const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    required: true,
    enum: ['Medical Leave', 'Personal Leave', 'Family Emergency', 'Academic Leave', 'Other']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String
  }],
  status: {
    type: String,
    enum: ['pending', 'teacher_reviewing', 'teacher_approved', 'to_reviewing', 'approved', 'rejected'],
    default: 'pending'
  },
  currentStage: {
    type: String,
    enum: ['student_submitted', 'teacher_review', 'to_review', 'completed'],
    default: 'student_submitted'
  },
  teacherReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['approved', 'rejected']
    },
    reviewDate: Date,
    comments: String,
    rejectionReason: String,
    reviewStarted: Date
  },
  toReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['approved', 'rejected']
    },
    reviewDate: Date,
    comments: String,
    rejectionReason: String,
    reviewStarted: Date
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  completedDate: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  urgencyReason: String
}, {
  timestamps: true
});

// Index for efficient queries
leaveSchema.index({ student: 1, submittedDate: -1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ currentStage: 1 });

// Virtual for calculating leave duration
leaveSchema.virtual('duration').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// Method to get status color
leaveSchema.methods.getStatusColor = function() {
  const colors = {
    'pending': '#ff9800',
    'teacher_reviewing': '#2196f3',
    'teacher_approved': '#4caf50',
    'to_reviewing': '#9c27b0',
    'approved': '#4caf50',
    'rejected': '#f44336'
  };
  return colors[this.status] || '#757575';
};

// Method to get current stage info
leaveSchema.methods.getCurrentStageInfo = function() {
  const stages = {
    'student_submitted': { 
      label: 'Submitted', 
      color: '#ff9800', 
      description: 'Application submitted by student' 
    },
    'teacher_review': { 
      label: 'Teacher Review', 
      color: '#2196f3', 
      description: 'Under review by teacher' 
    },
    'to_review': { 
      label: 'TO Review', 
      color: '#9c27b0', 
      description: 'Under review by Training Officer' 
    },
    'completed': { 
      label: 'Completed', 
      color: this.status === 'approved' ? '#4caf50' : '#f44336', 
      description: this.status === 'approved' ? 'Application approved' : 'Application rejected' 
    }
  };
  return stages[this.currentStage] || stages['student_submitted'];
};

module.exports = mongoose.model('Leave', leaveSchema);
