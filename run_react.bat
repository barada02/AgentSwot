@echo off
echo Starting React Development Server...
echo ====================================

cd Client
if not exist "node_modules" (
    echo ERROR: Node modules not found!
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Make sure you're in the correct directory
    pause
    exit /b 1
)

echo Starting React development server...
npm run dev

echo.
echo React server stopped. Press any key to exit...
pause > nul