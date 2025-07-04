#!/bin/bash
# Build Docker image for development

echo "Building Docker image for development..."
cd backend
docker build --build-arg ENV=development -t bioinformatics-backend:dev .
cd ..
