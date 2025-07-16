const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');

// 🔢 Generate unique order number
const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { items, shippingAddress, paymentMethod, notes } = req.body;
    const user = await User.findById(req.user._id);

    // ======== NEW ADDRESS VALIDATION ========
    // Use either provided shippingAddress or user's saved address
    const address = shippingAddress || user.address;
    
    // Validate all required address fields
    if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required',
        requiredFields: {
          street: !address?.street,
          city: !address?.city,
          state: !address?.state,
          zipCode: !address?.zipCode
        },
        hint: 'Either provide complete shippingAddress in request or save complete address in user profile'
      });
    }
    // ======== END OF NEW VALIDATION ========

    let orderItems = [];
    let subtotal = 0;

    // Validate items and calculate totals (keep existing code)
    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book || !book.isActive) {
        return res.status(400).json({
          success: false,
          message: `Book not available: ${item.book}`,
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${book.title}". Available: ${book.stock}, Requested: ${item.quantity}`,
        });
      }

      const itemTotal = book.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        book: book._id,
        title: book.title,
        quantity: item.quantity,
        price: book.price,
        coverImage: book.coverImage
      });
    }

    // Calculate totals (keep existing code)
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + tax + shipping;

    // Create order (modified to use validated address)
    const order = new Order({
      user: req.user._id,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress: address,  // Use validated address
      paymentMethod,
      notes,
      customerInfo: {
        name: user.name,
        email: user.email,
        phone: user.phone || '', // Handle optional phone
        address: {              // Structured to match schema
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country || 'Kenya' // Default
        }
      }
    });

    // Save order and update stock (keep existing code)
    await order.save();
    
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.book },
        update: { $inc: { stock: -item.quantity } }
      }
    }));
    await Book.bulkWrite(bulkOps);

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.book', 'title author');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    const query = { user: req.user._id };
    
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.book', 'title author price coverImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    .populate('items.book', 'title author price coverImage')
    .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ['pending', 'processing'] }
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled or not found'
      });
    }

    // Restore book stock
    const bulkOps = order.items.map(item => ({
      updateOne: {
        filter: { _id: item.book },
        update: { $inc: { stock: item.quantity } }
      }
    }));
    await Book.bulkWrite(bulkOps);

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, userId, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.book', 'title author price coverImage')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateData = { status };
    
    // Add timestamps for specific status changes
    if (status === 'shipped') updateData.shippedAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('user', 'name email')
    .populate('items.book', 'title author price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let groupBy = { $month: '$createdAt' };
    
    if (period === 'day') groupBy = { $dayOfMonth: '$createdAt' };
    if (period === 'year') groupBy = { $year: '$createdAt' };

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update order tracking (Admin)
// @route   PUT /api/admin/orders/:id/tracking
// @access  Private/Admin
const updateTracking = async (req, res) => {
  try {
    const { trackingNumber, carrier } = req.body;

    if (!trackingNumber || !carrier) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number and carrier are required'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        trackingNumber,
        carrier,
        status: 'shipped',
        shippedAt: new Date() 
      },
      { new: true }
    )
    .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tracking information updated',
      data: order
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tracking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  updateTracking
};