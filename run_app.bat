@echo off
title AI Study Planner
echo ========================================================
echo               AI Study Planner Application              
echo ========================================================
echo.

if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" main.py
) else (
    python main.py
)

if errorlevel 1 (
    echo.
    echo Application exited with an error.
    echo Please make sure dependencies are installed and .env has your GEMINI_API_KEY.
    pause
)
