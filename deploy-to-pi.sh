#!/bin/bash
# Deploy to Raspberry Pi

# Configuration
PI_USER="pi"
PI_HOST="192.168.1.110"
PI_PATH="/home/pi/bioinformatics-tool"

echo "=== Building optimized production Docker image ==="
./docker-build-prod.sh

echo ""
echo "=== Image size information ==="
docker images bioinformatics-backend:prod --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo ""
echo "=== Saving Docker image ==="
docker save bioinformatics-backend:prod | gzip > bioinformatics-backend-prod.tar.gz

# Show compressed file size
echo "Compressed image size: $(ls -lh bioinformatics-backend-prod.tar.gz | awk '{print $5}')"

echo ""
echo "=== Preparing Raspberry Pi ==="
echo "Creating directory structure and copying files..."

# Create directory on Pi and copy file in one step
ssh ${PI_USER}@${PI_HOST} "mkdir -p ${PI_PATH}"

echo "=== Copying to Raspberry Pi ==="
scp bioinformatics-backend-prod.tar.gz ${PI_USER}@${PI_HOST}:${PI_PATH}/

echo ""
echo "=== Deploying on Raspberry Pi ==="
ssh ${PI_USER}@${PI_HOST} << EOF
    cd ${PI_PATH}
    echo "Current directory: \$(pwd)"
    echo "Files in directory:"
    ls -la
    
    echo ""
    echo "Loading Docker image..."
    if [ -f "bioinformatics-backend-prod.tar.gz" ]; then
        docker load < bioinformatics-backend-prod.tar.gz
    else
        echo "Error: Image file not found!"
        exit 1
    fi
    
    echo ""
    echo "Stopping existing container..."
    docker stop bioinformatics-backend 2>/dev/null || echo "No existing container to stop"
    docker rm bioinformatics-backend 2>/dev/null || echo "No existing container to remove"
    
    echo ""
    echo "Starting new container..."
    docker run -d --name bioinformatics-backend -p 8000:8000 --restart unless-stopped bioinformatics-backend:prod
    
    echo ""
    echo "Cleaning up..."
    rm bioinformatics-backend-prod.tar.gz
    
    echo ""
    echo "Container status:"
    docker ps | grep bioinformatics-backend || echo "Container not running!"
    
    echo ""
    echo "Container logs (last 10 lines):"
    docker logs --tail 10 bioinformatics-backend 2>/dev/null || echo "No logs available"
    
    echo ""
    echo "Available disk space:"
    df -h / | tail -1
EOF

echo ""
echo "=== Cleaning up local files ==="
rm bioinformatics-backend-prod.tar.gz

echo ""
echo "=== Deployment complete! ==="
echo "Your application should be running at: http://${PI_HOST}:8000"
echo ""
echo "To check the status, run:"
echo "ssh ${PI_USER}@${PI_HOST} 'docker ps | grep bioinformatics-backend'"
echo ""
echo "To view logs, run:"
echo "ssh ${PI_USER}@${PI_HOST} 'docker logs bioinformatics-backend'"
