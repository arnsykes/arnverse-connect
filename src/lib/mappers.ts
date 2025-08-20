// ===================================================================
// ARNVERSE Data Mappers
// Normalize API responses (snake_case) to UI models (camelCase)
// ===================================================================

import type { 
  ApiAuthor, ApiPost, ApiComment, ApiStory,
  AuthorUI, PostUI, CommentUI, StoryUI 
} from '@/types/social';

// Helper function to format relative timestamps
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(diff / 604800000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (weeks < 4) return `${weeks}w`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    console.warn('Invalid date format:', dateString);
    return 'unknown';
  }
}

// Helper function to safely convert to number
function safeNumber(value: any, fallback = 0): number {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

// Helper function to safely convert to string
function safeString(value: any, fallback = ''): string {
  return value != null ? String(value) : fallback;
}

// Helper function to safely convert to boolean
function safeBoolean(value: any): boolean {
  return Boolean(value);
}

/**
 * Map API author data to UI author model
 * Handles missing fields gracefully with fallbacks
 */
export function mapApiAuthor(apiAuthor?: ApiAuthor | null): AuthorUI | null {
  if (!apiAuthor || !apiAuthor.id) {
    return null;
  }

  const username = safeString(apiAuthor.username);
  const displayName = safeString(apiAuthor.display_name, username || 'Unknown User');

  return {
    id: safeNumber(apiAuthor.id),
    username: username || 'unknown',
    displayName,
    avatar: apiAuthor.avatar || null,
    isVerified: safeBoolean(apiAuthor.is_verified),
    isExclusive: safeBoolean(apiAuthor.is_exclusive),
    isPrivate: safeBoolean(apiAuthor.is_private),
  };
}

/**
 * Map API post data to UI post model
 * Normalizes field names and provides safe fallbacks
 */
export function mapApiPost(apiPost?: ApiPost | null): PostUI | null {
  if (!apiPost || !apiPost.id) {
    return null;
  }

  const mappedAuthor = mapApiAuthor(apiPost.author);
  const createdAt = safeString(apiPost.created_at);

  return {
    id: safeString(apiPost.id),
    content: safeString(apiPost.content),
    mediaUrls: Array.isArray(apiPost.media_urls) ? apiPost.media_urls : [],
    hashtags: Array.isArray(apiPost.hashtags) ? apiPost.hashtags : [],
    likes: safeNumber(apiPost.likes_count),
    comments: safeNumber(apiPost.comments_count),
    shares: safeNumber(apiPost.shares_count),
    views: safeNumber(apiPost.views_count),
    isLiked: safeBoolean(apiPost.is_liked),
    isSaved: safeBoolean(apiPost.is_saved),
    createdAt,
    updatedAt: safeString(apiPost.updated_at),
    timestamp: formatRelativeTime(createdAt),
    author: mappedAuthor,
  };
}

/**
 * Map API comment data to UI comment model
 */
export function mapApiComment(apiComment?: ApiComment | null): CommentUI | null {
  if (!apiComment || !apiComment.id) {
    return null;
  }

  const mappedAuthor = mapApiAuthor(apiComment.author);
  const createdAt = safeString(apiComment.created_at);

  return {
    id: safeString(apiComment.id),
    content: safeString(apiComment.content),
    createdAt,
    timestamp: formatRelativeTime(createdAt),
    likes: safeNumber(apiComment.likes),
    author: mappedAuthor,
  };
}

/**
 * Map API story data to UI story model
 */
export function mapApiStory(apiStory?: ApiStory | null): StoryUI | null {
  if (!apiStory || !apiStory.id) {
    return null;
  }

  const mappedAuthor = mapApiAuthor(apiStory.author);
  const createdAt = safeString(apiStory.created_at);

  return {
    id: safeString(apiStory.id),
    mediaUrl: safeString(apiStory.media_url),
    mediaType: apiStory.media_type === 'video' ? 'video' : 'image',
    content: safeString(apiStory.content),
    duration: safeNumber(apiStory.duration, 15),
    createdAt,
    expiresAt: safeString(apiStory.expired_at),
    isViewed: safeBoolean(apiStory.is_viewed),
    author: mappedAuthor,
  };
}

/**
 * Map array of API posts with filtering out invalid items
 */
export function mapApiPosts(apiPosts: ApiPost[]): PostUI[] {
  if (!Array.isArray(apiPosts)) {
    console.warn('Expected array of posts, got:', typeof apiPosts);
    return [];
  }

  return apiPosts
    .map(mapApiPost)
    .filter((post): post is PostUI => post !== null);
}

/**
 * Map array of API comments with filtering out invalid items
 */
export function mapApiComments(apiComments: ApiComment[]): CommentUI[] {
  if (!Array.isArray(apiComments)) {
    console.warn('Expected array of comments, got:', typeof apiComments);
    return [];
  }

  return apiComments
    .map(mapApiComment)
    .filter((comment): comment is CommentUI => comment !== null);
}

/**
 * Map array of API stories with filtering out invalid items
 */
export function mapApiStories(apiStories: ApiStory[]): StoryUI[] {
  if (!Array.isArray(apiStories)) {
    console.warn('Expected array of stories, got:', typeof apiStories);
    return [];
  }

  return apiStories
    .map(mapApiStory)
    .filter((story): story is StoryUI => story !== null);
}