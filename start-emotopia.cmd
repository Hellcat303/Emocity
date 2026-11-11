@echo off
echo ========================================================
echo         EMOTOPIA - Interactive Event Application
echo ========================================================
echo.

:: Check if Node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please install Node.js (LTS version) from https://nodejs.org
    echo and then run this script again.
    pause
    exit /b 1
)

:: Install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [SETUP] Installing project dependencies with npm...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b 1
    )
)

echo [START] Starting Emotopia local development server...
echo The app will open at http://localhost:3000
echo (Press Ctrl+C in this window anytime to stop the server)
echo.

:: Start Vite dev server
call npm run dev
