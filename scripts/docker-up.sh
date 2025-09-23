#!/bin/bash

echo "🚀 Starting GetThreaded with Docker..."

# Check if .env.docker exists and has OPENAI_API_KEY configured
if [ ! -f .env.docker ]; then
    echo "❌ Error: .env.docker file not found!"
    echo "Please create .env.docker with your OPENAI_API_KEY"
    exit 1
fi

if grep -q "your_openai_api_key_here" .env.docker; then
    echo "⚠️  Warning: Please update OPENAI_API_KEY in .env.docker with your actual API key"
    exit 1
fi

# Load environment variables
export $(cat .env.docker | grep -v '^#' | xargs)

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check health status
echo "🔍 Checking service health..."
docker-compose ps

echo "✅ GetThreaded is running!"
echo "📱 Application: http://localhost:3000"
echo "🗄️  MongoDB: mongodb://localhost:27017"
echo ""
echo "📊 View logs: ./scripts/docker-logs.sh"
echo "🛑 Stop services: ./scripts/docker-down.sh"