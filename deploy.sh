#!/bin/bash

echo "🚀 Starting Checklist Application Deployment..."

# Create necessary directories
mkdir -p data backups

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if application is running
echo "🔍 Checking application status..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access your checklist at: http://localhost:3000"
    echo "👤 Login with: mengseu2004@gmail.com"
    echo "🔑 Password: DatabaseChecker2024!"
else
    echo "❌ Application might not be ready yet. Check logs with: docker-compose logs"
fi

echo "📋 Useful commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop app:      docker-compose down"
echo "  Restart app:   docker-compose restart"
echo "  Update app:    ./deploy.sh"
