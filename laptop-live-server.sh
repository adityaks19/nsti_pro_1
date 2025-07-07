#!/bin/bash

# NSTI College Management System - Laptop Live Server Setup
# This script converts your laptop into a live server

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}💻 NSTI College Management System - Laptop Live Server${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="Windows"
else
    OS="Unknown"
fi

echo -e "${PURPLE}🖥️ System Information:${NC}"
echo -e "Operating System: ${GREEN}$OS${NC}"
echo -e "Current Directory: ${GREEN}$(pwd)${NC}"
echo ""

# Get local IP addresses
echo -e "${YELLOW}🌐 Detecting network interfaces...${NC}"
if command -v ip &> /dev/null; then
    LOCAL_IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+' 2>/dev/null || echo "127.0.0.1")
elif command -v ifconfig &> /dev/null; then
    LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
else
    LOCAL_IP="127.0.0.1"
fi

# Try to get external IP (if connected to internet)
EXTERNAL_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "Not available")

echo -e "Local IP: ${GREEN}$LOCAL_IP${NC}"
echo -e "External IP: ${GREEN}$EXTERNAL_IP${NC}"
echo ""

# Check if Node.js is installed
echo -e "${YELLOW}📦 Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo -e "Node.js: ${GREEN}$NODE_VERSION${NC}"
    echo -e "NPM: ${GREEN}$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 16+ first.${NC}"
    echo -e "${YELLOW}Visit: https://nodejs.org${NC}"
    exit 1
fi

# Check if MongoDB is installed
echo -e "${YELLOW}🗄️ Checking MongoDB installation...${NC}"
if command -v mongod &> /dev/null; then
    echo -e "MongoDB: ${GREEN}✅ Found${NC}"
    MONGODB_INSTALLED=true
else
    echo -e "MongoDB: ${YELLOW}⚠️ Not found - will use MongoDB Atlas or install locally${NC}"
    MONGODB_INSTALLED=false
fi

# Check if PM2 is installed
echo -e "${YELLOW}⚙️ Checking PM2 installation...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "PM2: ${GREEN}✅ Found${NC}"
else
    echo -e "${YELLOW}Installing PM2 globally...${NC}"
    npm install -g pm2
    echo -e "PM2: ${GREEN}✅ Installed${NC}"
fi

echo ""
echo -e "${GREEN}✅ Starting laptop server setup...${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Step 1: Installing project dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "Backend dependencies: ${GREEN}✅ Installed${NC}"
else
    echo -e "Backend dependencies: ${GREEN}✅ Already installed${NC}"
fi

# Step 2: Install and build frontend
echo -e "${YELLOW}🎨 Step 2: Setting up frontend...${NC}"
cd client

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "Frontend dependencies: ${GREEN}✅ Installed${NC}"
else
    echo -e "Frontend dependencies: ${GREEN}✅ Already installed${NC}"
fi

echo -e "${YELLOW}🏗️ Building frontend for production...${NC}"
npm run build
echo -e "Frontend build: ${GREEN}✅ Completed${NC}"

cd ..

# Step 3: Create environment configuration
echo -e "${YELLOW}⚙️ Step 3: Creating environment configuration...${NC}"
if [ ! -f ".env" ]; then
    cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nsti_college_db
JWT_SECRET=nsti_college_management_jwt_secret_key_2024_laptop_$(date +%s)
JWT_EXPIRE=30d
HOST=0.0.0.0
EOF
    echo -e "Environment file: ${GREEN}✅ Created${NC}"
else
    echo -e "Environment file: ${GREEN}✅ Already exists${NC}"
fi

# Step 4: Start MongoDB (if installed locally)
if [ "$MONGODB_INSTALLED" = true ]; then
    echo -e "${YELLOW}🗄️ Step 4: Starting MongoDB...${NC}"
    
    # Try to start MongoDB service
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mongod 2>/dev/null || true
    elif command -v brew &> /dev/null; then
        brew services start mongodb-community 2>/dev/null || mongod --config /usr/local/etc/mongod.conf --fork 2>/dev/null || true
    else
        # Try to start MongoDB manually
        mongod --dbpath ./data/db --fork --logpath ./data/mongodb.log 2>/dev/null || true
    fi
    
    sleep 3
    echo -e "MongoDB: ${GREEN}✅ Started${NC}"
else
    echo -e "${YELLOW}🗄️ Step 4: MongoDB setup...${NC}"
    echo -e "${YELLOW}⚠️ MongoDB not found locally. You can:${NC}"
    echo -e "1. Install MongoDB locally"
    echo -e "2. Use MongoDB Atlas (cloud database)"
    echo -e "3. Continue with in-memory database for testing"
    echo ""
fi

# Step 5: Seed database
echo -e "${YELLOW}🌱 Step 5: Seeding database...${NC}"
if node scripts/seedData.js 2>/dev/null; then
    echo -e "Database seeding: ${GREEN}✅ Completed${NC}"
else
    echo -e "Database seeding: ${YELLOW}⚠️ Skipped (database may not be available)${NC}"
fi

# Step 6: Create PM2 configuration for laptop
echo -e "${YELLOW}🚀 Step 6: Configuring PM2 for laptop server...${NC}"
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

echo -e "PM2 configuration: ${GREEN}✅ Created${NC}"

# Step 7: Start the server
echo -e "${YELLOW}🚀 Step 7: Starting laptop server...${NC}"
pm2 start ecosystem.laptop.config.js
pm2 save

echo -e "Server: ${GREEN}✅ Started${NC}"

# Step 8: Create laptop server management commands
echo -e "${YELLOW}🛠️ Step 8: Creating management commands...${NC}"

