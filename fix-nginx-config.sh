#!/bin/bash

# Quick fix for Nginx configuration issue

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Quick Fix - Nginx Configuration${NC}"
echo -e "${BLUE}=================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}✅ Fixing Nginx configuration...${NC}"

# Step 1: Check if application directory exists and has built frontend
APP_DIR="/opt/nsti-college-management"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}📁 Creating application directory...${NC}"
    mkdir -p $APP_DIR
    cp -r /home/ubuntu/nsti_pro_1/* $APP_DIR/
    chown -R nsti-app:nsti-app $APP_DIR
fi

cd $APP_DIR

# Step 2: Build frontend if not exists
if [ ! -d "client/build" ]; then
    echo -e "${YELLOW}🏗️ Building frontend...${NC}"
    cd client
    sudo -u nsti-app npm install
    sudo -u nsti-app npm run build
    cd ..
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${GREEN}✅ Frontend build already exists${NC}"
fi

# Step 3: Remove default Nginx configuration
echo -e "${YELLOW}🗑️ Removing default Nginx configuration...${NC}"
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-available/default

# Step 4: Create proper Nginx configuration for your app
echo -e "${YELLOW}⚙️ Creating proper Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/nsti-college << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root directory for React build
    root /opt/nsti-college-management/client/build;
    index index.html index.htm;

    # Serve React frontend
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
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
        return 200 "NSTI College Management System - Healthy\n";
        add_header Content-Type text/plain;
    }

    # Handle React Router routes
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF

# Step 5: Enable the new configuration
echo -e "${YELLOW}🔗 Enabling new Nginx configuration...${NC}"
ln -sf /etc/nginx/sites-available/nsti-college /etc/nginx/sites-enabled/

# Step 6: Test Nginx configuration
echo -e "${YELLOW}🧪 Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

# Step 7: Restart Nginx
echo -e "${YELLOW}🔄 Restarting Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx

# Step 8: Check if backend is responding
echo -e "${YELLOW}🔍 Checking backend status...${NC}"
sleep 5

if curl -f -s --connect-timeout 10 http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${YELLOW}⚠️ Backend may need a moment to start${NC}"
fi

# Step 9: Create the nsti-status command
echo -e "${YELLOW}📊 Creating status command...${NC}"
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
if curl -f -s --connect-timeout 5 http://localhost/ | grep -q "NSTI\|React\|<!DOCTYPE html>" 2>/dev/null; then
    echo "✅ Serving Application"
else
    echo "❌ Default Nginx Page"
fi

echo ""
echo "📱 PM2 Process Status:"
sudo -u nsti-app pm2 status 2>/dev/null || echo "PM2 not available"

echo ""
echo "💻 System Resources:"
echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"

echo ""
echo "🌐 Access Information:"
PUBLIC_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "34.234.90.108")
echo "Application URL: http://$PUBLIC_IP"
echo ""
echo "👥 Login Credentials:"
echo "Admin: admin@nsti.edu / admin123"
echo "Student: student@nsti.edu / student123"
echo "Teacher: teacher@nsti.edu / teacher123"

echo ""
echo "🛠️ Management Commands:"
echo "• Restart Backend: sudo -u nsti-app pm2 restart all"
echo "• View Logs: sudo -u nsti-app pm2 logs"
echo "• Restart Nginx: sudo systemctl restart nginx"
EOF

chmod +x /usr/local/bin/nsti-status

# Step 10: Final verification
echo -e "${YELLOW}🔍 Final verification...${NC}"
sleep 5

# Test if the application is now serving
if curl -s http://localhost/ | grep -q "<!DOCTYPE html>" 2>/dev/null; then
    FRONTEND_OK=true
else
    FRONTEND_OK=false
fi

# Test backend
if curl -f -s --connect-timeout 5 http://localhost:5000/health > /dev/null 2>&1; then
    BACKEND_OK=true
else
    BACKEND_OK=false
fi

# Test nginx
if systemctl is-active --quiet nginx; then
    NGINX_OK=true
else
    NGINX_OK=false
fi

echo ""
echo -e "${GREEN}🎉 NGINX CONFIGURATION FIX COMPLETED! 🎉${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "${YELLOW}📊 Final Status:${NC}"
echo -e "Nginx: $([ "$NGINX_OK" = true ] && echo "✅ Running" || echo "❌ Issue")"
echo -e "Backend: $([ "$BACKEND_OK" = true ] && echo "✅ Running" || echo "❌ Issue")"
echo -e "Frontend: $([ "$FRONTEND_OK" = true ] && echo "✅ Serving App" || echo "❌ Default Page")"
echo ""
echo -e "${YELLOW}🌐 Access Your Application:${NC}"
echo -e "• URL: ${GREEN}http://34.234.90.108${NC}"
echo -e "• Should now show: ${GREEN}NSTI College Management System${NC}"
echo -e "• Login: ${GREEN}admin@nsti.edu / admin123${NC}"
echo ""
echo -e "${YELLOW}🛠️ Commands Available:${NC}"
echo -e "• Check Status: ${GREEN}nsti-status${NC}"
echo -e "• View Logs: ${GREEN}sudo -u nsti-app pm2 logs${NC}"
echo ""

if [ "$NGINX_OK" = true ] && [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
    echo -e "${GREEN}🎯 SUCCESS! Your NSTI College Management System is now live!${NC}"
    echo -e "${GREEN}✅ Nginx is serving your React application${NC}"
    echo -e "${GREEN}✅ Backend API is responding${NC}"
    echo -e "${GREEN}✅ No more default Nginx page${NC}"
    echo ""
    echo -e "${BLUE}🎓 Your college management system is ready for use!${NC}"
else
    echo -e "${YELLOW}⚠️ Some services may need a moment to fully start${NC}"
    echo -e "${YELLOW}Wait 1-2 minutes and run: nsti-status${NC}"
fi

echo ""
EOF
