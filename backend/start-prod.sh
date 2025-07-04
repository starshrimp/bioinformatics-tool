#!/bin/bash
# Production startup script for backend

echo "Starting backend in production mode..."
cp .env.production .env
python app/main.py
