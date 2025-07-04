#!/bin/bash
# First-time setup for Raspberry Pi

# Configuration
PI_USER="pi"
PI_HOST="192.168.1.110"
PI_PATH="/home/pi/bioinformatics-tool"

echo "=== Raspberry Pi First-Time Setup ==="
echo "This script will:"
echo "1. Create the necessary directories"
echo "2. Check if Docker is installed"
echo "3. Set up SSH key authentication (optional)"
echo ""

read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "=== Creating directory structure ==="
ssh ${PI_USER}@${PI_HOST} << EOF
    echo "Creating directory: ${PI_PATH}"
    mkdir -p ${PI_PATH}
    
    echo "Setting permissions..."
    chmod 755 ${PI_PATH}
    
    echo "Directory created successfully:"
    ls -la ${PI_PATH}
EOF

echo ""
echo "=== Checking Docker installation ==="
ssh ${PI_USER}@${PI_HOST} << EOF
    echo "Docker version:"
    docker --version || echo "Docker not installed!"
    
    echo ""
    echo "Docker service status:"
    systemctl is-active docker || echo "Docker service not running"
    
    echo ""
    echo "Docker permissions for user ${PI_USER}:"
    groups ${PI_USER} | grep docker && echo "User is in docker group" || echo "User NOT in docker group!"
EOF

echo ""
echo "=== Setup complete! ==="
echo "Directory ${PI_PATH} has been created on your Raspberry Pi."
echo ""
echo "If Docker is not installed or user is not in docker group, run on the Pi:"
echo "  sudo apt update && sudo apt install -y docker.io"
echo "  sudo usermod -aG docker ${PI_USER}"
echo "  sudo systemctl enable docker"
echo "  sudo systemctl start docker"
echo ""
echo "Then logout and login again, or run: newgrp docker"
echo ""
echo "You can now run ./deploy-to-pi.sh to deploy your application."
