const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const BookRequest = require('../models/BookRequest');
const StoreItem = require('../models/StoreItem');
const StoreRequest = require('../models/StoreRequest');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get analytics overview data
// @access  Private (Admin only)
router.get('/overview', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalUsers = await User.countDocuments({ isActive: true });
    const booksIssued = await BookRequest.countDocuments({ 
      status: 'issued',
      createdAt: { $gte: startDate }
    });
    const storeRequests = await StoreRequest.countDocuments({ 
      status: 'fulfilled',
      createdAt: { $gte: startDate }
    });

    // Calculate system usage percentage (simplified)
    const totalRequests = await BookRequest.countDocuments({ createdAt: { $gte: startDate } }) +
                         await StoreRequest.countDocuments({ createdAt: { $gte: startDate } });
    const systemUsage = Math.min(Math.round((totalRequests / totalUsers) * 100), 100);

    res.json({
      success: true,
      data: {
        totalUsers,
        booksIssued,
        storeRequests,
        systemUsage
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get trend data for charts
// @access  Private (Admin only)
router.get('/trends', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const days = parseInt(req.query.days) || 30;
    
    // Generate sample trend data (in a real app, this would be calculated from actual data)
    const trends = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 50) + 20,
        books: Math.floor(Math.random() * 30) + 10,
        requests: Math.floor(Math.random() * 20) + 5
      });
    }

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/top-users
// @desc    Get most active users
// @access  Private (Admin only)
router.get('/top-users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get users with most book requests
    const topUsers = await BookRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$requestedBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          role: '$user.role',
          activity: '$count'
        }
      }
    ]);

    res.json({
      success: true,
      data: topUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/top-books
// @desc    Get most requested books
// @access  Private (Admin only)
router.get('/top-books', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topBooks = await BookRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' },
      {
        $project: {
          title: '$book.title',
          author: '$book.author',
          requests: '$count'
        }
      }
    ]);

    res.json({
      success: true,
      data: topBooks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/top-items
// @desc    Get most requested store items
// @access  Private (Admin only)
router.get('/top-items', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topItems = await StoreRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$item', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'storeitems',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $project: {
          name: '$item.name',
          category: '$item.category',
          requests: '$count'
        }
      }
    ]);

    res.json({
      success: true,
      data: topItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
