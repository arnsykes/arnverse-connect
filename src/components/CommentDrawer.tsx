import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { postsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mapApiComments } from "@/lib/mappers";
import type { CommentUI } from "@/types/social";

interface CommentDrawerProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentDrawer({ postId, isOpen, onClose }: CommentDrawerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  // Fetch comments
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await postsApi.getComments(postId);
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch comments');
      }
      // Apply mapper if data needs normalization
      const data = response.data;
      if (data && typeof data === 'object' && 'items' in data) {
        const items = (data as any).items;
        if (Array.isArray(items) && items.length > 0 && !items[0]?.timestamp) {
          return { ...data, items: mapApiComments(items) };
        }
      }
      return data;
    },
    enabled: isOpen && !!postId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => postsApi.comment(postId, content),
    onSuccess: (response) => {
      if (response.ok) {
        setNewComment("");
        queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        toast({
          title: "Comment added",
          description: "Your comment has been posted.",
        });
      } else {
        throw new Error(response.error || 'Failed to add comment');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const comments: CommentUI[] = (commentsData as any)?.items || [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] glass border-border/50">
        <SheetHeader className="pb-4">
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Comments List */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))
              ) : comments.length > 0 ? (
                comments.map((comment: CommentUI) => {
                  // Safe author access with fallbacks
                  const author = comment.author;
                  const authorName = author?.displayName || author?.username || 'Anonymous';
                  const authorUsername = author?.username || 'unknown';
                  const authorAvatar = author?.avatar;

                  return (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={authorAvatar || undefined} />
                        <AvatarFallback>
                          {authorName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {authorName}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            @{authorUsername}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {comment.timestamp}
                          </span>
                        </div>
                        
                        <p className="text-sm break-words mb-2">{comment.content}</p>
                        
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Heart className="h-3 w-3 mr-1" />
                            <span className="text-xs">{comment.likes}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Comment Input */}
          <div className="border-t border-border/50 pt-4 mt-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.display_name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="glass flex-1"
                  disabled={addCommentMutation.isPending}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}