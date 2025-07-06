#!/bin/bash

# NSTI College Management System - Quick Deploy Script
# Run this on your EC2 instance as root: curl -sSL https://raw.githubusercontent.com/adityaks19/nsti_pro_1/main/quick-deploy.sh | sudo bash

set -e

echo "🚀 NSTI College Management System - Quick Deploy"
echo "=============================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Download and run the full deployment script
echo "📥 Downloading deployment script..."
wget -q https://raw.githubusercontent.com/adityaks19/nsti_pro_1/main/deploy-to-ec2.sh -O /tmp/deploy-to-ec2.sh

echo "🔧 Making script executable..."
chmod +x /tmp/deploy-to-ec2.sh

echo "🚀 Starting deployment..."
/tmp/deploy-to-ec2.sh

echo "🧹 Cleaning up..."
rm -f /tmp/deploy-to-ec2.sh

echo ""
echo "🎉 Quick deployment completed!"
echo "Your NSTI College Management System is now running!"
echo ""
echo "Access your application at: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR-EC2-IP')"
echo ""
echo "Management commands:"
echo "• nsti-status  - Check system status"
echo "• nsti-update  - Update application"
echo "• nsti-backup  - Create backup"
echo ""
