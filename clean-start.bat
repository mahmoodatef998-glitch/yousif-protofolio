@echo off
echo Cleaning and starting fresh...
echo.

REM Kill all Node processes
echo Stopping all Node processes...
taskkill /F /IM node.exe > nul 2>&1
timeout /t 2 /nobreak > nul

REM Remove build cache
echo Removing build cache...
if exist ".next\" rmdir /s /q ".next"
if exist "node_modules\.cache\" rmdir /s /q "node_modules\.cache"

echo.
echo Starting server...
call start.bat

