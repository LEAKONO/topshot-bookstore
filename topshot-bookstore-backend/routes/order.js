const express = require('express');
const Order = require('../models/Order');
const Book = require('../models/Book');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// Create order (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { items, customerInfo, paymentMethod } = req.body;
    
    // Calculate total and validate stock
    let total = 0;
    for (const item of items) {
      const book = await Book.findById(item.book);
      if (!book || book.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${book?.title || 'book'}` });
      }
      total += book.price * item.quantity;
    }

    const order = new Order({
      user: req.user._id,
      items,
      total,
      customerInfo,
      paymentMethod
    });

    await order.save();

    // Update stock
    for (const item of items) {
      await Book.findByIdAndUpdate(item.book, { $inc: { stock: -item.quantity } });
    }

    await order.populate('items.book');
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.book')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/admin/orders', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.book')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/admin/orders/:id', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.book');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
