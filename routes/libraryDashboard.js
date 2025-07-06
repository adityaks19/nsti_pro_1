const express = require('express');
const Book = require('../models/Book');
const BookRequest = require('../models/BookRequest');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/library/dashboard
// @desc    Get library dashboard data
// @access  Private (Librarian only)
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Check if user is librarian or admin
    if (!['admin', 'librarian'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Librarian role required.' 
      });
    }

    // Get basic statistics
    const totalBooks = await Book.countDocuments({ isActive: true });
    const availableBooks = await Book.countDocuments({ 
      isActive: true, 
      availableCopies: { $gt: 0 } 
    });
    
    // Calculate issued books
    const issuedBooksCount = await BookRequest.countDocuments({ 
      status: 'issued' 
    });
    
    // Request statistics
    const totalRequests = await BookRequest.countDocuments();
    const pendingRequests = await BookRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await BookRequest.countDocuments({ status: 'approved' });
    const issuedRequests = await BookRequest.countDocuments({ status: 'issued' });
    const overdueRequests = await BookRequest.countDocuments({ status: 'overdue' });

    // Get total students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Get recent requests (last 10)
    const recentRequests = await BookRequest.find()
      .populate('book', 'title author category')
      .populate('requestedBy', 'name role studentId employeeId')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get available books
    const availableBooksData = await Book.find({ 
      isActive: true, 
      availableCopies: { $gt: 0 } 
    })
    .sort({ availableCopies: -1 })
    .limit(10);

    // Get overdue books
    const overdueBooks = await BookRequest.find({
      status: 'issued',
      dueDate: { $lt: new Date() }
    })
    .populate('book', 'title')
    .populate('requestedBy', 'name')
    .limit(5);

    // Monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await BookRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRequests: { $sum: 1 },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          issuedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Most requested books
    const mostRequestedBooks = await BookRequest.aggregate([
      {
        $group: {
          _id: '$book',
          totalRequests: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      {
        $unwind: '$bookDetails'
      },
      {
        $project: {
          title: '$bookDetails.title',
          author: '$bookDetails.author',
          category: '$bookDetails.category',
          totalRequests: 1
        }
      },
      {
        $sort: { totalRequests: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Generate notifications
    const notifications = [];
    
    // Pending requests notification
    if (pendingRequests > 0) {
      notifications.push({
        id: 'pending-requests',
        type: 'request',
        message: `${pendingRequests} new book requests pending approval`,
        time: 'Now',
        priority: 'high'
      });
    }

    // Overdue books notification
    if (overdueBooks.length > 0) {
      notifications.push({
        id: 'overdue-books',
        type: 'overdue',
        message: `${overdueBooks.length} books are overdue`,
        time: 'Now',
        priority: 'high'
      });
    }

    // Low stock notification
    const lowStockBooks = await Book.countDocuments({
      isActive: true,
      availableCopies: { $lte: 2, $gt: 0 }
    });

    if (lowStockBooks > 0) {
      notifications.push({
        id: 'low-stock',
        type: 'warning',
        message: `${lowStockBooks} books are running low on copies`,
        time: 'Now',
        priority: 'medium'
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks,
          availableBooks,
          issuedBooks: issuedBooksCount,
          pendingRequests,
          overdueBooks: overdueBooks.length,
          totalStudents
        },
        recentRequests,
        books: availableBooksData,
        overdueBooks,
        monthlyStats,
        mostRequestedBooks,
        notifications
      }
    });

  } catch (error) {
    console.error('Library dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching dashboard data' 
    });
  }
});

// @route   GET /api/library/books/available
// @desc    Get available books with search and filter
// @access  Private (Librarian only)
router.get('/books/available', protect, async (req, res) => {
  try {
    if (!['admin', 'librarian'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Librarian role required.' 
      });
    }

    const { search, category, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const books = await Book.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: books,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching books' 
    });
  }
});

