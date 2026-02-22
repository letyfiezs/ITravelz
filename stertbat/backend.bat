@echo off
title ITravelz Backend
echo Killing old Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

cd /d C:\Users\letyfiez\Documents\GitHub\ITravelz\backend

echo Starting backend on port 5000...
node server.js
pause