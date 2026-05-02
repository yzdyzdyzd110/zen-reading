@echo off
title ZenReading Server - close this window to stop
cd /d "%~dp0"
echo ================================
echo   ZenReading - 禅定阅读
echo ================================
echo.
echo Starting server on http://localhost:3001
echo Close this window to stop the server.
echo.
start "" http://localhost:3001
node server.js
pause
