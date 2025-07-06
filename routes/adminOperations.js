const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const StoreItem = require('../models/StoreItem');
const { protect } = require('../middleware/auth');

// Middleware to check admin role
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// ==================== USER MANAGEMENT ====================

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', protect, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/users', protect, adminAuth, async (req, res) => {
  try {
    const { name, email, password, role, phone, address, department, course, semester } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const userData = {
      name,
      email,
      password,
      role,
      phone,
      address
    };

    // Add role-specific fields
    if (role === 'student') {
      userData.department = department;
      userData.course = course;
      userData.semester = semester;
    } else if (role === 'teacher' || role === 'to') {
      userData.department = department;
    }

    const user = new User(userData);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/users/:id', protect, adminAuth, async (req, res) => {
  try {
    const { name, email, role, phone, address, department, course, semester } = req.body;

    const updateData = {
      name,
      email,
      role,
      phone,
      address
    };

    // Add role-specific fields
    if (role === 'student') {
      updateData.department = department;
      updateData.course = course;
      updateData.semester = semester;
    } else if (role === 'teacher' || role === 'to') {
      updateData.department = department;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', protect, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== BOOK MANAGEMENT ====================

// @route   GET /api/admin/books
// @desc    Get all books with pagination
// @access  Private (Admin only)
router.get('/books', protect, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments();

    res.json({
      success: true,
      books,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/books
// @desc    Create new book
// @access  Private (Admin only)
router.post('/books', protect, adminAuth, async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      publisher,
      publishedYear,
      totalCopies,
      description,
      location
    } = req.body;

    const book = new Book({
      title,
      author,
      isbn,
      category,
      publisher,
      publishedYear,
      totalCopies,
      availableCopies: totalCopies,
      description,
      location,
      addedBy: req.user.id
    });

    await book.save();
    await book.populate('addedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/books/:id
// @desc    Update book
// @access  Private (Admin only)
router.put('/books/:id', protect, adminAuth, async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      publisher,
      publishedYear,
      totalCopies,
      description,
      location
    } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Calculate new available copies if total copies changed
    const difference = totalCopies - book.totalCopies;
    const newAvailableCopies = book.availableCopies + difference;

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        isbn,
        category,
        publisher,
        publishedYear,
        totalCopies,
        availableCopies: Math.max(0, newAvailableCopies),
        description,
        location
      },
      { new: true, runValidators: true }
    ).populate('addedBy', 'name');

    res.json({
      success: true,
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/books/:id
// @desc    Delete book
// @access  Private (Admin only)
router.delete('/books/:id', protect, adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== STORE MANAGEMENT ====================

// @route   GET /api/admin/store-items
// @desc    Get all store items with pagination
// @access  Private (Admin only)
router.get('/store-items', protect, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const items = await StoreItem.find()
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StoreItem.countDocuments();

    res.json({
      success: true,
      items,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching store items:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/store-items
// @desc    Create new store item
// @access  Private (Admin only)
router.post('/store-items', protect, adminAuth, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      quantity,
      unit,
      minimumStock,
      supplier,
      unitPrice
    } = req.body;

    const item = new StoreItem({
      name,
      category,
      description,
      quantity,
      unit,
      minimumStock,
      supplier,
      unitPrice,
      addedBy: req.user.id
    });

    await item.save();
    await item.populate('addedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Store item created successfully',
      item
    });
  } catch (error) {
    console.error('Error creating store item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/store-items/:id
// @desc    Update store item
// @access  Private (Admin only)
router.put('/store-items/:id', protect, adminAuth, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      quantity,
      unit,
      minimumStock,
      supplier,
      unitPrice
    } = req.body;

    const item = await StoreItem.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        description,
        quantity,
        unit,
        minimumStock,
        supplier,
        unitPrice
      },
      { new: true, runValidators: true }
    ).populate('addedBy', 'name');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Store item not found'
      });
    }

    res.json({
      success: true,
      message: 'Store item updated successfully',
      item
    });
  } catch (error) {
    console.error('Error updating store item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/store-items/:id
// @desc    Delete store item
// @access  Private (Admin only)
router.delete('/store-items/:id', protect, adminAuth, async (req, res) => {
  try {
    const item = await StoreItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Store item not found'
      });
    }

    res.json({
      success: true,
      message: 'Store item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting store item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== DASHBOARD STATISTICS ====================

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard-stats', protect, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalBooks,
      totalStoreItems,
      activeStudents,
      availableBooks,
      issuedBooks
    ] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      StoreItem.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Book.aggregate([{ $group: { _id: null, total: { $sum: '$availableCopies' } } }]),
      Book.aggregate([{ $group: { _id: null, total: { $sum: { $subtract: ['$totalCopies', '$availableCopies'] } } } }])
    ]);

    const stats = {
      totalUsers,
      totalBooks,
      totalStoreItems,
      activeStudents,
      availableBooks: availableBooks[0]?.total || 0,
      issuedBooks: issuedBooks[0]?.total || 0,
      systemAlerts: 3, // Mock data for alerts
      pendingRequests: 23 // Mock data for requests
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== SYSTEM OPERATIONS ====================

// @route   POST /api/admin/backup
// @desc    Create system backup
// @access  Private (Admin only)
router.post('/backup', protect, adminAuth, async (req, res) => {
  try {
    // Mock backup operation
    res.json({
      success: true,
      message: 'System backup created successfully',
      backupId: `backup_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/maintenance
// @desc    Toggle maintenance mode
// @access  Private (Admin only)
router.post('/maintenance', protect, adminAuth, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    // Mock maintenance mode toggle
    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      maintenanceMode: enabled
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
