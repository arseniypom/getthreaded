#!/bin/bash

# Check if a service name is provided
if [ "$1" ]; then
    echo "📊 Showing logs for $1..."
    docker-compose logs -f $1
else
    echo "📊 Showing logs for all services..."
    echo "💡 Tip: Use './scripts/docker-logs.sh app' or './scripts/docker-logs.sh mongodb' for specific service logs"
    echo ""
    docker-compose logs -f
fi