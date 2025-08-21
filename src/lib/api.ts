// ===================================================================
// ARNVERSE API Client - PHP Backend Integration with Validation
// Menangani semua komunikasi dengan backend PHP di /api
// ===================================================================

import type { PostUI } from '@/types/social';
import { mapApiPosts, mapApiComments, mapApiStories } from '@/lib/mappers';
import { 
  validateApiResponse, 
  FeedResponseSchema,
  CommentsResponseSchema,
  StoriesResponseSchema,
  AuthResponseSchema
} from '@/lib/api/schema';

// Base URLs - ambil dari environment variables dengan fallback yang aman
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'https://armworld.space/api';
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE || 'https://armworld.space/uploads';

// Debug mode untuk development
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// API Response interface
interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Get token from localStorage
const getToken = () => localStorage.getItem('arn_token');

// Enhanced response handler with data normalization and validation
const handleApiResponse = (data: ApiResponse<any>, endpoint?: string) => {
  if (!data?.ok || !data?.data) {
    return data;
  }

  // Apply validation and mappers based on endpoint patterns
  try {
    if (endpoint?.includes('feed.php') && Array.isArray(data.data)) {
      // Validate structure but use original data for mapping to preserve types
      validateApiResponse(FeedResponseSchema, data, endpoint);
      data.data = mapApiPosts(data.data);
    } else if (endpoint?.includes('get_comments.php') && data?.data?.items) {
      // Validate structure but use original data for mapping  
      validateApiResponse(CommentsResponseSchema, data, endpoint);
      data.data = { ...data.data, items: mapApiComments(data.data.items) };
    } else if (endpoint?.includes('stories.php') && Array.isArray(data.data)) {
      // Validate structure but use original data for mapping
      validateApiResponse(StoriesResponseSchema, data, endpoint);
      data.data = mapApiStories(data.data);
    } else if (endpoint?.includes('auth.php') || endpoint?.includes('login.php')) {
      // For auth endpoints, keep original validation logic
      const validated = validateApiResponse(AuthResponseSchema, data, endpoint);
      if (validated?.data) {
        data.data = validated.data;
      }
    }
  } catch (error) {
    console.warn(`[API] Data mapping/validation failed for ${endpoint}:`, error);
    // Continue with original data as fallback
  }

  return data;
};

// ===================================================================
// Enhanced fetch wrapper dengan error handling dan auth
// ===================================================================
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Setup headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add authorization header jika token ada
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Debug log untuk development
    if (DEBUG_MODE) {
      console.log(`[API] ${options.method || 'GET'} ${url}`, {
        headers,
        body: options.body
      });
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    // Parse response JSON
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Invalid JSON response dari server');
    }
    
    // Debug log response
    if (DEBUG_MODE) {
      console.log(`[API] Response:`, data);
    }
    
    // Handle 401 globally - trigger logout otomatis
    if (response.status === 401) {
      console.warn('[API] Token expired atau invalid, logout otomatis');
      localStorage.removeItem('arn_token');
      
      // Redirect ke login hanya jika tidak sedang di halaman login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return { ok: false, error: 'UNAUTHORIZED' };
    }
    
    // Handle error responses dari server
    if (!response.ok || !data.ok) {
      const errorMsg = data.error || `HTTP ${response.status}`;
      if (DEBUG_MODE) {
        console.error('[API] Server error:', errorMsg);
      }
      throw new Error(errorMsg);
    }

    return handleApiResponse(data, endpoint);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Network error';
    console.error('[API] Request failed:', errorMsg);
    
    return {
      ok: false,
      error: errorMsg
    };
  }
}

