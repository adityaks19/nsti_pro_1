#!/bin/bash

# NSTI College Management System - Health Check Script
# This script performs comprehensive health checks

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_PORT=5000
FRONTEND_PORT=80
MONGODB_PORT=27017
SERVICE_USER="nsti-app"

echo -e "${BLUE}🏥 NSTI College Management System - Health Check${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Function to check service
check_service() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    
    echo -n "Checking $service_name... "
    
    if [ -n "$endpoint" ]; then
        if curl -f -s "$endpoint" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Healthy${NC}"
            return 0
        else
            echo -e "${RED}❌ Unhealthy${NC}"
            return 1
        fi
    elif [ -n "$port" ]; then
        if nc -z localhost $port 2>/dev/null; then
            echo -e "${GREEN}✅ Running${NC}"
            return 0
        else
            echo -e "${RED}❌ Down${NC}"
            return 1
        fi
    else
        if systemctl is-active --quiet $service_name; then
            echo -e "${GREEN}✅ Active${NC}"
            return 0
        else
            echo -e "${RED}❌ Inactive${NC}"
            return 1
        fi
    fi
}

# Check system services
echo -e "${YELLOW}📊 System Services:${NC}"
check_service "mongodb" $MONGODB_PORT
check_service "nginx" 
check_service "pm2-$SERVICE_USER"

echo ""

# Check application components
echo -e "${YELLOW}🚀 Application Components:${NC}"
check_service "Backend API" "" "http://localhost:$BACKEND_PORT/api/auth/test"
check_service "Frontend" "" "http://localhost:$FRONTEND_PORT/"

echo ""

# Check database connectivity
echo -e "${YELLOW}🗄️ Database Connectivity:${NC}"
echo -n "MongoDB Connection... "
if mongo --eval "db.adminCommand('ismaster')" --quiet > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Connection Failed${NC}"
fi

echo ""

# Check PM2 processes
echo -e "${YELLOW}📱 PM2 Processes:${NC}"
if command -v pm2 >/dev/null 2>&1; then
    sudo -u $SERVICE_USER pm2 jlist 2>/dev/null | jq -r '.[] | "\(.name): \(.pm2_env.status)"' 2>/dev/null || \
    sudo -u $SERVICE_USER pm2 status --no-colors 2>/dev/null | grep -E "(online|stopped|errored)" || \
    echo "PM2 status unavailable"
else
    echo "PM2 not installed"
fi

echo ""

# Check resource usage
echo -e "${YELLOW}💻 Resource Usage:${NC}"
echo "Memory: $(free -h | awk '/^Mem:/ {printf "Used: %s / Total: %s (%.1f%%)", $3, $2, ($3/$2)*100}')"
echo "Disk: $(df -h / | awk 'NR==2 {printf "Used: %s / Total: %s (%s)", $3, $2, $5}')"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}' | xargs)"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"

echo ""

# Check network connectivity
echo -e "${YELLOW}🌐 Network Connectivity:${NC}"
echo -n "Internet Connection... "
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ No Internet${NC}"
fi

echo -n "GitHub Access... "
if curl -f -s https://api.github.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Accessible${NC}"
else
    echo -e "${RED}❌ Blocked${NC}"
fi

echo ""

# Check log files
echo -e "${YELLOW}📝 Log Status:${NC}"
LOG_DIR="/var/log/nsti"
if [ -d "$LOG_DIR" ]; then
    echo "Log Directory: ✅ Exists"
    echo "Recent Errors: $(grep -c "ERROR\|Error\|error" $LOG_DIR/*.log 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')"
    echo "Log Size: $(du -sh $LOG_DIR 2>/dev/null | cut -f1)"
else
    echo "Log Directory: ❌ Missing"
fi

echo ""

# Check backup status
echo -e "${YELLOW}🗄️ Backup Status:${NC}"
BACKUP_DIR="/opt/backups/nsti"
if [ -d "$BACKUP_DIR" ]; then
    LATEST_BACKUP=$(find $BACKUP_DIR -name "*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" 2>/dev/null | cut -d' ' -f1)
        echo "Latest Backup: $BACKUP_DATE"
    else
        echo "Latest Backup: ❌ No backups found"
    fi
else
    echo "Backup Directory: ❌ Missing"
fi

echo ""

# Overall health score
echo -e "${YELLOW}🎯 Overall Health Score:${NC}"

# Count successful checks
TOTAL_CHECKS=8
PASSED_CHECKS=0

# Check each component and count successes
systemctl is-active --quiet mongodb && ((PASSED_CHECKS++))
systemctl is-active --quiet nginx && ((PASSED_CHECKS++))
systemctl is-active --quiet pm2-$SERVICE_USER && ((PASSED_CHECKS++))
curl -f -s "http://localhost:$BACKEND_PORT/api/auth/test" > /dev/null 2>&1 && ((PASSED_CHECKS++))
curl -f -s "http://localhost:$FRONTEND_PORT/" > /dev/null 2>&1 && ((PASSED_CHECKS++))
mongo --eval "db.adminCommand('ismaster')" --quiet > /dev/null 2>&1 && ((PASSED_CHECKS++))
ping -c 1 8.8.8.8 > /dev/null 2>&1 && ((PASSED_CHECKS++))
[ -d "$LOG_DIR" ] && ((PASSED_CHECKS++))

HEALTH_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $HEALTH_PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🟢 Excellent ($HEALTH_PERCENTAGE%) - System is healthy${NC}"
elif [ $HEALTH_PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}🟡 Good ($HEALTH_PERCENTAGE%) - Minor issues detected${NC}"
else
    echo -e "${RED}🔴 Poor ($HEALTH_PERCENTAGE%) - Critical issues need attention${NC}"
fi

echo ""
echo -e "${BLUE}Health check completed at $(date)${NC}"

# Exit with appropriate code
if [ $HEALTH_PERCENTAGE -ge 70 ]; then
    exit 0
else
    exit 1
fi
