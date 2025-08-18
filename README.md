# ARNVERSE - Cosmic Social Universe

A modern, mobile-first social media platform built with React, TypeScript, and Tailwind CSS. ARNVERSE provides a beautiful, performant frontend that integrates seamlessly with a PHP backend API.

## 🌟 Features

- **Cosmic UI Design**: Beautiful glass morphism effects with cosmic gradients and neon glows
- **Mobile-First**: Responsive design with bottom tabbar on mobile, sidebar on desktop
- **Real-time Feel**: Optimistic updates with 5-second polling for live content
- **Stories & Posts**: Instagram-style stories with autoplay and comprehensive feed
- **Direct Messaging**: Group chats, media sharing, and message management
- **Exclusive Content**: Badge system for premium content creators
- **Dark/Light Mode**: Seamless theme switching with cosmic variants

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui with cosmic customizations
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: React Router DOM v6
- **API Integration**: Fetch with credential-based sessions
- **Animations**: CSS animations with glass morphism effects

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- PHP backend API (separate repository)
- Domain with SSL for cookie-based authentication

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
NEXT_PUBLIC_MEDIA_BASE_URL=https://your-domain.com/uploads

# Optional: Enable development features
NODE_ENV=development
```

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd arnverse-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🏗️ Architecture

### SSR/CSR Strategy
- **SSR**: Feed and profile pages for SEO and initial load performance
- **CSR**: Interactive features (likes, comments, DMs, story viewer)
- **Caching**: TanStack Query with 5-minute stale time, background refetch

### Authentication Flow
- Cookie-based sessions with PHP backend
- All requests include `credentials: 'include'`
- Automatic token refresh and error handling
- Secure logout with server-side session destruction

### API Integration
The frontend consumes a PHP REST API with the following endpoints:

#### Authentication
- `GET /api/auth.php` - Get current user
- `POST /api/login.php` - Login user  
- `POST /api/register.php` - Register new user
- `POST /api/logout.php` - Logout user

#### Posts & Content
- `GET /api/feed.php` - Get paginated feed
- `POST /api/upload_post.php` - Upload new post (form-data)
- `POST /api/like_post.php` - Like/unlike post
- `POST /api/comment_post.php` - Add comment
- `GET /api/get_comments.php` - Get post comments

#### Stories
- `GET /api/stories.php` - Get user stories
- `POST /api/upload_story.php` - Upload story (form-data)
- `POST /api/story_view.php` - Mark story as viewed
- `GET /api/story_viewer.php` - Get story viewers

#### Messages & Chat
- `POST /api/send_message.php` - Send DM/group message
- `GET /api/load_messages.php` - Get chat messages
- `POST /api/create_group.php` - Create group chat
- `GET /api/check_inbox_events.php` - Check for new messages

All API responses follow the format:
```json
{
  "ok": true,
  "data": { ... },
  "error": null,
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

## 🎨 Design System

### Color Palette
```css
/* Cosmic Primary Colors */
--primary: hsl(250, 100%, 60%);        /* Deep cosmic purple */
--primary-variant: hsl(280, 100%, 70%); /* Brighter purple */
--accent: hsl(320, 100%, 65%);          /* Neon pink */
--accent-variant: hsl(340, 100%, 70%);  /* Bright pink */

/* Surface & Glass */
--surface: hsl(240, 5%, 96%);           /* Light glass base */
--glass-bg: hsl(240, 10%, 99% / 0.7);  /* Translucent glass */
--glass-border: hsl(240, 20%, 80% / 0.2); /* Subtle borders */
```

### Component Variants
```tsx
// Cosmic gradient buttons
<Button variant="cosmic">Primary Action</Button>
<Button variant="accent">Secondary Action</Button>
<Button variant="glass">Glass Button</Button>

// Glass morphism cards
<Card className="glass hover-lift">
  <CardContent>Beautiful glass effect</CardContent>
</Card>
```

### Animations & Effects
- `hover-lift`: Subtle lift on hover
- `hover-glow`: Neon glow effect
- `neon-glow`: Continuous cosmic glow
- `animate-float`: Gentle floating animation
- `glass` / `glass-strong`: Glass morphism backgrounds

## 📱 Mobile Experience

### Bottom Tab Navigation
- Home (Feed)
- Search (Explore)  
- Create (Post/Story)
- Inbox (Messages)
- Profile

### Touch Interactions
- **Story Viewer**: Tap left/right for navigation, hold to pause, swipe up for actions
- **Pull to Refresh**: Native-feeling refresh on feed
- **Infinite Scroll**: Smooth loading with skeleton states

## 🔒 Security Features

### Client-Side Validation
- Video duration limit (≤60s) before upload
- File type and size validation
- Content sanitization for user inputs
- XSS prevention with proper escaping

### API Security
- CSRF protection headers
- Credential-based authentication
- Input validation and sanitization
- Rate limiting for uploads and actions

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_API_BASE_URL
# - NEXT_PUBLIC_MEDIA_BASE_URL
```

### Traditional Hosting (cPanel/VPS)
```bash
# Build for production
npm run build

# Upload dist/ folder to your web server
# Configure nginx/apache to serve the SPA
# Set up environment variables
```

### Domain Configuration
For cross-domain setup:
1. Enable CORS on PHP API with frontend origin
2. Set `SameSite=None; Secure` for cookies
3. Use HTTPS for both domains

Alternative: Use Next.js API routes as proxy:
```typescript
// pages/api/proxy/[...path].ts
export default async function handler(req, res) {
  const response = await fetch(`${PHP_API_URL}/${path}`, {
    method: req.method,
    headers: { 'Cookie': req.headers.cookie },
    body: req.body
  });
  
  // Forward response and set cookies
  res.status(response.status).json(await response.json());
}
```

## 📋 Development Checklist

### Core Features ✅
- [x] Responsive layout with mobile tabbar
- [x] Glass morphism design system  
- [x] Feed with infinite scroll
- [x] Story bubbles and viewer
- [x] Post interactions (like, comment, share)
- [x] Profile pages with post grid
- [x] Search and explore functionality
- [x] Dark/light mode toggle

### API Integration ⏳
- [ ] Authentication flow
- [ ] Post upload with progress
- [ ] Story upload and viewing
- [ ] Direct messaging system
- [ ] Real-time notifications
- [ ] Username change restrictions
- [ ] File upload validation

### Advanced Features 🔄
- [ ] Push notifications
- [ ] WebSocket integration
- [ ] Offline support with PWA
- [ ] Advanced search filters
- [ ] Content moderation tools
- [ ] Analytics integration

## 🧪 Testing

### Acceptance Tests
1. **Authentication Flow**: Login → Create post → Like → Comment → Share to DM
2. **Story Features**: Upload story → View by others → Notifications
3. **Username Change**: Attempt change within 7 days (should fail)
4. **Media Validation**: Upload video >60s (client rejection)
5. **Exclusive Badge**: Verify badge appears in all contexts
6. **Story Deduplication**: Check story bubbles dedupe and reorder after viewing

### Manual Testing Checklist
- [ ] Mobile responsive design
- [ ] Glass morphism effects in dark/light mode
- [ ] Story viewer touch interactions
- [ ] Feed infinite scroll performance
- [ ] Real-time updates with 5s polling
- [ ] File upload progress indication
- [ ] Error handling and user feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/cosmic-feature`)
3. Follow the design system guidelines
4. Test on mobile and desktop
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🌌 About ARNVERSE

ARNVERSE represents the next evolution of social media - a platform where authentic connections flourish in a beautifully crafted digital cosmos. Built with performance, accessibility, and user experience at its core.

**Connect. Create. Explore the Universe.**