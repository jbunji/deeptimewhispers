#!/bin/bash

# Simple development server script
echo "Starting development server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""
echo "To view the timeline: http://localhost:8000/timeline.html"
echo "To view the main site: http://localhost:8000/"
echo ""

# Start Python HTTP server
cd "$(dirname "$0")"
python3 -m http.server 8000