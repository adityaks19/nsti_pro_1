const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Mock data for Prime Minister demonstration - Direct requests to librarian
let bookRequests = [
  {
    id: 1,
    userId: 'student1',
    userName: 'Aditya Sharma',
    userRole: 'student',
    bookId: 1,
    bookTitle: 'Introduction to Computer Science',
    status: 'pending',
    requestDate: new Date().toISOString(),
    studentId: 'STU2025040',
    requestedTo: 'librarian'
  },
  {
    id: 2,
    userId: 'teacher1',
    userName: 'Prof. Rajesh Kumar',
    userRole: 'teacher',
    bookId: 2,
    bookTitle: 'Data Structures and Algorithms',
    status: 'pending',
    requestDate: new Date().toISOString(),
    employeeId: 'EMP2025981',
    requestedTo: 'librarian'
  },
  {
    id: 3,
    userId: 'to1',
    userName: 'Training Officer',
    userRole: 'to',
    bookId: 3,
    bookTitle: 'Engineering Mathematics',
    status: 'approved',
    requestDate: new Date().toISOString(),
    employeeId: 'EMP2025577',
    requestedTo: 'librarian',
    approvedBy: 'Library Manager',
    approvedDate: new Date().toISOString()
  },
  {
    id: 4,
    userId: 'student2',
    userName: 'Priya Singh',
    userRole: 'student',
    bookId: 4,
    bookTitle: 'Digital Electronics',
    status: 'issued',
    requestDate: new Date(Date.now() - 86400000).toISOString(),
    studentId: 'STU2025041',
    requestedTo: 'librarian',
    approvedBy: 'Library Manager',
    approvedDate: new Date(Date.now() - 43200000).toISOString(),
    issuedDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 1209600000).toISOString() // 14 days from now
  },
  {
    id: 5,
    userId: 'teacher2',
    userName: 'Dr. Sarah Wilson',
    userRole: 'teacher',
    bookId: 5,
    bookTitle: 'Mechanical Engineering Design',
    status: 'rejected',
    requestDate: new Date(Date.now() - 172800000).toISOString(),
    employeeId: 'EMP2025982',
    requestedTo: 'librarian',
    rejectedBy: 'Library Manager',
    rejectedDate: new Date(Date.now() - 86400000).toISOString(),
    rejectionReason: 'Book currently reserved for final year students'
  }
];

let books = [
  { id: 1, title: 'Introduction to Computer Science', author: 'Thomas H. Cormen', available: 8, total: 10, category: 'Computer Science', location: 'A1-CS' },
  { id: 2, title: 'Digital Electronics', author: 'Morris Mano', available: 6, total: 8, category: 'Electronics', location: 'B2-EC' },
  { id: 3, title: 'Data Structures and Algorithms', author: 'Robert Sedgewick', available: 10, total: 12, category: 'Computer Science', location: 'A2-CS' },
  { id: 4, title: 'Engineering Mathematics', author: 'B.S. Grewal', available: 12, total: 15, category: 'Mathematics', location: 'C3-MATH' },
  { id: 5, title: 'Mechanical Engineering Design', author: 'Joseph Shigley', available: 4, total: 6, category: 'Mechanical', location: 'D4-MECH' },
  { id: 6, title: 'Database Management Systems', author: 'Raghu Ramakrishnan', available: 9, total: 12, category: 'Computer Science', location: 'A3-CS' },
  { id: 7, title: 'Network Security', author: 'William Stallings', available: 7, total: 10, category: 'Cybersecurity', location: 'A4-CS' }
];

