#!/bin/bash
# Development startup script for frontend

echo "Starting frontend in development mode..."
cp .env.development .env.local
npm start
