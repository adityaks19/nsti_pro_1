const express = require('express');
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');
const BookRequest = require('../models/BookRequest');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/library/books
// @desc    Get all books with advanced filtering
// @access  Private (All authenticated users can view books)
router.get('/books', protect, async (req, res) => {
  try {
    const { 
      category, 
      search, 
      available, 
      author, 
      publisher, 
      language, 
      condition,
      yearFrom,
      yearTo,
      page = 1, 
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { isActive: true };
    let sort = {};

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { publisher: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Author filter
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    // Publisher filter
    if (publisher) {
      query.publisher = { $regex: publisher, $options: 'i' };
    }

    // Language filter
    if (language && language !== 'all') {
      query.language = language;
    }

    // Condition filter
    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    // Available filter
    if (available === 'true') {
      query.availableCopies = { $gt: 0 };
    } else if (available === 'false') {
      query.availableCopies = 0;
    }

    // Year range filter
    if (yearFrom || yearTo) {
      query.publishedYear = {};
      if (yearFrom) query.publishedYear.$gte = parseInt(yearFrom);
      if (yearTo) query.publishedYear.$lte = parseInt(yearTo);
    }

    // Sorting
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const books = await Book.find(query)
      .populate('addedBy', 'name email')
      .populate('lastUpdatedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get categories for filter
    const categories = await Book.distinct('category', { isActive: true });
    const languages = await Book.distinct('language', { isActive: true });
    const conditions = await Book.distinct('condition', { isActive: true });

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBooks: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        filters: {
          categories: categories.sort(),
          languages: languages.sort(),
          conditions: conditions.sort()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
});

// @route   GET /api/library/books/:id
// @desc    Get single book by ID
// @access  Private
router.get('/books/:id', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('addedBy', 'name email role')
      .populate('lastUpdatedBy', 'name email role');

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
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
});

// @route   POST /api/library/books
// @desc    Add new book (Librarian only)
// @access  Private (Librarian)
router.post('/books', [
  protect,
  authorize('librarian', 'admin'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('isbn').notEmpty().withMessage('ISBN is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('publisher').notEmpty().withMessage('Publisher is required'),
    body('publishedYear').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid published year is required'),
    body('totalCopies').isInt({ min: 1 }).withMessage('Total copies must be at least 1'),
    body('location.shelf').notEmpty().withMessage('Shelf location is required'),
    body('location.section').notEmpty().withMessage('Section location is required')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn: req.body.isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    const bookData = {
      ...req.body,
      addedBy: req.user.id,
      availableCopies: req.body.totalCopies
    };

    const book = new Book(bookData);
    await book.save();

    await book.populate('addedBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book
    });

  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding book',
      error: error.message
    });
  }
});

// @route   PUT /api/library/books/:id
// @desc    Update book (Librarian only)
// @access  Private (Librarian)
router.put('/books/:id', [
  protect,
  authorize('librarian', 'admin'),
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().notEmpty().withMessage('Author cannot be empty'),
    body('isbn').optional().notEmpty().withMessage('ISBN cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('publisher').optional().notEmpty().withMessage('Publisher cannot be empty'),
    body('publishedYear').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid published year is required'),
    body('totalCopies').optional().isInt({ min: 1 }).withMessage('Total copies must be at least 1')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if ISBN is being changed and if it already exists
    if (req.body.isbn && req.body.isbn !== book.isbn) {
      const existingBook = await Book.findOne({ isbn: req.body.isbn });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: 'Book with this ISBN already exists'
        });
      }
    }

    // Update available copies if total copies changed
    if (req.body.totalCopies && req.body.totalCopies !== book.totalCopies) {
      const issuedCopies = book.totalCopies - book.availableCopies;
      req.body.availableCopies = Math.max(0, req.body.totalCopies - issuedCopies);
    }

    req.body.lastUpdatedBy = req.user.id;

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name email role')
     .populate('lastUpdatedBy', 'name email role');

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });

  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
});

// @route   DELETE /api/library/books/:id
// @desc    Delete book (Librarian only)
// @access  Private (Librarian)
router.delete('/books/:id', protect, authorize('librarian', 'admin'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book has active requests
    const activeRequests = await BookRequest.countDocuments({
      book: req.params.id,
      status: { $in: ['pending', 'approved', 'issued'] }
    });

    if (activeRequests > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active requests'
      });
    }

    // Soft delete - mark as inactive
    book.isActive = false;
    book.lastUpdatedBy = req.user.id;
    await book.save();

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
});

