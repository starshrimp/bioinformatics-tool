#!/bin/bash
# Development startup script for backend

echo "Starting backend in development mode..."
cp .env.development .env
python app/main.py
