# ARNVERSE Database Deployment Order

## 📋 Urutan Import SQL yang Benar

Untuk memastikan database ARNVERSE berfungsi dengan baik di cPanel/phpMyAdmin, ikuti urutan import yang tepat:

### 1. 00_schema.sql
**Tujuan:** Membuat semua tabel dan struktur database dasar
```sql
-- Import pertama: struktur database lengkap
-- File: database/00_schema.sql
```

**Yang dibuat:**
- Semua tabel utama (users, posts, likes, stories, dll)
- Foreign key relationships
- Indexes untuk performa
- Triggers untuk auto-update counters

### 2. 01_seed.sql  
**Tujuan:** Mengisi database dengan data demo yang idempotent
```sql  
-- Import kedua: data demo dan testing
-- File: database/01_seed.sql
```

**Yang dibuat:**
- 3 user demo: alice@arnverse.com, dev@arnverse.com, charlie@arnverse.com
- Password semua user: `password`
- Post demo, hashtags, comments, likes
- Stories demo yang belum expired

### 3. 02_fix_users_flags.sql
**Tujuan:** Menambah kolom yang dibutuhkan backend PHP
```sql
-- Import ketiga: tambah kolom is_active, last_login
-- File: database/02_fix_users_flags.sql
```

**Yang ditambahkan:**
- `users.is_active TINYINT(1) DEFAULT 1`
- `users.last_login DATETIME NULL`
- `posts.is_active TINYINT(1) DEFAULT 1`
- `stories.is_active TINYINT(1) DEFAULT 1`

### 4. 03_fix_user_sessions.sql
**Tujuan:** Migrasi user_sessions ke token hashing yang aman
```sql
-- Import keempat: perbaiki session management
-- File: database/03_fix_user_sessions.sql
```

**Yang diperbaiki:**
- Ganti `token` dengan `token_hash CHAR(64)`
- Tambah `expires_at DATETIME NOT NULL`
- Update indexes untuk performa
- Cleanup session expired

## 🧪 Verifikasi Setelah Import

Jalankan query ini di phpMyAdmin untuk memastikan import berhasil:

```sql
-- Cek jumlah data
SELECT 'users' as tabel, COUNT(*) as jumlah FROM users
UNION SELECT 'posts', COUNT(*) FROM posts  
UNION SELECT 'hashtags', COUNT(*) FROM hashtags
UNION SELECT 'likes', COUNT(*) FROM likes
UNION SELECT 'stories', COUNT(*) FROM stories;

-- Cek struktur tabel users
DESCRIBE users;

-- Cek struktur user_sessions
DESCRIBE user_sessions;

-- Cek akun demo bisa login
SELECT username, email, is_active FROM users WHERE email = 'alice@arnverse.com';
```

**Expected Results:**
- users: 3 records
- posts: 4+ records  
- hashtags: 10+ records
- likes: 6+ records
- stories: 3+ records

## ⚠️ Troubleshooting

### Error: Table doesn't exist
- **Solusi:** Import 00_schema.sql terlebih dahulu

### Error: Column 'is_active' doesn't exist  
- **Solusi:** Import 02_fix_users_flags.sql

### Error: Duplicate entry
- **Solusi:** File seed idempotent, aman dijalankan berulang

### Error: Cannot add foreign key constraint
- **Solusi:** Pastikan urutan import sesuai, 00_schema.sql → 01_seed.sql

## 🚀 Ready untuk Production

Setelah semua file diimport dengan sukses:

1. **Test login:** `alice@arnverse.com` / `password`
2. **Test API:** `GET /api/auth.php` dengan Bearer token
3. **Test feed:** `GET /api/feed.php` menampilkan posts
4. **Test stories:** `GET /api/stories.php` menampilkan stories aktif

Database siap untuk deployment! 🎉