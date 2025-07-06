const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Enhanced error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}:${conn.connection.port}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Connect to database
connectDB();

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

// Routes with error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/library', require('./routes/library'));
  app.use('/api/library', require('./routes/libraryDashboard'));
  app.use('/api/store', require('./routes/store'));
  app.use('/api/store', require('./routes/storeDashboard'));
  app.use('/api/book-requests', require('./routes/bookRequests'));
  app.use('/api/admin-ops', require('./routes/adminOperations'));
  app.use('/api/leave', require('./routes/leave'));
  app.use('/api/dashboard', require('./routes/dashboard'));
  app.use('/api/analytics', require('./routes/analytics'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/student', require('./routes/studentDashboard'));
  
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  process.exit(1);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Start server with error handling
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 NSTI College Management Server Started');
    console.log('='.repeat(50));
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log('='.repeat(50));
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      console.log('🔍 Checking for existing processes...');
      
      // Try to find and kill existing processes
      const { exec } = require('child_process');
      exec(`lsof -ti:${PORT}`, (error, stdout) => {
        if (stdout) {
          const pid = stdout.trim();
          console.log(`🔪 Killing process ${pid} on port ${PORT}`);
          exec(`kill -9 ${pid}`, (killError) => {
            if (!killError) {
              console.log('✅ Process killed, retrying server start...');
              setTimeout(startServer, 2000);
            } else {
              console.error('❌ Failed to kill process:', killError.message);
              process.exit(1);
            }
          });
        } else {
          console.error('❌ Port is in use but no process found');
          process.exit(1);
        }
      });
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      mongoose.connection.close(false, () => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      mongoose.connection.close(false, () => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      });
    });
  });
};

startServer();
