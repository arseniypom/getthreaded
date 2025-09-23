#!/bin/bash

echo "🛑 Stopping GetThreaded Docker services..."

# Stop services
docker-compose down

echo "✅ Services stopped successfully!"
echo ""
echo "💡 To remove volumes (database data), run:"
echo "   docker-compose down -v"