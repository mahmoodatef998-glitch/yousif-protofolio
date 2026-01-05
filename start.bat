@echo off
echo Starting Photography Portfolio Server...
echo.

REM Kill any existing Node processes on port 3008
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3008 ^| findstr LISTENING') do (
    echo Killing process on port 3008...
    taskkill /F /PID %%a > nul 2>&1
)
timeout /t 2 /nobreak > nul

REM Clean .next folder to avoid caching issues
if exist ".next\" (
    echo Cleaning .next folder...
    rmdir /s /q ".next" > nul 2>&1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the development server
echo Starting Next.js development server...
start "Next.js Dev Server" cmd /k "npm run dev"

REM Wait for server to start (longer wait for first build)
echo Waiting for server to start and build...
timeout /t 15 /nobreak > nul

REM Check if server is running
:check
curl -s http://localhost:3008 > nul 2>&1
if errorlevel 1 (
    echo Server not ready yet, waiting...
    timeout /t 3 /nobreak > nul
    goto check
)

REM Open browser
echo Opening browser...
start http://localhost:3008

echo.
echo ========================================
echo Server is running at http://localhost:3008
echo ========================================
echo.
echo The server window will stay open.
echo Close that window to stop the server.
echo.
echo Press any key to close this window (server will keep running)...
pause > nul