// Upload handler for form-data (posts, stories, media)
async function uploadRequest<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  try {
    const token = getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData, // Don't set Content-Type for FormData
    });

    const data = await response.json();
    
    // Handle 401 globally
    if (response.status === 401) {
      localStorage.removeItem('arn_token');
      window.location.href = '/login';
      return { ok: false, error: 'UNAUTHORIZED' };
    }
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return handleApiResponse(data, endpoint);
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// ===================================================================
// Authentication API - sesuai dengan endpoint PHP backend
// ===================================================================
export const authApi = {
  // GET /api/auth.php - cek user saat ini berdasarkan token
  me: () => apiRequest('/auth.php'),
  
  // POST /api/login.php - login dengan email & password
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/login.php', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(credentials).toString(),
    }),
  
  // POST /api/register.php - daftar akun baru  
  register: (userData: { username: string; email: string; password: string }) =>
    apiRequest('/register.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  // POST /api/logout.php - logout (opsional, bisa cukup hapus token di client)
  logout: () => apiRequest('/logout.php', { method: 'POST' }),
};

// ===================================================================
// Posts API - feed, posting, like, comment
// ===================================================================
export const postsApi = {
  // GET /api/feed.php - ambil daftar post dengan pagination
  getFeed: (cursor?: string, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    return apiRequest<{ items: PostUI[]; nextCursor?: string }>(`/feed.php?${params.toString()}`);
  },
  
  // POST /api/post.php - upload post baru (form-data untuk media)
  upload: (formData: FormData) => uploadRequest('/post.php', formData),
  
  // PATCH /api/edit_post.php - edit post (opsional)
  edit: (postId: string, data: { content?: string; media?: string[] }) =>
    apiRequest(`/edit_post.php`, {
      method: 'PATCH',
      body: JSON.stringify({ id: postId, ...data }),
    }),
  
  // DELETE /api/delete_post.php - hapus post (opsional)
  delete: (postId: string) =>
    apiRequest(`/delete_post.php`, {
      method: 'DELETE',
      body: JSON.stringify({ id: postId }),
    }),
  
  // POST /api/like_post.php - like/unlike post (toggle)
  like: (postId: string) =>
    apiRequest('/like_post.php', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId }),
    }),
  
  // POST /api/comment_post.php - tambah komentar
  comment: (postId: string, content: string) =>
    apiRequest('/comment_post.php', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, content }),
    }),
  
  // GET /api/get_comments.php - ambil daftar komentar
  getComments: (postId: string, cursor?: string) => {
    const params = new URLSearchParams({ post_id: postId });
    if (cursor) params.append('cursor', cursor);
    
    return apiRequest(`/get_comments.php?${params.toString()}`);
  },
  
  // POST /api/share_post.php - share post ke DM/grup
  share: (postId: string, targetId?: string) =>
    apiRequest('/share_post.php', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, target_id: targetId }),
    }),
};

// ===================================================================
// Stories API - 24 jam stories dengan auto-expire
// ===================================================================
export const storiesApi = {
  // GET /api/stories.php - ambil daftar stories yang aktif
  getStories: () => apiRequest('/stories.php'),
  
  // POST /api/upload_story.php - upload story baru (form-data untuk media)
  upload: (formData: FormData) => uploadRequest('/upload_story.php', formData),
  
  // POST /api/story_like.php - like story (opsional)
  like: (storyId: string) =>
    apiRequest('/story_like.php', {
      method: 'POST',
      body: JSON.stringify({ story_id: storyId }),
    }),
  
  // POST /api/story_comment.php - comment story (opsional)
  comment: (storyId: string, content: string) =>
    apiRequest('/story_comment.php', {
      method: 'POST',
      body: JSON.stringify({ story_id: storyId, content }),
    }),
  
  // POST /api/story_view.php - tandai story sudah dilihat
  view: (storyId: string) =>
    apiRequest('/story_view.php', {
      method: 'POST',
      body: JSON.stringify({ story_id: storyId }),
    }),
  
  // GET /api/story_viewer.php - ambil daftar yang sudah lihat story (opsional)
  getViewers: (storyId: string) =>
    apiRequest(`/story_viewer.php?story_id=${storyId}`),
  
  // DELETE /api/story_delete.php - hapus story sendiri (opsional)
  delete: (storyId: string) =>
    apiRequest('/story_delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ story_id: storyId }),
    }),
  
  // POST /api/share_story.php - share story ke DM (opsional)
  share: (storyId: string, targetId?: string) =>
    apiRequest('/share_story.php', {
      method: 'POST',
      body: JSON.stringify({ story_id: storyId, target_id: targetId }),
    }),
};

