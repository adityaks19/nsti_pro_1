const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect: auth } = require('../middleware/auth');

// @route   POST /api/leave/apply
// @desc    Submit a new leave application
// @access  Private (Student only)
router.post('/apply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can apply for leave'
      });
    }

    const { leaveType, startDate, endDate, reason, priority, urgencyReason } = req.body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const leaveApplication = new Leave({
      student: req.user.id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      priority: priority || 'medium',
      urgencyReason,
      attachments: [], // Empty for now
      status: 'pending',
      currentStage: 'student_submitted'
    });

    await leaveApplication.save();

    res.json({
      success: true,
      message: 'Leave application submitted successfully',
      application: leaveApplication
    });
  } catch (error) {
    console.error('Error submitting leave application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leave/my-applications
// @desc    Get student's leave applications
// @access  Private (Student only)
router.get('/my-applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const applications = await Leave.find({ student: req.user.id })
      .populate('teacherReview.reviewedBy', 'name')
      .populate('toReview.reviewedBy', 'name')
      .sort({ submittedDate: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leave/pending-teacher
// @desc    Get leave applications pending teacher review
// @access  Private (Teacher only)
router.get('/pending-teacher', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const applications = await Leave.find({ 
      status: 'pending',
      'teacherReview.status': { $exists: false }
    })
      .populate('student', 'name email studentId department course')
      .sort({ priority: -1, submittedDate: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leave/pending-to
// @desc    Get leave applications pending TO review
// @access  Private (TO only)
router.get('/pending-to', auth, async (req, res) => {
  try {
    if (req.user.role !== 'to') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const applications = await Leave.find({ 
      'teacherReview.status': 'approved',
      'toReview.status': { $exists: false }
    })
      .populate('student', 'name email studentId department course')
      .populate('teacherReview.reviewedBy', 'name')
      .sort({ priority: -1, submittedDate: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/leave/:id/teacher-review
// @desc    Teacher review of leave application
// @access  Private (Teacher only)
router.put('/:id/teacher-review', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status, comments, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Leave.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update teacher review
    application.teacherReview = {
      reviewedBy: req.user.id,
      status,
      reviewDate: new Date(),
      comments,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      reviewStarted: application.teacherReview?.reviewStarted || new Date()
    };

    // Update application status and stage
    if (status === 'approved') {
      application.status = 'teacher_approved';
      application.currentStage = 'to_review';
    } else {
      application.status = 'rejected';
      application.currentStage = 'completed';
      application.completedDate = new Date();
    }

    await application.save();

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    console.error('Error reviewing application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/leave/:id/to-review
// @desc    TO review of leave application
// @access  Private (TO only)
router.put('/:id/to-review', auth, async (req, res) => {
  try {
    if (req.user.role !== 'to') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status, comments, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Leave.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.teacherReview?.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Application must be approved by teacher first'
      });
    }

    // Update TO review
    application.toReview = {
      reviewedBy: req.user.id,
      status,
      reviewDate: new Date(),
      comments,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      reviewStarted: application.toReview?.reviewStarted || new Date()
    };

    // Update application status and stage
    application.status = status === 'approved' ? 'approved' : 'rejected';
    application.currentStage = 'completed';
    application.completedDate = new Date();

    await application.save();

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    console.error('Error reviewing application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/leave/:id/start-teacher-review
// @desc    Mark teacher review as started
// @access  Private (Teacher only)
router.put('/:id/start-teacher-review', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const application = await Leave.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update status to show teacher is reviewing
    application.status = 'teacher_reviewing';
    application.currentStage = 'teacher_review';
    
    if (!application.teacherReview) {
      application.teacherReview = {};
    }
    application.teacherReview.reviewStarted = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Review started',
      application
    });
  } catch (error) {
    console.error('Error starting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/leave/:id/start-to-review
// @desc    Mark TO review as started
// @access  Private (TO only)
router.put('/:id/start-to-review', auth, async (req, res) => {
  try {
    if (req.user.role !== 'to') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const application = await Leave.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update status to show TO is reviewing
    application.status = 'to_reviewing';
    
    if (!application.toReview) {
      application.toReview = {};
    }
    application.toReview.reviewStarted = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Review started',
      application
    });
  } catch (error) {
    console.error('Error starting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leave/all
// @desc    Get all leave applications (Admin/TO only)
// @access  Private (Admin/TO only)
router.get('/all', auth, async (req, res) => {
  try {
    if (!['admin', 'to'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const applications = await Leave.find()
      .populate('student', 'name email studentId department course')
      .populate('teacherReview.reviewedBy', 'name')
      .populate('toReview.reviewedBy', 'name')
      .sort({ priority: -1, submittedDate: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leave/stats
// @desc    Get leave statistics
// @access  Private (Admin/TO/Teacher only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (!['admin', 'to', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stageStats = await Leave.aggregate([
      {
        $group: {
          _id: '$currentStage',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byStage: stageStats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
