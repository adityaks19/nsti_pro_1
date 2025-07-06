#!/bin/bash

# NSTI College Management System - Complete Startup Script
echo "🚀 Starting NSTI College Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Kill any existing processes on ports 3000 and 5000
print_info "Cleaning up existing processes..."
lsof -ti:3000,5000 | xargs -r kill -9 2>/dev/null
sleep 2

# Check if MongoDB is running
print_info "Checking MongoDB status..."
if ! systemctl is-active --quiet mongod; then
    print_warning "MongoDB is not running. Starting MongoDB..."
    sudo systemctl start mongod
    sleep 3
    if systemctl is-active --quiet mongod; then
        print_status "MongoDB started successfully"
    else
        print_error "Failed to start MongoDB"
        exit 1
    fi
else
    print_status "MongoDB is already running"
fi

# Navigate to project directory
cd /home/aditya/finalpro

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing backend dependencies..."
    npm install
fi

# Install frontend dependencies if needed
if [ ! -d "client/node_modules" ]; then
    print_info "Installing frontend dependencies..."
    cd client
    npm install
    cd ..
fi

# Seed the database with demo data
print_info "Seeding database with demo data..."
node scripts/seedData.js

# Create log files
touch backend.log
touch client/frontend.log

print_status "Starting backend server on port 5000..."
# Start backend server in background
nohup npm run server > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_status "Backend server started successfully (PID: $BACKEND_PID)"
else
    print_error "Failed to start backend server"
    exit 1
fi

print_status "Starting frontend server on port 3000..."
# Start frontend server in background
cd client
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 10

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    print_status "Frontend server started successfully (PID: $FRONTEND_PID)"
else
    print_error "Failed to start frontend server"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Save PIDs for later cleanup
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid

print_status "🎉 NSTI College Management System is now running!"
echo ""
print_info "📋 Access Information:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:5000"
echo ""
print_info "👥 Demo Login Credentials:"
echo "   👨‍💼 Admin: admin@nsti.edu / admin123"
echo "   📚 Librarian: librarian@nsti.edu / lib123"
echo "   🏪 Store Manager: store@nsti.edu / store123"
echo "   👨‍🏫 Training Officer: to@nsti.edu / to123456"
echo "   👨‍🎓 Teacher: teacher@nsti.edu / teacher123"
echo "   🎓 Student: student@nsti.edu / student123"
echo ""
print_info "📊 System Status:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo "   MongoDB: Running"
echo ""
print_warning "To stop the system, run: ./stop-system.sh"
echo ""
print_status "System is ready for demonstration! 🚀"

# Keep script running to show logs
echo ""
print_info "Monitoring system logs (Press Ctrl+C to exit monitoring)..."
echo "Backend logs:"
tail -f backend.log &
echo "Frontend logs:"
tail -f client/frontend.log &

# Wait for user interrupt
wait
