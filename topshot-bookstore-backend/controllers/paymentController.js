const axios = require('axios');
const Order = require('../models/Order');

const pesapalConfig = {
  consumerKey: process.env.PESAPAL_CONSUMER_KEY,
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET,
  baseUrl: process.env.PESAPAL_BASE_URL,
  callbackUrl: process.env.PESAPAL_CALLBACK_URL,
  ipnUrl: process.env.PESAPAL_IPN_URL,
  notificationId: process.env.PESAPAL_NOTIFICATION_ID
};

// 🔐 Get Access Token
const getToken = async () => {
  const response = await axios.post(`${pesapalConfig.baseUrl}/api/Auth/RequestToken`, {
    consumer_key: pesapalConfig.consumerKey,
    consumer_secret: pesapalConfig.consumerSecret
  });
  return response.data.token;
};

// 🎯 Initiate Payment
const initiatePesapalPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id }).populate('items.book');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const token = await getToken();

    const paymentData = {
      currency: 'KES',
      amount: order.total,
      description: `Bookstore Order #${order.orderNumber}`,
      callback_url: pesapalConfig.callbackUrl,
      notification_id: pesapalConfig.notificationId,
      billing_address: {
        email_address: order.customerInfo.email,
        phone_number: order.customerInfo.phone,
        first_name: order.customerInfo.name.split(' ')[0],
        last_name: order.customerInfo.name.split(' ')[1] || '',
        line_1: order.customerInfo.address.street,
        city: order.customerInfo.address.city,
        state: order.customerInfo.address.state,
        postal_code: order.customerInfo.address.zipCode,
        country_code: 'KE'
      }
    };

    const response = await axios.post(
      `${pesapalConfig.baseUrl}/api/Transactions/SubmitOrderRequest`,
      paymentData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    order.paymentReference = response.data.merchant_reference;
    order.transactionTrackingId = response.data.order_tracking_id;
    await order.save();

    res.json({
      success: true,
      data: { redirectUrl: response.data.redirect_url }
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
};

// ✅ Callback Route (for browser redirect)
const pesapalCallback = async (req, res) => {
  try {
    const { merchantReference, orderTrackingId } = req.query;
    const order = await Order.findOne({ orderNumber: merchantReference });

    if (!order) return res.redirect(`${process.env.FRONTEND_URL}/payment-error?reason=order_not_found`);

    const token = await getToken();

    const statusResponse = await axios.get(
      `${pesapalConfig.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const status = statusResponse.data.payment_status.toLowerCase();

    if (status === 'completed') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();
    }

    res.redirect(`${process.env.FRONTEND_URL}/orders/${order._id}?payment=${status}`);
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-error`);
  }
};

// 🔁 IPN Endpoint (for server-to-server notification)
const pesapalIPN = async (req, res) => {
  try {
    const { merchantReference, orderTrackingId } = req.body;
    const order = await Order.findOne({ orderNumber: merchantReference });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const token = await getToken();

    const statusResponse = await axios.get(
      `${pesapalConfig.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const status = statusResponse.data.payment_status.toLowerCase();

    if (status === 'completed') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('IPN error:', error);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  initiatePesapalPayment,
  pesapalCallback,
  pesapalIPN
};
