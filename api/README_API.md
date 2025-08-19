# ARNVERSE API Documentation

## Deskripsi
Backend API PHP untuk platform sosial media ARNVERSE. API ini menyediakan endpoint lengkap untuk autentikasi, manajemen konten, interaksi sosial, dan messaging.

## Struktur Folder
```
api/
├── _env.php           # Konfigurasi environment
├── _db.php            # Koneksi database PDO
├── _auth.php          # Helper autentikasi JWT
├── _response.php      # Helper response JSON
├── _util.php          # Utility functions
├── .htaccess          # Konfigurasi Apache/LiteSpeed
├── .env.example       # Template environment variables
├── uploads/           # Folder untuk file upload
│   ├── avatars/       # Avatar users
│   ├── posts/         # Media posts
│   ├── stories/       # Media stories
│   └── messages/      # Media messages
└── [endpoint files]   # File endpoint individual
```

## Format Response Standar
Semua endpoint mengembalikan JSON dengan format:
```json
{
  "ok": true|false,
  "data": {...} | [],
  "error": null | "PESAN_ERROR",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

## Autentikasi
- Menggunakan JWT (JSON Web Token)
- Token dikirim via header: `Authorization: Bearer <token>`
- Token expire dalam 7 hari (default)
- Endpoint yang memerlukan auth akan mengembalikan 401 jika token invalid

## Endpoint API

### Health Check
**GET** `/api/health.php`
- Cek status API dan koneksi database
- Public endpoint (tidak perlu auth)

### Autentikasi

#### Register
**POST** `/api/register.php`
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "display_name": "John Doe",
  "password": "password123"
}
```

#### Login
**POST** `/api/login.php`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Check Auth
**GET** `/api/auth.php`
- Headers: `Authorization: Bearer <token>`

#### Logout
**POST** `/api/logout.php`
- Headers: `Authorization: Bearer <token>`

### Feed & Posts

#### Get Feed
**GET** `/api/feed.php?page=1&limit=20&q=search`
- Optional auth (untuk personalized feed)
- Parameters: page, limit, q (search query)

#### Create Post
**POST** `/api/post.php` (multipart/form-data)
- Headers: `Authorization: Bearer <token>`
- Fields:
  - `content` (text, required)
  - `media[]` (files, optional, multiple)

#### Like/Unlike Post
**POST** `/api/like_post.php`
- Headers: `Authorization: Bearer <token>`
```json
{
  "post_id": 123
}
```

#### Comment on Post
**POST** `/api/comment_post.php`
- Headers: `Authorization: Bearer <token>`
```json
{
  "post_id": 123,
  "content": "Nice post!",
  "parent_id": 456
}
```

#### Get Comments
**GET** `/api/get_comments.php?post_id=123&page=1&limit=20`
- Optional auth
- Parameters: post_id (required), page, limit, parent_id

### Stories

#### Get Stories
**GET** `/api/stories.php`
- Optional auth (untuk is_viewed status)

#### Upload Story
**POST** `/api/stories.php` (multipart/form-data)
- Headers: `Authorization: Bearer <token>`
- Fields:
  - `media` (file, required)
  - `duration` (number, optional, 1-30 seconds)

#### Mark Story Viewed
**POST** `/api/story_view.php`
- Headers: `Authorization: Bearer <token>`
```json
{
  "story_id": 123
}
```

### Messaging

#### Get Inbox
**GET** `/api/inbox.php?page=1&limit=20`
- Headers: `Authorization: Bearer <token>`

#### Load Messages
**GET** `/api/load_messages.php?chat_id=123&page=1&limit=20`
- Headers: `Authorization: Bearer <token>`

#### Send Message
**POST** `/api/send_message.php`
- Headers: `Authorization: Bearer <token>`
```json
{
  "chat_id": 123,
  "content": "Hello!",
  "reply_to_id": 456
}
```
Atau untuk DM baru:
```json
{
  "target_user_id": 789,
  "content": "Hello!"
}
```

#### Create Group
**POST** `/api/create_group.php`
- Headers: `Authorization: Bearer <token>`
```json
{
  "name": "My Group",
  "participant_ids": [456, 789, 101]
}
```

### Notifications

#### Get Notifications
**GET** `/api/notifications.php?page=1&limit=20`
- Headers: `Authorization: Bearer <token>`

#### Mark as Read
**POST** `/api/notifications.php`
- Headers: `Authorization: Bearer <token>`
```json
{
  "notification_ids": [123, 456],
  "mark_all_as_read": false
}
```

### Profile

#### Get Profile
**GET** `/api/profile.php?username=johndoe`
- Optional auth (untuk own profile detail)
- Jika tidak ada username, return current user profile

#### Update Profile
**POST** `/api/profile.php` (multipart/form-data)
- Headers: `Authorization: Bearer <token>`
- Fields:
  - `display_name` (text, optional)
  - `bio` (text, optional)
  - `avatar` (file, optional)

