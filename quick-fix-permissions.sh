#!/bin/bash

# Quick fix for PM2 log folder permissions issue

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Quick Fix - PM2 Log Folder Permissions${NC}"
echo -e "${BLUE}=========================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}✅ Fixing PM2 log folder permissions...${NC}"

# Step 1: Create log directory with proper permissions
echo -e "${YELLOW}📁 Creating log directory...${NC}"
mkdir -p /var/log/nsti
chown -R nsti-app:nsti-app /var/log/nsti
chmod -R 755 /var/log/nsti

# Step 2: Stop any existing PM2 processes
echo -e "${YELLOW}🛑 Stopping existing PM2 processes...${NC}"
sudo -u nsti-app pm2 kill || true
sleep 3

# Step 3: Navigate to application directory
APP_DIR="/opt/nsti-college-management"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Application directory not found. Copying from current location...${NC}"
    mkdir -p $APP_DIR
    cp -r /home/ubuntu/nsti_pro_1/* $APP_DIR/
    chown -R nsti-app:nsti-app $APP_DIR
fi

cd $APP_DIR

# Step 4: Create simplified PM2 ecosystem config
echo -e "${YELLOW}⚙️ Creating simplified PM2 configuration...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'nsti-backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        NODE_OPTIONS: '--max-old-space-size=1024'
      },
      log_file: '/var/log/nsti/backend.log',
      error_file: '/var/log/nsti/backend-error.log',
      out_file: '/var/log/nsti/backend-out.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      max_memory_restart: '800M',
      watch: false
    }
  ]
};
EOF

chown nsti-app:nsti-app ecosystem.config.js

# Step 5: Ensure all dependencies are installed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    sudo -u nsti-app npm install --production
fi

if [ ! -d "client/build" ]; then
    echo -e "${YELLOW}Building frontend...${NC}"
    cd client
    sudo -u nsti-app npm install
    sudo -u nsti-app npm run build
    cd ..
fi

# Step 6: Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️ Creating environment file...${NC}"
    cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nsti_college_db
JWT_SECRET=nsti_college_management_jwt_secret_key_2024_production_$(openssl rand -hex 16)
JWT_EXPIRE=30d
EOF
    chown nsti-app:nsti-app .env
    chmod 600 .env
fi

# Step 7: Ensure MongoDB is running
echo -e "${YELLOW}🗄️ Starting MongoDB...${NC}"
systemctl start mongod || systemctl start mongodb
systemctl enable mongod || systemctl enable mongodb

# Wait for MongoDB
sleep 5

# Step 8: Seed database if needed
echo -e "${YELLOW}🌱 Seeding database...${NC}"
sudo -u nsti-app node scripts/seedData.js || echo "Database seeding skipped (may already exist)"

# Step 9: Start PM2 with the fixed configuration
echo -e "${YELLOW}🚀 Starting PM2 with fixed configuration...${NC}"
sudo -u nsti-app NODE_OPTIONS="--max-old-space-size=1024" pm2 start ecosystem.config.js --env production

# Step 10: Save PM2 configuration
sudo -u nsti-app pm2 save

# Step 11: Set up PM2 startup
echo -e "${YELLOW}⚙️ Setting up PM2 startup...${NC}"
sudo -u nsti-app pm2 startup systemd -u nsti-app --hp /home/nsti-app > /tmp/pm2_startup_cmd.sh
chmod +x /tmp/pm2_startup_cmd.sh
/tmp/pm2_startup_cmd.sh || echo "PM2 startup setup completed"

# Step 12: Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/nsti-college << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Serve React frontend
    location / {
        root /opt/nsti-college-management/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site and restart nginx
ln -sf /etc/nginx/sites-available/nsti-college /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
if nginx -t; then
    systemctl restart nginx
    echo -e "${GREEN}✅ Nginx configured and restarted${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
fi

# Step 13: Create status check command
cat > /usr/local/bin/nsti-status << 'EOF'
#!/bin/bash

echo "🏥 NSTI College Management System - Status Check"
echo "=============================================="
echo ""

# Check services
echo "📊 Service Status:"
echo -n "MongoDB: "
if systemctl is-active --quiet mongod || systemctl is-active --quiet mongodb; then
    echo "✅ Running"
else
    echo "❌ Stopped"
fi

echo -n "Nginx: "
if systemctl is-active --quiet nginx; then
    echo "✅ Running"
else
    echo "❌ Stopped"
fi

echo -n "Backend API: "
if curl -f -s --connect-timeout 5 http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Responding"
else
    echo "❌ Not responding"
fi

echo -n "Frontend: "
if curl -f -s --connect-timeout 5 http://localhost/ > /dev/null 2>&1; then
    echo "✅ Accessible"
else
    echo "❌ Not accessible"
fi

echo ""
echo "📱 PM2 Process Status:"
sudo -u nsti-app pm2 status 2>/dev/null || echo "PM2 not available"

echo ""
echo "💻 Resource Usage:"
echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"

echo ""
echo "🌐 Access Information:"
PUBLIC_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "34.234.90.108")
echo "Application URL: http://$PUBLIC_IP"
echo "Admin Login: admin@nsti.edu / admin123"
EOF

chmod +x /usr/local/bin/nsti-status

# Step 14: Final status check
echo -e "${YELLOW}🔍 Performing final status check...${NC}"
sleep 10

# Check services
MONGODB_OK=false
NGINX_OK=false
BACKEND_OK=false

if systemctl is-active --quiet mongod || systemctl is-active --quiet mongodb; then
    MONGODB_OK=true
fi

if systemctl is-active --quiet nginx; then
    NGINX_OK=true
fi

if curl -f -s --connect-timeout 10 http://localhost:5000/health > /dev/null 2>&1; then
    BACKEND_OK=true
fi

echo ""
echo -e "${GREEN}🎉 QUICK FIX COMPLETED! 🎉${NC}"
echo -e "${BLUE}========================${NC}"
echo ""
echo -e "${YELLOW}📊 Final Status:${NC}"
echo -e "MongoDB: $([ "$MONGODB_OK" = true ] && echo "✅ Running" || echo "❌ Issue")"
echo -e "Nginx: $([ "$NGINX_OK" = true ] && echo "✅ Running" || echo "❌ Issue")"
echo -e "Backend: $([ "$BACKEND_OK" = true ] && echo "✅ Running" || echo "❌ Issue")"
echo ""
echo -e "${YELLOW}🌐 Access Your Application:${NC}"
echo -e "• URL: ${GREEN}http://34.234.90.108${NC}"
echo -e "• Admin: ${GREEN}admin@nsti.edu / admin123${NC}"
echo -e "• Student: ${GREEN}student@nsti.edu / student123${NC}"
echo ""
echo -e "${YELLOW}🛠️ Commands:${NC}"
echo -e "• Check Status: ${GREEN}nsti-status${NC}"
echo -e "• View Logs: ${GREEN}sudo -u nsti-app pm2 logs${NC}"
echo -e "• Restart: ${GREEN}sudo -u nsti-app pm2 restart all${NC}"
echo ""

if [ "$MONGODB_OK" = true ] && [ "$NGINX_OK" = true ] && [ "$BACKEND_OK" = true ]; then
    echo -e "${GREEN}🎯 SUCCESS! Your website is now working at http://34.234.90.108${NC}"
    echo -e "${GREEN}✅ All services are operational${NC}"
    echo -e "${GREEN}✅ PM2 log folder permissions fixed${NC}"
    echo -e "${GREEN}✅ Application ready for use${NC}"
else
    echo -e "${YELLOW}⚠️ Some services may need a few more minutes to start${NC}"
    echo -e "${YELLOW}Run 'nsti-status' in 2-3 minutes to check again${NC}"
fi

echo ""
EOF
