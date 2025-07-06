const express = require('express');
const mongoose = require('mongoose');
const BookRequest = require('../models/BookRequest');
const Book = require('../models/Book');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/student/dashboard
// @desc    Get student dashboard data
// @access  Private (Student only)
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Check if user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student role required.'
      });
    }

    const studentId = req.user.id;

    // Get student's book requests
    const bookRequests = await BookRequest.find({ requestedBy: studentId })
      .populate('book', 'title author isbn category')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate dashboard statistics
    const stats = {
      totalBookRequests: bookRequests.length,
      pendingRequests: bookRequests.filter(r => r.status === 'pending').length,
      approvedRequests: bookRequests.filter(r => r.status === 'approved').length,
      issuedBooks: bookRequests.filter(r => r.status === 'issued').length,
      overdueBooks: bookRequests.filter(r => r.status === 'overdue').length,
      returnedBooks: bookRequests.filter(r => r.status === 'returned').length,
      totalFines: bookRequests.reduce((sum, r) => sum + (r.fine || 0), 0),
      pendingFines: bookRequests.filter(r => r.fineStatus === 'pending').reduce((sum, r) => sum + (r.fine || 0), 0)
    };

    // Get recent book requests (last 5)
    const recentRequests = bookRequests.slice(0, 5);

    // Get currently issued books
    const issuedBooks = bookRequests.filter(r => ['issued', 'overdue'].includes(r.status));

    // Get available books for recommendations (random 6 books)
    const availableBooks = await Book.find({ 
      isActive: true, 
      availableCopies: { $gt: 0 } 
    })
    .select('title author isbn category price')
    .limit(6)
    .sort({ requestCount: -1 }) // Sort by popularity
    .lean();

    // Get total available books count
    const totalAvailableBooks = await Book.countDocuments({ 
      isActive: true, 
      availableCopies: { $gt: 0 } 
    });

    // Generate monthly activity data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    let monthlyActivity = [];
    try {
      monthlyActivity = await BookRequest.aggregate([
        {
          $match: {
            requestedBy: new mongoose.Types.ObjectId(studentId),
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            requests: { $sum: 1 },
            issued: { $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] } },
            returned: { $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] } }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);
    } catch (aggError) {
      console.error('Monthly activity aggregation error:', aggError);
      // Fallback to mock data
      monthlyActivity = [];
    }

    // Format monthly data for frontend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let formattedMonthlyActivity = monthlyActivity.map(item => ({
      month: months[item._id.month - 1],
      requests: item.requests,
      issued: item.issued,
      returned: item.returned
    }));

    // If no data, provide mock data
    if (formattedMonthlyActivity.length === 0) {
      formattedMonthlyActivity = [
        { month: 'Jan', requests: 2, issued: 1, returned: 1 },
        { month: 'Feb', requests: 3, issued: 2, returned: 1 },
        { month: 'Mar', requests: 1, issued: 1, returned: 2 },
        { month: 'Apr', requests: 4, issued: 3, returned: 1 },
        { month: 'May', requests: 2, issued: 2, returned: 3 },
        { month: 'Jun', requests: 3, issued: 1, returned: 2 }
      ];
    }

    // Generate category statistics
    let categoryStats = [];
    try {
      categoryStats = await BookRequest.aggregate([
        {
          $match: { requestedBy: new mongoose.Types.ObjectId(studentId) }
        },
        {
          $lookup: {
            from: 'books',
            localField: 'book',
            foreignField: '_id',
            as: 'bookInfo'
          }
        },
        {
          $unwind: '$bookInfo'
        },
        {
          $group: {
            _id: '$bookInfo.category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        }
      ]);
    } catch (aggError) {
      console.error('Category stats aggregation error:', aggError);
      categoryStats = [];
    }

    let formattedCategoryStats = categoryStats.map((cat, index) => ({
      name: cat._id || 'Unknown',
      value: cat.count,
      color: ['#1a237e', '#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da'][index]
    }));

    // If no data, provide mock data
    if (formattedCategoryStats.length === 0) {
      formattedCategoryStats = [
        { name: 'Computer Science', value: 5, color: '#1a237e' },
        { name: 'Mathematics', value: 3, color: '#3f51b5' },
        { name: 'Engineering', value: 2, color: '#5c6bc0' },
        { name: 'Science', value: 1, color: '#7986cb' }
      ];
    }

    // Get student's leave applications
    let leaveApplications = [];
    try {
      leaveApplications = await Leave.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
    } catch (leaveError) {
      console.error('Leave applications error:', leaveError);
    }

    // Generate notifications
    const notifications = [];

    // Check for overdue books
    const overdueBooks = issuedBooks.filter(book => {
      return book.dueDate && new Date() > new Date(book.dueDate);
    });

    if (overdueBooks.length > 0) {
      notifications.push({
        id: 'overdue',
        type: 'error',
        title: 'Overdue Books',
        message: `You have ${overdueBooks.length} overdue book(s). Please return them to avoid additional fines.`,
        time: 'Now',
        icon: 'warning'
      });
    }

    // Check for books due soon (within 3 days)
    const dueSoonBooks = issuedBooks.filter(book => {
      if (!book.dueDate) return false;
      const daysUntilDue = Math.ceil((new Date(book.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilDue > 0 && daysUntilDue <= 3;
    });

    if (dueSoonBooks.length > 0) {
      notifications.push({
        id: 'due-soon',
        type: 'warning',
        title: 'Books Due Soon',
        message: `${dueSoonBooks.length} book(s) are due within 3 days.`,
        time: 'Today',
        icon: 'schedule'
      });
    }

    // Check for approved requests
    const approvedRequests = bookRequests.filter(r => r.status === 'approved');
    if (approvedRequests.length > 0) {
      notifications.push({
        id: 'approved',
        type: 'success',
        title: 'Requests Approved',
        message: `${approvedRequests.length} of your book requests have been approved.`,
        time: '1 day ago',
        icon: 'check_circle'
      });
    }

    // Add general notification about new books
    notifications.push({
      id: 'new-books',
      type: 'info',
      title: 'New Books Available',
      message: 'Check out the latest additions to our library collection.',
      time: '2 days ago',
      icon: 'book'
    });

    res.json({
      success: true,
      data: {
        stats: {
          ...stats,
          availableBooks: totalAvailableBooks
        },
        recentRequests,
        issuedBooks,
        recommendedBooks: availableBooks,
        monthlyActivity: formattedMonthlyActivity,
        categoryStats: formattedCategoryStats,
        notifications,
        leaveApplications
      }
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/student/profile
// @desc    Get student profile information
// @access  Private (Student only)
router.get('/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student role required.'
      });
    }

    const student = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get additional stats
    const totalRequests = await BookRequest.countDocuments({ requestedBy: req.user.id });
    const totalFines = await BookRequest.aggregate([
      { $match: { requestedBy: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: null, total: { $sum: '$fine' } } }
    ]);

    const profileData = {
      ...student,
      libraryStats: {
        totalRequests,
        totalFines: totalFines[0]?.total || 0
      }
    };

    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile data'
    });
  }
});

module.exports = router;