### Hashtags

#### Get Trending Hashtags
**GET** `/api/hashtags.php?trending=true&search=tech&page=1&limit=20`
- Public endpoint

## Contoh Penggunaan dengan cURL

### 1. Health Check
```bash
curl -X GET "https://arnworld.space/api/health.php"
```

### 2. Register
```bash
curl -X POST "https://arnworld.space/api/register.php" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "display_name": "Test User",
    "password": "password123"
  }'
```

### 3. Login
```bash
curl -X POST "https://arnworld.space/api/login.php" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Get Feed (dengan auth)
```bash
curl -X GET "https://arnworld.space/api/feed.php?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Create Post dengan Media
```bash
curl -X POST "https://arnworld.space/api/post.php" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -F "content=Hello World! #test" \\
  -F "media[]=@/path/to/image.jpg"
```

### 6. Like Post
```bash
curl -X POST "https://arnworld.space/api/like_post.php" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"post_id": 1}'
```

## Error Codes & HTTP Status

| Status | Keterangan |
|--------|------------|
| 200    | OK - Request berhasil |
| 201    | Created - Resource berhasil dibuat |
| 400    | Bad Request - Parameter tidak valid |
| 401    | Unauthorized - Token tidak valid/expired |
| 404    | Not Found - Resource tidak ditemukan |
| 422    | Validation Error - Data tidak valid |
| 429    | Too Many Requests - Rate limit exceeded |
| 500    | Internal Server Error - Error server |

## Rate Limiting
- Create Post: 10 posts per jam
- Like Action: 30 likes per menit  
- Comment: 10 komentar per 5 menit
- Send Message: 20 pesan per menit
- Upload Story: 5 stories per jam
- Update Profile: 5 updates per jam
- Create Group: 3 grup per jam

## Upload Limits
- Ukuran file maksimal: 10MB
- Format yang didukung:
  - Gambar: JPEG, PNG, GIF
  - Video: MP4, QuickTime
  - Audio: MP3, WAV (untuk messages)

## Setup Development

### 1. Persiapan Database
```bash
# Import database schema
mysql -u username -p database_name < database/Database.sql
mysql -u username -p database_name < database/MIGRATIONS.sql
mysql -u username -p database_name < database/SEED_DATA.sql
```

### 2. Konfigurasi Environment
```bash
# Copy dan edit file environment
cp api/.env.example api/.env
# Edit sesuai konfigurasi database Anda
```

### 3. Setup Permissions
```bash
# Set permission untuk upload folder
chmod 755 api/uploads/
chmod 755 api/uploads/avatars/
chmod 755 api/uploads/posts/
chmod 755 api/uploads/stories/
chmod 755 api/uploads/messages/

# Set permission untuk .env
chmod 600 api/.env
```

### 4. Test API
```bash
# Test health check
curl https://arnworld.space/api/health.php

# Test dengan user seed data
curl -X POST "https://arnworld.space/api/login.php" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "alice@arnverse.com",
    "password": "password"
  }'
```

## Deploy ke Production (cPanel)

### 1. Upload Files
- Upload seluruh folder `api/` ke `/public_html/arnworld.space/api/`
- Pastikan struktur: `/public_html/arnworld.space/api/login.php`, dll.

### 2. Setup Database
- Import file SQL melalui phpMyAdmin atau CLI
- Update kredensial database di `api/.env`

### 3. Set Permissions
```bash
# Via File Manager cPanel atau SSH
chmod 755 api/uploads/
chmod 755 api/uploads/*/
chmod 644 api/*.php
chmod 600 api/.env
```

### 4. Test Production
- Buka https://arnworld.space/api/health.php
- Test endpoint dengan data seed

## Troubleshooting

### 1. CORS Issues
Jika frontend berbeda domain, uncomment kode CORS di `_response.php`:
```php
function setCorsHeaders() { 
    header('Access-Control-Allow-Origin: *'); 
    // ... 
}
```

### 2. Upload Issues  
- Cek permission folder uploads (755)
- Cek `upload_max_filesize` di php.ini
- Cek `post_max_size` di php.ini

### 3. JWT Issues
- Pastikan `JWT_SECRET` di `.env` adalah string yang kuat
- Cek timestamp server (JWT expire)

### 4. Database Issues
- Cek kredensial di `.env`
- Pastikan database dan tabel sudah ter-import
- Cek koneksi PDO di `health.php`

### 5. 500 Errors
- Cek error log server: `/var/log/apache2/error.log` atau cPanel Error Logs
- Enable PHP error display untuk debugging:
```php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

## Security Notes
- Ganti `JWT_SECRET` dengan string random yang kuat
- Set permission `.env` ke 600 (read-only owner)
- Validate semua input user
- Use prepared statements untuk query database
- Set rate limiting di production
- Enable HTTPS di production
- Regular backup database

## Support
Untuk pertanyaan atau issues, hubungi developer atau buat issue di repository project.