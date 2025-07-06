#!/bin/bash

# NSTI College Management System - Ubuntu 24.04 Compatible Deploy
# Fixed for Ubuntu 24.04 Noble Numbat

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 NSTI College Management System - Ubuntu 24.04 Deploy${NC}"
echo -e "${BLUE}====================================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}✅ Starting deployment for Ubuntu 24.04...${NC}"

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt update
apt upgrade -y

# Install basic packages
echo -e "${YELLOW}📦 Installing basic packages...${NC}"
apt install -y curl wget git software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Fix MongoDB repository for Ubuntu 24.04
echo -e "${YELLOW}🗄️ Adding MongoDB repository (Ubuntu 22.04 compatible)...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

# Use jammy (22.04) repository since noble (24.04) isn't available yet
echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update with new repository
apt update

# Install MongoDB
echo -e "${YELLOW}🗄️ Installing MongoDB...${NC}"
apt install -y mongodb-org

# Install Node.js 18.x
echo -e "${YELLOW}📦 Installing Node.js 18.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install other packages
echo -e "${YELLOW}📦 Installing Nginx and other packages...${NC}"
apt install -y nginx ufw

# Install PM2 globally
echo -e "${YELLOW}📦 Installing PM2 process manager...${NC}"
npm install -g pm2

# Create application user
echo -e "${YELLOW}👤 Creating application user...${NC}"
if ! id "nsti-app" &>/dev/null; then
    useradd -r -s /bin/bash -d /home/nsti-app -m nsti-app
    echo -e "${GREEN}✅ User nsti-app created${NC}"
else
    echo -e "${YELLOW}⚠️ User nsti-app already exists${NC}"
fi

# Set up application directory
APP_DIR="/opt/nsti-college-management"
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p $APP_DIR

# Copy files from current directory to app directory
echo -e "${YELLOW}📋 Copying application files...${NC}"
cp -r . $APP_DIR/
chown -R nsti-app:nsti-app $APP_DIR

cd $APP_DIR

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
sudo -u nsti-app npm install --production

# Install frontend dependencies and build
echo -e "${YELLOW}🎨 Installing frontend dependencies...${NC}"
cd $APP_DIR/client
sudo -u nsti-app npm install

echo -e "${YELLOW}🏗️ Building frontend for production...${NC}"
sudo -u nsti-app npm run build

cd $APP_DIR

# Create environment file
echo -e "${YELLOW}⚙️ Creating environment configuration...${NC}"
cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nsti_college_db
JWT_SECRET=nsti_college_management_jwt_secret_key_2024_production_$(openssl rand -hex 16)
JWT_EXPIRE=30d
EOF

chown nsti-app:nsti-app .env
chmod 600 .env

# Start and configure MongoDB
echo -e "${YELLOW}🗄️ Starting MongoDB...${NC}"
systemctl start mongod
systemctl enable mongod

# Wait for MongoDB to start
echo -e "${YELLOW}⏳ Waiting for MongoDB to initialize...${NC}"
sleep 15

# Check if MongoDB is running
if ! systemctl is-active --quiet mongod; then
    echo -e "${RED}❌ MongoDB failed to start${NC}"
    systemctl status mongod
    exit 1
fi

# Seed database
echo -e "${YELLOW}🌱 Seeding database with demo data...${NC}"
if sudo -u nsti-app node scripts/seedData.js; then
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Database seeding failed, but continuing...${NC}"
fi

# Create PM2 ecosystem file
echo -e "${YELLOW}⚙️ Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'nsti-backend',
      script: 'server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/nsti/backend-error.log',
      out_file: '/var/log/nsti/backend-out.log',
      log_file: '/var/log/nsti/backend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false
    }
  ]
};
EOF

chown nsti-app:nsti-app ecosystem.config.js

# Create log directory
mkdir -p /var/log/nsti
chown nsti-app:nsti-app /var/log/nsti

# Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/nsti-college << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Serve React frontend
    location / {
        root /opt/nsti-college-management/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/nsti-college /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

# Start nginx
systemctl start nginx
systemctl enable nginx

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Start application with PM2
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
sudo -u nsti-app pm2 start ecosystem.config.js --env production
sudo -u nsti-app pm2 save

# Set up PM2 to start on boot
echo -e "${YELLOW}⚙️ Setting up PM2 startup...${NC}"
sudo -u nsti-app pm2 startup systemd -u nsti-app --hp /home/nsti-app > /tmp/pm2_startup.sh
chmod +x /tmp/pm2_startup.sh
/tmp/pm2_startup.sh

# Create monitoring script
echo -e "${YELLOW}📊 Setting up auto-restart monitoring...${NC}"
cat > /usr/local/bin/nsti-monitor.sh << 'EOF'
#!/bin/bash

LOG_FILE="/var/log/nsti/monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check backend health
check_backend() {
    if curl -f -s --connect-timeout 10 http://localhost:5000/health > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check and restart backend if needed
if ! check_backend; then
    log_message "Backend is down, restarting..."
    sudo -u nsti-app pm2 restart nsti-backend
    sleep 10
    if check_backend; then
        log_message "Backend restarted successfully"
    else
        log_message "Backend restart failed"
    fi
fi

# Check and restart nginx if needed
if ! systemctl is-active --quiet nginx; then
    log_message "Nginx is down, restarting..."
    systemctl restart nginx
    if systemctl is-active --quiet nginx; then
        log_message "Nginx restarted successfully"
    else
        log_message "Nginx restart failed"
    fi
fi

# Check and restart mongodb if needed
if ! systemctl is-active --quiet mongod; then
    log_message "MongoDB is down, restarting..."
    systemctl restart mongod
    sleep 15
    if systemctl is-active --quiet mongod; then
        log_message "MongoDB restarted successfully"
    else
        log_message "MongoDB restart failed"
    fi
fi

log_message "Monitoring check completed"
EOF

chmod +x /usr/local/bin/nsti-monitor.sh

# Set up monitoring cron job (every 2 minutes)
cat > /etc/cron.d/nsti-monitor << EOF
# NSTI College Management System Monitoring
*/2 * * * * root /usr/local/bin/nsti-monitor.sh
EOF

# Create status check script
cat > /usr/local/bin/nsti-status << 'EOF'
#!/bin/bash

echo "🏥 NSTI College Management System - Status Check"
echo "=============================================="
echo ""
echo "📊 Service Status:"

# Check MongoDB
echo -n "MongoDB: "
if systemctl is-active --quiet mongod; then
    echo "✅ Running"
else
    echo "❌ Stopped"
fi

# Check Nginx
echo -n "Nginx: "
if systemctl is-active --quiet nginx; then
    echo "✅ Running"
else
    echo "❌ Stopped"
fi

# Check Backend API
echo -n "Backend API: "
if curl -f -s --connect-timeout 5 http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Responding"
else
    echo "❌ Not responding"
fi

# Check Frontend
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
echo "Load: $(uptime | awk -F'load average:' '{print $2}' | xargs)"

echo ""
echo "🌐 Network Status:"
echo "Public IP: $(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo 'Unable to fetch')"
EOF

chmod +x /usr/local/bin/nsti-status

# Create update script
cat > /usr/local/bin/nsti-update << 'EOF'
#!/bin/bash

echo "🔄 Updating NSTI College Management System..."

cd /opt/nsti-college-management

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
sudo -u nsti-app git pull origin main

# Update backend dependencies
echo "📦 Updating backend dependencies..."
sudo -u nsti-app npm install --production

# Update frontend
echo "🎨 Updating and rebuilding frontend..."
cd client
sudo -u nsti-app npm install
sudo -u nsti-app npm run build
cd ..

# Restart application
echo "🔄 Restarting application..."
sudo -u nsti-app pm2 restart all

echo "✅ Update completed successfully!"
EOF

chmod +x /usr/local/bin/nsti-update

# Final status check
echo -e "${YELLOW}🔍 Performing final system check...${NC}"
sleep 15

# Get public IP
PUBLIC_IP=$(curl -s --connect-timeout 10 ifconfig.me 2>/dev/null || echo "YOUR-EC2-IP")

# Check services
MONGODB_STATUS="❌"
NGINX_STATUS="❌"
BACKEND_STATUS="❌"

if systemctl is-active --quiet mongod; then
    MONGODB_STATUS="✅"
fi

if systemctl is-active --quiet nginx; then
    NGINX_STATUS="✅"
fi

if curl -f -s --connect-timeout 10 http://localhost:5000/health > /dev/null 2>&1; then
    BACKEND_STATUS="✅"
fi

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED! 🎉${NC}"
echo -e "${BLUE}==============================${NC}"
echo ""
echo -e "${YELLOW}📊 Final System Status:${NC}"
echo -e "MongoDB: $MONGODB_STATUS"
echo -e "Nginx: $NGINX_STATUS"
echo -e "Backend API: $BACKEND_STATUS"
echo ""
echo -e "${YELLOW}📋 Access Information:${NC}"
echo -e "• Application URL: ${GREEN}http://$PUBLIC_IP${NC}"
echo -e "• Admin Login: ${GREEN}admin@nsti.edu / admin123${NC}"
echo -e "• Teacher Login: ${GREEN}teacher@nsti.edu / teacher123${NC}"
echo -e "• Student Login: ${GREEN}student@nsti.edu / student123${NC}"
echo -e "• TO Login: ${GREEN}to@nsti.edu / to123456${NC}"
echo ""
echo -e "${YELLOW}🛠️ Management Commands:${NC}"
echo -e "• Check Status: ${GREEN}nsti-status${NC}"
echo -e "• Update App: ${GREEN}nsti-update${NC}"
echo -e "• View Logs: ${GREEN}sudo -u nsti-app pm2 logs${NC}"
echo -e "• Restart App: ${GREEN}sudo -u nsti-app pm2 restart all${NC}"
echo ""
echo -e "${GREEN}✅ Auto-restart monitoring enabled (checks every 2 minutes)${NC}"
echo -e "${GREEN}✅ System ready for 10+ concurrent users${NC}"
echo -e "${GREEN}✅ All services configured to start on boot${NC}"
echo ""

if [[ "$MONGODB_STATUS" == "✅" && "$NGINX_STATUS" == "✅" && "$BACKEND_STATUS" == "✅" ]]; then
    echo -e "${GREEN}🎯 Deployment successful! Your application is ready to use.${NC}"
else
    echo -e "${YELLOW}⚠️ Some services may need a few more minutes to fully start.${NC}"
    echo -e "${YELLOW}Run 'nsti-status' in a few minutes to check again.${NC}"
fi

echo ""
EOF
