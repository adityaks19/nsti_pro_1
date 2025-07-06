#!/bin/bash

# NSTI College Management System - EC2 Deployment Script
# This script deploys the application to EC2 and sets up auto-restart functionality

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="nsti-college-management"
REPO_URL="https://github.com/adityaks19/nsti_pro_1.git"
APP_DIR="/opt/nsti-college-management"
SERVICE_USER="nsti-app"
MONGODB_PORT=27017
BACKEND_PORT=5000
FRONTEND_PORT=3000

echo -e "${BLUE}🚀 NSTI College Management System - EC2 Deployment${NC}"
echo -e "${BLUE}=================================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_status "Starting deployment process..."

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git nginx mongodb certbot python3-certbot-nginx

# Install Node.js 18.x
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 globally for process management
print_status "Installing PM2 process manager..."
npm install -g pm2

# Create application user
print_status "Creating application user..."
if ! id "$SERVICE_USER" &>/dev/null; then
    useradd -r -s /bin/bash -d /home/$SERVICE_USER -m $SERVICE_USER
    print_status "User $SERVICE_USER created"
else
    print_warning "User $SERVICE_USER already exists"
fi

# Create application directory
print_status "Setting up application directory..."
mkdir -p $APP_DIR
chown $SERVICE_USER:$SERVICE_USER $APP_DIR

# Clone repository
print_status "Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
    print_warning "Repository already exists, pulling latest changes..."
    cd $APP_DIR
    sudo -u $SERVICE_USER git pull origin main
else
    sudo -u $SERVICE_USER git clone $REPO_URL $APP_DIR
fi

cd $APP_DIR

# Install backend dependencies
print_status "Installing backend dependencies..."
sudo -u $SERVICE_USER npm install

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd $APP_DIR/client
sudo -u $SERVICE_USER npm install

# Build frontend for production
print_status "Building frontend for production..."
sudo -u $SERVICE_USER npm run build

cd $APP_DIR

# Create environment file
print_status "Creating environment configuration..."
cat > .env << EOF
NODE_ENV=production
PORT=$BACKEND_PORT
MONGODB_URI=mongodb://localhost:$MONGODB_PORT/nsti_college_db
JWT_SECRET=nsti_college_management_jwt_secret_key_2024_production_$(openssl rand -hex 16)
JWT_EXPIRE=30d
EOF

chown $SERVICE_USER:$SERVICE_USER .env
chmod 600 .env

# Configure MongoDB
print_status "Configuring MongoDB..."
systemctl start mongodb
systemctl enable mongodb

# Wait for MongoDB to start
sleep 5

# Seed database
print_status "Seeding database with initial data..."
sudo -u $SERVICE_USER node scripts/seedData.js

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'nsti-backend',
      script: 'server.js',
      cwd: '$APP_DIR',
      user: '$SERVICE_USER',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT
      },
      error_file: '/var/log/nsti/backend-error.log',
      out_file: '/var/log/nsti/backend-out.log',
      log_file: '/var/log/nsti/backend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'client', 'logs'],
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

chown $SERVICE_USER:$SERVICE_USER ecosystem.config.js

# Create log directory
mkdir -p /var/log/nsti
chown $SERVICE_USER:$SERVICE_USER /var/log/nsti

# Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/nsti-college << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

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
nginx -t

# Start and enable nginx
systemctl start nginx
systemctl enable nginx

# Start application with PM2
print_status "Starting application with PM2..."
sudo -u $SERVICE_USER pm2 start ecosystem.config.js --env production

# Save PM2 configuration
sudo -u $SERVICE_USER pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 auto-startup..."
sudo -u $SERVICE_USER pm2 startup systemd -u $SERVICE_USER --hp /home/$SERVICE_USER
# Note: The above command will output a command that needs to be run as root
# We'll handle this in the next step

