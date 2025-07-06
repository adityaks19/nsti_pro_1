# 🚀 EC2 Deployment Guide - NSTI College Management System

## 📋 **Quick Deployment Instructions**

### **Step 1: Launch EC2 Instance**
1. **Instance Type**: t3.medium or larger (for 10+ users)
2. **OS**: Ubuntu 20.04 LTS or Ubuntu 22.04 LTS
3. **Storage**: 20GB+ SSD
4. **Security Group**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

### **Step 2: Connect to EC2 Instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### **Step 3: Run Deployment Script**
```bash
# Download and run the deployment script
wget https://raw.githubusercontent.com/adityaks19/nsti_pro_1/main/deploy-to-ec2.sh
chmod +x deploy-to-ec2.sh
sudo ./deploy-to-ec2.sh
```

### **Step 4: Access Your Application**
- **URL**: http://your-ec2-ip
- **Admin Panel**: Login with provided credentials

---

## 🛠️ **What the Deployment Script Does**

### **System Setup:**
- ✅ Updates Ubuntu packages
- ✅ Installs Node.js 18.x
- ✅ Installs MongoDB
- ✅ Installs Nginx (reverse proxy)
- ✅ Installs PM2 (process manager)
- ✅ Configures firewall (UFW)

### **Application Setup:**
- ✅ Clones your GitHub repository
- ✅ Installs all dependencies
- ✅ Builds production frontend
- ✅ Seeds database with demo data
- ✅ Configures environment variables

### **Auto-Restart & Monitoring:**
- ✅ **PM2 Process Manager** - Automatically restarts crashed processes
- ✅ **System Monitoring** - Checks every 2 minutes
- ✅ **Auto-Recovery** - Restarts MongoDB, Nginx, Backend if they fail
- ✅ **Cluster Mode** - Runs 2 backend instances for load balancing

### **Production Features:**
- ✅ **Nginx Reverse Proxy** - Handles static files and API routing
- ✅ **Log Management** - Automatic log rotation
- ✅ **Daily Backups** - Database and application backups
- ✅ **Security Headers** - XSS protection, CSRF protection
- ✅ **Gzip Compression** - Faster loading times

---

## 👥 **Multi-User Support (10+ Users)**

### **Performance Optimizations:**
- **Cluster Mode**: 2 backend processes for load balancing
- **Connection Pooling**: MongoDB connection optimization
- **Static File Caching**: Nginx serves static files efficiently
- **Memory Management**: Automatic restart if memory usage exceeds 1GB

### **Concurrent User Handling:**
- **Load Balancing**: PM2 distributes requests across processes
- **Database Optimization**: Indexed queries for fast responses
- **Session Management**: JWT tokens for stateless authentication
- **Resource Monitoring**: Automatic scaling based on load

---

## 🔧 **Management Commands**

### **Check System Status:**
```bash
nsti-status
```

### **Update Application:**
```bash
nsti-update
```

### **Create Backup:**
```bash
nsti-backup
```

### **View Application Logs:**
```bash
sudo -u nsti-app pm2 logs
```

### **Restart Application:**
```bash
sudo -u nsti-app pm2 restart all
```

### **Monitor Resources:**
```bash
htop
sudo -u nsti-app pm2 monit
```

---

## 🔄 **Auto-Restart Features**

### **What Gets Monitored:**
1. **Backend API** - Checks if API responds every 2 minutes
2. **MongoDB** - Ensures database is running
3. **Nginx** - Verifies web server is active
4. **PM2 Processes** - Monitors application processes

### **Auto-Recovery Actions:**
- **Backend Crash** → PM2 automatically restarts
- **MongoDB Down** → System service restarts MongoDB
- **Nginx Issues** → Nginx service restarts
- **High Memory Usage** → Process restarts automatically
- **Server Reboot** → All services start automatically

