// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const { query, param, body } = require('express-validator');

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', [
  auth,
  admin,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  query('sort')
    .optional()
    .matches(/^(name|email|createdAt):(asc|desc)$/)
    .withMessage('Invalid sort format. Use field:asc or field:desc')
], adminController.getUsers);

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/users/:id', [
  auth,
  admin,
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Invalid role specified'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], adminController.updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only - soft delete)
// @access  Private/Admin
router.delete('/users/:id', [
  auth,
  admin,
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
], adminController.deleteUser);

module.exports = router;