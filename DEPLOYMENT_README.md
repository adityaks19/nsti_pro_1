# 🚀 EC2 Deployment - NSTI College Management System

## ⚡ **One-Command Deployment**

Deploy your NSTI College Management System to EC2 with auto-restart capabilities in just one command!

### **Quick Deploy (Recommended):**
```bash
curl -sSL https://raw.githubusercontent.com/adityaks19/nsti_pro_1/main/quick-deploy.sh | sudo bash
```

### **Manual Deploy:**
```bash
wget https://raw.githubusercontent.com/adityaks19/nsti_pro_1/main/deploy-to-ec2.sh
chmod +x deploy-to-ec2.sh
sudo ./deploy-to-ec2.sh
```

---

## 🎯 **What You Get**

### **✅ Complete Production Setup:**
- **Auto-Restart**: System monitors and restarts failed components every 2 minutes
- **Load Balancing**: 2 backend processes for handling multiple users
- **Security**: Firewall, security headers, and proper user permissions
- **Monitoring**: Health checks and automated recovery
- **Backups**: Daily automated backups of database and application

### **✅ Multi-User Support:**
- **10+ Concurrent Users**: Optimized for multiple simultaneous users
- **Session Management**: JWT-based stateless authentication
- **Resource Optimization**: Memory and CPU usage monitoring
- **Auto-Scaling**: Processes restart if memory usage exceeds limits

### **✅ Production Features:**
- **Nginx Reverse Proxy**: Efficient static file serving and API routing
- **PM2 Process Manager**: Advanced process management with clustering
- **MongoDB Database**: Persistent data storage with automatic backups
- **Log Management**: Automatic log rotation and monitoring
- **SSL Ready**: Easy SSL certificate setup with Certbot

---

## 🖥️ **EC2 Requirements**

### **Minimum Specifications:**
- **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04 LTS or Ubuntu 22.04 LTS
- **Security Group**: Ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

### **Recommended for 10+ Users:**
- **Instance Type**: t3.large (2 vCPU, 8GB RAM)
- **Storage**: 30GB+ SSD
- **Enhanced Networking**: Enabled

---

## 🔧 **Management Commands**

After deployment, use these commands to manage your system:

### **System Status:**
```bash
nsti-status          # Complete system health check
nsti-health-check    # Detailed health analysis
```

### **Application Management:**
```bash
nsti-update          # Update to latest GitHub version
nsti-backup          # Create manual backup
sudo -u nsti-app pm2 restart all    # Restart application
sudo -u nsti-app pm2 logs           # View application logs
```

### **Service Management:**
```bash
sudo systemctl restart nginx        # Restart web server
sudo systemctl restart mongodb      # Restart database
sudo systemctl restart pm2-nsti-app # Restart process manager
```

---

## 🔄 **Auto-Restart Features**

### **What Gets Monitored:**
- ✅ **Backend API** - Health check every 2 minutes
- ✅ **MongoDB Database** - Service status monitoring
- ✅ **Nginx Web Server** - Process monitoring
- ✅ **PM2 Processes** - Application process health

### **Auto-Recovery Actions:**
- **Backend Crash** → PM2 automatically restarts (< 10 seconds)
- **Database Down** → System service restarts MongoDB
- **Web Server Issues** → Nginx service restarts
- **High Memory Usage** → Process restarts automatically
- **Server Reboot** → All services start automatically on boot

### **Monitoring Schedule:**
```
Every 2 minutes: Health checks and auto-restart
Daily at 2 AM: Automatic database and file backups
Weekly: Log rotation and cleanup
On Boot: All services auto-start
```

---

## 👥 **User Access & Credentials**

### **Demo Login Credentials:**
| Role | Email | Password | Capabilities |
|------|-------|----------|-------------|
| **Admin** | admin@nsti.edu | admin123 | Full system access, user management |
| **Teacher** | teacher@nsti.edu | teacher123 | Review and approve leave applications |
| **Student** | student@nsti.edu | student123 | Apply for leave, track status |
| **Training Officer** | to@nsti.edu | to123456 | Final approval authority |
| **Librarian** | librarian@nsti.edu | lib123 | Library management |
| **Store Manager** | store@nsti.edu | store123 | Inventory management |

### **Multi-User Features:**
- **Concurrent Sessions**: Up to 50+ simultaneous users
- **Role-Based Access**: Different permissions for each user type
- **Session Management**: Secure JWT token authentication
- **Real-Time Updates**: Live status updates across all users

---

## 📊 **Performance & Monitoring**

### **Expected Performance:**
- **Response Time**: < 200ms for API calls
- **Concurrent Users**: 10-50 users comfortably
- **Uptime**: 99.9% with auto-restart features
- **Database Performance**: Handles 1000+ records efficiently

