# Docker Setup for GetThreaded

This document explains how to run GetThreaded with Docker, including MongoDB integration.

## Prerequisites

- Docker Desktop installed on your system
- Docker Compose (included with Docker Desktop)
- Your OpenAI API key

## Quick Start

### 1. Configure Environment Variables

Before running Docker, update the `.env.docker` file with your OpenAI API key:

```bash
# Edit .env.docker and replace 'your_openai_api_key_here' with your actual API key
OPENAI_API_KEY=your_actual_api_key_here
```

### 2. Start the Application

```bash
# Start all services
./scripts/docker-up.sh

# Application will be available at:
# - App: http://localhost:3000
# - MongoDB: mongodb://localhost:27017
```

### 3. Stop the Application

```bash
# Stop all services
./scripts/docker-down.sh

# Remove all data (including database)
docker-compose down -v
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `./scripts/docker-up.sh` | Build and start all services |
| `./scripts/docker-down.sh` | Stop all services |
| `./scripts/docker-build.sh` | Build Docker images |
| `./scripts/docker-build.sh --no-cache` | Rebuild without cache |
| `./scripts/docker-logs.sh` | View logs for all services |
| `./scripts/docker-logs.sh app` | View logs for Next.js app |
| `./scripts/docker-logs.sh mongodb` | View logs for MongoDB |

## Architecture

### Multi-Stage Dockerfile

The Dockerfile uses a 3-stage build process for optimal performance:

1. **Dependencies Stage**: Installs npm packages
2. **Builder Stage**: Builds the Next.js application
3. **Runner Stage**: Minimal production image (~150MB)

Key features:
- Alpine Linux base for security and small size
- Non-root user execution
- Standalone Next.js output
- Layer caching optimization

### Docker Compose Services

#### Next.js Application
- Port: 3000
- Health checks every 30 seconds
- Auto-restart on failure
- Connected to MongoDB

#### MongoDB
- Port: 27017
- Persistent data volumes
- Health monitoring
- Latest stable version (7.0)

## Environment Variables

Docker uses `.env.docker` for configuration:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (auto-configured) |
| `OPENAI_API_KEY` | Your OpenAI API key (required) |
| `NODE_ENV` | Set to 'production' |

## Troubleshooting

### Port Already in Use

If port 3000 or 27017 is already in use:

```bash
# Stop existing services
docker-compose down

# Check what's using the ports
lsof -i :3000
lsof -i :27017

# Kill the process or change ports in docker-compose.yml
```

### MongoDB Connection Issues

Check MongoDB health:

```bash
# View MongoDB logs
./scripts/docker-logs.sh mongodb

# Test MongoDB connection
docker exec -it getthreaded-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Build Failures

Clear cache and rebuild:

```bash
# Clean rebuild
./scripts/docker-build.sh --no-cache

# Remove all containers and volumes
docker-compose down -v
docker system prune -a
```

## Production Deployment

This Docker setup is production-ready and can be deployed to:

- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Any Kubernetes cluster
- VPS with Docker installed

### Security Considerations

✅ Non-root user execution
✅ Minimal Alpine base image
✅ No sensitive data in images
✅ Environment variable separation
✅ Health checks for reliability
✅ Network isolation between services

## Development vs Production

For local development, we recommend using `npm run dev` directly for better performance and hot reload.

Use Docker for:
- Production deployments
- Testing production builds
- Team environment consistency
- CI/CD pipelines