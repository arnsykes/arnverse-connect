import { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
    isExclusive?: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  }[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
  isSaved: boolean;
}

interface FeedCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
}

export function FeedCard({ post, onLike, onComment, onShare, onSave }: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLike?.(post.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(post.id);
  };

  return (
    <article className="glass rounded-xl border border-border/50 overflow-hidden hover-lift animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full cosmic-gradient p-0.5">
            <div className="h-full w-full rounded-full bg-surface flex items-center justify-center text-sm font-medium">
              {post.author.displayName.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-foreground">{post.author.displayName}</p>
              {post.author.isExclusive && (
                <Badge className="cosmic-gradient border-0 text-white text-xs px-2">
                  Exclusive
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{post.author.username}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-sm text-muted-foreground">{post.timestamp}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="px-4 pb-4">
          <div className={cn(
            "grid gap-1 rounded-lg overflow-hidden",
            post.media.length === 1 && "grid-cols-1",
            post.media.length === 2 && "grid-cols-2",
            post.media.length > 2 && "grid-cols-2 grid-rows-2"
          )}>
            {post.media.map((item, index) => (
              <div key={index} className="relative bg-surface aspect-square">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt="Post media"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <video 
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-4 pt-2">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            className={cn(
              "flex items-center space-x-2 hover-glow transition-all",
              isLiked && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            <span>{likesCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onComment?.(post.id)}
            className="flex items-center space-x-2 hover-glow"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onShare?.(post.id)}
            className="flex items-center space-x-2 hover-glow"
          >
            <Share className="h-5 w-5" />
            <span>{post.shares}</span>
          </Button>
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleSave}
          className={cn(
            "hover-glow transition-all",
            isSaved && "text-accent"
          )}
        >
          <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
        </Button>
      </div>
    </article>
  );
}