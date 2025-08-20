# 🧪 ARNVERSE Testing Checklist untuk cPanel

Gunakan checklist ini untuk memastikan deployment ARNVERSE berhasil di cPanel/LiteSpeed.

## ✅ Pre-Deployment Checklist

### Database Setup
- [ ] Database sudah dibuat di cPanel (`arnn8651_arnverse`)
- [ ] phpMyAdmin bisa diakses
- [ ] Import SQL berurutan:
  - [ ] `00_schema.sql` (struktur tabel) ✅
  - [ ] `01_seed.sql` (data demo) ✅  
  - [ ] `02_fix_users_flags.sql` (kolom is_active) ✅

### Build & Upload
- [ ] `npm run build` sukses lokal
- [ ] Isi folder `dist/` di-upload ke `/public_html/arnworld.space/`
- [ ] File `index.html` ada di root domain
- [ ] Folder `assets/` ter-upload dengan benar
- [ ] File `.htaccess` ada di root dengan konten SPA routing

### Backend API
- [ ] Folder `api/` di-upload ke `/public_html/arnworld.space/api/`
- [ ] File `api/.env` dibuat dengan kredensial DB benar
- [ ] Permission folder `api/` = 0755
- [ ] Permission file `*.php` = 0644

## 🔍 Testing Plan

### 1. SPA Routing Test
```bash
# Akses langsung routes - harus TIDAK 404:
✅ https://arnworld.space/           # Homepage  
✅ https://arnworld.space/login      # Login page
✅ https://arnworld.space/explore    # Explore page
✅ https://arnworld.space/profile/alice_cosmic  # Profile page

# Refresh browser di setiap route - harus tetap load halaman
```

### 2. API Endpoints Test  
```bash
# Test login API:
POST https://arnworld.space/api/login.php
Content-Type: application/json
{
  "email": "alice@arnverse.com",
  "password": "password"
}

Expected Response:
{
  "ok": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "username": "alice_cosmic", 
      "display_name": "Alice Cooper",
      "email": "alice@arnverse.com",
      "is_verified": true,
      "is_admin": false
    }
  }
}

# Test auth check:
GET https://arnworld.space/api/auth.php
Authorization: Bearer <token_dari_login>

Expected: {"ok": true, "data": {"user": {...}}}

# Test feed:
GET https://arnworld.space/api/feed.php?page=1

Expected: {"ok": true, "data": {"posts": [...], "pagination": {...}}}
```

### 3. Database Verification
```sql
-- Test di phpMyAdmin:
SELECT COUNT(*) FROM users;          -- Expected: 3
SELECT COUNT(*) FROM posts;          -- Expected: 3+  
SELECT COUNT(*) FROM hashtags;       -- Expected: 10
SELECT COUNT(*) FROM likes;          -- Expected: 5+

-- Test user demo:
SELECT username, email, is_active, is_verified 
FROM users 
WHERE email = 'alice@arnverse.com';
-- Expected: alice_cosmic, is_active=1, is_verified=1

-- Test password hash:
SELECT password_verify('password', password_hash) as valid_password
FROM users 
WHERE email = 'alice@arnverse.com';
-- Expected: valid_password = 1
```

### 4. Frontend Integration Test
```bash
# Buka browser ke https://arnworld.space/login
# Test login flow:
1. Input: alice@arnverse.com / password
2. Click "Login" 
3. Expected: redirect ke dashboard/feed
4. Check LocalStorage: token tersimpan
5. Check Network tab: POST /api/login.php status 200

# Test navigation:
1. Click semua menu (Explore, Profile, etc)
2. Expected: URL berubah tanpa page reload
3. Expected: tidak ada 404 error

# Test logout:
1. Click logout
2. Expected: token dihapus dari LocalStorage  
3. Expected: redirect ke /login
```

## 🚨 Common Issues & Solutions

### ❌ 404 pada /login
```bash
# Penyebab: SPA routing tidak bekerja
# Solusi:
1. Pastikan index.html ada di /public_html/arnworld.space/
2. Pastikan .htaccess ada dengan konten benar
3. Purge LiteSpeed cache di cPanel
4. Test langsung: https://arnworld.space/index.html (harus load)
```

### ❌ 500 pada API login
```bash
# Penyebab: Database connection atau query error
# Debug:
1. Cek error_log di cPanel File Manager
2. Test connection: buat file test_db.php dengan PDO connect
3. Pastikan kolom is_active ada: DESCRIBE users;
4. Test manual query di phpMyAdmin
```

### ❌ "Unknown column 'is_active'"
```bash
# Penyebab: Migration belum dijalankan
# Solusi:
1. Import database/02_fix_users_flags.sql di phpMyAdmin
2. Verifikasi: DESCRIBE users; (harus ada kolom is_active)
3. Test lagi API login
```

### ❌ Login berhasil tapi redirect error
```bash
# Penyebab: Token tidak valid atau API auth error
# Debug:
1. Check Network tab: response POST /api/login.php
2. Check LocalStorage: token tersimpan?
3. Test GET /api/auth.php dengan token
4. Pastikan JWT_SECRET sama di .env
```

## ✅ Success Criteria

### Minimal Working State:
- [ ] `/login` tidak 404, UI login tampil
- [ ] Login dengan `alice@arnverse.com` / `password` berhasil  
- [ ] Redirect ke dashboard setelah login
- [ ] API endpoints return valid JSON responses
- [ ] Database queries tidak error

### Full Feature State:
- [ ] Semua SPA routes bekerja tanpa 404
- [ ] Feed menampilkan posts dari seed data
- [ ] Like/comment functionality bekerja
- [ ] Stories dan messaging basic functionality
- [ ] Profile pages load dengan benar
- [ ] Logout dan re-login cycle bekerja

## 📞 Emergency Rollback

Jika deployment gagal total:
```bash
1. Backup/download current files dari cPanel
2. Rollback database: hapus data, re-import clean schema
3. Upload working version sebelumnya
4. Test basic functionality
5. Debug step by step dengan checklist ini
```