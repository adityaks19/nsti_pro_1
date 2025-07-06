# 🔧 Deployment Troubleshooting Guide

## ❌ **Issues Encountered & Solutions**

### **Issue 1: Pending Kernel Upgrade**
```
Pending kernel upgrade!
Running kernel version: 6.8.0-1029-aws
Expected kernel version: 6.8.0-1031-aws
```

**Solution:**
- The fixed script now handles this automatically
- System will reboot after deployment if kernel upgrade is pending
- All services will auto-start after reboot

### **Issue 2: MongoDB Package Not Found**
```
Package mongodb is not available, but is referred to by another package.
E: Package 'mongodb' has no installation candidate
```

**Problem:** Wrong package name and missing repository

**Solution in Fixed Script:**
```bash
# Add official MongoDB repository
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install correct package
apt install -y mongodb-org
```

### **Issue 3: Connection Timeout**
```
This site can't be reached
34.234.90.108 took too long to respond.
ERR_CONNECTION_TIMED_OUT
```

**Possible Causes:**
1. Security Group not configured properly
2. Nginx not started
3. Application not running
4. Firewall blocking connections

**Solutions:**

#### **Check Security Group:**
```bash
# In AWS Console, ensure these ports are open:
# Port 22 (SSH) - 0.0.0.0/0
# Port 80 (HTTP) - 0.0.0.0/0  
# Port 443 (HTTPS) - 0.0.0.0/0
```

#### **Check Services:**
```bash
# Check if services are running
sudo systemctl status nginx
sudo systemctl status mongod
sudo systemctl status pm2-nsti-app

# Check if application is responding
curl http://localhost:5000/health
curl http://localhost/
```

#### **Check Firewall:**
```bash
# Check UFW status
sudo ufw status

# If needed, configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

---

## 🚀 **Use the Fixed Deployment Script**

### **Quick Fix Deployment:**
```bash
# Download and run the fixed script
wget https://raw.githubusercontent.com/adityaks19/nsti_pro_1/main/deploy-to-ec2-fixed.sh
chmod +x deploy-to-ec2-fixed.sh
sudo ./deploy-to-ec2-fixed.sh
```

### **What the Fixed Script Does:**

#### **✅ Handles Kernel Upgrades:**
- Detects pending kernel upgrades
- Completes deployment first
- Automatically reboots if needed
- All services auto-start after reboot

#### **✅ Fixes MongoDB Installation:**
- Adds official MongoDB repository
- Uses correct package name (`mongodb-org`)
- Handles repository key properly
- Verifies installation success

#### **✅ Improves Network Handling:**
- Retry mechanisms for downloads
- Better timeout handling
- Connection verification
- Fallback options for network issues

#### **✅ Enhanced Error Handling:**
- Detailed error messages
- Retry logic for failed operations
- Graceful failure handling
- Better logging and diagnostics

---

## 🔍 **Manual Troubleshooting Steps**

### **If Deployment Still Fails:**

#### **1. Check System Status:**
```bash
# Check system resources
free -h
df -h
top

# Check for pending updates
sudo apt list --upgradable
```

#### **2. Check Network Connectivity:**
```bash
# Test internet connection
ping -c 4 8.8.8.8

# Test GitHub access
curl -I https://github.com

# Test package repositories
sudo apt update
```

#### **3. Manual MongoDB Installation:**
```bash
# Remove any existing MongoDB packages
sudo apt remove --purge mongodb* -y

# Add MongoDB repository manually
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start and enable
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### **4. Manual Application Setup:**
```bash
# Clone repository manually
cd /opt
sudo git clone https://github.com/adityaks19/nsti_pro_1.git nsti-college-management
cd nsti-college-management

# Install dependencies
npm install
cd client && npm install && npm run build
cd ..

# Create environment file
sudo tee .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nsti_college_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d
EOF

# Seed database
node scripts/seedData.js

# Start with PM2
sudo npm install -g pm2
pm2 start server.js --name nsti-backend
pm2 save
pm2 startup
```

