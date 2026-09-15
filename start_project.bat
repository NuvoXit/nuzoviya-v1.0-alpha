@echo off

title Nuzoviya Medical Platform (Alpha)

echo ==========================================
echo     NUZOVIYA MEDICAL PLATFORM (ALPHA)
echo ==========================================
echo.

echo Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0" && call ".venv\Scripts\activate.bat" && cd backend && py main.py"

echo.
echo ==========================================
echo     Project Started!
echo ==========================================
echo.

pause