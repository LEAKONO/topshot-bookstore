const { body, query } = require('express-validator');

// Common validation rules
const commonValidation = {
  // MongoDB ObjectId validation
  mongoId: (field) => 
    body(field).isMongoId().withMessage(`${field} must be a valid ID`),

  // Email validation
  email: (field = 'email') =>
    body(field)
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Please provide a valid email address'),

  // Password validation
  password: (field = 'password', minLength = 6) =>
    body(field)
      .isLength({ min: minLength })
      .withMessage(`Password must be at least ${minLength} characters long`)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  // Name validation
  name: (field = 'name', minLength = 2, maxLength = 100) =>
    body(field)
      .trim()
      .notEmpty()
      .withMessage(`${field} is required`)
      .isLength({ min: minLength, max: maxLength })
      .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`),

  // Phone validation
  phone: (field = 'phone') =>
    body(field)
      .optional()
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Please enter a valid phone number'),

  // Price validation
  price: (field = 'price', min = 0, max = 10000) =>
    body(field)
      .isFloat({ min, max })
      .withMessage(`${field} must be between ${min} and ${max}`),

  // Integer validation
  integer: (field, min = 0, max = 999999) =>
    body(field)
      .isInt({ min, max })
      .withMessage(`${field} must be an integer between ${min} and ${max}`),

  // String validation
  string: (field, minLength = 1, maxLength = 1000) =>
    body(field)
      .trim()
      .notEmpty()
      .withMessage(`${field} is required`)
      .isLength({ min: minLength, max: maxLength })
      .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`),

  // Optional string validation
  optionalString: (field, maxLength = 1000) =>
    body(field)
      .optional()
      .trim()
      .isLength({ max: maxLength })
      .withMessage(`${field} cannot exceed ${maxLength} characters`),

  // Array validation
  array: (field, minItems = 1) =>
    body(field)
      .isArray({ min: minItems })
      .withMessage(`${field} must be an array with at least ${minItems} item(s)`),

  // Enum validation
  enum: (field, values) =>
    body(field)
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`),

  // Date validation
  date: (field) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage(`${field} must be a valid date`),

  // Boolean validation
  boolean: (field) =>
    body(field)
      .optional()
      .isBoolean()
      .withMessage(`${field} must be true or false`),

  // Query parameter validations
  pagination: {
    page: query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    limit: query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  },

  // Sort validation
  sort: {
    sortBy: (allowedFields) =>
      query('sortBy')
        .optional()
        .isIn(allowedFields)
        .withMessage(`Sort field must be one of: ${allowedFields.join(', ')}`),
    
    order: query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc')
  }
};

// Specific validation schemas
const validationSchemas = {
  // User registration
  userRegistration: [
    commonValidation.name('name'),
    commonValidation.email(),
    commonValidation.password(),
    commonValidation.phone('phone')
  ],

  // User login
  userLogin: [
    commonValidation.email(),
    body('password').notEmpty().withMessage('Password is required')
  ],

  // Book creation/update
  book: [
    commonValidation.string('title', 1, 200),
    commonValidation.string('author', 1, 100),
    commonValidation.string('description', 1, 2000),
    commonValidation.price('price'),
    commonValidation.enum('category', [
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 
      'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 
      'Children', 'Young Adult', 'Horror', 'Thriller'
    ]),
    commonValidation.integer('stock', 0),
    body('isbn')
      .optional()
      .matches(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
      .withMessage('Please enter a valid ISBN')
  ],

  // Order creation
  order: [
    commonValidation.array('items'),
    body('items.*.book').isMongoId().withMessage('Invalid book ID'),
    body('items.*.quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
    commonValidation.name('customerInfo.name'),
    commonValidation.email('customerInfo.email'),
    commonValidation.string('customerInfo.phone', 1, 20),
    commonValidation.string('customerInfo.address.street', 1, 200),
    commonValidation.string('customerInfo.address.city', 1, 100),
    commonValidation.string('customerInfo.address.state', 1, 100),
    body('customerInfo.address.zipCode')
      .matches(/^\d{5}(-\d{4})?$/)
      .withMessage('Please enter a valid zip code'),
    commonValidation.enum('paymentMethod', ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'])
  ],

  // Query validations
  bookQuery: [
    commonValidation.pagination.page,
    commonValidation.pagination.limit,
    commonValidation.sort.sortBy(['title', 'author', 'price', 'createdAt', 'rating']),
    commonValidation.sort.order,
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
    query('inStock').optional().isBoolean().withMessage('inStock must be true or false')
  ],

  orderQuery: [
    commonValidation.pagination.page,
    commonValidation.pagination.limit,
    commonValidation.enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
  ]
};

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  commonValidation,
  validationSchemas,
  handleValidationErrors
};