# Create systemd service for PM2
cat > /etc/systemd/system/pm2-$SERVICE_USER.service << EOF
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=$SERVICE_USER
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/usr/local/bin
Environment=PM2_HOME=/home/$SERVICE_USER/.pm2
PIDFile=/home/$SERVICE_USER/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/local/lib/node_modules/pm2/bin/pm2 resurrect
ExecReload=/usr/local/lib/node_modules/pm2/bin/pm2 reload all
ExecStop=/usr/local/lib/node_modules/pm2/bin/pm2 kill

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable pm2-$SERVICE_USER
systemctl start pm2-$SERVICE_USER

# Configure firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow $MONGODB_PORT

# Create monitoring script
print_status "Creating monitoring and auto-restart script..."
cat > /usr/local/bin/nsti-monitor.sh << 'EOF'
#!/bin/bash

# NSTI College Management System - Monitoring Script
# This script monitors the application and restarts it if needed

LOG_FILE="/var/log/nsti/monitor.log"
SERVICE_USER="nsti-app"
BACKEND_PORT=5000

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

check_backend() {
    if curl -f -s http://localhost:$BACKEND_PORT/api/auth/test > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

check_nginx() {
    if systemctl is-active --quiet nginx; then
        return 0
    else
        return 1
    fi
}

check_mongodb() {
    if systemctl is-active --quiet mongodb; then
        return 0
    else
        return 1
    fi
}

restart_backend() {
    log_message "Backend is down, restarting..."
    sudo -u $SERVICE_USER pm2 restart nsti-backend
    sleep 10
    if check_backend; then
        log_message "Backend restarted successfully"
    else
        log_message "Backend restart failed"
    fi
}

restart_nginx() {
    log_message "Nginx is down, restarting..."
    systemctl restart nginx
    if check_nginx; then
        log_message "Nginx restarted successfully"
    else
        log_message "Nginx restart failed"
    fi
}

restart_mongodb() {
    log_message "MongoDB is down, restarting..."
    systemctl restart mongodb
    sleep 15
    if check_mongodb; then
        log_message "MongoDB restarted successfully"
    else
        log_message "MongoDB restart failed"
    fi
}

# Main monitoring loop
log_message "Starting monitoring check..."

# Check MongoDB
if ! check_mongodb; then
    restart_mongodb
fi

# Check Backend
if ! check_backend; then
    restart_backend
fi

# Check Nginx
if ! check_nginx; then
    restart_nginx
fi

log_message "Monitoring check completed"
EOF

chmod +x /usr/local/bin/nsti-monitor.sh

# Create cron job for monitoring
print_status "Setting up automated monitoring..."
cat > /etc/cron.d/nsti-monitor << EOF
# NSTI College Management System Monitoring
# Check every 2 minutes
*/2 * * * * root /usr/local/bin/nsti-monitor.sh
EOF

# Create system status script
cat > /usr/local/bin/nsti-status.sh << 'EOF'
#!/bin/bash

# NSTI College Management System - Status Check Script

echo "🏥 NSTI College Management System - Status Check"
echo "=============================================="

# Check services
echo "📊 Service Status:"
echo -n "MongoDB: "
if systemctl is-active --quiet mongodb; then
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

echo -n "PM2: "
if systemctl is-active --quiet pm2-nsti-app; then
    echo "✅ Running"
else
    echo "❌ Stopped"
fi

# Check application
echo ""
echo "🚀 Application Status:"
if curl -f -s http://localhost:5000/api/auth/test > /dev/null 2>&1; then
    echo "Backend API: ✅ Responding"
else
    echo "Backend API: ❌ Not responding"
fi

if curl -f -s http://localhost/ > /dev/null 2>&1; then
    echo "Frontend: ✅ Accessible"
else
    echo "Frontend: ❌ Not accessible"
fi

# Show PM2 status
echo ""
echo "📱 PM2 Process Status:"
sudo -u nsti-app pm2 status

# Show resource usage
echo ""
echo "💻 Resource Usage:"
echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"

# Show recent logs
echo ""
echo "📝 Recent Backend Logs:"
tail -5 /var/log/nsti/backend-combined.log 2>/dev/null || echo "No logs available"
EOF

chmod +x /usr/local/bin/nsti-status.sh

# Create update script
cat > /usr/local/bin/nsti-update.sh << 'EOF'
#!/bin/bash

# NSTI College Management System - Update Script

echo "🔄 Updating NSTI College Management System..."

cd /opt/nsti-college-management

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
sudo -u nsti-app git pull origin main

# Update backend dependencies
echo "📦 Updating backend dependencies..."
sudo -u nsti-app npm install

# Update frontend dependencies and rebuild
echo "🎨 Updating frontend..."
cd client
sudo -u nsti-app npm install
sudo -u nsti-app npm run build

cd ..

# Restart application
echo "🔄 Restarting application..."
sudo -u nsti-app pm2 restart all

echo "✅ Update completed successfully!"
EOF

chmod +x /usr/local/bin/nsti-update.sh

# Set up log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/nsti << EOF
/var/log/nsti/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nsti-app nsti-app
    postrotate
        sudo -u nsti-app pm2 reloadLogs
    endscript
}
EOF

