#!/bin/bash
# Check Docker image size and contents

echo "=== Docker Image Size Check ==="

# Build image if it doesn't exist
if [[ "$(docker images -q bioinformatics-backend:prod 2> /dev/null)" == "" ]]; then
    echo "Image not found. Building..."
    ./docker-build-prod.sh
fi

# Show image size
echo ""
echo "Image size:"
docker images bioinformatics-backend:prod --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo ""
echo "=== Files included in Docker image ==="
echo "(This will show what files are actually copied to the image)"

# Create a temporary container to inspect contents
docker run --rm -it bioinformatics-backend:prod sh -c "
echo 'Contents of /app/data/:'
ls -la /app/data/ 2>/dev/null || echo 'No data directory'

echo ''
echo 'Contents of /app/data/parquet/:'
ls -la /app/data/parquet/ 2>/dev/null || echo 'No parquet directory'

echo ''
echo 'Total size of /app directory:'
du -sh /app 2>/dev/null || echo 'Cannot calculate size'

echo ''
echo 'Data directory size breakdown:'
du -sh /app/data/* 2>/dev/null || echo 'No data files'
"

echo ""
echo "=== Image layers and size breakdown ==="
docker history bioinformatics-backend:prod --human=true --format "table {{.CreatedBy}}\t{{.Size}}"
