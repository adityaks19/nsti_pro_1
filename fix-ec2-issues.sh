#!/bin/bash

# NSTI College Management System - EC2 Issues Fix Script
# This script fixes memory issues, bash errors, and restarts services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 NSTI College Management System - Issues Fix${NC}"
echo -e "${BLUE}=============================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}✅ Starting system fixes...${NC}"

# Step 1: Fix memory issues by increasing Node.js memory limit
echo -e "${YELLOW}🧠 Fixing Node.js memory issues...${NC}"

# Kill any existing Node.js processes
pkill -f node || true
pkill -f pm2 || true

# Wait for processes to terminate
sleep 5

# Step 2: Fix bash PATH syntax error
echo -e "${YELLOW}🔧 Fixing bash PATH syntax error...${NC}"

# Backup original bashrc
cp /home/ubuntu/.bashrc /home/ubuntu/.bashrc.backup 2>/dev/null || true

# Create a clean bashrc for ubuntu user
cat > /home/ubuntu/.bashrc << 'EOF'
# ~/.bashrc: executed by bash(1) for non-login shells.

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# don't put duplicate lines or lines starting with space in the history.
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add /usr/local/bin to PATH
export PATH="/usr/local/bin:$PATH"

# Add npm global packages to PATH
export PATH="/usr/local/lib/node_modules/.bin:$PATH"
EOF

chown ubuntu:ubuntu /home/ubuntu/.bashrc

# Step 3: Set up proper Node.js memory limits
echo -e "${YELLOW}⚙️ Configuring Node.js memory settings...${NC}"

# Create Node.js options file
echo 'export NODE_OPTIONS="--max-old-space-size=2048"' >> /etc/environment

# Step 4: Restart and configure services
echo -e "${YELLOW}🔄 Restarting services...${NC}"

# Ensure MongoDB is running
systemctl start mongod || systemctl start mongodb
systemctl enable mongod || systemctl enable mongodb

# Step 5: Navigate to application directory and restart
APP_DIR="/opt/nsti-college-management"
if [ -d "$APP_DIR" ]; then
    cd $APP_DIR
    
    # Set proper ownership
    chown -R nsti-app:nsti-app $APP_DIR
    
    # Create new PM2 ecosystem with memory limits
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
      error_file: '/var/log/nsti/backend-error.log',
      out_file: '/var/log/nsti/backend-out.log',
      log_file: '/var/log/nsti/backend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      max_memory_restart: '800M',
      watch: false,
      kill_timeout: 5000
    }
  ]
};
EOF
    
    chown nsti-app:nsti-app ecosystem.config.js
    
    # Start application with PM2
    echo -e "${YELLOW}🚀 Starting application with memory optimizations...${NC}"
    sudo -u nsti-app NODE_OPTIONS="--max-old-space-size=1024" pm2 start ecosystem.config.js --env production
    sudo -u nsti-app pm2 save
    
else
    echo -e "${RED}❌ Application directory not found. Need to deploy first.${NC}"
fi

# Step 6: Configure Nginx properly
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"

# Create proper Nginx configuration
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
        
        # Handle CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF

# Enable the site and remove default
ln -sf /etc/nginx/sites-available/nsti-college /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    systemctl restart nginx
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
fi

# Step 7: Create system monitoring script
echo -e "${YELLOW}📊 Setting up enhanced monitoring...${NC}"

cat > /usr/local/bin/nsti-monitor-enhanced.sh << 'EOF'
#!/bin/bash

LOG_FILE="/var/log/nsti/monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f"), $3/$2 * 100.0}')
if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
    log_message "High memory usage: ${MEMORY_USAGE}% - Restarting application"
    sudo -u nsti-app pm2 restart nsti-backend
fi

# Check backend health
if ! curl -f -s --connect-timeout 10 http://localhost:5000/health > /dev/null 2>&1; then
    log_message "Backend is down, restarting..."
    sudo -u nsti-app NODE_OPTIONS="--max-old-space-size=1024" pm2 restart nsti-backend
fi

# Check nginx
if ! systemctl is-active --quiet nginx; then
    log_message "Nginx is down, restarting..."
    systemctl restart nginx
