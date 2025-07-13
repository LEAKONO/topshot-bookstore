const { validationResult } = require('express-validator');
const Book = require('../models/Book');

// @desc    Get all books with filtering, sorting, and pagination
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
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

    const { 
      category, 
      search, 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      order = 'desc',
      minPrice,
      maxPrice,
      inStock
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const books = await Book.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching books'
    });
  }
};

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
const getFeaturedBooks = async (req, res) => {
  try {
    const books = await Book.find({ featured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Get featured books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured books'
    });
  }
};

// @desc    Get all categories
// @route   GET /api/books/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories.sort()
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
const searchBooks = async (req, res) => {
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

    const { q, limit = 10 } = req.query;

    const books = await Book.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { author: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    })
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBook = async (req, res) => {
  try {
    const book = await Book.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Get book error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book'
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
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

    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    console.error('Create book error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating book'
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
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

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    console.error('Update book error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating book'
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Soft delete - set isActive to false
    await Book.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting book'
    });
  }
};

// @desc    Update book stock
// @route   PATCH /api/books/:id/stock
// @access  Private/Admin
const updateStock = async (req, res) => {
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

    const { stock } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { stock: book.stock }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating stock'
    });
  }
};

// @desc    Toggle book featured status
// @route   PATCH /api/books/:id/featured
// @access  Private/Admin
const toggleFeatured = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    book.featured = !book.featured;
    await book.save();

    res.json({
      success: true,
      message: `Book ${book.featured ? 'added to' : 'removed from'} featured list`,
      data: { featured: book.featured }
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating featured status'
    });
  }
};

module.exports = {
  getBooks,
  getFeaturedBooks,
  getCategories,
  searchBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  updateStock,
  toggleFeatured
};
