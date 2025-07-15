const express = require('express');
const { body, query } = require('express-validator');
const bookController = require('../controllers/bookController');
const { auth, admin, optionalAuth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../config/cloudinary');

const router = express.Router();

// Validation rules
const bookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Price must be between 0 and 10000'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Children', 'Young Adult', 'Horror', 'Thriller'])
    .withMessage('Please select a valid category'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('isbn')
    .optional()
    .matches(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
    .withMessage('Please enter a valid ISBN'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('publisher')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Publisher name cannot exceed 100 characters'),
  body('publishedDate')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date'),
  body('pages')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Pages must be a positive integer'),
  body('language')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Language cannot exceed 50 characters'),
  body('format')
    .optional()
    .isIn(['Hardcover', 'Paperback', 'E-book', 'Audio'])
    .withMessage('Please select a valid format')
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
  query('sortBy')
    .optional()
    .isIn(['title', 'author', 'price', 'createdAt', 'rating'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('category')
    .optional()
    .isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Children', 'Young Adult', 'Horror', 'Thriller'])
    .withMessage('Please select a valid category'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

// @route   GET /api/books
// @desc    Get all books with filtering, sorting, and pagination
// @access  Public
router.get('/', queryValidation, bookController.getBooks);

// @route   GET /api/books/featured
// @desc    Get featured books
// @access  Public
router.get('/featured', bookController.getFeaturedBooks);

// @route   GET /api/books/categories
// @desc    Get all book categories
// @access  Public
router.get('/categories', bookController.getCategories);

// @route   GET /api/books/search
// @desc    Search books
// @access  Public
router.get('/search', [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], bookController.searchBooks);

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get('/:id', optionalAuth, bookController.getBook);

// @route   POST /api/books
// @desc    Create a new book
// @access  Private/Admin
router.post('/', 
  auth, 
  admin, 
  upload.single('coverImage'), 
  handleUploadError,
  bookValidation, 
  bookController.createBook
);

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private/Admin
router.put('/:id', 
  auth, 
  admin, 
  upload.single('coverImage'), 
  handleUploadError,
  bookValidation, 
  bookController.updateBook
);

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private/Admin
router.delete('/:id', auth, admin, bookController.deleteBook);

// @route   PATCH /api/books/:id/stock
// @desc    Update book stock
// @access  Private/Admin
router.patch('/:id/stock', [
  auth,
  admin,
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
], bookController.updateStock);

// @route   PATCH /api/books/:id/featured
// @desc    Toggle book featured status
// @access  Private/Admin
router.patch('/:id/featured', auth, admin, bookController.toggleFeatured);

module.exports = router;