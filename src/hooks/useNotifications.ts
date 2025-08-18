import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share' | 'story_view' | 'message';
  actor: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isExclusive?: boolean;
  };
  data: {
    postTitle?: string;
    commentPreview?: string;
    messagePreview?: string;
    chatType?: 'dm' | 'group';
    followerUsername?: string;
    viewerUsername?: string;
  };
  readAt?: string;
  createdAt: string;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  // Get notifications
  const { 
    data: notifications = [], 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsApi.getNotifications(1);
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch notifications');
      }
      return response.data as Notification[];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Mark notifications as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onMutate: async (notificationIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      
      const previousNotifications = queryClient.getQueryData(['notifications']);
      
      queryClient.setQueryData(['notifications'], (old: Notification[] = []) =>
        old.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      return { previousNotifications };
    },
    onError: (error, notificationIds, context) => {
      queryClient.setQueryData(['notifications'], context?.previousNotifications);
      toast({
        title: "Mark as read failed",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Helper functions
  const unreadCount = notifications.filter(n => !n.readAt).length;
  
  const markAsRead = (notificationIds: string[]) => {
    markAsReadMutation.mutate(notificationIds);
  };

  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter(n => !n.readAt)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  const getNotificationText = (notification: Notification): string => {
    const { type, actor, data } = notification;
    
    switch (type) {
      case 'like':
        return `${actor.displayName} liked your post${data.postTitle ? `: "${data.postTitle.slice(0, 30)}..."` : ''}`;
      
      case 'comment':
        return `${actor.displayName} commented on your post${data.commentPreview ? `: "${data.commentPreview.slice(0, 40)}..."` : ''}`;
      
      case 'follow':
        return `${actor.displayName} started following you`;
      
      case 'mention':
        return `${actor.displayName} mentioned you in a post`;
      
      case 'share':
        return `${actor.displayName} shared your post`;
      
      case 'story_view':
        return `${actor.displayName} viewed your story`;
      
      case 'message':
        const chatType = data.chatType === 'group' ? 'group' : '';
        return `${actor.displayName} sent you a ${chatType} message${data.messagePreview ? `: "${data.messagePreview.slice(0, 30)}..."` : ''}`;
      
      default:
        return `${actor.displayName} interacted with your content`;
    }
  };

  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'mention': return '@';
      case 'share': return '🔄';
      case 'story_view': return '👁️';
      case 'message': return '📩';
      default: return '🔔';
    }
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      let groupKey = date;
      if (date === today) {
        groupKey = 'Today';
      } else if (date === yesterday) {
        groupKey = 'Yesterday';
      } else {
        groupKey = new Date(notification.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric'
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  };

  return {
    notifications,
    isLoading,
    error,
    refetch,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationText,
    getNotificationIcon,
    groupNotificationsByDate,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
}