// @route   POST /api/library/request
// @desc    Request a book (Student, Teacher, TO)
// @access  Private
router.post('/request', [
  protect,
  authorize('student', 'teacher', 'to', 'admin'),
  [
    body('bookId').notEmpty().withMessage('Book ID is required'),
    body('requestType').optional().isIn(['borrow', 'reference', 'research']).withMessage('Invalid request type'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
    body('remarks').optional().isLength({ max: 500 }).withMessage('Remarks too long')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { bookId, requestType = 'borrow', priority = 'normal', remarks } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found or not available'
      });
    }

    // Check if user already has a pending/active request for this book
    const existingRequest = await BookRequest.findOne({
      book: bookId,
      requestedBy: req.user.id,
      status: { $in: ['pending', 'approved', 'issued'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active request for this book'
      });
    }

    // Check user's active book limit (students: 3, teachers/TO: 5)
    const userLimit = req.user.role === 'student' ? 3 : 5;
    const activeRequests = await BookRequest.countDocuments({
      requestedBy: req.user.id,
      status: { $in: ['approved', 'issued'] }
    });

    if (activeRequests >= userLimit) {
      return res.status(400).json({
        success: false,
        message: `You have reached your limit of ${userLimit} active book requests`
      });
    }

    const bookRequest = new BookRequest({
      book: bookId,
      requestedBy: req.user.id,
      requestType,
      priority,
      remarks
    });

    await bookRequest.save();

    // Increment request count for the book
    await Book.findByIdAndUpdate(bookId, { $inc: { requestCount: 1 } });

    await bookRequest.populate([
      { path: 'book', select: 'title author isbn category' },
      { path: 'requestedBy', select: 'name email role' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Book request submitted successfully',
      data: bookRequest
    });

  } catch (error) {
    console.error('Error creating book request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating book request',
      error: error.message
    });
  }
});

// @route   GET /api/library/requests
// @desc    Get book requests (filtered by role)
// @access  Private
router.get('/requests', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'librarian' || req.user.role === 'admin') {
      // Librarians and admins can see all requests
      if (status && status !== 'all') {
        query.status = status;
      }
    } else {
      // Other users can only see their own requests
      query.requestedBy = req.user.id;
      if (status && status !== 'all') {
        query.status = status;
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await BookRequest.find(query)
      .populate('book', 'title author isbn category availableCopies')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BookRequest.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRequests: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching book requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book requests',
      error: error.message
    });
  }
});

// @route   PUT /api/library/requests/:id/approve
// @desc    Approve book request (Librarian only)
// @access  Private (Librarian)
router.put('/requests/:id/approve', protect, authorize('librarian', 'admin'), async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.id)
      .populate('book')
      .populate('requestedBy', 'name email role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // Check if book is still available
    if (request.book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is no longer available'
      });
    }

    // Update request status
    request.status = 'approved';
    request.approvedBy = req.user.id;
    request.approvalDate = new Date();
    await request.save();

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: request
    });

  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving request',
      error: error.message
    });
  }
});

// @route   PUT /api/library/requests/:id/reject
// @desc    Reject book request (Librarian only)
// @access  Private (Librarian)
router.put('/requests/:id/reject', [
  protect,
  authorize('librarian', 'admin'),
  [
    body('rejectionReason').notEmpty().withMessage('Rejection reason is required')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const request = await BookRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    request.status = 'rejected';
    request.approvedBy = req.user.id;
    request.rejectionReason = req.body.rejectionReason;
    await request.save();

    await request.populate([
      { path: 'book', select: 'title author isbn' },
      { path: 'requestedBy', select: 'name email role' },
      { path: 'approvedBy', select: 'name email role' }
    ]);

    res.json({
      success: true,
      message: 'Request rejected successfully',
      data: request
    });

  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting request',
      error: error.message
    });
  }
});

