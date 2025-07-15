const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Book = require('../models/Book');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, customerInfo, paymentMethod, notes } = req.body;

    // Validate and calculate order totals
    let orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const book = await Book.findById(item.book);
      
      if (!book || !book.isActive) {
        return res.status(400).json({
          success: false,
          message: `Book not found: ${item.book}`
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${book.title}". Available: ${book.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = book.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        book: book._id,
        quantity: item.quantity,
        price: book.price
      });
    }

    // Calculate tax and shipping
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      customerInfo,
      paymentMethod,
      notes
    });

    await order.save();

    // Update book stock
    for (const item of items) {
      await Book.findByIdAndUpdate(
        item.book,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate book details for response
    await order.populate('items.book user', 'title author price name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.book', 'title author price image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
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
    }).populate('items.book', 'title author price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.book');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Restore book stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(
        item.book._id,
        { $inc: { stock: item.quantity } }
      );
    }

    // Update order
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
};

// Admin Controllers

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.book', 'title author price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status and related fields
    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();
    
    await order.populate('items.book user', 'title author price name email');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Get order statistics (admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics'
    });
  }
};

// @desc    Update tracking information (admin)
// @route   PUT /api/orders/admin/:id/tracking
// @access  Private/Admin
const updateTracking = async (req, res) => {
  try {
    const { trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        trackingNumber,
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) })
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Tracking information updated successfully',
      data: {
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tracking information'
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
