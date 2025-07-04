#!/bin/bash
# Debug script for Raspberry Pi deployment issues

# Configuration
PI_USER="pi"
PI_HOST="192.168.1.110"
PI_PATH="/home/pi/bioinformatics-tool"

echo "=== Raspberry Pi Debug Information ==="

ssh ${PI_USER}@${PI_HOST} << EOF
    echo "=== System Information ==="
    uname -a
    echo ""
    
    echo "=== Directory Structure ==="
    echo "Home directory contents:"
    ls -la /home/pi/
    echo ""
    
    echo "Target directory (${PI_PATH}):"
    if [ -d "${PI_PATH}" ]; then
        ls -la ${PI_PATH}
    else
        echo "Directory does not exist!"
    fi
    echo ""
    
    echo "=== Docker Information ==="
    echo "Docker version:"
    docker --version 2>/dev/null || echo "Docker not found!"
    echo ""
    
    echo "Docker service status:"
    systemctl is-active docker 2>/dev/null || echo "Docker service not active"
    echo ""
    
    echo "Docker images:"
    docker images 2>/dev/null || echo "Cannot list Docker images"
    echo ""
    
    echo "Running containers:"
    docker ps 2>/dev/null || echo "Cannot list containers"
    echo ""
    
    echo "All containers (including stopped):"
    docker ps -a 2>/dev/null || echo "Cannot list all containers"
    echo ""
    
    echo "=== Network Information ==="
    echo "Network interfaces:"
    ip addr show | grep "inet " | head -5
    echo ""
    
    echo "=== Disk Space ==="
    df -h
    echo ""
    
    echo "=== Memory Usage ==="
    free -h
    echo ""
    
    echo "=== User Information ==="
    echo "Current user: \$(whoami)"
    echo "User groups: \$(groups)"
    echo ""
    
    echo "=== Port 8000 Status ==="
    netstat -tuln | grep :8000 || echo "Port 8000 not in use"
    echo ""
EOF

echo ""
echo "Debug information collected from Raspberry Pi."
