# 🌌 ARNVERSE - Cosmic Social Universe

**ARNVERSE** adalah platform media sosial modern dengan tema kosmik yang menghubungkan pengguna dalam alam semesta digital. Aplikasi ini dibangun dengan teknologi web terkini dan menyediakan fitur lengkap seperti feed posting, stories 24 jam, messaging, dan eksplorasi konten.

## ✨ Fitur Utama

🚀 **Feed Sosial**  
- Infinite scrolling feed dengan konten terbaru
- Like, comment, dan share ke DM internal
- Upload post dengan media (gambar/video)
- Interaksi real-time dan optimistic UI

📖 **Stories 24 Jam**  
- Upload dan view stories dengan auto-expire
- Multi-media support (gambar & video ≤60 detik)
- Story viewer dengan tap navigation
- View counter dan seen status

💬 **Messaging System**  
- Direct messaging (DM) antar user
- Group chat dengan invite by username
- Real-time chat dengan polling
- Media sharing dalam chat

🔍 **Eksplorasi & Discovery**  
- Explore trending content
- User search dan discovery
- Profile customization
- Dark/Light mode support

## 🛠️ Tech Stack

**Frontend:**
- ⚛️ React 18 + TypeScript
- ⚡ Vite (build tool)
- 🎨 Tailwind CSS + Shadcn/UI
- 🧭 React Router (SPA routing)
- 📡 TanStack Query (data fetching)
- 🗂️ Zustand (state management)

**Backend:**
- 🐘 PHP 8+ dengan MySQL
- 🔐 JWT Authentication
- 📁 File upload handling
- 🛡️ Security (XSS, CSRF, SQLi protection)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ dan npm
- PHP 8+ dengan MySQL (untuk backend)
- Web server (Apache/Nginx/LiteSpeed)

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd arnverse-frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local sesuai kebutuhan

# Start development server
npm run dev
```

### Production Build

```bash
# Build untuk produksi
npm run build

# Preview build
npm run preview
```

## 🌐 Deploy ke cPanel/LiteSpeed

### Prasyarat Deploy
- cPanel hosting dengan PHP 8+ dan MySQL 
- Database sudah dibuat di cPanel (contoh: `arnn8651_arnverse`)
- phpMyAdmin akses untuk import SQL
- Node.js 18+ di lokal untuk build

### Langkah-langkah Deploy

#### 1. **Persiapan Database**
```bash
# Di phpMyAdmin, pilih database yang sudah dibuat
# Import berurutan (PENTING: urutan harus tepat):
1. Import database/00_schema.sql    # Struktur tabel
2. Import database/01_seed.sql      # Data demo  
3. Import database/02_fix_users_flags.sql  # Fix kolom is_active
```

#### 2. **Build Frontend**
```bash
# Di lokal, build aplikasi React
npm ci
npm run build

# Upload isi folder dist/ ke /public_html/arnworld.space/
# Pastikan struktur:
# /public_html/arnworld.space/
#   ├── index.html
#   ├── assets/
#   └── .htaccess
```

#### 3. **Upload Backend API**
```bash
# Upload folder api/ ke /public_html/arnworld.space/api/
# Set permission:
# - Folder api/: 0755
# - File *.php: 0644
```

#### 4. **Konfigurasi Environment**
```bash
# Buat file api/.env dengan isi:
DB_HOST=localhost
DB_NAME=arnn8651_arnverse  # sesuaikan dengan nama DB Anda
DB_USER=arnn8651_arnverse  # sesuaikan dengan user DB Anda  
DB_PASS=your_db_password   # password DB cPanel
JWT_SECRET=your_jwt_secret_32_chars_min

# Generate JWT_SECRET dengan:
# php -r "echo bin2hex(random_bytes(32));"
```

#### 5. **Upload .htaccess untuk SPA Routing**
```apache
# Pastikan file .htaccess ada di root (/public_html/arnworld.space/.htaccess)
# dengan konten yang mendukung React Router
```

#### 6. **Testing Deployment**
```bash
# Test routing SPA:
https://arnworld.space/login     # Harus tidak 404

# Test API:
POST https://arnworld.space/api/login.php
{
  "email": "alice@arnverse.com",
  "password": "password"
}
# Response: {"ok": true, "data": {...}}

