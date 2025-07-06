const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'librarian', 'admin', 'store', 'to'],
    required: [true, 'Role is required']
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'teacher';
    }
  },
  course: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  semester: {
    type: Number,
    required: function() {
      return this.role === 'student';
    }
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate employee/student ID
userSchema.pre('save', function(next) {
  if (this.isNew) {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    if (this.role === 'student') {
      this.studentId = `STU${currentYear}${randomNum}`;
    } else if (this.role !== 'admin') {
      this.employeeId = `EMP${currentYear}${randomNum}`;
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