// Profile API
export const profileApi = {
  getProfile: (username: string) => 
    apiRequest(`/profile.php?username=${username}`),
  updateProfile: (data: { bio?: string; displayName?: string; avatar?: string }) =>
    apiRequest('/update_profile.php', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  changeUsername: (newUsername: string) =>
    apiRequest('/username_change.php', {
      method: 'POST',
      body: JSON.stringify({ username: newUsername }),
    }),
};

// ===================================================================
// Messages/DM API - chat pribadi dan grup
// ===================================================================
export const messagesApi = {
  // GET /api/chats.php - ambil daftar chat/DM
  getChats: () => apiRequest('/chats.php'),
  
  // GET /api/load_messages.php - ambil pesan dalam chat tertentu
  loadMessages: (chatId: string, cursor?: string) => {
    const params = new URLSearchParams({ chat_id: chatId });
    if (cursor) params.append('cursor', cursor);
    
    return apiRequest(`/load_messages.php?${params.toString()}`);
  },
  
  // POST /api/send_message.php - kirim pesan
  send: (chatId: string, content: string, mediaUrl?: string) =>
    apiRequest('/send_message.php', {
      method: 'POST',
      body: JSON.stringify({ 
        chat_id: chatId, 
        content, 
        media_url: mediaUrl 
      }),
    }),
  
  // PATCH /api/edit_message.php - edit pesan (opsional)
  edit: (messageId: string, content: string) =>
    apiRequest('/edit_message.php', {
      method: 'PATCH',
      body: JSON.stringify({ message_id: messageId, content }),
    }),
  
  // DELETE /api/delete_message.php - hapus pesan (opsional)
  delete: (messageId: string) =>
    apiRequest('/delete_message.php', {
      method: 'DELETE',
      body: JSON.stringify({ message_id: messageId }),
    }),
  
  // POST /api/create_group.php - buat grup chat baru
  createGroup: (name: string, userIds: string[]) =>
    apiRequest('/create_group.php', {
      method: 'POST',
      body: JSON.stringify({ name, user_ids: userIds }),
    }),
  
  // GET /api/check_inbox_events.php - polling untuk pesan baru (opsional)
  checkInboxEvents: () => apiRequest('/check_inbox_events.php'),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (page = 1) =>
    apiRequest(`/notifications.php?page=${page}`),
  markAsRead: (notificationIds: string[]) =>
    apiRequest('/mark_notifications_read.php', {
      method: 'POST',
      body: JSON.stringify({ notification_ids: notificationIds }),
    }),
};

// Chatroom API (public chat)
export const chatroomApi = {
  loadPublicChat: (page = 1) =>
    apiRequest(`/load_public_chat.php?page=${page}`),
  sendMessage: (content: string) =>
    apiRequest('/chatroom_send.php', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};

// ===================================================================
// Utility Functions - helper untuk media dan validasi
// ===================================================================

// Helper untuk mendapatkan URL media yang benar
export const getMediaUrl = (relativePath: string) => {
  if (!relativePath) return '/placeholder.svg';
  if (relativePath.startsWith('http')) return relativePath;
  
  // Normalize path - hilangkan leading slash duplikat
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${MEDIA_BASE_URL}/${cleanPath}`;
};

// Helper untuk debug - log semua API calls jika debug mode aktif
export const setDebugMode = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    (window as any).__ARNVERSE_DEBUG__ = enabled;
  }
};

export const validateVideoFile = (file: File): Promise<{ valid: boolean; error?: string }> => {
  // Validate video duration ≤60s (client-side check)
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 60) {
        resolve({ valid: false, error: 'Video duration must be 60 seconds or less' });
      } else {
        resolve({ valid: true });
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve({ valid: false, error: 'Invalid video file' });
    };
    
    video.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, WebP)' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }
  
  return { valid: true };
};