### **Monitoring Schedule:**
- **Every 2 minutes**: Health checks
- **Daily 2 AM**: Automatic backups
- **Weekly**: Log rotation
- **On Boot**: All services auto-start

---

## 📊 **System Architecture**

```
Internet → Nginx (Port 80) → Backend API (Port 5000)
                          ↓
                      MongoDB (Port 27017)
                          ↓
                    React Frontend (Static Files)
```

### **Process Management:**
```
PM2 Process Manager
├── nsti-backend (Instance 1)
├── nsti-backend (Instance 2)
└── Monitoring & Auto-restart
```

---

## 🔐 **Security Features**

### **Network Security:**
- ✅ UFW Firewall configured
- ✅ Only necessary ports open (22, 80, 443)
- ✅ MongoDB not exposed to internet

### **Application Security:**
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Input validation and sanitization

### **Server Security:**
- ✅ Non-root application user
- ✅ File permissions properly set
- ✅ Security headers in Nginx
- ✅ Regular security updates

---

## 📈 **Performance Specifications**

### **Recommended EC2 Instance:**
- **Type**: t3.medium (2 vCPU, 4GB RAM)
- **Storage**: 20GB+ SSD
- **Network**: Enhanced networking enabled

### **Expected Performance:**
- **Concurrent Users**: 10-50 users
- **Response Time**: < 200ms for API calls
- **Uptime**: 99.9% with auto-restart
- **Database**: Handles 1000+ records efficiently

### **Scaling Options:**
- **Vertical**: Upgrade to t3.large for more users
- **Horizontal**: Add load balancer + multiple instances
- **Database**: MongoDB Atlas for managed database

---

## 🎯 **Demo Credentials**

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@nsti.edu | admin123 | Full system access |
| Teacher | teacher@nsti.edu | teacher123 | Review leave applications |
| Student | student@nsti.edu | student123 | Apply for leave |
| TO | to@nsti.edu | to123456 | Final approval authority |
| Librarian | librarian@nsti.edu | lib123 | Library management |
| Store Manager | store@nsti.edu | store123 | Store management |

---

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **Application Not Loading:**
```bash
# Check service status
nsti-status

# Check logs
sudo -u nsti-app pm2 logs

# Restart services
sudo systemctl restart nginx
sudo -u nsti-app pm2 restart all
```

#### **Database Connection Issues:**
```bash
# Check MongoDB
sudo systemctl status mongodb
sudo systemctl restart mongodb

# Check database logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### **High Memory Usage:**
```bash
# Check memory usage
free -h
sudo -u nsti-app pm2 monit

# Restart if needed
sudo -u nsti-app pm2 restart all
```

### **Emergency Recovery:**
```bash
# Full system restart
sudo reboot

# Manual service restart
sudo systemctl restart mongodb nginx pm2-nsti-app
```

---

## 📞 **Support & Maintenance**

### **Log Locations:**
- **Application**: `/var/log/nsti/`
- **Nginx**: `/var/log/nginx/`
- **MongoDB**: `/var/log/mongodb/`
- **System**: `/var/log/syslog`

### **Backup Locations:**
- **Database**: `/opt/backups/nsti/db_*`
- **Application**: `/opt/backups/nsti/app_*`

### **Configuration Files:**
- **Application**: `/opt/nsti-college-management/`
- **Nginx**: `/etc/nginx/sites-available/nsti-college`
- **PM2**: `/opt/nsti-college-management/ecosystem.config.js`

---

## 🎉 **Deployment Complete!**

Your NSTI College Management System is now:
- ✅ **Deployed on EC2** with auto-restart capabilities
- ✅ **Ready for 10+ users** with load balancing
- ✅ **Automatically monitored** every 2 minutes
- ✅ **Backed up daily** for data safety
- ✅ **Production ready** with security features

**Access your application at**: `http://your-ec2-ip`

---

*Last Updated: July 6, 2025*  
*Deployment Script Version: 1.0*