### **Resource Monitoring:**
```bash
# Check resource usage
htop                 # System resources
sudo -u nsti-app pm2 monit    # Application monitoring
df -h               # Disk usage
free -h             # Memory usage
```

### **Performance Optimization:**
- **Cluster Mode**: Multiple backend processes
- **Connection Pooling**: Optimized database connections
- **Static File Caching**: Nginx handles static assets
- **Gzip Compression**: Reduced bandwidth usage

---

## 🔐 **Security Features**

### **Network Security:**
- ✅ **UFW Firewall**: Only necessary ports open
- ✅ **Security Headers**: XSS, CSRF protection
- ✅ **Private Database**: MongoDB not exposed to internet
- ✅ **SSL Ready**: Easy HTTPS setup

### **Application Security:**
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Password Hashing**: bcrypt encryption
- ✅ **Role-Based Access**: Proper permission system
- ✅ **Input Validation**: SQL injection prevention

### **Server Security:**
- ✅ **Non-Root User**: Application runs as dedicated user
- ✅ **File Permissions**: Proper access controls
- ✅ **Regular Updates**: Automated security patches
- ✅ **Log Monitoring**: Security event tracking

---

## 🆘 **Troubleshooting**

### **Common Issues & Solutions:**

#### **Application Not Loading:**
```bash
nsti-status                    # Check overall status
sudo -u nsti-app pm2 logs     # Check application logs
sudo systemctl restart nginx  # Restart web server
```

#### **Database Connection Issues:**
```bash
sudo systemctl status mongodb    # Check MongoDB status
sudo systemctl restart mongodb   # Restart database
mongo --eval "db.stats()"       # Test database connection
```

#### **High Resource Usage:**
```bash
htop                           # Check system resources
sudo -u nsti-app pm2 monit     # Monitor PM2 processes
sudo -u nsti-app pm2 restart all  # Restart if needed
```

#### **Auto-Restart Not Working:**
```bash
sudo systemctl status pm2-nsti-app  # Check PM2 service
crontab -l                          # Check monitoring cron job
/usr/local/bin/nsti-monitor.sh      # Run monitor manually
```

---

## 📈 **Scaling Options**

### **Vertical Scaling (Single Server):**
- **t3.large**: 8GB RAM for 20+ users
- **t3.xlarge**: 16GB RAM for 50+ users
- **Add more PM2 instances**: Scale backend processes

### **Horizontal Scaling (Multiple Servers):**
- **Load Balancer**: AWS Application Load Balancer
- **Database**: MongoDB Atlas (managed database)
- **CDN**: CloudFront for static assets
- **Auto Scaling**: EC2 Auto Scaling Groups

---

## 🎉 **Success Indicators**

After deployment, you should see:

### **✅ System Health:**
```bash
$ nsti-status
MongoDB: ✅ Running
Nginx: ✅ Running  
PM2: ✅ Running
Backend API: ✅ Responding
Frontend: ✅ Accessible
```

### **✅ Application Access:**
- Visit `http://your-ec2-ip` in browser
- Login with demo credentials
- All features working (leave applications, library, store)
- Multiple users can login simultaneously

### **✅ Auto-Restart Working:**
- Kill a process: `sudo pkill -f node`
- Check after 2 minutes: Process should be restarted automatically
- Reboot server: All services should start automatically

---

## 📞 **Support & Maintenance**

### **Log Locations:**
- **Application Logs**: `/var/log/nsti/`
- **Nginx Logs**: `/var/log/nginx/`
- **MongoDB Logs**: `/var/log/mongodb/`
- **System Logs**: `/var/log/syslog`

### **Backup Locations:**
- **Database Backups**: `/opt/backups/nsti/db_*`
- **Application Backups**: `/opt/backups/nsti/app_*`

### **Configuration Files:**
- **Application**: `/opt/nsti-college-management/`
- **Nginx Config**: `/etc/nginx/sites-available/nsti-college`
- **PM2 Config**: `/opt/nsti-college-management/ecosystem.config.js`
- **Environment**: `/opt/nsti-college-management/.env`

---

## 🎯 **Quick Start Checklist**

- [ ] Launch EC2 instance (t3.medium or larger)
- [ ] Configure security group (ports 22, 80, 443)
- [ ] Connect via SSH
- [ ] Run deployment command: `curl -sSL https://raw.githubusercontent.com/adityaks19/nsti_pro_1/main/quick-deploy.sh | sudo bash`
- [ ] Wait for deployment to complete (5-10 minutes)
- [ ] Access application at `http://your-ec2-ip`
- [ ] Test login with demo credentials
- [ ] Verify auto-restart: `nsti-status`
- [ ] Test with multiple users
- [ ] Set up SSL certificate (optional): `sudo certbot --nginx`

**Your NSTI College Management System is now production-ready with auto-restart capabilities!** 🚀

---

*Deployment Guide Version: 1.0*  
*Last Updated: July 6, 2025*