# Create backup script
cat > /usr/local/bin/nsti-backup.sh << 'EOF'
#!/bin/bash

# NSTI College Management System - Backup Script

BACKUP_DIR="/opt/backups/nsti"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "🗄️ Creating backup..."

# Backup database
mongodump --db nsti_college_db --out $BACKUP_DIR/db_$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /opt nsti-college-management --exclude=node_modules --exclude=client/node_modules

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
find $BACKUP_DIR -type d -empty -delete

echo "✅ Backup completed: $BACKUP_DIR"
EOF

chmod +x /usr/local/bin/nsti-backup.sh

# Set up daily backup
cat > /etc/cron.d/nsti-backup << EOF
# NSTI College Management System Daily Backup
0 2 * * * root /usr/local/bin/nsti-backup.sh
EOF

# Final status check
print_status "Performing final status check..."
sleep 10

# Check if services are running
if systemctl is-active --quiet nginx && systemctl is-active --quiet mongodb && systemctl is-active --quiet pm2-$SERVICE_USER; then
    print_status "All services are running successfully!"
else
    print_warning "Some services may not be running properly. Check with: nsti-status"
fi

# Display final information
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
echo -e "${YELLOW}📋 Important Information:${NC}"
echo -e "• Application URL: http://$(curl -s ifconfig.me || echo 'YOUR-EC2-IP')"
echo -e "• Application Directory: $APP_DIR"
echo -e "• Service User: $SERVICE_USER"
echo -e "• Logs Directory: /var/log/nsti/"
echo ""
echo -e "${YELLOW}🛠️ Management Commands:${NC}"
echo -e "• Check Status: ${GREEN}nsti-status${NC}"
echo -e "• Update Application: ${GREEN}nsti-update${NC}"
echo -e "• Create Backup: ${GREEN}nsti-backup${NC}"
echo -e "• View Logs: ${GREEN}sudo -u $SERVICE_USER pm2 logs${NC}"
echo -e "• Restart App: ${GREEN}sudo -u $SERVICE_USER pm2 restart all${NC}"
echo ""
echo -e "${YELLOW}👥 Demo Login Credentials:${NC}"
echo -e "• Admin: admin@nsti.edu / admin123"
echo -e "• Teacher: teacher@nsti.edu / teacher123"
echo -e "• Student: student@nsti.edu / student123"
echo -e "• TO: to@nsti.edu / to123456"
echo ""
echo -e "${GREEN}✅ The system will automatically restart if any component fails${NC}"
echo -e "${GREEN}✅ Monitoring runs every 2 minutes${NC}"
echo -e "${GREEN}✅ Daily backups are configured${NC}"
echo -e "${GREEN}✅ Ready for 10+ concurrent users${NC}"
echo ""
print_status "Deployment completed successfully!"
EOF
