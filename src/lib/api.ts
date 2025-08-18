// API Integration Layer for ARNVERSE PHP Backend
// This handles all API communications with the PHP backend

import type { Post } from '@/hooks/useFeed';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-domain.com/api';
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'https://your-domain.com/uploads';

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

// Enhanced fetch wrapper with error handling and auth
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include', // Include cookies for PHP session
      headers: {
        'Content-Type': 'application/json',
        // Add CSRF token if needed
        // 'X-CSRF-Token': getCsrfToken(),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Upload handler for form-data (posts, stories, media)
async function uploadRequest<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // Don't set Content-Type for FormData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// Authentication API
export const authApi = {
  me: () => apiRequest('/auth.php'),
  login: (credentials: { username: string; password: string }) =>
    apiRequest('/login.php', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData: { username: string; email: string; password: string; displayName: string }) =>
    apiRequest('/register.php', {
      method: 'POST', 
      body: JSON.stringify(userData),
    }),
  logout: () => apiRequest('/logout.php', { method: 'POST' }),
};

// Posts API
export const postsApi = {
  getFeed: (page = 1, limit = 20) => 
    apiRequest<{ posts: Post[]; total: number; hasMore: boolean }>(`/feed.php?page=${page}&limit=${limit}`),
  upload: (formData: FormData) => uploadRequest('/upload_post.php', formData),
  edit: (postId: string, data: { content?: string; media?: string[] }) =>
    apiRequest(`/edit_post.php`, {
      method: 'PATCH',
      body: JSON.stringify({ id: postId, ...data }),
    }),
  delete: (postId: string) =>
    apiRequest(`/delete_post.php`, {
      method: 'DELETE',
      body: JSON.stringify({ id: postId }),
    }),
  like: (postId: string) =>
    apiRequest('/like_post.php', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId }),
    }),
  comment: (postId: string, content: string) =>
    apiRequest('/comment_post.php', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, content }),
    }),
  getComments: (postId: string, page = 1) =>
    apiRequest(`/get_comments.php?post_id=${postId}&page=${page}`),
  share: (postId: string, targetId?: string) =>
    apiRequest('/share_post.php', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, target_id: targetId }),
    }),
};

// Stories API
export const storiesApi = {
  getStories: () => apiRequest('/stories.php'),
  upload: (formData: FormData) => uploadRequest('/upload_story.php', formData),
  like: (storyId: string) =>
    apiRequest('/story_like.php', {
      method: 'POST',
      body: JSON.stringify({ story_id: storyId }),
    }),
  comment: (storyId: string, content: string) =>
    apiRequest('/story_comment.php', {
      method: 'POST',
      body: JSON.stringify({ story_id: storyId, content }),
    }),
  view: (storyId: string) =>
    apiRequest('/story_view.php', {
      method: 'POST',
      body: JSON.stringify({ story_id: storyId }),
    }),
  getViewers: (storyId: string) =>
    apiRequest(`/story_viewer.php?story_id=${storyId}`),
  delete: (storyId: string) =>
    apiRequest('/story_delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ story_id: storyId }),
    }),
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

// Messages/DM API
export const messagesApi = {
  getChats: () => apiRequest('/chats.php'),
  loadMessages: (chatId: string, page = 1) =>
    apiRequest(`/load_messages.php?chat_id=${chatId}&page=${page}`),
  send: (chatId: string, content: string, mediaUrl?: string) =>
    apiRequest('/send_message.php', {
      method: 'POST',
      body: JSON.stringify({ chat_id: chatId, content, media_url: mediaUrl }),
    }),
  edit: (messageId: string, content: string) =>
    apiRequest('/edit_message.php', {
      method: 'PATCH',
      body: JSON.stringify({ message_id: messageId, content }),
    }),
  delete: (messageId: string) =>
    apiRequest('/delete_message.php', {
      method: 'DELETE',
      body: JSON.stringify({ message_id: messageId }),
    }),
  createGroup: (name: string, userIds: string[]) =>
    apiRequest('/create_group.php', {
      method: 'POST',
      body: JSON.stringify({ name, user_ids: userIds }),
    }),
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

// Utility functions
export const getMediaUrl = (relativePath: string) => {
  if (!relativePath) return '/placeholder.svg';
  if (relativePath.startsWith('http')) return relativePath;
  return `${MEDIA_BASE_URL}/${relativePath}`;
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