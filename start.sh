#!/bin/bash

# Deep Time Whispers Website Startup Script
# This script starts a local web server to serve the static website

echo "Starting Deep Time Whispers Website..."

# Check if Python 3 is available (most systems have this)
if command -v python3 &> /dev/null; then
    echo "Using Python 3 HTTP server..."
    echo "Website will be available at: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    # Fallback to Python 2 if Python 3 isn't available
    echo "Using Python 2 HTTP server..."
    echo "Website will be available at: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000
elif command -v php &> /dev/null; then
    # Fallback to PHP if Python isn't available
    echo "Using PHP built-in server..."
    echo "Website will be available at: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:8000
elif command -v node &> /dev/null; then
    # Check if npx and http-server are available
    if command -v npx &> /dev/null; then
        echo "Using Node.js http-server via npx..."
        echo "Website will be available at: http://localhost:8000"
        echo "Press Ctrl+C to stop the server"
        echo ""
        npx http-server -p 8000
    else
        echo "Node.js is available but npx is not installed."
        echo "Please install a global http-server: npm install -g http-server"
        exit 1
    fi
else
    echo "Error: No suitable web server found!"
    echo "Please install one of the following:"
    echo "  - Python 3 (recommended): python3 -m http.server 8000"
    echo "  - Python 2: python -m SimpleHTTPServer 8000"
    echo "  - PHP: php -S localhost:8000"
    echo "  - Node.js: npx http-server -p 8000"
    exit 1
fi