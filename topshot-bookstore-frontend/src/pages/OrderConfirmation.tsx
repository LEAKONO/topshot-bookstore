import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // Extract payment status from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('payment');

    if (status) {
      setPaymentStatus(status);

      if (status === 'completed') {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully.',
        });
        verifyPayment();
      } else if (status === 'cancelled') {
        toast({
          title: 'Payment Cancelled',
          description: 'Your payment was not completed.',
          variant: 'destructive',
        });
      }
    }
  }, [location.search]);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.getOrder(id!);
        setOrder(response.data.data); // ✅ Unwrap actual order data here
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load order details',
          variant: 'destructive',
        });
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const verifyPayment = async () => {
    try {
      await api.verifyPesapalPayment(id!);
      const updatedOrder = await api.getOrder(id!);
      setOrder(updatedOrder.data.data); // ✅ Unwrap again after verification
    } catch (error) {
      console.error('Payment verification failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p>Order not found</p>
        <Button onClick={() => navigate('/orders')} className="mt-4" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Payment Alerts */}
      {paymentStatus === 'completed' && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-200">Payment Successful</h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Your payment has been processed successfully.
            </p>
          </div>
        </div>
      )}

      {paymentStatus === 'cancelled' && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-200">Payment Cancelled</h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              Your payment was not completed. You can try again below.
            </p>
          </div>
        </div>
      )}

      {/* Payment CTA */}
      {order.paymentStatus === 'pending' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              <Link to={`/orders/${order._id}/pay`}>Pay Now</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.book._id} className="flex items-start gap-4 p-3 border rounded-lg">
                <img
                  src={item.book.image?.url || '/placeholder-book.png'}
                  alt={item.book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.book.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by {item.book.author}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">Qty: {item.quantity}</span>
                    <span className="font-medium">${(item.book.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Details */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h3 className="font-medium">Shipping Address</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {order.customerInfo.address.street}<br />
              {order.customerInfo.address.city}, {order.customerInfo.address.state}<br />
              {order.customerInfo.address.zipCode}, {order.customerInfo.address.country}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={() => navigate('/orders')} variant="outline">
          Back to Orders
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
