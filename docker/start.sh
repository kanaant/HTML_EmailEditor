#!/bin/sh

# Start Nginx in background
nginx -g "daemon on;"

# Start Node.js Backend in foreground
echo "Starting Backend..."
cd /app
node server.js
