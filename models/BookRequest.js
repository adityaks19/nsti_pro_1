const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'issued', 'returned', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  requestType: {
    type: String,
    enum: ['borrow', 'reference', 'research'],
    default: 'borrow'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  issueDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  returnDate: {
    type: Date
  },
  actualReturnDate: {
    type: Date
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 500
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  fine: {
    type: Number,
    default: 0,
    min: 0
  },
  fineStatus: {
    type: String,
    enum: ['none', 'pending', 'paid'],
    default: 'none'
  },
  renewalCount: {
    type: Number,
    default: 0,
    max: 2
  },
  isRenewed: {
    type: Boolean,
    default: false
  },
  notificationsSent: {
    reminder: { type: Boolean, default: false },
    overdue: { type: Boolean, default: false },
    final: { type: Boolean, default: false }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 300
  }
}, {
  timestamps: true
});

// Indexes for better performance
bookRequestSchema.index({ requestedBy: 1, status: 1 });
bookRequestSchema.index({ book: 1, status: 1 });
bookRequestSchema.index({ status: 1, dueDate: 1 });
bookRequestSchema.index({ approvedBy: 1 });

// Set due date to 15 days from issue date and approval date when approved
bookRequestSchema.pre('save', function(next) {
  // Set due date when book is issued
  if (this.isModified('issueDate') && this.issueDate && !this.dueDate) {
    const dueDate = new Date(this.issueDate);
    dueDate.setDate(dueDate.getDate() + 15);
    this.dueDate = dueDate;
  }
  
  // Set approval date when status changes to approved
  if (this.isModified('status') && this.status === 'approved' && !this.approvalDate) {
    this.approvalDate = new Date();
  }
  
  // Set actual return date when status changes to returned
  if (this.isModified('status') && this.status === 'returned' && !this.actualReturnDate) {
    this.actualReturnDate = new Date();
  }
  
  // Update status to overdue if past due date
  if (this.status === 'issued' && this.dueDate && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  
  next();
});

// Virtual for days overdue
bookRequestSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'overdue' && this.dueDate) {
    const today = new Date();
    const diffTime = today - this.dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for days remaining
bookRequestSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'issued' && this.dueDate) {
    const today = new Date();
    const diffTime = this.dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for request duration
bookRequestSchema.virtual('requestDuration').get(function() {
  if (this.issueDate && this.actualReturnDate) {
    const diffTime = this.actualReturnDate - this.issueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

module.exports = mongoose.model('BookRequest', bookRequestSchema);
