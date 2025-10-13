@echo off
REM Run the PowerShell script with execution bypass
powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"

REM Pause to keep the window open
pause