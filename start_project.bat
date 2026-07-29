@echo off

echo Starting Frontend...

start cmd /k "cd frontend && npm run dev"


echo Starting Backend...

start cmd /k "cd backend && .venv\Scripts\activate && python main.py"


echo Project Started!

pause