// @route   POST /api/library/seed-books
// @desc    Seed library with sample books (development only)
// @access  Private (Librarian only)
router.post('/seed-books', protect, async (req, res) => {
  try {
    if (!['admin', 'librarian'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Librarian role required.' 
      });
    }

    // Check if books already exist
    const existingBooks = await Book.countDocuments();
    if (existingBooks > 0) {
      return res.json({
        success: true,
        message: 'Library already has books'
      });
    }

    // Sample books data
    const sampleBooks = [
      {
        title: 'Introduction to Computer Science',
        author: 'Thomas H. Cormen',
        isbn: '978-0262033848',
        category: 'Computer Science',
        publisher: 'MIT Press',
        publishedYear: 2009,
        totalCopies: 10,
        availableCopies: 8,
        location: {
          shelf: 'A1',
          section: 'CS',
          floor: 'Ground Floor'
        },
        description: 'Comprehensive introduction to algorithms and data structures',
        addedBy: req.user.id
      },
      {
        title: 'Digital Electronics',
        author: 'Morris Mano',
        isbn: '978-0132543262',
        category: 'Electronics',
        publisher: 'Pearson',
        publishedYear: 2013,
        totalCopies: 8,
        availableCopies: 6,
        location: {
          shelf: 'B2',
          section: 'EC',
          floor: 'Ground Floor'
        },
        description: 'Fundamentals of digital logic and computer design',
        addedBy: req.user.id
      },
      {
        title: 'Data Structures and Algorithms',
        author: 'Robert Sedgewick',
        isbn: '978-0321573513',
        category: 'Computer Science',
        publisher: 'Addison-Wesley',
        publishedYear: 2011,
        totalCopies: 12,
        availableCopies: 10,
        location: {
          shelf: 'A2',
          section: 'CS',
          floor: 'Ground Floor'
        },
        description: 'Advanced algorithms and data structure implementations',
        addedBy: req.user.id
      },
      {
        title: 'Engineering Mathematics',
        author: 'B.S. Grewal',
        isbn: '978-8173716751',
        category: 'Mathematics',
        publisher: 'Khanna Publishers',
        publishedYear: 2014,
        totalCopies: 15,
        availableCopies: 12,
        location: {
          shelf: 'C3',
          section: 'MATH',
          floor: 'First Floor'
        },
        description: 'Higher engineering mathematics for technical students',
        addedBy: req.user.id
      },
      {
        title: 'Mechanical Engineering Design',
        author: 'Joseph Shigley',
        isbn: '978-0073398204',
        category: 'Mechanical',
        publisher: 'McGraw-Hill',
        publishedYear: 2015,
        totalCopies: 6,
        availableCopies: 4,
        location: {
          shelf: 'D4',
          section: 'MECH',
          floor: 'First Floor'
        },
        description: 'Mechanical component design and analysis',
        addedBy: req.user.id
      },
      {
        title: 'Database Management Systems',
        author: 'Raghu Ramakrishnan',
        isbn: '978-0072465631',
        category: 'Computer Science',
        publisher: 'McGraw-Hill',
        publishedYear: 2012,
        totalCopies: 9,
        availableCopies: 7,
        location: {
          shelf: 'A3',
          section: 'CS',
          floor: 'Ground Floor'
        },
        description: 'Database design, implementation, and management',
        addedBy: req.user.id
      },
      {
        title: 'Computer Networks',
        author: 'Andrew Tanenbaum',
        isbn: '978-0132126953',
        category: 'Computer Science',
        publisher: 'Pearson',
        publishedYear: 2011,
        totalCopies: 8,
        availableCopies: 5,
        location: {
          shelf: 'A4',
          section: 'CS',
          floor: 'Ground Floor'
        },
        description: 'Network protocols, architecture, and implementation',
        addedBy: req.user.id
      },
      {
        title: 'Operating System Concepts',
        author: 'Abraham Silberschatz',
        isbn: '978-1118063330',
        category: 'Computer Science',
        publisher: 'Wiley',
        publishedYear: 2013,
        totalCopies: 10,
        availableCopies: 8,
        location: {
          shelf: 'A5',
          section: 'CS',
          floor: 'Ground Floor'
        },
        description: 'Operating system principles and implementation',
        addedBy: req.user.id
      }
    ];

    // Insert all books
    await Book.insertMany(sampleBooks);

    res.json({
      success: true,
      message: `Successfully seeded ${sampleBooks.length} books`,
      data: {
        totalBooks: sampleBooks.length
      }
    });

  } catch (error) {
    console.error('Seed books error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while seeding books' 
    });
  }
});

module.exports = router;