// @route   PUT /api/library/requests/:id/issue
// @desc    Issue book (Librarian only)
// @access  Private (Librarian)
router.put('/requests/:id/issue', protect, authorize('librarian', 'admin'), async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.id)
      .populate('book')
      .populate('requestedBy', 'name email role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Request must be approved first'
      });
    }

    // Check if book is still available
    if (request.book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is no longer available'
      });
    }

    // Update request status
    request.status = 'issued';
    request.issueDate = new Date();
    
    // Set due date (15 days from issue date)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    request.dueDate = dueDate;

    await request.save();

    // Decrease available copies
    await Book.findByIdAndUpdate(request.book._id, {
      $inc: { availableCopies: -1 }
    });

    res.json({
      success: true,
      message: 'Book issued successfully',
      data: request
    });

  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({
      success: false,
      message: 'Error issuing book',
      error: error.message
    });
  }
});

// @route   PUT /api/library/requests/:id/return
// @desc    Return book (Librarian only)
// @access  Private (Librarian)
router.put('/requests/:id/return', protect, authorize('librarian', 'admin'), async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.id)
      .populate('book')
      .populate('requestedBy', 'name email role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'issued' && request.status !== 'overdue') {
      return res.status(400).json({
        success: false,
        message: 'Book is not currently issued'
      });
    }

    // Calculate fine if overdue
    let fine = 0;
    if (request.dueDate && new Date() > request.dueDate) {
      const daysOverdue = Math.ceil((new Date() - request.dueDate) / (1000 * 60 * 60 * 24));
      fine = daysOverdue * 5; // ₹5 per day fine
    }

    // Update request status
    request.status = 'returned';
    request.actualReturnDate = new Date();
    request.fine = fine;
    request.fineStatus = fine > 0 ? 'pending' : 'none';

    await request.save();

    // Increase available copies
    await Book.findByIdAndUpdate(request.book._id, {
      $inc: { availableCopies: 1 }
    });

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: request,
      fine: fine
    });

  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({
      success: false,
      message: 'Error returning book',
      error: error.message
    });
  }
});

// @route   GET /api/library/stats
// @desc    Get library statistics
// @access  Private (Librarian, Admin)
router.get('/stats', protect, authorize('librarian', 'admin'), async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments({ isActive: true });
    const totalCopies = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalCopies' } } }
    ]);
    
    const availableCopies = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$availableCopies' } } }
    ]);

    const issuedCopies = (totalCopies[0]?.total || 0) - (availableCopies[0]?.total || 0);

    const pendingRequests = await BookRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await BookRequest.countDocuments({ status: 'approved' });
    const issuedBooks = await BookRequest.countDocuments({ status: 'issued' });
    const overdueBooks = await BookRequest.countDocuments({ status: 'overdue' });

    const categoryStats = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, copies: { $sum: '$totalCopies' } } },
      { $sort: { count: -1 } }
    ]);

    const popularBooks = await Book.find({ isActive: true })
      .sort({ requestCount: -1 })
      .limit(5)
      .select('title author requestCount');

    res.json({
      success: true,
      data: {
        overview: {
          totalBooks,
          totalCopies: totalCopies[0]?.total || 0,
          availableCopies: availableCopies[0]?.total || 0,
          issuedCopies
        },
        requests: {
          pending: pendingRequests,
          approved: approvedRequests,
          issued: issuedBooks,
          overdue: overdueBooks
        },
        categories: categoryStats,
        popularBooks
      }
    });

  } catch (error) {
    console.error('Error fetching library stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library statistics',
      error: error.message
    });
  }
});

// @route   GET /api/library/my-requests
// @desc    Get current user's book requests
// @access  Private
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await BookRequest.find({ requestedBy: req.user.id })
      .populate('book', 'title author isbn category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your requests'
    });
  }
});

// @route   GET /api/library/my-fines
// @desc    Get current user's fines
// @access  Private
router.get('/my-fines', protect, async (req, res) => {
  try {
    const fines = await BookRequest.find({ 
      requestedBy: req.user.id,
      fine: { $gt: 0 }
    })
    .populate('book', 'title author isbn')
    .sort({ createdAt: -1 });

    const formattedFines = fines.map(request => ({
      _id: request._id,
      book: request.book,
      amount: request.fine,
      reason: request.fineReason || 'Late return',
      date: request.returnDate || request.dueDate,
      status: request.fineStatus || 'pending'
    }));

    res.json({
      success: true,
      fines: formattedFines
    });
  } catch (error) {
    console.error('Error fetching user fines:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your fines'
    });
  }
});

module.exports = router;
