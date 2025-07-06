#!/bin/bash

echo "🚀 Starting NSTI College Management System..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Run: sudo systemctl start mongod"
    echo "   Or: mongod --dbpath /path/to/your/db"
    exit 1
fi

echo "✅ MongoDB is running"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if client/node_modules exists
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client && npm install && cd ..
fi

# Seed database if needed
echo "🌱 Seeding database with demo data..."
node scripts/seedData.js

echo "🎉 Starting the application..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo ""
echo "🔐 Demo Login Credentials:"
echo "   Admin: admin@nsti.edu / admin123"
echo "   Librarian: librarian@nsti.edu / lib123"
echo "   Store Manager: store@nsti.edu / store123"
echo "   Training Officer: to@nsti.edu / to123"
echo "   Teacher: teacher@nsti.edu / teacher123"
echo "   Student: student@nsti.edu / student123"
echo ""

# Start the application
npm run dev