// @route   GET /api/book-requests/books
// @desc    Get all available books for Student/Teacher/TO
// @access  Private
router.get('/books', protect, async (req, res) => {
  try {
    // Only allow Student, Teacher, TO to view books for requesting
    if (!['student', 'teacher', 'to'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, teachers, and training officers can view books for requesting.'
      });
    }

    res.json({
      success: true,
      books: books,
      message: `Books available for ${req.user.role} to request directly to librarian`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/book-requests/request
// @desc    Submit a book request directly to librarian
// @access  Private (Student, Teacher, TO only)
router.post('/request', protect, async (req, res) => {
  try {
    // Only allow Student, Teacher, TO to make requests
    if (!['student', 'teacher', 'to'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students, teachers, and training officers can request books.'
      });
    }

    const { bookId } = req.body;
    
    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    const book = books.find(b => b.id === parseInt(bookId));
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.available <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book not available'
      });
    }

    // Check if user already has pending request for this book
    const existingRequest = bookRequests.find(r => 
      r.userId === req.user.id && 
      r.bookId === parseInt(bookId) && 
      ['pending', 'approved'].includes(r.status)
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved request for this book'
      });
    }

    const newRequest = {
      id: bookRequests.length + 1,
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      bookId: book.id,
      bookTitle: book.title,
      status: 'pending',
      requestDate: new Date().toISOString(),
      studentId: req.user.studentId,
      employeeId: req.user.employeeId,
      requestedTo: 'librarian'
    };

    bookRequests.push(newRequest);

    res.json({
      success: true,
      message: `Book request submitted successfully to librarian. Request ID: ${newRequest.id}`,
      request: newRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/book-requests/my-requests
// @desc    Get user's book requests
// @access  Private (Student, Teacher, TO)
router.get('/my-requests', protect, async (req, res) => {
  try {
    if (!['student', 'teacher', 'to'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const userRequests = bookRequests.filter(req => req.userId === req.user.id);
    
    res.json({
      success: true,
      requests: userRequests,
      message: `Found ${userRequests.length} requests for ${req.user.role}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/book-requests/librarian-requests
// @desc    Get all book requests for librarian to review
// @access  Private (Librarian only)
router.get('/librarian-requests', protect, async (req, res) => {
  try {
    if (req.user.role !== 'librarian') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only librarians can view all requests.'
      });
    }

    // Get all requests with book details
    const requestsWithBooks = bookRequests.map(request => {
      const book = books.find(b => b.id === request.bookId);
      return {
        ...request,
        bookDetails: book
      };
    });

    res.json({
      success: true,
      requests: requestsWithBooks,
      stats: {
        total: bookRequests.length,
        pending: bookRequests.filter(r => r.status === 'pending').length,
        approved: bookRequests.filter(r => r.status === 'approved').length,
        issued: bookRequests.filter(r => r.status === 'issued').length,
        rejected: bookRequests.filter(r => r.status === 'rejected').length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/book-requests/:id/approve
// @desc    Approve a book request (Librarian only)
// @access  Private (Librarian only)
router.put('/:id/approve', protect, async (req, res) => {
  try {
    if (req.user.role !== 'librarian') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only librarians can approve requests.'
      });
    }

    const requestId = parseInt(req.params.id);
    const request = bookRequests.find(r => r.id === requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be approved'
      });
    }

    request.status = 'approved';
    request.approvedDate = new Date().toISOString();
    request.approvedBy = req.user.name;

    res.json({
      success: true,
      message: `Request approved successfully for ${request.userName} (${request.userRole})`,
      request: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/book-requests/:id/reject
// @desc    Reject a book request (Librarian only)
// @access  Private (Librarian only)
router.put('/:id/reject', protect, async (req, res) => {
  try {
    if (req.user.role !== 'librarian') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only librarians can reject requests.'
      });
    }

    const requestId = parseInt(req.params.id);
    const { reason } = req.body;
    const request = bookRequests.find(r => r.id === requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be rejected'
      });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    request.status = 'rejected';
    request.rejectedDate = new Date().toISOString();
    request.rejectedBy = req.user.name;
    request.rejectionReason = reason;

    res.json({
      success: true,
      message: `Request rejected for ${request.userName} (${request.userRole})`,
      request: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/book-requests/:id/issue
// @desc    Issue a book (Librarian only)
// @access  Private (Librarian only)
router.put('/:id/issue', protect, async (req, res) => {
  try {
    if (req.user.role !== 'librarian') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only librarians can issue books.'
      });
    }

    const requestId = parseInt(req.params.id);
    const request = bookRequests.find(r => r.id === requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved requests can be issued'
      });
    }

    // Check book availability
    const book = books.find(b => b.id === request.bookId);
    if (!book || book.available <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book not available for issue'
      });
    }

    request.status = 'issued';
    request.issuedDate = new Date().toISOString();
    request.issuedBy = req.user.name;
    
    // Set due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    request.dueDate = dueDate.toISOString();

    // Decrease available books
    book.available -= 1;

    res.json({
      success: true,
      message: `Book issued successfully to ${request.userName} (${request.userRole}). Due date: ${dueDate.toLocaleDateString()}`,
      request: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
