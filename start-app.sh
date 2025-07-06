#!/bin/bash

echo "🚀 Starting NSTI College Management System..."

# Kill any existing processes on ports 5001 and 3000
echo "🔄 Cleaning up existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Start backend server in background
echo "🔧 Starting backend server on port 5001..."
cd /home/aditya/finalpro
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server on port 3000..."
cd /home/aditya/finalpro/client
npm start &
FRONTEND_PID=$!

echo "✅ Both servers started successfully!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "node server.js" 2>/dev/null || true
    pkill -f "react-scripts start" 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for both processes
wait
