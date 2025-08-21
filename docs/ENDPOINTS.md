# ARNVERSE API Endpoints Documentation

**Base URL:** `https://armworld.space/api`  
**Content-Type:** `application/json` atau `application/x-www-form-urlencoded` untuk login  
**Authentication:** Bearer token di header `Authorization: Bearer {token}`

## 📋 Response Format Standar

Semua endpoint mengembalikan JSON dengan format konsisten:

```json
{
  "ok": true|false,
  "data": {...},
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

## 🔐 Authentication Endpoints

### POST `/login.php`
**Deskripsi:** Login dengan email dan password  
**Content-Type:** `application/x-www-form-urlencoded`  
**Body:**
```
email=alice@arnverse.com&password=password
```

**Response Success:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": 3,
      "username": "alice_cooper",
      "display_name": "Alice Cooper",
      "email": "alice@arnverse.com",
      "avatar": null,
      "is_verified": true,
      "is_admin": false
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

### GET `/auth.php`
**Deskripsi:** Verifikasi token dan ambil profil user saat ini  
**Headers:** `Authorization: Bearer {token}`

**Response Success:**
```json
{
  "ok": true,
  "data": {
    "id": 3,
    "username": "alice_cooper",
    "display_name": "Alice Cooper",
    "email": "alice@arnverse.com",
    "avatar": null,
    "is_verified": true,
    "is_admin": false
  }
}
```

### POST `/register.php`
**Deskripsi:** Registrasi akun baru  
**Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securepassword"
}
```

### POST `/logout.php`
**Deskripsi:** Logout dan invalidate token

---

## 📰 Feed Endpoints

### GET `/feed.php`
**Deskripsi:** Ambil daftar post dengan pagination  
**Query Parameters:**
- `limit` (integer, default: 20) - Jumlah post per halaman
- `cursor` (string, optional) - Cursor untuk pagination

**Example Request:**
```
GET /feed.php?limit=20&cursor=eyJpZCI6NH0
```

**Response Success:**
```json
{
  "ok": true,
  "data": [
    {
      "id": 4,
      "content": "Ini adalah contoh post dengan hashtag #react #nextjs",
      "media_urls": ["uploads/post_4_image1.jpg"],
      "hashtags": ["#react", "#nextjs"],
      "likes_count": 5,
      "comments_count": 3,
      "shares_count": 1,
      "views_count": 23,
      "is_liked": false,
      "is_saved": false,
      "created_at": "2025-08-20 15:30:00",
      "updated_at": "2025-08-20 15:30:00",
      "author": {
        "id": 3,
        "username": "charlie_ui",
        "display_name": "Charlie Designer",
        "avatar": null,
        "is_verified": true,
        "is_exclusive": false,
        "is_private": false
      }
    }
  ],
  "meta": {
    "nextCursor": "eyJpZCI6M30",
    "hasMore": true
  }
}
```

### POST `/post.php`
**Deskripsi:** Upload post baru  
**Content-Type:** `multipart/form-data`  
**Body (FormData):**
- `content` (string) - Teks post
- `media[]` (files, optional) - Upload gambar/video
- `hashtags` (string, optional) - Hashtags dipisah koma

---

## 💬 Comments Endpoints  

### GET `/get_comments.php`
**Deskripsi:** Ambil komentar untuk sebuah post  
**Query Parameters:**
- `post_id` (required) - ID post
- `cursor` (optional) - Pagination cursor

**Example Request:**
```
GET /get_comments.php?post_id=4&cursor=eyJpZCI6N30
```

**Response Success:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": 7,
        "content": "Komentar yang sangat menarik!",
        "created_at": "2025-08-20 16:15:00",
        "likes": 2,
        "author": {
          "id": 5,
          "username": "david_dev",
          "display_name": "David Developer",
          "avatar": null,
          "is_verified": false
        }
      }
    ],
    "nextCursor": "eyJpZCI6Nn0"
  }
}
```

### POST `/comment_post.php`
**Deskripsi:** Tambah komentar pada post  
**Body:**
```json
{
  "post_id": "4",
  "content": "Ini adalah komentar baru"
}
```

---

## ❤️ Like/Interaction Endpoints

### POST `/like_post.php`
**Deskripsi:** Like/unlike post (toggle)  
**Body:**
```json
{
  "post_id": "4"
}
```

**Response Success:**
```json
{
  "ok": true,
  "data": {
    "is_liked": true,
    "likes_count": 6
  }
}
```

---

## 📖 Stories Endpoints

### GET `/stories.php`
**Deskripsi:** Ambil daftar stories aktif (belum expired)

**Response Success:**
```json
{
  "ok": true,
  "data": [
    {
      "id": 12,
      "media_url": "uploads/story_12.jpg",
      "media_type": "image",
      "content": "Story content text",
      "duration": 15,
      "created_at": "2025-08-20 14:00:00",
      "expired_at": "2025-08-21 14:00:00",
      "is_viewed": false,
      "author": {
        "id": 3,
        "username": "alice_cooper",
        "display_name": "Alice Cooper",
        "avatar": null,
        "is_verified": true
      }
    }
  ]
}
```

### POST `/story_view.php`
**Deskripsi:** Tandai story sudah dilihat  
**Body:**
```json
{
  "story_id": "12"
}
```

---

## 👤 Profile Endpoints

### GET `/profile.php`
**Deskripsi:** Ambil profil user berdasarkan username  
**Query Parameters:**
- `username` (required) - Username target

**Example Request:**
```
GET /profile.php?username=alice_cooper
```

---

## 💬 Messages/Chat Endpoints

### GET `/load_messages.php`
**Deskripsi:** Ambil pesan dalam chat tertentu  
**Query Parameters:**
- `chat_id` (required) - ID chat room
- `cursor` (optional) - Pagination cursor

### POST `/send_message.php`
**Deskripsi:** Kirim pesan ke chat  
**Body:**
```json
{
  "chat_id": "room_123",
  "content": "Hello world!",
  "media_url": "uploads/image.jpg"
}
```

---

## 🔔 Notification Endpoints

### GET `/notifications.php`
**Deskripsi:** Ambil daftar notifikasi user  
**Query Parameters:**
- `page` (integer, default: 1) - Halaman

### POST `/mark_notifications_read.php`
**Deskripsi:** Tandai notifikasi sudah dibaca  
**Body:**
```json
{
  "notification_ids": ["1", "2", "3"]
}
```

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Token invalid/expired |
| `VALIDATION_ERROR` | Input data tidak valid |
| `NOT_FOUND` | Resource tidak ditemukan |
| `RATE_LIMITED` | Terlalu banyak request |
| `SERVER_ERROR` | Error internal server |
| `PERMISSION_DENIED` | User tidak punya akses |

---

## 📝 Catatan Penting

1. **Authentication:** Semua endpoint (kecuali login/register) memerlukan Bearer token
2. **Rate Limiting:** Max 100 request per menit per user
3. **File Upload:** Max 10MB per file, format: JPG, PNG, WebP, MP4
4. **Pagination:** Menggunakan cursor-based pagination untuk performa yang lebih baik
5. **Timestamps:** Semua timestamp dalam format `YYYY-MM-DD HH:mm:ss` (Asia/Jakarta)
6. **Field Naming:** API response menggunakan `snake_case`, frontend mengkonversi ke `camelCase`