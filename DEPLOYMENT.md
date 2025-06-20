# 🚀 myNGO Deployment Guide

This guide covers deploying the myNGO application to Coolify and other production environments.

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose
- MySQL 8.0+
- Coolify instance or production server

## 🏗️ Deployment Options

### Option 1: Single Container (Recommended for Coolify)

**Ports:**
- Frontend + Backend: `3000` (Nginx serves frontend, proxies `/api` to backend on internal port `3001`)

**Environment Variables:**
```bash
NODE_ENV=production
VITE_ENVIRONMENT=production
VITE_API_URL=https://api-myngo.0o0.my
CORS_ORIGINS=https://myngo.0o0.my,https://api-myngo.0o0.my
DB_HOST=localhost
DB_PORT=3306
DB_USER=myngo
DB_PASSWORD=your-secure-password
DB_NAME=myngo_production
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
```

**Deploy Command:**
```bash
docker build -t myngo-app .
docker run -p 3000:3000 --env-file .env myngo-app
```

### Option 2: Separate Containers

**Ports:**
- Frontend: `3000`
- Backend API: `3001`

**Frontend:**
```bash
docker build -f Dockerfile.frontend -t myngo-frontend .
docker run -p 3000:3000 myngo-frontend
```

**Backend:**
```bash
docker build -f Dockerfile.backend -t myngo-backend .
docker run -p 3001:3001 --env-file .env myngo-backend
```

### Option 3: Docker Compose

```bash
# Single container
docker-compose up -d

# Separate containers
docker-compose --profile separate up -d
```

## 🌐 Coolify Deployment

### 1. Single Container Setup (Recommended)

1. **Create New Project** in Coolify
2. **Import Repository** from GitHub
3. **Configure Environment Variables**:
   ```
   NODE_ENV=production
   VITE_API_URL=https://api-myngo.0o0.my
   CORS_ORIGINS=https://myngo.0o0.my
   DB_HOST=database
   DB_PASSWORD=your-secure-password
   JWT_ACCESS_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-jwt-refresh-secret
   ```
4. **Set Dockerfile**: Use default `Dockerfile`
5. **Configure Domains**:
   - Main app: `myngo.0o0.my` → Port `3000`
6. **Deploy**

### 2. Separate Containers Setup

1. **Frontend Service**:
   - Dockerfile: `Dockerfile.frontend`
   - Port: `3000`
   - Domain: `myngo.0o0.my`

2. **Backend Service**:
   - Dockerfile: `Dockerfile.backend`
   - Port: `3001`
   - Domain: `api-myngo.0o0.my`

3. **Database Service**:
   - Use Coolify's MySQL service
   - Configure connection in backend environment

## 🔧 Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
# Required
NODE_ENV=production
DB_PASSWORD=your-secure-database-password
JWT_ACCESS_SECRET=your-super-secure-jwt-access-secret
JWT_REFRESH_SECRET=your-super-secure-jwt-refresh-secret

# API URLs
VITE_API_URL=https://api-myngo.0o0.my
CORS_ORIGINS=https://myngo.0o0.my,https://api-myngo.0o0.my

# Database
DB_HOST=localhost
DB_USER=myngo
DB_NAME=myngo_production

# Optional
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

## 🏥 Health Checks

- **Frontend**: `GET /nginx-health` (Single container)
- **Backend**: `GET /health`
- **Combined**: `GET /` (Shows API status)

## 📊 Monitoring & Logs

### Docker Logs
```bash
# Single container
docker logs myngo-app

# Separate containers
docker logs myngo-frontend
docker logs myngo-backend
```

### Docker Compose Logs
```bash
docker-compose logs -f
```

### Health Check Commands
```bash
# Test frontend
curl -f http://localhost:3000/nginx-health

# Test backend
curl -f http://localhost:3001/health

# Test full app
curl -f http://localhost:3000/
```

## 🔄 Updates & Maintenance

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Database Migrations
Migrations are automatically applied on container startup from `/src/server/migrations/`

### Backup Database
```bash
docker exec myngo-database mysqldump -u root -p myngo_production > backup.sql
```

## 🐛 Troubleshooting

### Common Issues

1. **API not accessible**:
   - Check CORS_ORIGINS includes your domain
   - Verify VITE_API_URL is correct
   - Check backend health: `curl localhost:3001/health`

2. **Frontend not loading**:
   - Check nginx health: `curl localhost:3000/nginx-health`
   - Verify build completed: Check `dist/` directory exists

3. **Database connection failed**:
   - Check DB_HOST, DB_USER, DB_PASSWORD
   - Verify database container is running
   - Check network connectivity

### Debug Commands
```bash
# Check running containers
docker ps

# Inspect container
docker inspect myngo-app

# Shell into container
docker exec -it myngo-app sh

# Check nginx config
docker exec myngo-app nginx -t

# Check PM2 processes
docker exec myngo-app pm2 list
```

## 🔐 Security Checklist

- [ ] Change default JWT secrets
- [ ] Use strong database passwords
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable log monitoring
- [ ] Regular security updates
- [ ] Database backups configured

## 📝 Notes

- Single container uses supervisor to manage both Nginx and Node.js processes
- Backend runs on internal port 3001, Nginx proxies API requests
- Frontend is served as static files by Nginx
- All environment variables are configurable via `.env` file
- Health checks ensure both services are running properly 