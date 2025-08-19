import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isExclusive: boolean;
  };
  content: string;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
  }>;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
}

interface FeedResponse {
  items: Post[];
  nextCursor?: string;
}

export function useFeed() {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      const response = await postsApi.getFeed(pageParam as string);
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch feed');
      }
      return response.data as FeedResponse;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: FeedResponse) => {
      return lastPage.nextCursor;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes when active
  });

  // Like post mutation with optimistic updates
  const likeMutation = useMutation({
    mutationFn: postsApi.like,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const previousData = queryClient.getQueryData(['feed']);
      
      // Optimistically update the UI
      queryClient.setQueryData(['feed'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            items: page.items?.map((post: Post) => 
              post.id === postId
                ? {
                    ...post,
                    isLiked: !post.isLiked,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1
                  }
                : post
            ) || []
          }))
        };
      });
      
      return { previousData };
    },
    onError: (error, postId, context) => {
      // Rollback optimistic update
      queryClient.setQueryData(['feed'], context?.previousData);
      toast({
        title: "Like failed",
        description: "Unable to like post. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      postsApi.comment(postId, content),
    onSuccess: (response, { postId }) => {
      if (response.ok) {
        // Update comment count optimistically
        queryClient.setQueryData(['feed'], (old: any) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: FeedResponse) => ({
              ...page,
              items: page.items?.map((post: Post) => 
                post.id === postId
                  ? { ...post, comments: post.comments + 1 }
                  : post
              ) || []
            }))
          };
        });
        
        toast({
          title: "Comment added",
          description: "Your comment has been posted",
        });
      } else {
        throw new Error(response.error);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Comment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: ({ postId, targetId }: { postId: string; targetId?: string }) =>
      postsApi.share(postId, targetId),
    onSuccess: (response) => {
      if (response.ok) {
        toast({
          title: "Post shared",
          description: "Post has been shared successfully",
        });
      } else {
        throw new Error(response.error);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Share failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Flatten posts from all pages
  const posts = data?.pages?.flatMap(page => page.items || []) || [];
  
  return {
    posts,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    error,
    // Actions
    likePost: (postId: string) => likeMutation.mutate(postId),
    commentOnPost: (postId: string, content: string) =>
      commentMutation.mutate({ postId, content }),
    sharePost: (postId: string, targetId?: string) =>
      shareMutation.mutate({ postId, targetId }),
    // Loading states
    isLikePending: likeMutation.isPending,
    isCommentPending: commentMutation.isPending,
    isSharePending: shareMutation.isPending,
  };
}