# Sushrusa Deployment Guide

## Backend Deployment Steps

### 1. Connect to Server
```bash
ssh sammy@139.59.21.121
```

### 2. Navigate to Backend Directory
```bash
cd sushrusha_Django
```

### 3. Fetch Latest Changes from Git
```bash
git fetch origin
git pull origin main
```

### 4. Activate Virtual Environment
```bash
source ../myenv/bin/activate
```

### 5. Install/Update Dependencies
```bash
pip install -r requirements.txt
```

### 6. Run Database Migrations
```bash
python manage.py migrate
```

### 7. Collect Static Files (if needed)
```bash
python manage.py collectstatic --noinput
```

### 8. Restart Services
```bash
# Restart Gunicorn
sudo systemctl restart gunicorn.service

# Restart Nginx
sudo systemctl restart nginx
```

---

## Frontend Deployment Steps

### 1. Build Frontend (Local Machine)
```bash
cd sushrusa-homepage-design-hub
npm run build
```

### 2. Transfer Build Files to Server
```bash
scp -r ./dist sammy@139.59.21.121:/home/sammy/sushrusha_Django/
```

### 3. Alternative: Transfer Build Files
```bash
# If using build directory instead of dist
scp -r ./build sammy@139.59.21.121:/home/sammy/sushrusha_Django/
```

---

## Complete Deployment Checklist

### Backend Deployment ✅
- [ ] SSH into server
- [ ] Navigate to backend directory
- [ ] Fetch latest git changes
- [ ] Activate virtual environment
- [ ] Install/update dependencies
- [ ] Run database migrations
- [ ] Collect static files (if needed)
- [ ] Restart Gunicorn service
- [ ] Restart Nginx service

### Frontend Deployment ✅
- [ ] Build frontend locally
- [ ] Transfer build files to server
- [ ] Verify files are in correct location

### Verification Steps
- [ ] Check backend API endpoints
- [ ] Verify frontend is accessible
- [ ] Test edit doctor functionality
- [ ] Check file uploads work
- [ ] Verify all features are working

---

## Important Notes

### Backend Files Updated
- **119 files changed** in latest deployment
- **3,842 insertions, 94 deletions**
- New features: Edit doctor functionality, DigitalOcean Spaces integration, Signal handlers
- New management commands added
- Enhanced API endpoints

### Frontend Files Updated
- **4 files changed** in latest deployment
- **605 insertions, 76 deletions**
- Enhanced SuperAdminDashboard with edit doctor capabilities
- Fixed JSX structure issues
- Improved form validation and API integration

### Services to Monitor
- **Gunicorn**: Django application server
- **Nginx**: Web server and reverse proxy
- **PostgreSQL**: Database (if using)
- **Redis**: Cache and Celery broker (if using)

---

## Troubleshooting

### Common Issues

#### 1. Permission Denied
```bash
# Check file permissions
ls -la /home/sammy/sushrusha_Django/

# Fix permissions if needed
chmod -R 755 /home/sammy/sushrusha_Django/
```

#### 2. Service Not Starting
```bash
# Check service status
sudo systemctl status gunicorn.service
sudo systemctl status nginx

# Check logs
sudo journalctl -u gunicorn.service
sudo journalctl -u nginx
```

#### 3. Database Migration Issues
```bash
# Check migration status
python manage.py showmigrations

# Reset migrations if needed
python manage.py migrate --fake-initial
```

#### 4. Static Files Not Loading
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check static files location
ls -la /home/sammy/sushrusha_Django/staticfiles/
```

---

## Environment Variables

Make sure these environment variables are set in your `.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# DigitalOcean Spaces
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_ENDPOINT_URL=https://nyc3.digitaloceanspaces.com

# Django
SECRET_KEY=your_secret_key
DEBUG=False
ALLOWED_HOSTS=your_domain.com,139.59.21.121

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

---

## Monitoring and Maintenance

### Regular Tasks
- [ ] Monitor server logs
- [ ] Check disk space usage
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Monitor application performance

### Log Locations
```bash
# Gunicorn logs
sudo journalctl -u gunicorn.service

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Django logs
tail -f /home/sammy/sushrusha_Django/logs/django.log
```

---

## Rollback Procedure

If deployment fails, you can rollback:

### Backend Rollback
```bash
cd /home/sammy/sushrusha_Django
git log --oneline -5  # Check recent commits
git reset --hard HEAD~1  # Rollback one commit
pip install -r requirements.txt
python manage.py migrate
sudo systemctl restart gunicorn.service
```

### Frontend Rollback
```bash
# Rebuild with previous version
git checkout HEAD~1
npm run build
scp -r ./dist sammy@139.59.21.121:/home/sammy/sushrusha_Django/
```

---

## Security Checklist

- [ ] HTTPS is enabled
- [ ] Firewall is configured
- [ ] Regular security updates
- [ ] Database backups are encrypted
- [ ] Environment variables are secure
- [ ] File permissions are correct
- [ ] Log monitoring is active

---

*Last Updated: July 28, 2024*
*Version: 1.0* 