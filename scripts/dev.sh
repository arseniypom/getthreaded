#!/bin/bash

echo "🚀 Starting GetThreaded Development Environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB Configuration (Docker)
MONGODB_URI=mongodb://mongodb:27017/getthreaded
EOF
    echo "⚠️  Please update OPENAI_API_KEY in .env.local with your actual API key"
    exit 1
fi

# Check for OPENAI_API_KEY
if grep -q "your_openai_api_key_here" .env.local; then
    echo "⚠️  Please update OPENAI_API_KEY in .env.local with your actual API key"
    exit 1
fi

# Export environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Start services with docker-compose
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.dev.yml up

# This will run in foreground, press Ctrl+C to stop