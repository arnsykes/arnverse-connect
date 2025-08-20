# 🗄️ ARNVERSE Database - Urutan Import

**PENTING**: Import file SQL harus berurutan untuk menghindari dependency error.

## 📋 Urutan Import (WAJIB)

### 1. Schema Struktur
```sql
database/00_schema.sql
```
- ✅ Membuat semua tabel inti
- ✅ Index dan constraints
- ✅ Struktur relasi antar tabel

### 2. Data Seed  
```sql
database/01_seed.sql
```
- ✅ User demo (alice, bob, charlie)
- ✅ Hashtag populer
- ✅ Post contoh
- ✅ Relasi follows, likes, comments
- ✅ Stories dan chat data

### 3. Migrasi & Patches
```sql
database/02_fix_users_flags.sql
```
- ✅ Kolom `is_active` di tabel users
- ✅ Index tambahan untuk performa
- ✅ Record migrations

### 4. Stored Procedures (Opsional)
```sql
database/02_migrations.sql
```
- ✅ Maintenance procedures
- ✅ Auto cleanup functions
- ✅ Migration tracking

## 🔍 Verifikasi Setelah Import

```sql
-- 1. Cek struktur tabel users
DESCRIBE users;
-- Harus ada kolom: is_active TINYINT(1) DEFAULT 1

-- 2. Cek jumlah data seed
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM posts) as posts_count,
  (SELECT COUNT(*) FROM hashtags) as hashtags_count,
  (SELECT COUNT(*) FROM likes WHERE likeable_type='post') as likes_count;
-- Expected: users=3, posts≥4, hashtags=10, likes≥6

-- 3. Test user login demo
SELECT username, email, is_active, is_verified 
FROM users WHERE email = 'alice@arnverse.com';
-- Expected: alice_cosmic, is_active=1, is_verified=1

-- 4. Cek migrasi tercatat
SELECT migration, batch, ran_at FROM migrations ORDER BY ran_at;
-- Harus ada record migrations
```

## ⚠️ Error Handling

### "Table already exists"
- ✅ **Normal** - semua tabel menggunakan `CREATE TABLE IF NOT EXISTS`
- ✅ Lanjutkan import file berikutnya

### "Unknown column 'is_active'"  
- ❌ File 02_fix_users_flags.sql belum diimport
- 🔧 Import file tersebut sebelum test API login

### "Duplicate entry" di seed data
- ✅ **Normal** - seed menggunakan `INSERT IGNORE` dan `WHERE NOT EXISTS`
- ✅ Data tidak akan duplikat

### Foreign key constraint fails
- ❌ Urutan import salah atau ada file tertinggal
- 🔧 Drop semua tabel, import ulang berurutan

## 🧪 Test Commands

```sql
-- Test password hash (harus return 1)
SELECT password_verify('password', password_hash) as is_valid
FROM users WHERE email = 'alice@arnverse.com';

-- Test relasi posts-likes
SELECT p.content, COUNT(l.id) as likes_count
FROM posts p
LEFT JOIN likes l ON l.likeable_type = 'post' AND l.likeable_id = p.id
GROUP BY p.id;

-- Test hashtag relationships
SELECT h.name, COUNT(ph.post_id) as posts_count
FROM hashtags h
LEFT JOIN post_hashtags ph ON ph.hashtag_id = h.id  
GROUP BY h.id;
```

## 🔄 Reset Database (Jika Perlu)

```sql
-- DANGER: Hapus semua data (untuk fresh start)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS migrations, system_settings, user_sessions, 
  user_settings, public_chat_messages, messages, chat_participants, 
  chats, notifications, bookmarks, story_likes, story_views, stories, 
  likes, comments, post_hashtags, posts, hashtags, follows, users;
SET FOREIGN_KEY_CHECKS = 1;

-- Kemudian import ulang: 00_schema.sql → 01_seed.sql → 02_fix_users_flags.sql
```

---

**💡 Tips**: Gunakan phpMyAdmin import dengan encoding **UTF-8** dan pastikan tidak ada timeout.