@echo off
title Itravelmongolia - Starting All Servers
echo ============================================
echo  Itravelmongolia - Killing old Node processes...
echo ============================================
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting Backend (port 5000)...
start "Itravelmongolia BACKEND" cmd /k "cd /d C:\Users\letyfiez\Documents\GitHub\ITravelz\backend && node server.js"

timeout /t 2 /nobreak >nul

echo Starting Frontend (port 3000)...
start "Itravelmongolia FRONTEND" cmd /k "cd /d C:\Users\letyfiez\Documents\GitHub\ITravelz\frontend && npm run dev"

echo.
echo ============================================
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo ============================================
timeout /t 3 /nobreak >nul
start http://localhost:3000
