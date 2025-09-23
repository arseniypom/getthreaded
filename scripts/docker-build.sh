#!/bin/bash

echo "🔨 Building GetThreaded Docker images..."

# Check environment file
if [ ! -f .env.docker ]; then
    echo "❌ Error: .env.docker file not found!"
    exit 1
fi

# Build with no cache for fresh build
if [ "$1" == "--no-cache" ]; then
    echo "🧹 Building without cache..."
    docker-compose build --no-cache
else
    echo "📦 Building with cache..."
    docker-compose build
fi

echo "✅ Build completed successfully!"
echo ""
echo "🚀 Start services: ./scripts/docker-up.sh"