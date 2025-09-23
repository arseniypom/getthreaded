# GetThreaded Launch Instructions

## Table of Contents
1. [Local Development Setup (Docker)](#1-local-development-setup-docker)
2. [Production Deployment on DigitalOcean VPS](#2-production-deployment-on-digitalocean-vps)
3. [Connecting to Production MongoDB from Local](#3-connecting-to-production-mongodb-from-local)

---

## 1. Local Development Setup (Docker)

### Prerequisites

- **Docker Desktop** installed and running
- **Git** (check with `git --version`)
- **OpenAI API Key**

### Quick Start - One Command Setup

```bash
# Start both app and MongoDB with hot-reload
./scripts/dev.sh
```

**That's it!** 🎉

- App: http://localhost:3000
- MongoDB: mongodb://localhost:27017/getthreaded
- Hot-reload is enabled (changes auto-refresh)

Press `Ctrl+C` to stop everything.

### Alternative Docker Commands

```bash
# Run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Reset everything (including database)
docker-compose -f docker-compose.dev.yml down -v
```

### What's Running?

The development setup runs two containers:
1. **Next.js App** - With hot-reload enabled
2. **MongoDB** - Persistent data storage

Both start together, connected on the same network.

### Troubleshooting Local Development

#### Ports Already in Use

```bash
# Check what's using the ports
lsof -i :3000    # App port
lsof -i :27017   # MongoDB port

# Stop conflicting services or change ports in docker-compose.dev.yml
```

#### Reset Everything

```bash
# Stop and remove all containers and data
docker-compose -f docker-compose.dev.yml down -v

# Start fresh
./scripts/dev.sh
```

#### View Container Logs

```bash
# All logs
docker-compose -f docker-compose.dev.yml logs -f

# App logs only
docker-compose -f docker-compose.dev.yml logs -f app

# MongoDB logs only
docker-compose -f docker-compose.dev.yml logs -f mongodb
```

---

## 2. Production Deployment on DigitalOcean VPS

### VPS Requirements

- **Droplet Size**: Minimum 2GB RAM, 1 vCPU
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 25GB+ SSD

### Step-by-Step VPS Deployment

#### 2.1. Create DigitalOcean Droplet

1. Log into DigitalOcean
2. Create new Droplet:
   - Choose Ubuntu 22.04 LTS
   - Select size (Basic → Regular → $12/month minimum)
   - Choose datacenter region
   - Add SSH key for authentication
   - Create Droplet

#### 2.2. Initial Server Setup

```bash
# SSH into your server
ssh root@your_server_ip

# Update system packages
apt update && apt upgrade -y

# Create non-root user
adduser appuser
usermod -aG sudo appuser

# Set up firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw allow 3000
ufw --force enable

# Install essential packages
apt install -y curl wget git nginx certbot python3-certbot-nginx
```

#### 2.3. Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add user to docker group
usermod -aG docker appuser

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

#### 2.4. Deploy Application

```bash
# Switch to app user
su - appuser

# Clone repository
git clone https://github.com/yourusername/getthreaded.git
cd getthreaded

# Create production environment file
nano .env.docker
```

Add to `.env.docker`:

```env
# Production environment
OPENAI_API_KEY=your_actual_api_key_here
MONGODB_URI=mongodb://mongodb:27017/getthreaded
NODE_ENV=production
```

```bash
# Build and start services
docker-compose up -d

# Verify services are running
docker-compose ps
docker-compose logs -f
```

#### 2.5. Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/getthreaded
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/getthreaded /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 2.6. Set Up SSL with Let's Encrypt

```bash
# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

#### 2.7. Set Up Automatic Startup

```bash
# Create systemd service
sudo nano /etc/systemd/system/getthreaded.service
```

Add:

```ini
[Unit]
Description=GetThreaded Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
User=appuser
Group=appuser
WorkingDirectory=/home/appuser/getthreaded
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable getthreaded
sudo systemctl start getthreaded
```

#### 2.8. Configure Automated Backups

```bash
# Create backup script
nano ~/backup.sh
```

Add:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/appuser/backups"
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec getthreaded-mongodb mongodump --archive=/tmp/backup.gz --gzip
docker cp getthreaded-mongodb:/tmp/backup.gz $BACKUP_DIR/mongodb_$TIMESTAMP.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

```bash
# Make executable and add to cron
chmod +x ~/backup.sh

# Add to crontab (daily at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * /home/appuser/backup.sh") | crontab -
```

### Production Maintenance

#### Update Application

```bash
cd /home/appuser/getthreaded
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb
```

#### Monitor Resources

```bash
# System resources
htop

# Docker resources
docker stats

# Disk usage
df -h
```

---

## 3. Connecting to Production MongoDB from Local

### 3.1. Configure MongoDB for External Access

**⚠️ Security Warning**: Only enable external access if absolutely necessary. Use SSH tunneling as a safer alternative.

#### Option A: SSH Tunnel (Recommended - Most Secure)

On your local machine:

```bash
# Create SSH tunnel to production MongoDB
ssh -L 27017:localhost:27017 appuser@your_server_ip

# Keep this terminal open
# MongoDB is now accessible at localhost:27017
```

#### Option B: Direct Connection (Less Secure)

On the VPS:

```bash
# Edit docker-compose.yml to add authentication
nano docker-compose.yml
```

Update MongoDB service:

```yaml
mongodb:
  image: mongo:7.0-jammy
  container_name: getthreaded-mongodb
  ports:
    - "27017:27017"  # Already exposed
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=strongpassword123
    - MONGO_INITDB_DATABASE=getthreaded
  # ... rest of config
```

```bash
# Restart MongoDB
docker-compose down
docker-compose up -d

# Create application user
docker exec -it getthreaded-mongodb mongosh

# In MongoDB shell:
use admin
db.auth('admin', 'strongpassword123')

use getthreaded
db.createUser({
  user: "appuser",
  pwd: "apppassword123",
  roles: [
    { role: "readWrite", db: "getthreaded" }
  ]
})
```

Open firewall port:

```bash
# ⚠️ Only if you need direct external access
sudo ufw allow 27017/tcp
```

### 3.2. Connect with MongoDB Compass

#### Via SSH Tunnel (Recommended)

1. Open MongoDB Compass
2. Click "New Connection"
3. Use connection string:
   ```
   mongodb://localhost:27017/getthreaded
   ```
4. Click "Connect"

#### Via Direct Connection

1. Open MongoDB Compass
2. Click "New Connection"
3. Use connection string:
   ```
   mongodb://appuser:apppassword123@your_server_ip:27017/getthreaded?authSource=getthreaded
   ```
4. Or use Advanced Options:
   - **Hostname**: your_server_ip
   - **Port**: 27017
   - **Authentication**: Username/Password
   - **Username**: appuser
   - **Password**: apppassword123
   - **Authentication Database**: getthreaded
5. Click "Connect"

### 3.3. Security Best Practices

#### IP Whitelisting

```bash
# Allow only specific IPs
sudo ufw allow from YOUR_HOME_IP to any port 27017

# Remove general access
sudo ufw delete allow 27017
```

#### Use MongoDB Atlas (Alternative)

For production, consider MongoDB Atlas:
1. Create free cluster at mongodb.com/atlas
2. Whitelist your IPs
3. Get connection string
4. Update MONGODB_URI in production

---

## Environment Variables Reference

| Variable | Development | Production | Description |
|----------|------------|------------|-------------|
| `OPENAI_API_KEY` | Required | Required | OpenAI API key for content generation |
| `MONGODB_URI` | Required | Required | MongoDB connection string |
| `NODE_ENV` | development | production | Application environment |
| `PORT` | 3000 | 3000 | Application port |
| `NEXT_TELEMETRY_DISABLED` | Optional | 1 | Disable Next.js telemetry |

## Common Commands Cheat Sheet

### Local Development

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter
```

### Docker Commands

```bash
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
docker-compose ps        # List services
docker-compose restart   # Restart services
```

### VPS Management

```bash
ssh appuser@server       # Connect to VPS
sudo systemctl status    # Check system services
df -h                    # Check disk space
htop                     # Monitor resources
sudo ufw status          # Check firewall
```

### MongoDB Operations

```bash
# Backup
docker exec mongodb mongodump --archive=backup.gz --gzip

# Restore
docker exec -i mongodb mongorestore --archive --gzip < backup.gz

# Shell access
docker exec -it mongodb mongosh
```

## Troubleshooting Guide

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose config

# Rebuild
docker-compose build --no-cache
```

### MongoDB Connection Issues

```bash
# Test connection
docker exec -it app node -e "console.log('Testing MongoDB...')"

# Check MongoDB logs
docker-compose logs mongodb

# Verify network
docker network ls
docker network inspect getthreaded_getthreaded-network
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart services
docker-compose restart

# Limit container memory (add to docker-compose.yml)
deploy:
  resources:
    limits:
      memory: 512M
```

---

## Support

For issues or questions:
1. Check the logs first
2. Verify environment variables
3. Ensure all services are running
4. Check network connectivity
5. Review security settings

Remember to always backup your data before making significant changes!