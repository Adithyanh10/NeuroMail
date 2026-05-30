@echo off
REM Quick start script for all services
REM Run this to start backend, ML server, and frontend all at once

echo ============================================================
echo   AI Email Reply Generator - Starting All Services
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo [1/3] Starting Backend on port 8000...
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
timeout /t 3 >nul

echo [2/3] Starting ML Server on port 8001...
start "ML Server" cmd /k "cd ml-server && venv\Scripts\activate && uvicorn app.main:app --reload --port 8001"
timeout /t 3 >nul

echo [3/3] Starting Frontend on port 3000...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 >nul

echo.
echo ============================================================
echo   All Services Started!
echo ============================================================
echo.
echo   Backend:  http://localhost:8000
echo   ML Server: http://localhost:8001
echo   Frontend:  http://localhost:3000
echo.
echo   Demo Login:
echo     Email: demo@aimail.com
echo     Password: Demo@1234
echo.
echo   Press any key to open frontend in browser...
pause >nul

start http://localhost:3000

echo.
echo   Services are running in separate windows.
echo   Close those windows to stop the services.
echo.
pause
