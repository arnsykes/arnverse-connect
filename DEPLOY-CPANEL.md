# 🚀 ARNVERSE - Deploy ke cPanel/LiteSpeed

Panduan lengkap deploy aplikasi ARNVERSE ke shared hosting cPanel dengan LiteSpeed.

## 📋 Persiapan

### Requirements
- ✅ cPanel hosting dengan LiteSpeed/Apache
- ✅ PHP 8.0+ dengan extension: PDO, MySQL, JSON, GD
- ✅ MySQL/MariaDB 10.x
- ✅ Node.js 18+ (untuk build lokal)
- ✅ Domain/subdomain sudah pointing

### Struktur Target
```
/public_html/arnworld.space/
├── index.html              # SPA entry point
├── assets/                 # CSS, JS, images (dari build)
├── api/                    # Backend PHP
│   ├── *.php              # Endpoint files
│   ├── .env               # Kredensial database
│   └── uploads/           # Media uploads
└── .htaccess              # SPA routing rules
```

## 🔧 Step 1: Build Frontend

```bash
# Clone dan setup project
git clone https://github.com/yourusername/arnverse-connect.git
cd arnverse-connect

# Install dependencies
npm ci

# Build untuk produksi
npm run build

# Buat release package
npm run release
```

File `release/dist_cpanel.zip` siap di-upload.

## 🌐 Step 2: Setup Domain & Upload

### 2.1 Setup Domain di cPanel
1. Masuk cPanel → **Subdomains**
2. Buat subdomain: `arnworld` → Document Root: `/public_html/arnworld.space`
3. Atau gunakan domain utama: Document Root: `/public_html/`

### 2.2 Upload Frontend
1. **File Manager** → masuk `/public_html/arnworld.space/`
2. Upload `release/dist_cpanel.zip`
3. **Extract** → pilih "Extract Files" → konfirm
4. Hapus file `.zip` setelah extract

### 2.3 Upload Backend API
1. Upload folder `api/` ke `/public_html/arnworld.space/api/`
2. Set permission:
   - Folder `api/`: **0755**
   - File `*.php`: **0644** 
   - Folder `api/uploads/`: **0755** (buat manual jika belum ada)

## 🗄️ Step 3: Setup Database

### 3.1 Buat Database di cPanel
1. **MySQL Databases** → buat database baru
2. Contoh nama: `yourusername_arnverse`
3. Buat user database dengan semua privilege
4. Catat: **DB_HOST**, **DB_NAME**, **DB_USER**, **DB_PASS**

### 3.2 Import Schema & Data
**phpMyAdmin** → pilih database → **Import**

Import berurutan (WAJIB sesuai urutan):
```bash
1. database/00_schema.sql       # Struktur tabel
2. database/01_seed.sql         # Data demo
3. database/02_fix_users_flags.sql  # Fix kolom is_active
```

⚠️ **PENTING**: Jangan import dengan opsi "CREATE DATABASE" atau "USE database"

### 3.3 Verifikasi Database
```sql
-- Test query di phpMyAdmin:
SELECT COUNT(*) FROM users;        -- Expected: 3
SELECT COUNT(*) FROM posts;        -- Expected: 4+
SELECT COUNT(*) FROM hashtags;     -- Expected: 10
SELECT COUNT(*) FROM likes WHERE likeable_type='post'; -- Expected: 6+

-- Test user demo:
SELECT username, email, is_active, is_verified 
FROM users WHERE email = 'alice@arnverse.com';
-- Expected: alice_cosmic, is_active=1, is_verified=1
```

## ⚙️ Step 4: Konfigurasi Backend

### 4.1 Buat File .env
Di `/public_html/arnworld.space/api/.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_NAME=yourusername_arnverse
DB_USER=yourusername_arnverse
DB_PASS=your_secure_password

# JWT Secret (WAJIB ubah untuk production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Base URL
BASE_URL=https://arnworld.space

# Debug Mode (set false untuk production)
DEBUG_MODE=false
```

⚠️ **KEAMANAN**: Set permission `.env` ke **0600**

### 4.2 Test API Endpoints
```bash
# Test koneksi database:
GET https://arnworld.space/api/test_db.php
# Expected: {"ok": true, "data": "Database connected successfully"}

# Test login:
POST https://arnworld.space/api/login.php
Content-Type: application/json
{
  "email": "alice@arnverse.com",
  "password": "password"
}
# Expected: {"ok": true, "data": {"token": "...", "user": {...}}}
```