---

## 🔧 **Common Solutions**

### **Service Not Starting:**
```bash
# Check service logs
sudo journalctl -u nginx -f
sudo journalctl -u mongod -f
sudo systemctl status pm2-nsti-app

# Restart services
sudo systemctl restart nginx
sudo systemctl restart mongod
sudo systemctl restart pm2-nsti-app
```

### **Port Already in Use:**
```bash
# Check what's using the port
sudo lsof -i :5000
sudo lsof -i :80

# Kill process if needed
sudo pkill -f node
sudo pkill -f nginx
```

### **Permission Issues:**
```bash
# Fix ownership
sudo chown -R nsti-app:nsti-app /opt/nsti-college-management
sudo chown -R nsti-app:nsti-app /var/log/nsti

# Fix permissions
sudo chmod -R 755 /opt/nsti-college-management
sudo chmod 600 /opt/nsti-college-management/.env
```

### **Database Connection Issues:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo --eval "db.adminCommand('ismaster')"
```

---

## 🎯 **Verification Steps**

### **After Fixed Deployment:**

#### **1. Check All Services:**
```bash
nsti-status
```

#### **2. Test Application:**
```bash
# Test backend
curl http://localhost:5000/health

# Test frontend
curl http://localhost/

# Test from outside
curl http://YOUR-EC2-IP/
```

#### **3. Test Login:**
- Open browser: `http://YOUR-EC2-IP`
- Login with: `admin@nsti.edu` / `admin123`
- Verify all features work

#### **4. Test Auto-Restart:**
```bash
# Kill backend process
sudo pkill -f node

# Wait 2 minutes and check
nsti-status
# Should show backend running again
```

---

## 🆘 **Emergency Recovery**

### **If Everything Fails:**

#### **Complete Reset:**
```bash
# Stop all services
sudo systemctl stop nginx mongod pm2-nsti-app

# Remove application
sudo rm -rf /opt/nsti-college-management

# Remove user
sudo userdel -r nsti-app

# Clean packages
sudo apt remove --purge mongodb-org* nodejs npm -y
sudo apt autoremove -y

# Start fresh with fixed script
wget https://raw.githubusercontent.com/adityaks19/nsti_pro_1/main/deploy-to-ec2-fixed.sh
chmod +x deploy-to-ec2-fixed.sh
sudo ./deploy-to-ec2-fixed.sh
```

#### **Reboot and Retry:**
```bash
# Sometimes a clean reboot helps
sudo reboot

# After reboot, run fixed script
sudo ./deploy-to-ec2-fixed.sh
```

---

## 📞 **Getting Help**

### **Collect Diagnostic Information:**
```bash
# System info
uname -a
lsb_release -a
free -h
df -h

# Service status
sudo systemctl status nginx mongod pm2-nsti-app

# Application logs
sudo tail -100 /var/log/nsti/backend-combined.log
sudo tail -100 /var/log/nginx/error.log

# Network status
sudo netstat -tlnp | grep -E ':(80|443|5000|27017)'
```

### **Common Log Locations:**
- **Application**: `/var/log/nsti/`
- **Nginx**: `/var/log/nginx/`
- **MongoDB**: `/var/log/mongodb/`
- **System**: `/var/log/syslog`

---

## ✅ **Success Indicators**

After using the fixed script, you should see:

```bash
$ nsti-status
🏥 NSTI College Management System - Status Check
==============================================
📊 Service Status:
MongoDB: ✅ Running
Nginx: ✅ Running
PM2: ✅ Running

🚀 Application Status:
Backend API: ✅ Responding
Frontend: ✅ Accessible
```

**Your application should be accessible at `http://YOUR-EC2-IP`**

---

*Troubleshooting Guide Version: 1.0*  
*Last Updated: July 6, 2025*