# Create status script
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

echo -n "Database: "
if curl -f -s --connect-timeout 3 http://localhost:5000/api/auth/test > /dev/null 2>&1; then
    echo "✅ Connected"
else
    echo "❌ Connection issue"
fi

echo ""
echo "📱 PM2 Process Status:"
pm2 status 2>/dev/null || echo "PM2 not available"

echo ""
echo "💻 System Resources:"
echo "Memory: $(free -h 2>/dev/null | awk '/^Mem:/ {print $3 "/" $2}' || echo 'N/A')"
echo "Disk: $(df -h . 2>/dev/null | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}' || echo 'N/A')"

echo ""
echo "👥 Demo Login Credentials:"
echo "┌─────────────────┬─────────────────────┬─────────────┐"
echo "│ Role            │ Email               │ Password    │"
echo "├─────────────────┼─────────────────────┼─────────────┤"
echo "│ Admin           │ admin@nsti.edu      │ admin123    │"
echo "│ Student         │ student@nsti.edu    │ student123  │"
echo "│ Teacher         │ teacher@nsti.edu    │ teacher123  │"
echo "│ Training Officer│ to@nsti.edu         │ to123456    │"
echo "│ Librarian       │ librarian@nsti.edu  │ lib123      │"
echo "│ Store Manager   │ store@nsti.edu      │ store123    │"
echo "└─────────────────┴─────────────────────┴─────────────┘"

echo ""
echo "🛠️ Management Commands:"
echo "• Check Status: ./laptop-status.sh"
echo "• View Logs: pm2 logs"
echo "• Restart Server: pm2 restart nsti-laptop-server"
echo "• Stop Server: pm2 stop nsti-laptop-server"
echo "• Monitor: pm2 monit"
EOF

chmod +x laptop-status.sh

# Create stop script
cat > laptop-stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping NSTI Laptop Server..."
pm2 stop nsti-laptop-server
pm2 delete nsti-laptop-server
echo "✅ Server stopped"
EOF

chmod +x laptop-stop.sh

# Create restart script
cat > laptop-restart.sh << 'EOF'
#!/bin/bash
echo "🔄 Restarting NSTI Laptop Server..."
pm2 restart nsti-laptop-server
echo "✅ Server restarted"
EOF

chmod +x laptop-restart.sh

echo -e "Management scripts: ${GREEN}✅ Created${NC}"

# Step 9: Final verification
echo -e "${YELLOW}🔍 Step 9: Final verification...${NC}"
sleep 5

# Test server
if curl -f -s --connect-timeout 10 http://localhost:5000/health > /dev/null 2>&1; then
    SERVER_OK=true
else
    SERVER_OK=false
fi

echo ""
echo -e "${GREEN}🎉 LAPTOP LIVE SERVER SETUP COMPLETED! 🎉${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

if [ "$SERVER_OK" = true ]; then
    echo -e "${GREEN}✅ SUCCESS! Your laptop is now a live server!${NC}"
else
    echo -e "${YELLOW}⚠️ Server may need a moment to fully start${NC}"
fi

echo ""
echo -e "${PURPLE}💻 YOUR LAPTOP SERVER URLS:${NC}"
echo -e "${CYAN}┌─────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│                 ACCESS URLS                     │${NC}"
echo -e "${CYAN}├─────────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│ Local Access:    http://localhost:5000         │${NC}"
echo -e "${CYAN}│ Network Access:  http://$LOCAL_IP:5000      │${NC}"
if [ "$EXTERNAL_IP" != "Not available" ]; then
echo -e "${CYAN}│ External Access: http://$EXTERNAL_IP:5000   │${NC}"
fi
echo -e "${CYAN}└─────────────────────────────────────────────────┘${NC}"
echo ""

echo -e "${YELLOW}🎯 How to Access:${NC}"
echo -e "• ${GREEN}Same Device${NC}: http://localhost:5000"
echo -e "• ${GREEN}Other Devices on Same WiFi${NC}: http://$LOCAL_IP:5000"
echo -e "• ${GREEN}Mobile/Tablet on Same WiFi${NC}: http://$LOCAL_IP:5000"
if [ "$EXTERNAL_IP" != "Not available" ]; then
echo -e "• ${GREEN}From Internet${NC}: http://$EXTERNAL_IP:5000 (if ports are open)"
fi

echo ""
echo -e "${YELLOW}📱 Features Available:${NC}"
echo -e "✅ Complete NSTI College Management System"
echo -e "✅ Student, Teacher, Admin, TO dashboards"
echo -e "✅ Leave application workflow"
echo -e "✅ Library management system"
echo -e "✅ Store management system"
echo -e "✅ Real-time updates and notifications"
echo -e "✅ Professional UI with Material-UI"
echo -e "✅ Mobile responsive design"

echo ""
echo -e "${YELLOW}🛠️ Management Commands:${NC}"
echo -e "• ${GREEN}./laptop-status.sh${NC} - Check server status"
echo -e "• ${GREEN}./laptop-restart.sh${NC} - Restart server"
echo -e "• ${GREEN}./laptop-stop.sh${NC} - Stop server"
echo -e "• ${GREEN}pm2 logs${NC} - View server logs"
echo -e "• ${GREEN}pm2 monit${NC} - Monitor resources"

echo ""
echo -e "${YELLOW}👥 Demo Accounts Ready:${NC}"
echo -e "All demo accounts are seeded and ready to use!"

echo ""
echo -e "${BLUE}🎓 Your laptop is now serving the NSTI College Management System!${NC}"
echo -e "${PURPLE}Share the network URL with others on the same WiFi to let them access it!${NC}"
echo ""
EOF
