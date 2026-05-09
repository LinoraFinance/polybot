@echo off
title Polybot Access Telegram Bot

echo.
echo ================================
echo   Polybot Access Telegram Bot
echo ================================
echo.

if not exist node_modules (
  echo Installing dependencies...
  npm install
)

if not exist .env (
  echo.
  echo ERROR: .env file not found.
  echo.
  pause
  exit /b
)

echo Starting bot...
echo Press CTRL + C to stop.
echo.
npm start

pause
