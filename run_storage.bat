@echo off
echo Starting Storage Server...
echo ============================

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

if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure your secrets:
    echo   copy .env.example .env
    echo Then edit .env with your actual MongoDB URI and JWT secret
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
echo Virtual environment activated
echo Starting Storage Server...
python storage_server.py

echo.
echo Storage server stopped. Press any key to exit...
pause > nul