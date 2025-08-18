import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Share, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StoryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  duration: number;
}

interface Story {
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
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialStoryIndex, onClose }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentStoryIndex];
  const currentItem = currentStory.items[currentItemIndex];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / currentItem.duration);
        if (newProgress >= 100) {
          nextItem();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentItemIndex, currentStoryIndex, isPaused, currentItem.duration]);

  const nextItem = () => {
    if (currentItemIndex < currentStory.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setProgress(0);
    } else {
      nextStory();
    }
  };

  const prevItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      setProgress(0);
    } else {
      prevStory();
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentItemIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentItemIndex(0);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="h-full flex items-center justify-center">
        <div className="relative w-full max-w-sm h-full max-h-[80vh] bg-black rounded-xl overflow-hidden">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1">
            {currentStory.items.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ 
                    width: index === currentItemIndex 
                      ? `${progress}%` 
                      : index < currentItemIndex 
                        ? '100%' 
                        : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-16 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full cosmic-gradient p-0.5">
                <div className="h-full w-full rounded-full bg-surface flex items-center justify-center text-sm font-medium text-white">
                  {currentStory.user.displayName.charAt(0)}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-white">{currentStory.user.displayName}</p>
                  {currentStory.user.isExclusive && (
                    <Badge className="cosmic-gradient border-0 text-white text-xs px-2">
                      Exclusive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/70">{currentStory.timestamp}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Story content */}
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${currentItem.url})` }}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Navigation areas */}
            <button 
              className="absolute left-0 top-0 w-1/3 h-full z-10"
              onClick={prevItem}
            />
            <button 
              className="absolute right-0 top-0 w-1/3 h-full z-10"
              onClick={nextItem}
            />
          </div>

          {/* Bottom actions */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-white">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                  <Share className="h-5 w-5" />
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">{currentStory.views}</span>
              </Button>
            </div>
          </div>

          {/* Navigation arrows */}
          {currentStoryIndex > 0 && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={prevStory}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          {currentStoryIndex < stories.length - 1 && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={nextStory}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}