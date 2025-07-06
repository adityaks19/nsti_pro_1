#!/bin/bash

echo "🏥 NSTI COLLEGE MANAGEMENT SYSTEM STATUS"
echo "========================================"
echo "⏰ $(date)"
echo ""

# Check Backend
echo "🔧 BACKEND STATUS:"
echo "----------------"
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend: RUNNING on port 5000"
    UPTIME=$(curl -s http://localhost:5000/health | grep -o '"uptime":[0-9.]*' | cut -d: -f2)
    echo "⏱️ Uptime: $(echo $UPTIME | cut -d. -f1) seconds"
else
    echo "❌ Backend: NOT RUNNING"
fi

# Check Frontend
echo ""
echo "🎨 FRONTEND STATUS:"
echo "-----------------"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: RUNNING on port 3000"
else
    echo "❌ Frontend: NOT RUNNING"
fi

# Check MongoDB
echo ""
echo "🗄️ DATABASE STATUS:"
echo "------------------"
if mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB: CONNECTED"
else
    echo "❌ MongoDB: NOT CONNECTED"
fi

# Check Processes
echo ""
echo "🔄 ACTIVE PROCESSES:"
echo "------------------"
BACKEND_PIDS=$(pgrep -f "server-stable.js")
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "✅ Backend Process: $BACKEND_PIDS"
else
    echo "❌ No backend process found"
fi

FRONTEND_PIDS=$(pgrep -f "react-scripts")
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "✅ Frontend Process: $FRONTEND_PIDS"
else
    echo "❌ No frontend process found"
fi

# Check Ports
echo ""
echo "🌐 PORT STATUS:"
echo "-------------"
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port 5000: IN USE (Backend)"
else
    echo "❌ Port 5000: FREE"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port 3000: IN USE (Frontend)"
else
    echo "❌ Port 3000: FREE"
fi

# System Resources
echo ""
echo "💻 SYSTEM RESOURCES:"
echo "------------------"
echo "🧠 Memory Usage: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')"
echo "💾 Disk Usage: $(df -h / | awk 'NR==2{print $5}')"
echo "⚡ Load Average: $(uptime | awk -F'load average:' '{ print $2 }')"

echo ""
echo "🔗 ACCESS URLS:"
echo "-------------"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🏥 Health Check: http://localhost:5000/health"

echo ""
echo "👤 LOGIN CREDENTIALS:"
echo "-------------------"
echo "📚 Librarian: librarian@nsti.edu / lib123"
echo "👨‍💼 Admin: admin@nsti.edu / admin123"
echo "🎓 Student: student@nsti.edu / student123"

echo ""
echo "========================================"
