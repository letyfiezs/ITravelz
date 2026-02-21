#!/bin/bash

# Frontend startup script for ITravel React Application

echo ""
echo "========================================"
echo "ITravel Frontend Development Server"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "Starting development server..."
echo "Server will run on http://localhost:3000"
echo ""
echo "Make sure the backend is running on http://localhost:5000"
echo ""

npm run dev
