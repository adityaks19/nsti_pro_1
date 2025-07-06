#!/bin/bash

# NSTI College Management System - Stop Script
echo "🛑 Stopping NSTI College Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Navigate to project directory
cd /home/aditya/finalpro

# Kill processes by PID if files exist
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        print_status "Backend server stopped (PID: $BACKEND_PID)"
    fi
    rm backend.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        print_status "Frontend server stopped (PID: $FRONTEND_PID)"
    fi
    rm frontend.pid
fi

# Kill any remaining processes on ports 3000 and 5000
print_info "Cleaning up any remaining processes..."
lsof -ti:3000,5000 | xargs -r kill -9 2>/dev/null

print_status "🎉 NSTI College Management System stopped successfully!"
echo ""
print_info "To restart the system, run: ./start-complete.sh"
