#!/bin/bash
# Production build script for frontend

echo "Building frontend for production..."
cp .env.production .env.local
npm run build
