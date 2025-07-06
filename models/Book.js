const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Engineering', 
      'Science', 
      'Mathematics', 
      'Computer Science', 
      'Electronics', 
      'Mechanical', 
      'Civil', 
      'Electrical',
      'Chemical',
      'Automobile',
      'Information Technology',
      'General', 
      'Reference',
      'Technical',
      'Management',
      'Communication Skills',
      'Soft Skills'
    ]
  },
  publisher: {
    type: String,
    required: [true, 'Publisher is required'],
    trim: true
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: 1900,
    max: new Date().getFullYear()
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  bookImage: {
    type: String,
    default: ''
  },
  location: {
    shelf: {
      type: String,
      required: [true, 'Shelf location is required'],
      trim: true
    },
    section: {
      type: String,
      required: [true, 'Section location is required'],
      trim: true
    },
    floor: {
      type: String,
      default: 'Ground Floor'
    }
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  language: {
    type: String,
    default: 'English',
    enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Other']
  },
  condition: {
    type: String,
    enum: ['New', 'Good', 'Fair', 'Poor'],
    default: 'New'
  },
  tags: [{
    type: String,
    trim: true
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  requestCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ isbn: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ availableCopies: 1 });

// Set available copies equal to total copies when creating new book
bookSchema.pre('save', function(next) {
  if (this.isNew && !this.availableCopies) {
    this.availableCopies = this.totalCopies;
  }
  
  // Update lastUpdatedBy if not new
  if (!this.isNew && this.isModified()) {
    this.lastUpdatedBy = this.addedBy; // This will be set properly in the route
  }
  
  next();
});

// Virtual for issued copies
bookSchema.virtual('issuedCopies').get(function() {
  return this.totalCopies - this.availableCopies;
});

// Virtual for availability status
bookSchema.virtual('availabilityStatus').get(function() {
  if (this.availableCopies === 0) return 'Out of Stock';
  if (this.availableCopies <= 2) return 'Low Stock';
  return 'Available';
});

module.exports = mongoose.model('Book', bookSchema);
