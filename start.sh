#!/bin/bash

echo "Starting Photography Portfolio Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Start the development server in background
echo "Starting Next.js development server..."
npm run dev &
DEV_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 8

# Open browser (works on macOS and Linux with default browser)
echo "Opening browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open http://localhost:3000
else
    echo "Please open http://localhost:3000 in your browser"
fi

echo ""
echo "Server is running at http://localhost:3000"
echo "Server PID: $DEV_PID"
echo "To stop the server, run: kill $DEV_PID"
echo ""
echo "Press Ctrl+C to exit this script (server will keep running)"
wait $DEV_PID

