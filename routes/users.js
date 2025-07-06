const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = {};
    const roles = ['admin', 'librarian', 'store_manager', 'training_officer', 'teacher', 'student'];
    
    for (const role of roles) {
      stats[role] = await User.countDocuments({ role, isActive: true });
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

// @route   GET /api/users
// @desc    Get all users (with role-based filtering)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // Role-based access control
    if (req.user.role === 'librarian') {
      // Librarian can see all students
      query = { role: 'student' };
    } else if (req.user.role === 'to') {
      // TO can see all students
      query = { role: 'student' };
    } else if (req.user.role === 'admin') {
      // Admin can see all users
      query = {};
    } else {
      // Others can only see their own profile
      query = { _id: req.user.id };
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'to' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (TO can edit students, users can edit themselves)
router.put('/:id', protect, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    const canEdit = (
      req.user.role === 'admin' ||
      (req.user.role === 'to' && user.role === 'student') ||
      req.user.id === req.params.id
    );

    if (!canEdit) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const { name, email, phone, address, department, course, semester, isActive } = req.body;

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (department) user.department = department;
    if (course) user.course = course;
    if (semester) user.semester = semester;
    
    // Only admin and TO can change active status
    if (typeof isActive === 'boolean' && (req.user.role === 'admin' || req.user.role === 'to')) {
      user.isActive = isActive;
    }

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin and TO only)
router.delete('/:id', protect, authorize('admin', 'to'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TO can only delete students
    if (req.user.role === 'to' && user.role !== 'student') {
      return res.status(403).json({ message: 'TO can only delete students' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/students/all
// @desc    Get all students (for TO and Librarian)
// @access  Private
router.get('/students/all', protect, authorize('to', 'librarian', 'admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
