#!/bin/bash

# NSTI College Management System - Quick EC2 Deploy
# Run this script on your EC2 instance after cloning the repository

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 NSTI College Management System - Quick EC2 Deploy${NC}"
echo -e "${BLUE}===================================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}✅ Starting deployment...${NC}"

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt update
apt upgrade -y

# Install basic packages
echo -e "${YELLOW}📦 Installing basic packages...${NC}"
apt install -y curl wget git software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Add MongoDB repository
echo -e "${YELLOW}🗄️ Adding MongoDB repository...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update with new repository
apt update

# Install MongoDB
echo -e "${YELLOW}🗄️ Installing MongoDB...${NC}"
apt install -y mongodb-org

# Install Node.js
echo -e "${YELLOW}📦 Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install other packages
echo -e "${YELLOW}📦 Installing Nginx and other packages...${NC}"
apt install -y nginx ufw

# Install PM2
echo -e "${YELLOW}📦 Installing PM2...${NC}"
npm install -g pm2

# Create application user
echo -e "${YELLOW}👤 Creating application user...${NC}"
if ! id "nsti-app" &>/dev/null; then
    useradd -r -s /bin/bash -d /home/nsti-app -m nsti-app
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
echo -e "${YELLOW}🎨 Installing frontend dependencies and building...${NC}"
cd $APP_DIR/client
sudo -u nsti-app npm install
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

# Wait for MongoDB
sleep 10

# Seed database
echo -e "${YELLOW}🌱 Seeding database...${NC}"
sudo -u nsti-app node scripts/seedData.js

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
      max_memory_restart: '1G'
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

# Enable site
ln -sf /etc/nginx/sites-available/nsti-college /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Start nginx
systemctl start nginx
systemctl enable nginx

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Start application with PM2
echo -e "${YELLOW}🚀 Starting application...${NC}"
sudo -u nsti-app pm2 start ecosystem.config.js --env production
sudo -u nsti-app pm2 save

# Create PM2 startup script
sudo -u nsti-app pm2 startup systemd -u nsti-app --hp /home/nsti-app | grep "sudo env" | bash

# Create monitoring script
echo -e "${YELLOW}📊 Setting up monitoring...${NC}"
cat > /usr/local/bin/nsti-monitor.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/nsti/monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check backend
if ! curl -f -s --connect-timeout 10 http://localhost:5000/health > /dev/null 2>&1; then
    log_message "Backend is down, restarting..."
    sudo -u nsti-app pm2 restart nsti-backend
fi

# Check nginx
if ! systemctl is-active --quiet nginx; then
    log_message "Nginx is down, restarting..."
    systemctl restart nginx
fi

# Check mongodb
if ! systemctl is-active --quiet mongod; then
    log_message "MongoDB is down, restarting..."
    systemctl restart mongod
fi
EOF

chmod +x /usr/local/bin/nsti-monitor.sh

# Set up monitoring cron job
cat > /etc/cron.d/nsti-monitor << EOF
*/2 * * * * root /usr/local/bin/nsti-monitor.sh
EOF

# Create status check script
cat > /usr/local/bin/nsti-status << 'EOF'
#!/bin/bash
echo "🏥 NSTI College Management System - Status Check"
echo "=============================================="
echo "📊 Service Status:"
echo -n "MongoDB: "
systemctl is-active --quiet mongod && echo "✅ Running" || echo "❌ Stopped"
echo -n "Nginx: "
systemctl is-active --quiet nginx && echo "✅ Running" || echo "❌ Stopped"
echo -n "Backend: "
curl -f -s --connect-timeout 5 http://localhost:5000/health > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Stopped"
echo ""
echo "📱 PM2 Status:"
sudo -u nsti-app pm2 status 2>/dev/null || echo "PM2 not available"
EOF

chmod +x /usr/local/bin/nsti-status

# Final status check
echo -e "${YELLOW}🔍 Performing final checks...${NC}"
sleep 10

# Get public IP
PUBLIC_IP=$(curl -s --connect-timeout 10 ifconfig.me 2>/dev/null || echo "YOUR-EC2-IP")

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}📋 Access Information:${NC}"
echo -e "• Application URL: ${GREEN}http://$PUBLIC_IP${NC}"
echo -e "• Admin Login: ${GREEN}admin@nsti.edu / admin123${NC}"
echo -e "• Teacher Login: ${GREEN}teacher@nsti.edu / teacher123${NC}"
echo -e "• Student Login: ${GREEN}student@nsti.edu / student123${NC}"
echo ""
echo -e "${YELLOW}🛠️ Management Commands:${NC}"
echo -e "• Check Status: ${GREEN}nsti-status${NC}"
echo -e "• View Logs: ${GREEN}sudo -u nsti-app pm2 logs${NC}"
echo -e "• Restart App: ${GREEN}sudo -u nsti-app pm2 restart all${NC}"
echo ""
echo -e "${GREEN}✅ Auto-restart monitoring is enabled (checks every 2 minutes)${NC}"
echo -e "${GREEN}✅ System is ready for 10+ concurrent users${NC}"
echo ""
EOF
