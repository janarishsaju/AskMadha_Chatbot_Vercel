@echo off
echo Starting Tamil Bible Server...
start "Tamil Bible API (Port 3000)" cmd /k "cd "Tamil Bible" && node server.js"

echo Starting English Bible Backend...
start "English Bible Backend (Port 3001)" cmd /k "cd backend && node server.js"

echo Starting Frontend Dev Server...
start "Frontend Dev (Port 5173)" cmd /k "cd frontend && npm run dev"

echo All services have been started in separate windows!
