@echo off

echo 🚀 Starting Checklist Application Deployment...

REM Create necessary directories
if not exist "data" mkdir data
if not exist "backups" mkdir backups

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak > nul

REM Check if application is running
echo 🔍 Checking application status...
curl -f http://localhost:3000 > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Application is running successfully!
    echo 🌐 Access your checklist at: http://localhost:3000
    echo 👤 Login with: mengseu2004@gmail.com
    echo 🔑 Password: DatabaseChecker2024!
) else (
    echo ❌ Application might not be ready yet. Check logs with: docker-compose logs
)

echo.
echo 📋 Useful commands:
echo   View logs:     docker-compose logs -f
echo   Stop app:      docker-compose down
echo   Restart app:   docker-compose restart
echo   Update app:    deploy.bat

pause
