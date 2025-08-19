# 🚀 Panduan Deploy ARNVERSE ke cPanel - Langkah Demi Langkah

Panduan ini menjelaskan cara deploy aplikasi **ARNVERSE** ke shared hosting cPanel dengan mudah dan lengkap.

## 📋 Prasyarat

✅ **Akun cPanel** dengan domain `arnworld.space`  
✅ **Backend PHP** sudah tersedia di `/public_html/arnworld.space/api/`  
✅ **Database MySQL** sudah di-setup dengan seed data  
✅ **Node.js** terinstall di komputer lokal untuk build  

---

## 🔧 STEP 1: Build Aplikasi di Lokal

### 1.1 Persiapan Environment
```bash
# Clone/download project ke lokal
cd arnverse-frontend

# Install dependencies
npm ci
# atau jika pakai yarn:
yarn install
```

### 1.2 Setup Environment Variables
```bash
# Salin file environment
cp .env.example .env.local

# Edit .env.local dengan setting produksi:
# VITE_API_BASE=https://arnworld.space/api
# VITE_MEDIA_BASE=https://arnworld.space/uploads
# VITE_USE_HASH_ROUTER=false
```

### 1.3 Build untuk Produksi
```bash
# Build aplikasi
npm run build

# Hasil build akan ada di folder /dist
ls dist/
# Output: index.html, assets/, favicon.ico, dll
```

---

## 📤 STEP 2: Upload ke cPanel

### 2.1 Akses File Manager cPanel
1. Login ke **cPanel** → klik **File Manager**
2. Navigasi ke folder `/public_html/arnworld.space/`
3. **PENTING**: Pastikan folder `/api/` tetap ada dan tidak terhapus!

### 2.2 Upload File Build
```bash
# Di File Manager cPanel:
1. Pilih semua file di /public_html/arnworld.space/ (KECUALI folder /api/)
2. Delete file lama (index.html lama, assets lama, dll)
3. Upload semua ISI folder /dist dari lokal ke /public_html/arnworld.space/
   - index.html → /public_html/arnworld.space/index.html
   - assets/ → /public_html/arnworld.space/assets/
   - dll
```

### 2.3 Setup .htaccess untuk SPA Routing
Buat file `.htaccess` di `/public_html/arnworld.space/.htaccess`:

```apache
# ===================================================================
# ARNVERSE SPA Routing Configuration
# ===================================================================
Options -MultiViews
RewriteEngine On
RewriteBase /

# 1) Layani file/folder yang memang ada
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# 2) Jangan ganggu endpoint API
RewriteRule ^api/ - [L]

# 3) Fallback SPA ke index.html
RewriteRule ^ index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>
```

### 2.4 Set Permission File
```bash
# Di File Manager, set permission:
- Folder: 0755 (rwxr-xr-x)
- File: 0644 (rw-r--r--)

# Caranya:
1. Klik kanan folder/file → Properties
2. Set permission sesuai di atas
3. Centang "Apply to subdirectories" untuk folder
```

---

## 🗄️ STEP 3: Verifikasi Database (jika belum)

### 3.1 Cek Database MySQL
```bash
# Di cPanel → MySQL Databases
1. Pastikan database arnverse sudah ada
2. Pastikan user database punya akses penuh
3. Test koneksi via phpMyAdmin
```

### 3.2 Import Seed Data (jika perlu)
```sql
-- Via phpMyAdmin, run:
-- File: database/SEED_DATA.sql
INSERT INTO users (username, email, password, display_name) 
VALUES ('alice', 'alice@arnverse.com', '$2y$10$hash_password_here', 'Alice Cooper');
-- dst...
```

---

## 🧪 STEP 4: Testing & Verifikasi

### 4.1 Test URL Routing (wajib lulus semua!)
```bash
✅ https://arnworld.space/           → Homepage (bukan 404)
✅ https://arnworld.space/login      → Login page (bukan 404)  
✅ https://arnworld.space/register   → Register page (bukan 404)
✅ https://arnworld.space/explore    → Redirect ke /login (jika belum auth)
✅ https://arnworld.space/api/auth.php → JSON response (test API)
```

