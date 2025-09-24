@echo off
echo Starting ADK API Server...
echo ==============================

cd agentsvertex
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please create virtual environment first:
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
echo Virtual environment activated
echo Starting ADK API server...
adk api_server

echo.
echo ADK server stopped. Press any key to exit...
pause > nul