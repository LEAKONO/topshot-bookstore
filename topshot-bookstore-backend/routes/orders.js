const express = require('express');
const { body, query, validationResult } = require('express-validator');
const orderController = require('../controllers/orderController');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.book')
    .notEmpty()
    .withMessage('Book ID is required for each item')
    .isMongoId()
    .withMessage('Invalid book ID'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('customerInfo.name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  body('customerInfo.email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  body('customerInfo.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number'),
  body('customerInfo.address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('customerInfo.address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('customerInfo.address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('customerInfo.address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please enter a valid zip code'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'])
    .withMessage('Invalid payment method')
];

const statusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status filter')
];

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, orderValidation, orderController.createOrder);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, queryValidation, orderController.getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, orderController.getOrder);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', [
  auth,
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters')
], orderController.cancelOrder);

// Admin routes
// @route   GET /api/orders/admin/all
// @desc    Get all orders (admin)
// @access  Private/Admin
router.get('/admin/all', auth, admin, queryValidation, orderController.getAllOrders);

// @route   PUT /api/orders/admin/:id/status
// @desc    Update order status (admin)
// @access  Private/Admin
router.put('/admin/:id/status', auth, admin, statusValidation, orderController.updateOrderStatus);

// @route   GET /api/orders/admin/stats
// @desc    Get order statistics (admin)
// @access  Private/Admin
router.get('/admin/stats', auth, admin, orderController.getOrderStats);

// @route   PUT /api/orders/admin/:id/tracking
// @desc    Update tracking information (admin)
// @access  Private/Admin
router.put('/admin/:id/tracking', [
  auth,
  admin,
  body('trackingNumber')
    .notEmpty()
    .withMessage('Tracking number is required'),
  body('estimatedDelivery')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid delivery date')
], orderController.updateTracking);

module.exports = router;
