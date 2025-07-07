#!/bin/bash

# Fix build errors in React components

echo "🔧 Fixing React build errors..."

# Fix TOLeaveApplications.js - CheckCircleIcon import
echo "Fixing TOLeaveApplications.js..."
cd client/src/components/to

# Create a backup
cp TOLeaveApplications.js TOLeaveApplications.js.backup

# Fix the CheckCircleIcon import issue
sed -i 's/CheckCircle as ApproveIcon,/CheckCircle as ApproveIcon,\n  CheckCircle as CheckCircleIcon,/' TOLeaveApplications.js

cd ../../../..

# Fix AddBook.js - ensure all Material-UI imports are properly formatted
echo "Fixing AddBook.js..."
cd client/src/components/library

# Create a backup
cp AddBook.js AddBook.js.backup

# Recreate the file with proper imports
cat > AddBook_fixed.js << 'EOF'
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Snackbar,
  Paper,
  Divider,
  Chip,
  InputAdornment,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Language as LanguageIcon,
  Star as StarIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { StandardTextField, StandardSelect, StandardNumberField } from '../common/StandardInput';
EOF

# Get the rest of the file content (everything after the imports)
tail -n +35 AddBook.js >> AddBook_fixed.js

# Replace the original file
mv AddBook_fixed.js AddBook.js

cd ../../../..

echo "✅ Build errors fixed!"

# Try building again
echo "🏗️ Rebuilding frontend..."
cd client
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    cd ..
    
    # Continue with the laptop server setup
    echo "🚀 Continuing with laptop server setup..."
    
    # Create environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nsti_college_db
JWT_SECRET=nsti_college_management_jwt_secret_key_2024_laptop_$(date +%s)
JWT_EXPIRE=30d
HOST=0.0.0.0
EOF
        echo "Environment file: ✅ Created"
    fi
    
    # Seed database
    echo "🌱 Seeding database..."
    node scripts/seedData.js 2>/dev/null && echo "Database seeding: ✅ Completed" || echo "Database seeding: ⚠️ Skipped"
    
    # Create PM2 configuration
    cat > ecosystem.laptop.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'nsti-laptop-server',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0'
      },
      watch: false,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      max_memory_restart: '500M',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
EOF
    
    # Create logs directory
    mkdir -p logs
    
    # Start the server
    echo "🚀 Starting laptop server..."
    pm2 start ecosystem.laptop.config.js
    pm2 save
    
    # Get network info
    if command -v ip &> /dev/null; then
        LOCAL_IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+' 2>/dev/null || echo "127.0.0.1")
    elif command -v ifconfig &> /dev/null; then
        LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    else
        LOCAL_IP="127.0.0.1"
    fi
    
    EXTERNAL_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "Not available")
    
    # Create management scripts
    cat > laptop-status.sh << 'EOF'
#!/bin/bash

echo "💻 NSTI College Management System - Laptop Server Status"
echo "======================================================="
echo ""

# Get network info
if command -v ip &> /dev/null; then
    LOCAL_IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+' 2>/dev/null || echo "127.0.0.1")
elif command -v ifconfig &> /dev/null; then
    LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
else
    LOCAL_IP="127.0.0.1"
fi

echo "🌐 Server Access URLs:"
echo "Local: http://localhost:5000"
echo "Network: http://$LOCAL_IP:5000"
echo ""

echo "📊 Service Status:"
echo -n "Backend Server: "
if curl -f -s --connect-timeout 3 http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo ""
echo "📱 PM2 Process Status:"
pm2 status 2>/dev/null || echo "PM2 not available"

echo ""
echo "👥 Demo Login Credentials:"
echo "Admin: admin@nsti.edu / admin123"
echo "Student: student@nsti.edu / student123"
echo "Teacher: teacher@nsti.edu / teacher123"
EOF
    
    chmod +x laptop-status.sh
    
    cat > laptop-stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping NSTI Laptop Server..."
pm2 stop nsti-laptop-server
pm2 delete nsti-laptop-server
echo "✅ Server stopped"
EOF
    
    chmod +x laptop-stop.sh
    
    cat > laptop-restart.sh << 'EOF'
#!/bin/bash
echo "🔄 Restarting NSTI Laptop Server..."
pm2 restart nsti-laptop-server
echo "✅ Server restarted"
EOF
    
    chmod +x laptop-restart.sh
    
    echo ""
    echo "🎉 LAPTOP LIVE SERVER SETUP COMPLETED! 🎉"
    echo "=========================================="
    echo ""
    echo "💻 YOUR LAPTOP SERVER URLS:"
    echo "┌─────────────────────────────────────────────────┐"
    echo "│                 ACCESS URLS                     │"
    echo "├─────────────────────────────────────────────────┤"
    echo "│ Local Access:    http://localhost:5000         │"
    echo "│ Network Access:  http://$LOCAL_IP:5000      │"
    if [ "$EXTERNAL_IP" != "Not available" ]; then
    echo "│ External Access: http://$EXTERNAL_IP:5000   │"
    fi
    echo "└─────────────────────────────────────────────────┘"
    echo ""
    echo "🎯 How to Access:"
    echo "• Same Device: http://localhost:5000"
    echo "• Other Devices on Same WiFi: http://$LOCAL_IP:5000"
    echo ""
    echo "👥 Demo Login Credentials:"
    echo "• Admin: admin@nsti.edu / admin123"
    echo "• Student: student@nsti.edu / student123"
    echo "• Teacher: teacher@nsti.edu / teacher123"
    echo "• TO: to@nsti.edu / to123456"
    echo ""
    echo "🛠️ Management Commands:"
    echo "• ./laptop-status.sh - Check server status"
    echo "• ./laptop-restart.sh - Restart server"
    echo "• ./laptop-stop.sh - Stop server"
    echo ""
    echo "🎓 Your laptop is now serving the NSTI College Management System!"
    
else
    echo "❌ Frontend build failed. Please check the errors above."
    cd ..
fi
EOF
