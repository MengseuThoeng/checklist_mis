# 🐳 Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 2GB free disk space

### 🚀 Deploy with One Command

**Windows:**
```cmd
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 🎯 Manual Deployment

1. **Build and start the application:**
   ```bash
   docker-compose up --build -d
   ```

2. **Access your application:**
   - URL: http://localhost:3000
   - Email: `mengseu2004@gmail.com`
   - Password: `DatabaseChecker2024!`

## 📋 Docker Services

- **checklist-app**: Main Next.js application
- **db-init**: Database initialization and seeding
- **db-backup**: Automatic daily database backups

## 🔧 Management Commands

```bash
# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart application
docker-compose restart

# Rebuild and restart
docker-compose up --build -d

# Access container shell
docker exec -it checklist-app sh

# Manual database backup
docker exec checklist-app npx prisma db push
```

## 📁 Data Persistence

- **Database**: `./data/dev.db`
- **Backups**: `./backups/backup-YYYYMMDD-HHMMSS.db`

## 🔒 Security Notes

1. **Change the NEXTAUTH_SECRET** in `docker-compose.yml`
2. **Update admin password** after first login
3. **Backup database regularly** (automatic backups included)

## 🐛 Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs checklist-app

# Rebuild containers
docker-compose down
docker-compose up --build -d
```

### Database issues
```bash
# Reset database
docker-compose down
rm -rf data/*
docker-compose up --build -d
```

### Port conflicts
```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

## 📊 Monitoring

- **Application Logs**: `docker-compose logs checklist-app`
- **Database Size**: Check `./data/dev.db` file size
- **Backup Status**: Check `./backups/` directory

## 🔄 Updates

To update the application:
1. Pull new code
2. Run `./deploy.sh` or `deploy.bat`
3. Database and settings are preserved

## 🏠 Production Deployment

For production servers, update `docker-compose.yml`:
1. Change `NEXTAUTH_URL` to your domain
2. Use strong `NEXTAUTH_SECRET`
3. Enable HTTPS
4. Configure firewall rules
