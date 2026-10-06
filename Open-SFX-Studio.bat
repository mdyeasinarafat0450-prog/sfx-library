@echo off
setlocal

:: Get the directory where this script is located (SFX Studio root)
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo =====================================
echo  SFX Studio - Development Launcher
echo =====================================
echo.

:: Verify Node/NPM is installed
where npm.cmd >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js/npm was not found. Please install Node.js and try again.
    pause
    exit /b 1
)

:: Verify package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found in %PROJECT_ROOT%.
    echo Are you sure this script is in the project root?
    pause
    exit /b 1
)

echo [1/2] Building and Installing SFX Studio...
call npm.cmd run dev:extension

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] The build or installation failed. Please check the logs above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =====================================
echo SUCCESS: SFX Studio is Ready!
echo =====================================
echo 1. Open Adobe Premiere Pro.
echo 2. Go to: Window -^> Extensions -^> SFX Studio
echo 3. The panel will open inside Premiere Pro.
echo.
pause
