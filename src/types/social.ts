// ===================================================================
// ARNVERSE UI Type Definitions
// Standardized types for frontend components (camelCase)
// ===================================================================

export interface AuthorUI {
  id: number;
  username: string;
  displayName: string;
  avatar?: string | null;
  isVerified?: boolean;
  isExclusive?: boolean;
  isPrivate?: boolean;
}

export interface PostUI {
  id: string;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt?: string;
  timestamp: string; // Formatted relative time
  author: AuthorUI | null;
}

export interface CommentUI {
  id: string;
  content: string;
  createdAt: string;
  timestamp: string; // Formatted relative time
  likes: number;
  author: AuthorUI | null;
}

export interface StoryUI {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  content?: string;
  duration: number;
  createdAt: string;
  expiresAt: string;
  isViewed: boolean;
  author: AuthorUI | null;
}

// API Response types (snake_case as received from backend)
export interface ApiAuthor {
  id: number;
  username?: string;
  display_name?: string;
  avatar?: string | null;
  is_verified?: boolean;
  is_exclusive?: boolean;
  is_private?: boolean;
}

export interface ApiPost {
  id: string | number;
  content?: string;
  media_urls?: string[];
  hashtags?: string[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  views_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
  created_at?: string;
  updated_at?: string;
  author?: ApiAuthor | null;
}

export interface ApiComment {
  id: string | number;
  content?: string;
  created_at?: string;
  likes?: number;
  author?: ApiAuthor | null;
}

export interface ApiStory {
  id: string | number;
  media_url?: string;
  media_type?: 'image' | 'video';
  content?: string;
  duration?: number;
  created_at?: string;
  expired_at?: string;
  is_viewed?: boolean;
  author?: ApiAuthor | null;
}