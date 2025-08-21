# ARNVERSE Deployment Guide

## 🚀 Panduan Deploy End-to-End

### Pre-requisites
- MySQL/MariaDB database access
- PHP 7.4+ dengan ekstensi: PDO, JSON, OpenSSL
- Web server (Apache/Nginx) dengan mod_rewrite
- Node.js 18+ untuk build frontend

---

## 📂 Struktur Directory Deploy

```
public_html/arnworld.space/     # atau domain Anda
├── index.html                  # Frontend (hasil build)
├── assets/                     # CSS, JS, images
├── api/                        # Backend PHP
│   ├── *.php                  # Endpoint files
│   ├── .env                   # Kredensial database
│   ├── .htaccess             # API configuration
│   └── uploads/              # Media upload folder
├── uploads/                   # Media files (public access)
└── .htaccess                 # SPA routing
```

---

## 🔧 Step 1: Setup Database

### 1.1 Create Database
```sql
CREATE DATABASE arnn8651_arnverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'arnn8651_arn'@'localhost' IDENTIFIED BY 'lovearin15';
GRANT ALL PRIVILEGES ON arnn8651_arnverse.* TO 'arnn8651_arn'@'localhost';
FLUSH PRIVILEGES;
```

### 1.2 Import Schema & Seed Data
```bash
# Urutan import WAJIB seperti ini:
mysql -u arnn8651_arn -p arnn8651_arnverse < database/schema.sql
mysql -u arnn8651_arn -p arnn8651_arnverse < database/seed.sql
```

### 1.3 Verify Database
```bash
mysql -u arnn8651_arn -p -e "SELECT COUNT(*) FROM arnn8651_arnverse.users;"
# Should return: 5 (demo users)
```

---

## 🖥️ Step 2: Deploy Backend (API)

### 2.1 Upload API Files
Upload seluruh folder `api/` ke server:
```bash
api/
├── _auth.php
├── _db.php
├── _env.php
├── _response.php
├── _util.php
├── .htaccess
├── auth.php
├── comment_post.php
├── feed.php
├── get_comments.php
├── health.php
├── like_post.php
├── login.php
├── register.php
├── stories.php
└── story_view.php
```

### 2.2 Create API .env File
```bash
# Create /api/.env
DB_HOST=localhost
DB_NAME=arnn8651_arnverse
DB_USER=arnn8651_arn
DB_PASS=lovearin15
DB_CHARSET=utf8mb4

JWT_SECRET=arnverse-production-secret-key-2025
JWT_EXPIRY=604800

UPLOAD_DIR=../uploads/
MAX_FILE_SIZE=10485760

DEBUG_MODE=false
CORS_ORIGIN=*
TIMEZONE=Asia/Jakarta
```

### 2.3 Set Permissions
```bash
chmod 755 api/
chmod 644 api/*.php
chmod 600 api/.env
mkdir uploads && chmod 755 uploads/
```

### 2.4 Test API Endpoints
```bash
# Test health check
curl https://arnworld.space/api/health.php

# Test login with demo user
curl -X POST https://arnworld.space/api/login.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=alice@arnverse.com&password=password"

# Test feed
curl https://arnworld.space/api/feed.php?limit=5
```

---

## 🎨 Step 3: Deploy Frontend

### 3.1 Build Production
```bash
# Di local development machine:
npm install
npm run build
```

### 3.2 Upload Build Files
Upload seluruh isi folder `dist/` ke root domain:
```bash
dist/
├── index.html          → /public_html/arnworld.space/
├── assets/            → /public_html/arnworld.space/assets/
└── ...
```

### 3.3 Create Root .htaccess
```apache
# /public_html/arnworld.space/.htaccess
RewriteEngine On

# Handle SPA routing - redirect all non-file requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

---

## ✅ Step 4: End-to-End Testing

### 4.1 Basic Functionality
- [ ] Visit `https://arnworld.space/` → Homepage loads
- [ ] Visit `https://arnworld.space/login` → Login form appears  
- [ ] Login dengan `alice@arnverse.com` / `password` → Success
- [ ] Feed loads with demo posts → No console errors
- [ ] Click comment button → Drawer opens with comments
- [ ] Like/unlike posts → Counter updates
- [ ] Stories section loads → No errors

### 4.2 API Endpoints
- [ ] `GET /api/health.php` → `{"ok": true}`
- [ ] `POST /api/login.php` → Returns token
- [ ] `GET /api/feed.php` → Returns posts array
- [ ] `GET /api/get_comments.php?post_id=1` → Returns comments
- [ ] `GET /api/stories.php` → Returns stories array

### 4.3 Console Check
Open DevTools Console pada halaman feed:
- [ ] No red errors
- [ ] All API calls return 2xx status codes
- [ ] No "ERR_NAME_NOT_RESOLVED" errors

---

## 🔧 Troubleshooting

### 🚨 "500 Internal Server Error"
```bash
# Check error logs
tail -f /path/to/error.log

# Common fixes:
1. Check .env file exists and has correct credentials
2. Verify database connection
3. Check file permissions (PHP files: 644, directories: 755)
4. Ensure PHP extensions are enabled: PDO, JSON
```

### 🚨 "Access Denied" Database Error
```sql
-- Fix user privileges
GRANT ALL PRIVILEGES ON arnn8651_arnverse.* TO 'arnn8651_arn'@'localhost';
FLUSH PRIVILEGES;

-- Test connection
mysql -u arnn8651_arn -p arnn8651_arnverse -e "SELECT 1;"
```

### 🚨 Frontend "Failed to fetch" Error
1. Check network tab: API URLs correct?
2. CORS headers present in response?
3. API endpoint returning valid JSON?
4. Check API .htaccess CORS configuration

### 🚨 Login Not Working
```bash
# Test login API directly
curl -X POST https://arnworld.space/api/login.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=alice@arnverse.com&password=password"

# Check if demo user exists
mysql -u arnn8651_arn -p -e "SELECT * FROM arnn8651_arnverse.users WHERE email='alice@arnverse.com';"
```

---

## 📋 Success Criteria

### ✅ Must Pass All These Tests:
1. **Homepage**: Loads without errors
2. **Login**: Demo user dapat login dengan credential yang benar
3. **Feed**: Menampilkan posts dari database tanpa crash
4. **Comments**: Drawer comments buka dan tampil data yang benar
5. **Like/Save**: Toggle functionality bekerja dengan update real-time
6. **Stories**: Load dan tampil tanpa error
7. **Console**: Bersih dari error merah
8. **Network**: Semua API calls 2xx status

### 🎯 Performance Checks:
- [ ] Homepage load < 3 detik
- [ ] Feed load < 2 detik  
- [ ] API response time < 500ms
- [ ] No memory leaks di console
- [ ] Responsive di mobile viewport

---

## 📞 Support

Jika ada error yang tidak bisa diselesaikan:

1. **Check API health**: `GET /api/health.php`
2. **Check database**: Koneksi dan struktur tabel
3. **Check logs**: Server error logs dan browser console
4. **Check permissions**: File dan folder permissions
5. **Check environment**: PHP version dan ekstensi

**Status Deploy Sukses**: Semua checklist ✅ dan aplikasi berjalan stabil tanpa error console!