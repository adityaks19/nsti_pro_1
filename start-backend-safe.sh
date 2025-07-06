#!/bin/bash

echo "🔧 NSTI Backend Safe Startup Script"
echo "=================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "server.js" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "node.*5000" 2>/dev/null || true

# Wait for processes to die
sleep 3

# Check if port 5000 is free
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 5000 is still in use, force killing..."
    PID=$(lsof -ti:5000)
    if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null || true
        sleep 2
    fi
fi

# Verify port is free
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Unable to free port 5000, exiting"
    exit 1
else
    echo "✅ Port 5000 is free"
fi

# Check MongoDB connection
echo "🔍 Checking MongoDB connection..."
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log('✅ MongoDB connection verified');
  process.exit(0);
}).catch(err => {
  console.log('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
" || {
    echo "❌ MongoDB connection failed, exiting"
    exit 1
}

# Start the server
echo "🚀 Starting backend server..."
echo "=================================="

# Use the stable server
node server-stable.js
