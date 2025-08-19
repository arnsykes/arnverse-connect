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

## 🌐 Deploy ke cPanel

Lihat panduan lengkap di **[DEPLOY-CPANEL.md](./DEPLOY-CPANEL.md)** untuk instruksi deploy ke shared hosting cPanel.

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