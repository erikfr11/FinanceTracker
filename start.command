#!/bin/bash
cd "$(dirname "$0")"

echo "=================================================="
echo " 🚀 Starting FinanceTracker (API + Web)..."
echo " 💡 Close this window or press Ctrl+C to stop."
echo "=================================================="

# Open browser automatically after 3 seconds
(sleep 3 && open http://localhost:5173) &

# Kill background jobs on exit
trap 'kill $(jobs -p) 2>/dev/null' EXIT INT TERM

dotnet watch --project FinanceTracker.Api &
npm --prefix FinanceTracker.Web run dev &

wait
