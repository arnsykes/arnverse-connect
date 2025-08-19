import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Story } from "@/hooks/useStories";

interface StoryBubbleProps {
  story?: Story & { isOwn?: boolean };
  isAddStory?: boolean;
  onClick?: () => void;
}

export function StoryBubble({ story, isAddStory, onClick }: StoryBubbleProps) {
  if (isAddStory) {
    return (
      <button 
        onClick={onClick}
        className="flex flex-col items-center space-y-2 hover-lift transition-all group"
      >
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-surface border-2 border-dashed border-primary/50 flex items-center justify-center group-hover:border-primary group-hover:neon-glow transition-all">
            <Plus className="h-6 w-6 text-primary" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium truncate max-w-16">
          Your Story
        </p>
      </button>
    );
  }

  if (!story) return null;

  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center space-y-2 hover-lift transition-all group"
    >
      <div className="relative">
        <div className={cn(
          "h-16 w-16 rounded-full p-0.5 transition-all",
          story.isViewed 
            ? "bg-muted" 
            : "cosmic-gradient neon-glow group-hover:scale-105"
        )}>
          <div 
            className="h-full w-full rounded-full bg-surface bg-cover bg-center"
            style={{ backgroundImage: `url(${story.preview})` }}
          />
        </div>
        {story.isOwn && (
          <div className="absolute -bottom-1 -right-1 h-6 w-6 cosmic-gradient rounded-full border-2 border-background flex items-center justify-center">
            <Plus className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <p className="text-xs text-foreground font-medium truncate max-w-16">
        {story.isOwn ? 'Your Story' : story.user.displayName}
      </p>
    </button>
  );
}