### 4.2 Test Fungsionalitas
```bash
🔐 AUTH TEST:
   1. Buka /register → daftar akun baru → sukses redirect ke /
   2. Logout → redirect ke /login
   3. Login dengan: alice@arnverse.com | password → sukses masuk
   4. Refresh halaman → tetap login (token persist)

📱 FEED TEST:
   1. Homepage → tampil daftar post seed
   2. Like post → counter berubah
   3. Comment → modal terbuka, bisa kirim comment
   4. Create post → upload berhasil, muncul di feed

📖 STORY TEST:
   1. Story strip → tampil bubbles
   2. Klik story → viewer terbuka
   3. Upload story → berhasil muncul di strip

💬 INBOX TEST:
   1. /inbox → tampil daftar chat
   2. Klik chat → tampil pesan
   3. Kirim pesan → berhasil terkirim
```

### 4.3 Test Browser Compatibility
```bash
✅ Chrome desktop/mobile
✅ Firefox desktop/mobile  
✅ Safari desktop/mobile
✅ Edge desktop
```

---

## 🐛 Troubleshooting Umum

### Problem: 404 di URL selain homepage
```bash
CAUSE: .htaccess tidak bekerja atau salah konfigurasi
FIX: 
1. Cek file .htaccess ada di root domain
2. Cek server support mod_rewrite
3. Coba ganti ke HashRouter: VITE_USE_HASH_ROUTER=true
```

### Problem: API calls gagal (CORS/Network Error)  
```bash
CAUSE: Base URL API salah atau CORS issue
FIX:
1. Cek VITE_API_BASE di .env: https://arnworld.space/api
2. Test API manual: curl https://arnworld.space/api/auth.php
3. Cek server PHP error log
```

### Problem: Login success tapi redirect loop
```bash
CAUSE: Token tidak tersimpan atau expired
FIX:
1. Cek localStorage di Browser DevTools
2. Cek format response API login: { ok: true, data: { token, user } }
3. Cek PHP session/JWT config
```

### Problem: Upload file gagal
```bash
CAUSE: Permission folder uploads atau size limit
FIX:
1. Set /uploads folder permission 0755
2. Cek PHP upload_max_filesize di cpanel
3. Cek disk space hosting
```

### Problem: Cache lama masih tampil
```bash
FIX:
1. Di cPanel → LiteSpeed Cache → Purge All
2. Browser: Ctrl+F5 (hard refresh)
3. Cek .htaccess ada cache headers
```

---

## ⚡ Performance Tips

### 1. Enable Gzip Compression
Tambahkan ke `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Enable Browser Caching
```apache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>
```

### 3. Monitor Resource Usage
```bash
# Di cPanel → Metrics:
- CPU Usage: < 80%
- Memory: < 256MB
- I/O: < 1MB/s
```

---

## 🎯 Checklist Deploy Sukses

```bash
✅ Build lokal berhasil (npm run build)
✅ Upload file ke cPanel (isi folder dist → root domain)  
✅ .htaccess SPA routing setup
✅ Permission file/folder benar (0755/0644)
✅ Folder /api/ backend tidak terganggu
✅ Database dan seed data ready
✅ Environment variables benar
✅ Test semua URL routing (tidak 404)
✅ Test auth: register → login → logout
✅ Test feed: tampil post, like, comment
✅ Test story: tampil, view, upload
✅ Test inbox: chat basic  
✅ Test di berbagai browser/device
✅ LiteSpeed cache di-purge
```

---

## 📞 Support

Jika masih ada masalah:

1. **Cek Browser Console** → F12 → Console (error JS)
2. **Cek Network Tab** → API calls gagal/lambat  
3. **Cek cPanel Error Logs** → PHP errors
4. **Test API Manual** → Postman/curl ke endpoint
5. **Hubungi support hosting** → jika server issue

**Selamat! ARNVERSE sudah live di https://arnworld.space 🚀**