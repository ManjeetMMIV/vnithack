#!/bin/bash

echo "Booting Nagpur Police Land Registry & Fraud Investigation Stack..."

# 1. Start Node.js Express Backend (Port 5000)
echo "Starting Backend API on Port 5000..."
cd backend
npm install
node server.js &
BACKEND_PID=$!
cd ..

# 2. Start Next.js Security Dashboard (Port 3000)
echo "Starting Next.js Security Dashboard on Port 3000..."
cd dashboard
npm install
npm run dev &
DASHBOARD_PID=$!
cd ..

# 3. Start LangGraph Agent Server (Port 3001)
echo "Starting LangGraph Agent Server on Port 3001..."
cd agent
npm install
node server.js &
AGENT_SERVER_PID=$!
cd ..

# 4. Start Agent Visualizer Frontend (Port 5173)
echo "Starting Agent Visualizer Frontend on Port 5173..."
cd agent/frontend
npm install
npm run dev &
AGENT_FRONTEND_PID=$!
cd ../..

echo "=========================================================="
echo "All systems are online!"
echo "Security Dashboard: http://localhost:3000"
echo "Agent Visualizer:   http://localhost:5173"
echo "Backend API:        http://localhost:5000"
echo "Agent Server:       http://localhost:3001"
echo "=========================================================="
echo "Press [CTRL+C] to shut down all services."

# Trap SIGINT and SIGTERM to kill all background processes gracefully
cleanup() {
    echo ""
    echo "Shutting down all services..."
    kill $BACKEND_PID $DASHBOARD_PID $AGENT_SERVER_PID $AGENT_FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Wait for all background processes
wait $BACKEND_PID $DASHBOARD_PID $AGENT_SERVER_PID $AGENT_FRONTEND_PID