# Test database:
# Login dengan akun demo: alice@arnverse.com / password
```

### Troubleshooting cPanel

🔧 **404 pada /login atau routes lain**
- Pastikan `index.html` ada di root domain
- Cek `.htaccess` ada dan benar
- Purge cache LiteSpeed di cPanel → LiteSpeed Cache

🔧 **500 Error pada API**  
- Cek `error_log` di cPanel File Manager
- Pastikan `api/.env` ada dengan kredensial DB benar
- Cek permission folder `api/` = 0755, file `*.php` = 0644

🔧 **Database Error "Unknown column 'is_active'"**
- Import `02_fix_users_flags.sql` untuk menambah kolom yang hilang
- Pastikan urutan import SQL benar: schema → seed → fix

🔧 **Login API Error**
- Cek kredensial database di `api/.env`  
- Pastikan user demo ada: `SELECT * FROM users WHERE email='alice@arnverse.com'`
- Test hash password: `SELECT password_verify('password', password_hash) FROM users...`

## 📖 API Integration

Aplikasi ini terintegrasi dengan backend PHP melalui REST API:

```typescript
// Base API URL
const API_BASE = '/api';

// Contoh endpoint:
POST /api/login.php      // Login
GET  /api/feed.php       // Get posts
POST /api/post.php       // Create post
GET  /api/stories.php    // Get stories
POST /api/send_message.php // Send message
```

Format response API:
```json
{
  "ok": true,
  "data": { /* data object */ },
  "error": null
}
```

## 🧪 Testing

### Manual Testing
```bash
# Test dengan akun seed:
Email: alice@arnverse.com
Password: password

# Test flow:
1. Register → Login → Homepage
2. Create post → Like → Comment
3. Upload story → View stories
4. Send message → Chat
5. Logout → Login ulang
```

### Automated Testing
```bash
# Run E2E tests (jika tersedia)
npm run test:e2e

# Run unit tests
npm run test
```

## 📱 Browser Support

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  
📱 Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Design System

ARNVERSE menggunakan design system kustom dengan tema kosmik:

```css
/* Warna utama */
--primary: 250 100% 60%;          /* Cosmic blue */
--accent: 320 100% 65%;           /* Neon pink */
--background: 240 10% 98%;        /* Light cosmic */

/* Dark mode */
--background: 240 15% 8%;         /* Dark cosmic */
```

Komponen UI menggunakan Shadcn/UI dengan customization cosmic theme.

## 📁 Struktur Project

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI components
│   ├── layout/         # Layout components (Header, Sidebar)
│   ├── feed/           # Feed-related components
│   └── stories/        # Story components
├── pages/              # Route pages
├── hooks/              # Custom React hooks
├── lib/                # Utilities (API client, utils)
├── store/              # State management (Zustand)
└── assets/             # Static assets
```

## 🔧 Configuration

### Environment Variables
```bash
VITE_API_BASE=https://arnworld.space/api      # API endpoint
VITE_MEDIA_BASE=https://arnworld.space/uploads # Media URL
VITE_USE_HASH_ROUTER=false                     # Router type
VITE_DEBUG_MODE=false                          # Debug logging
```

### Vite Config
```typescript
// vite.config.ts
export default defineConfig({
  base: "/",                    // Base path
  build: { outDir: "dist" },    # Build output
  // ...custom configuration
});
```

## 🛡️ Security Features

- 🔐 JWT token authentication
- 🛡️ XSS protection dengan input sanitization
- 🚫 CSRF protection
- 📁 Secure file upload dengan validation
- 🔒 Rate limiting untuk API calls
- 👤 Authorization checks per endpoint

## 📊 Performance

- ⚡ Code splitting dengan dynamic imports
- 🖼️ Lazy loading untuk images
- 📱 Mobile-first responsive design
- 🗜️ Gzip compression
- 💾 Efficient caching strategy
- 🔄 Optimistic UI updates

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Untuk bug reports dan feature requests:
- 🐛 Buat issue di GitHub
- 💬 Diskusi di GitHub Discussions
- 📧 Email support

---

**Dibuat dengan ❤️ untuk cosmic social experience**

🌌 **ARNVERSE - Connect in the Cosmic Digital Universe** 🌌