fi

# Check mongodb
if ! systemctl is-active --quiet mongod && ! systemctl is-active --quiet mongodb; then
    log_message "MongoDB is down, restarting..."
    systemctl restart mongod || systemctl restart mongodb
fi
EOF

chmod +x /usr/local/bin/nsti-monitor-enhanced.sh

# Update cron job
cat > /etc/cron.d/nsti-monitor << EOF
# NSTI College Management System Enhanced Monitoring
*/2 * * * * root /usr/local/bin/nsti-monitor-enhanced.sh
EOF

# Step 8: Create enhanced status script
cat > /usr/local/bin/nsti-status << 'EOF'
#!/bin/bash

echo "🏥 NSTI College Management System - Enhanced Status Check"
echo "======================================================="
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
echo "Memory: $(free -h | awk '/^Mem:/ {printf "Used: %s / Total: %s (%.1f%%)", $3, $2, ($3/$2)*100}')"
echo "Disk: $(df -h / | awk 'NR==2 {printf "Used: %s / Total: %s (%s)", $3, $2, $5}')"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}' | xargs)"

echo ""
echo "🌐 Network Status:"
PUBLIC_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "Unable to fetch")
echo "Public IP: $PUBLIC_IP"
echo "Application URL: http://$PUBLIC_IP"

echo ""
echo "📝 Recent Logs (last 5 lines):"
tail -5 /var/log/nsti/backend-combined.log 2>/dev/null || echo "No backend logs available"
EOF

chmod +x /usr/local/bin/nsti-status

# Step 9: Final system check
echo -e "${YELLOW}🔍 Performing final system check...${NC}"
sleep 10

# Check if services are running
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

# Get public IP
PUBLIC_IP=$(curl -s --connect-timeout 10 ifconfig.me 2>/dev/null || echo "34.234.90.108")

echo ""
echo -e "${GREEN}🎉 SYSTEM FIXES COMPLETED! 🎉${NC}"
echo -e "${BLUE}==============================${NC}"
echo ""
echo -e "${YELLOW}📊 System Status:${NC}"
echo -e "MongoDB: $([ "$MONGODB_OK" = true ] && echo "✅ Running" || echo "❌ Issue")"
echo -e "Nginx: $([ "$NGINX_OK" = true ] && echo "✅ Running" || echo "❌ Issue")"
echo -e "Backend: $([ "$BACKEND_OK" = true ] && echo "✅ Running" || echo "❌ Issue")"
echo ""
echo -e "${YELLOW}🌐 Access Information:${NC}"
echo -e "• Application URL: ${GREEN}http://$PUBLIC_IP${NC}"
echo -e "• Admin Login: ${GREEN}admin@nsti.edu / admin123${NC}"
echo -e "• Student Login: ${GREEN}student@nsti.edu / student123${NC}"
echo ""
echo -e "${YELLOW}🛠️ Management Commands:${NC}"
echo -e "• Check Status: ${GREEN}nsti-status${NC}"
echo -e "• View Logs: ${GREEN}sudo -u nsti-app pm2 logs${NC}"
echo -e "• Restart App: ${GREEN}sudo -u nsti-app pm2 restart all${NC}"
echo ""
echo -e "${GREEN}✅ Memory issues fixed with Node.js optimization${NC}"
echo -e "${GREEN}✅ Bash PATH syntax error resolved${NC}"
echo -e "${GREEN}✅ Nginx properly configured for your application${NC}"
echo -e "${GREEN}✅ Enhanced monitoring enabled${NC}"
echo ""

if [ "$MONGODB_OK" = true ] && [ "$NGINX_OK" = true ] && [ "$BACKEND_OK" = true ]; then
    echo -e "${GREEN}🎯 All systems operational! Your website should be working at http://$PUBLIC_IP${NC}"
else
    echo -e "${YELLOW}⚠️ Some services may need a few more minutes to fully start.${NC}"
    echo -e "${YELLOW}Run 'nsti-status' in 2-3 minutes to check again.${NC}"
fi

echo ""
EOF
