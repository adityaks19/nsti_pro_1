const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const BookRequest = require('../models/BookRequest');
const StoreItem = require('../models/StoreItem');
const StoreRequest = require('../models/StoreRequest');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics based on user role
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    let stats = {};

    switch (req.user.role) {
      case 'admin':
        stats = await getAdminStats();
        break;
      case 'librarian':
        stats = await getLibrarianStats();
        break;
      case 'store':
        stats = await getStoreStats();
        break;
      case 'to':
        stats = await getTOStats();
        break;
      case 'teacher':
        stats = await getTeacherStats(req.user.id);
        break;
      case 'student':
        stats = await getStudentStats(req.user.id);
        break;
      default:
        stats = { message: 'No stats available for this role' };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/recent-activities
// @desc    Get recent system activities
// @access  Private (Admin only)
router.get('/recent-activities', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get recent activities from various collections
    const recentBookRequests = await BookRequest.find()
      .populate('user', 'name')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentStoreRequests = await StoreRequest.find()
      .populate('user', 'name')
      .populate('item', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const activities = [
      ...recentBookRequests.map(req => ({
        action: `Book request: ${req.book?.title || 'Unknown'} by ${req.user?.name || 'Unknown'}`,
        timestamp: req.createdAt,
        type: 'book_request'
      })),
      ...recentStoreRequests.map(req => ({
        action: `Store request: ${req.item?.name || 'Unknown'} by ${req.user?.name || 'Unknown'}`,
        timestamp: req.createdAt,
        type: 'store_request'
      })),
      ...recentUsers.map(user => ({
        action: `New user registered: ${user.name}`,
        timestamp: user.createdAt,
        type: 'user_registration'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/system-health
// @desc    Get system health status
// @access  Private (Admin only)
router.get('/system-health', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Simple system health check
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalStoreItems = await StoreItem.countDocuments();
    
    const health = {
      status: 'healthy',
      message: 'All systems operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    };

    // Add some basic health checks
    if (totalUsers === 0 || totalBooks === 0) {
      health.status = 'warning';
      health.message = 'Some system components may need attention';
    }

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Dashboard Stats
async function getAdminStats() {
  const totalUsers = await User.countDocuments({ isActive: true });
  const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
  const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
  const totalLibrarians = await User.countDocuments({ role: 'librarian', isActive: true });
  const totalStoreManagers = await User.countDocuments({ role: 'store_manager', isActive: true });
  const totalTrainingOfficers = await User.countDocuments({ role: 'training_officer', isActive: true });
  
  const totalBooks = await Book.countDocuments({ isActive: true });
  const totalStoreItems = await StoreItem.countDocuments({ isActive: true });
  
  const pendingBookRequests = await BookRequest.countDocuments({ status: 'pending' });
  const pendingStoreRequests = await StoreRequest.countDocuments({ status: 'pending' });
  
  const issuedBooks = await BookRequest.countDocuments({ status: 'issued' });
  const overdueBooks = await BookRequest.countDocuments({ 
    status: 'issued',
    dueDate: { $lt: new Date() }
  });

  // Get low stock items
  const lowStockItems = await StoreItem.countDocuments({
    $expr: { $lte: ['$quantity', '$minQuantity'] }
  });

  // Get book categories count
  const bookCategories = await Book.distinct('category').then(categories => categories.length);
  
  // Get store categories count
  const storeCategories = await StoreItem.distinct('category').then(categories => categories.length);

  return {
    users: {
      total: totalUsers,
      students: totalStudents,
      teachers: totalTeachers,
      librarians: totalLibrarians,
      storeManagers: totalStoreManagers,
      trainingOfficers: totalTrainingOfficers
    },
    library: {
      totalBooks,
      issuedBooks,
      overdueBooks,
      pendingRequests: pendingBookRequests,
      categories: bookCategories
    },
    store: {
      totalItems: totalStoreItems,
      lowStockItems,
      pendingRequests: pendingStoreRequests,
      categories: storeCategories
    },
    courses: {
      total: 0 // Placeholder for future course management
    },
    security: {
      activeUsers: totalUsers // Simplified active user count
    }
  };
}

// Librarian Dashboard Stats
async function getLibrarianStats() {
  const totalBooks = await Book.countDocuments({ isActive: true });
  const availableBooks = await Book.countDocuments({ availableCopies: { $gt: 0 }, isActive: true });
  const issuedBooks = await BookRequest.countDocuments({ status: 'issued' });
  const overdueBooks = await BookRequest.countDocuments({ 
    status: 'issued',
    dueDate: { $lt: new Date() }
  });
  
  const pendingRequests = await BookRequest.countDocuments({ status: 'pending' });
  const approvedRequests = await BookRequest.countDocuments({ status: 'approved' });
  
  const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
  
  const recentRequests = await BookRequest.find({ status: 'pending' })
    .populate('book', 'title author')
    .populate('requestedBy', 'name studentId employeeId role')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    books: {
      total: totalBooks,
      available: availableBooks,
      issued: issuedBooks,
      overdue: overdueBooks
    },
    requests: {
      pending: pendingRequests,
      approved: approvedRequests
    },
    students: totalStudents,
    recentRequests
  };
}

// Store Manager Dashboard Stats
async function getStoreStats() {
  const totalItems = await StoreItem.countDocuments({ isActive: true });
  const cleaningItems = await StoreItem.countDocuments({ category: 'cleaning', isActive: true });
  const stationaryItems = await StoreItem.countDocuments({ category: 'stationary', isActive: true });
  
  const lowStockItems = await StoreItem.countDocuments({ 
    $expr: { $lte: ['$quantity', '$minimumStock'] },
    isActive: true 
  });
  const outOfStockItems = await StoreItem.countDocuments({ quantity: 0, isActive: true });
  
  const pendingRequests = await StoreRequest.countDocuments({ status: 'pending' });
  const approvedRequests = await StoreRequest.countDocuments({ status: 'approved' });
  
  const recentRequests = await StoreRequest.find({ status: 'pending' })
    .populate('item', 'name category unit')
    .populate('requestedBy', 'name employeeId role')
    .sort({ createdAt: -1 })
    .limit(5);

  const lowStockItemsList = await StoreItem.find({ 
    $expr: { $lte: ['$quantity', '$minimumStock'] },
    isActive: true 
  }).select('name category quantity minimumStock unit').limit(10);

  return {
    inventory: {
      total: totalItems,
      cleaning: cleaningItems,
      stationary: stationaryItems,
      lowStock: lowStockItems,
      outOfStock: outOfStockItems
    },
    requests: {
      pending: pendingRequests,
      approved: approvedRequests
    },
    recentRequests,
    lowStockItems: lowStockItemsList
  };
}

// TO Dashboard Stats
async function getTOStats() {
  const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
  const activeStudents = await User.countDocuments({ 
    role: 'student', 
    isActive: true,
    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  });
  
  const myBookRequests = await BookRequest.countDocuments({ 
    requestedBy: req.user?.id,
    status: { $in: ['pending', 'approved', 'issued'] }
  });
  
  const myStoreRequests = await StoreRequest.countDocuments({ 
    requestedBy: req.user?.id,
    status: { $in: ['pending', 'approved'] }
  });

  const recentStudents = await User.find({ role: 'student' })
    .select('name email studentId department course semester createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    students: {
      total: totalStudents,
      active: activeStudents
    },
    myRequests: {
      books: myBookRequests,
      store: myStoreRequests
    },
    recentStudents
  };
}

// Teacher Dashboard Stats
async function getTeacherStats(userId) {
  const myBookRequests = await BookRequest.countDocuments({ 
    requestedBy: userId,
    status: { $in: ['pending', 'approved', 'issued'] }
  });
  
  const myStoreRequests = await StoreRequest.countDocuments({ 
    requestedBy: userId,
    status: { $in: ['pending', 'approved'] }
  });
  
  const issuedBooks = await BookRequest.countDocuments({ 
    requestedBy: userId,
    status: 'issued'
  });
  
  const overdueBooks = await BookRequest.countDocuments({ 
    requestedBy: userId,
    status: 'issued',
    dueDate: { $lt: new Date() }
  });

  const recentBookRequests = await BookRequest.find({ requestedBy: userId })
    .populate('book', 'title author')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentStoreRequests = await StoreRequest.find({ requestedBy: userId })
    .populate('item', 'name category unit')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    requests: {
      books: myBookRequests,
      store: myStoreRequests
    },
    books: {
      issued: issuedBooks,
      overdue: overdueBooks
    },
    recentBookRequests,
    recentStoreRequests
  };
}

// Student Dashboard Stats
async function getStudentStats(userId) {
  const myBookRequests = await BookRequest.countDocuments({ 
    requestedBy: userId,
    status: { $in: ['pending', 'approved', 'issued'] }
  });
  
  const issuedBooks = await BookRequest.countDocuments({ 
    requestedBy: userId,
    status: 'issued'
  });
  
  const overdueBooks = await BookRequest.countDocuments({ 
    requestedBy: userId,
    status: 'issued',
    dueDate: { $lt: new Date() }
  });
  
  const totalFines = await BookRequest.aggregate([
    { $match: { requestedBy: userId, fine: { $gt: 0 } } },
    { $group: { _id: null, totalFines: { $sum: '$fine' } } }
  ]);

  const recentBookRequests = await BookRequest.find({ requestedBy: userId })
    .populate('book', 'title author')
    .sort({ createdAt: -1 })
    .limit(5);

  const availableBooks = await Book.countDocuments({ 
    availableCopies: { $gt: 0 }, 
    isActive: true 
  });

  return {
    books: {
      requested: myBookRequests,
      issued: issuedBooks,
      overdue: overdueBooks,
      available: availableBooks
    },
    fines: totalFines.length > 0 ? totalFines[0].totalFines : 0,
    recentRequests: recentBookRequests
  };
}

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent activity based on user role
// @access  Private
router.get('/recent-activity', protect, async (req, res) => {
  try {
    let activities = [];

    switch (req.user.role) {
      case 'admin':
      case 'librarian':
        activities = await getLibraryActivity();
        break;
      case 'store':
        activities = await getStoreActivity();
        break;
      case 'to':
      case 'teacher':
      case 'student':
        activities = await getUserActivity(req.user.id);
        break;
    }

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

async function getLibraryActivity() {
  const bookRequests = await BookRequest.find()
    .populate('book', 'title')
    .populate('requestedBy', 'name role')
    .sort({ updatedAt: -1 })
    .limit(10);

  return bookRequests.map(request => ({
    type: 'book_request',
    message: `${request.requestedBy.name} ${request.status} "${request.book.title}"`,
    timestamp: request.updatedAt,
    status: request.status
  }));
}

async function getStoreActivity() {
  const storeRequests = await StoreRequest.find()
    .populate('item', 'name')
    .populate('requestedBy', 'name role')
    .sort({ updatedAt: -1 })
    .limit(10);

  return storeRequests.map(request => ({
    type: 'store_request',
    message: `${request.requestedBy.name} requested ${request.quantityRequested} ${request.item.name}`,
    timestamp: request.updatedAt,
    status: request.status
  }));
}

async function getUserActivity(userId) {
  const bookRequests = await BookRequest.find({ requestedBy: userId })
    .populate('book', 'title')
    .sort({ updatedAt: -1 })
    .limit(5);

  const storeRequests = await StoreRequest.find({ requestedBy: userId })
    .populate('item', 'name')
    .sort({ updatedAt: -1 })
    .limit(5);

  const activities = [
    ...bookRequests.map(request => ({
      type: 'book_request',
      message: `Book request for "${request.book.title}" is ${request.status}`,
      timestamp: request.updatedAt,
      status: request.status
    })),
    ...storeRequests.map(request => ({
      type: 'store_request',
      message: `Store request for ${request.quantityRequested} ${request.item.name} is ${request.status}`,
      timestamp: request.updatedAt,
      status: request.status
    }))
  ];

  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
}

module.exports = router;
