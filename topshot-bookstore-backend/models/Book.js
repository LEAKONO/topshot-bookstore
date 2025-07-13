const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Book description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [10000, 'Price cannot exceed $10,000']
  },
  image: {
    type: String,
    default: '/placeholder.svg'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Children', 'Young Adult', 'Horror', 'Thriller'],
      message: 'Please select a valid category'
    },
    index: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Please enter a valid ISBN']
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters']
  },
  publishedDate: Date,
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  language: {
    type: String,
    default: 'English'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1, price: 1 });
bookSchema.index({ featured: 1, createdAt: -1 });
bookSchema.index({ 'rating.average': -1 });

// Virtual for availability status
bookSchema.virtual('isAvailable').get(function() {
  return this.stock > 0 && this.isActive;
});

// Virtual for stock status
bookSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= 5) return 'Low Stock';
  return 'In Stock';
});

// Static method to get featured books
bookSchema.statics.getFeatured = function() {
  return this.find({ featured: true, isActive: true }).sort({ createdAt: -1 });
};

// Static method to get books by category
bookSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Method to update stock
bookSchema.methods.updateStock = function(quantity) {
  this.stock = Math.max(0, this.stock + quantity);
  return this.save();
};

module.exports = mongoose.model('Book', bookSchema);
