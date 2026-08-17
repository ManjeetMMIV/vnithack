#!/bin/bash
cd /mnt/storage/build/hackathons/vnit

echo "Starting Backend..."
(cd backend && node server.js > ../backend.log 2>&1) &
BACKEND_PID=$!

echo "Starting Agent..."
(cd agent && node server.js > ../agent.log 2>&1) &
AGENT_PID=$!

echo "Waiting for services to start..."
sleep 8

echo "Running tests..."
node test-all.js

echo "Cleaning up..."
kill $BACKEND_PID $AGENT_PID
