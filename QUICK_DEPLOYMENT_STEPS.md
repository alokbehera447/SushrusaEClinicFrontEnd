# Quick Deployment Steps

## Backend Deployment

### 1. SSH Connection
```bash
ssh sammy@139.59.21.121
```

### 2. Git Updates
```bash
git fetch origin && git pull origin main
```

### 3. Environment Setup
```bash
source ../myenv/bin/activate
```

### 4. Dependencies
```bash
pip install -r requirements.txt
```

### 5. Database
```bash
python manage.py migrate
```

### 6. Services
```bash
sudo systemctl restart gunicorn.service
sudo systemctl restart nginx
```

---

## Frontend Deployment

### 1. Build
```bash
npm run build
```

### 2. Transfer
```bash
scp -r ./dist sammy@139.59.21.121:/home/sammy/sushrusha_Django/
```

---

## Complete Command Sequence

### Backend (Server)
```bash
ssh sammy@139.59.21.121
cd sushrusha_Django
git fetch origin && git pull origin main
source ../myenv/bin/activate
pip install -r requirements.txt
python manage.py migrate
sudo systemctl restart gunicorn.service
sudo systemctl restart nginx
```

### Frontend (Local Machine)
```bash
cd sushrusa-homepage-design-hub
npm run build
scp -r ./dist sammy@139.59.21.121:/home/sammy/sushrusha_Django/
```

---

*Last Updated: July 28, 2024* 