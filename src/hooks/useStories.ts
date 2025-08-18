import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storiesApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export interface StoryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  duration: number;
  textOverlay?: {
    text: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
  };
}

export interface Story {
  id: string;
  user: {
    username: string;
    displayName: string;
    avatar?: string;
    isExclusive?: boolean;
  };
  items: StoryItem[];
  timestamp: string;
  views: number;
  likes: number;
  comments: number;
  isViewed?: boolean;
  preview: string;
  expiresAt: string;
}

export interface StoryUploadData {
  media: File;
  duration?: number;
  textOverlay?: {
    text: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
  };
}

export function useStories() {
  const queryClient = useQueryClient();
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);

  // Get all stories
  const { 
    data: stories = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const response = await storiesApi.getStories();
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch stories');
      }
      return response.data as Story[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });

  // Upload story mutation
  const uploadStoryMutation = useMutation({
    mutationFn: async (storyData: StoryUploadData) => {
      const formData = new FormData();
      formData.append('media', storyData.media);
      
      if (storyData.duration) {
        formData.append('duration', storyData.duration.toString());
      }
      
      if (storyData.textOverlay) {
        formData.append('textOverlay', JSON.stringify(storyData.textOverlay));
      }

      return storiesApi.upload(formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['stories'] });
        toast({
          title: "Story uploaded!",
          description: "Your story has been shared with the cosmos.",
        });
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Like story mutation
  const likeStoryMutation = useMutation({
    mutationFn: storiesApi.like,
    onMutate: async (storyId: string) => {
      await queryClient.cancelQueries({ queryKey: ['stories'] });
      
      const previousStories = queryClient.getQueryData(['stories']);
      
      queryClient.setQueryData(['stories'], (old: Story[] = []) =>
        old.map(story => 
          story.id === storyId 
            ? { ...story, likes: story.likes + 1 }
            : story
        )
      );
      
      return { previousStories };
    },
    onError: (error, storyId, context) => {
      queryClient.setQueryData(['stories'], context?.previousStories);
      toast({
        title: "Like failed",
        description: "Failed to like story. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

  // Comment on story mutation
  const commentStoryMutation = useMutation({
    mutationFn: ({ storyId, content }: { storyId: string; content: string }) =>
      storiesApi.comment(storyId, content),
    onSuccess: (response) => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['stories'] });
        toast({
          title: "Comment added",
          description: "Your comment has been posted.",
        });
      } else {
        throw new Error(response.error || 'Comment failed');
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

  // View story mutation
  const viewStoryMutation = useMutation({
    mutationFn: storiesApi.view,
    onMutate: async (storyId: string) => {
      await queryClient.cancelQueries({ queryKey: ['stories'] });
      
      const previousStories = queryClient.getQueryData(['stories']);
      
      queryClient.setQueryData(['stories'], (old: Story[] = []) =>
        old.map(story => 
          story.id === storyId 
            ? { ...story, views: story.views + 1, isViewed: true }
            : story
        )
      );
      
      return { previousStories };
    },
    onError: (error, storyId, context) => {
      queryClient.setQueryData(['stories'], context?.previousStories);
    },
  });

  // Delete story mutation
  const deleteStoryMutation = useMutation({
    mutationFn: storiesApi.delete,
    onSuccess: (response) => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['stories'] });
        toast({
          title: "Story deleted",
          description: "Your story has been removed.",
        });
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Share story mutation
  const shareStoryMutation = useMutation({
    mutationFn: ({ storyId, targetId }: { storyId: string; targetId?: string }) =>
      storiesApi.share(storyId, targetId),
    onSuccess: (response) => {
      if (response.ok) {
        toast({
          title: "Story shared",
          description: "Story has been shared successfully.",
        });
      } else {
        throw new Error(response.error || 'Share failed');
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

  // Get story viewers
  const { data: storyViewers } = useQuery({
    queryKey: ['story-viewers', currentStoryIndex >= 0 ? stories[currentStoryIndex]?.id : null],
    queryFn: async () => {
      if (currentStoryIndex < 0 || !stories[currentStoryIndex]) return [];
      
      const response = await storiesApi.getViewers(stories[currentStoryIndex].id);
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch viewers');
      }
      return response.data;
    },
    enabled: currentStoryIndex >= 0 && stories.length > 0,
  });

  // Story navigation
  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentItemIndex(0);
    }
  }, [currentStoryIndex, stories.length]);

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentItemIndex(0);
    }
  }, [currentStoryIndex]);

  const goToNextItem = useCallback(() => {
    const currentStory = stories[currentStoryIndex];
    if (currentStory && currentItemIndex < currentStory.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      goToNextStory();
    }
  }, [currentStoryIndex, currentItemIndex, stories, goToNextStory]);

  const goToPreviousItem = useCallback(() => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
    } else {
      goToPreviousStory();
    }
  }, [currentItemIndex, goToPreviousStory]);

  // Story actions
  const uploadStory = useCallback((storyData: StoryUploadData) => {
    uploadStoryMutation.mutate(storyData);
  }, [uploadStoryMutation]);

  const likeStory = useCallback((storyId: string) => {
    likeStoryMutation.mutate(storyId);
  }, [likeStoryMutation]);

  const commentOnStory = useCallback((storyId: string, content: string) => {
    commentStoryMutation.mutate({ storyId, content });
  }, [commentStoryMutation]);

  const viewStory = useCallback((storyId: string) => {
    viewStoryMutation.mutate(storyId);
  }, [viewStoryMutation]);

  const deleteStory = useCallback((storyId: string) => {
    deleteStoryMutation.mutate(storyId);
  }, [deleteStoryMutation]);

  const shareStory = useCallback((storyId: string, targetId?: string) => {
    shareStoryMutation.mutate({ storyId, targetId });
  }, [shareStoryMutation]);

  const setStoryIndex = useCallback((index: number) => {
    setCurrentStoryIndex(index);
    setCurrentItemIndex(0);
  }, []);

  // Get deduplicated stories (one per user, prioritize unviewed)
  const deduplicatedStories = stories.reduce((acc: Story[], story) => {
    const existingIndex = acc.findIndex(s => s.user.username === story.user.username);
    
    if (existingIndex === -1) {
      acc.push(story);
    } else {
      // Replace if current story is unviewed and existing is viewed
      if (!story.isViewed && acc[existingIndex].isViewed) {
        acc[existingIndex] = story;
      }
    }
    
    return acc;
  }, []);

  // Sort stories: unviewed first, then by timestamp
  const sortedStories = deduplicatedStories.sort((a, b) => {
    if (a.isViewed !== b.isViewed) {
      return a.isViewed ? 1 : -1; // Unviewed first
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return {
    stories: sortedStories,
    allStories: stories,
    isLoading,
    error,
    refetch,
    currentStoryIndex,
    currentItemIndex,
    currentStory: stories[currentStoryIndex],
    storyViewers,
    uploadStory,
    likeStory,
    commentOnStory,
    viewStory,
    deleteStory,
    shareStory,
    goToNextStory,
    goToPreviousStory,
    goToNextItem,
    goToPreviousItem,
    setStoryIndex,
    isUploading: uploadStoryMutation.isPending,
    isLiking: likeStoryMutation.isPending,
    isCommenting: commentStoryMutation.isPending,
    isDeleting: deleteStoryMutation.isPending,
    isSharing: shareStoryMutation.isPending,
  };
}