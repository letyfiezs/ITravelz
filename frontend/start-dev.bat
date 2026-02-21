@echo off
REM Frontend startup script for ITravel React Application

echo.
echo ========================================
echo ITravel Frontend Development Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting development server...
echo Server will run on http://localhost:3000
echo.
echo Make sure the backend is running on http://localhost:5000
echo.

call npm run dev
