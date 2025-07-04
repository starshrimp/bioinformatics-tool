#!/bin/bash
# Build Docker image for production

echo "Building Docker image for production..."
cd backend
docker build --build-arg ENV=production -t bioinformatics-backend:prod .
cd ..