## 🔄 Step 5: Konfigurasi SPA Routing

File `/.htaccess` (root domain):
```apache
Options -Indexes -MultiViews
DirectoryIndex index.html

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /

# Layani file/folder yang ada
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Biarkan PHP API jalan apa adanya
RewriteRule ^api/ - [L]

# Fallback semua route SPA ke index.html
RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set X-XSS-Protection "1; mode=block"
</IfModule>
```

## 🧪 Step 6: Testing & Verifikasi

### 6.1 Test SPA Routes
```bash
✅ https://arnworld.space/           # Homepage (tidak 404)
✅ https://arnworld.space/login      # Login page
✅ https://arnworld.space/explore    # Explore page  
✅ https://arnworld.space/profile/alice_cosmic  # Profile

# Refresh browser di setiap route → harus tetap load tanpa 404
```

### 6.2 Test Authentication Flow
1. Buka `/login`
2. Login dengan: `alice@arnverse.com` / `password`
3. Redirect ke dashboard/feed
4. Check browser localStorage: token tersimpan
5. Test logout: token terhapus, redirect ke login

### 6.3 Test API Integration
```bash
# Feed API:
GET /api/feed.php?page=1
Expected: List posts dengan metadata

# Auth check:
GET /api/auth.php
Authorization: Bearer {token}
Expected: User profile data
```

## 🔧 Troubleshooting

### ❌ Route SPA 404
**Penyebab**: `.htaccess` tidak bekerja atau salah konfigurasi
**Solusi**:
1. Pastikan `index.html` ada di document root
2. Cek `.htaccess` ada dan readable (permission 0644)
3. **Purge LiteSpeed Cache** di cPanel
4. Test langsung: `https://domain.com/index.html`

### ❌ API 500 Error  
**Penyebab**: Database connection atau query error
**Debug**:
1. Cek **Error Logs** di cPanel File Manager
2. Test `api/test_db.php` untuk koneksi database
3. Verifikasi kredensial di `api/.env`
4. Pastikan kolom `is_active` ada: `DESCRIBE users;`

### ❌ Login Gagal "Unknown column is_active"
**Penyebab**: Migration belum dijalankan
**Solusi**:
1. Import `database/02_fix_users_flags.sql` di phpMyAdmin
2. Verifikasi: `DESCRIBE users;` harus ada kolom `is_active`
3. Test API login lagi

### ❌ Media/Upload Error
**Penyebab**: Permission atau path salah
**Solusi**:
1. Buat folder `api/uploads/` dengan permission **0755**
2. Test upload gambar kecil via UI
3. Cek error log untuk path issues

## 🚀 Performance & Security

### Cache & Compression
1. **LiteSpeed Cache**: Enable di cPanel
2. **Gzip Compression**: Aktifkan di `.htaccess`
3. **Browser Caching**: Set expire headers untuk assets

### Security Checklist
- ✅ File `.env` permission 0600
- ✅ JWT secret strong & unique  
- ✅ Database user privilege minimal
- ✅ Upload folder di luar web root (ideal)
- ✅ HTTPS aktif dengan valid SSL
- ✅ Error logs tidak exposed

## 📞 Support

Jika masih ada masalah:

1. **Cek Browser Console**: F12 → Console tab
2. **Cek Network Tab**: Inspeksi request/response API
3. **Cek cPanel Error Logs**: File Manager → `error_logs`
4. **Test API Manual**: Postman/curl untuk isolasi masalah

---

## 🎯 Quick Deploy Checklist

- [ ] Build frontend: `npm run release`
- [ ] Upload & extract `dist_cpanel.zip`
- [ ] Upload folder `api/` dengan permissions benar
- [ ] Buat database & user di cPanel
- [ ] Import SQL berurutan: schema → seed → migrations
- [ ] Buat file `api/.env` dengan kredensial benar
- [ ] Set `.htaccess` untuk SPA routing
- [ ] Test `/login` tidak 404
- [ ] Test login API dengan `alice@arnverse.com` / `password`
- [ ] Purge LiteSpeed Cache
- [ ] Test navigation antar pages tanpa refresh

**🚀 ARNVERSE siap digunakan!**