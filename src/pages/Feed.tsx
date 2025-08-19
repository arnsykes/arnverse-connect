import { useState } from "react";
import { FeedCard } from "@/components/feed/FeedCard";
import { StoryBubble } from "@/components/stories/StoryBubble";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { CreatePost } from "@/components/CreatePost";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeed } from "@/hooks/useFeed";
import { useStories } from "@/hooks/useStories";
import { useAuth } from "@/hooks/useAuth";
import { RefreshCw, Plus } from "lucide-react";

export default function Feed() {
  const { user } = useAuth();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  
  const { 
    posts, 
    hasNextPage, 
    isFetching, 
    isFetchingNextPage, 
    fetchNextPage, 
    refetch,
    error,
    likePost,
    commentOnPost,
    sharePost
  } = useFeed();
  
  const {
    stories,
    uploadStory,
    viewStory,
    isUploading
  } = useStories();

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
    if (stories[index]) {
      viewStory(stories[index].id);
    }
  };

  const handleAddStory = () => {
    // This would open a story creation modal
    // For now, just show a placeholder
    console.log("Add story clicked");
  };

  const closeStoryViewer = () => {
    setSelectedStoryIndex(null);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Failed to load feed</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      <div className="glass rounded-xl p-4 border border-border/50">
        <CreatePost trigger={
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-5 w-5 mr-2" />
            What's happening in your universe?
          </Button>
        } />
      </div>

      {/* Stories Section */}
      <div className="glass rounded-xl p-4 border border-border/50">
        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide pb-2">
          <StoryBubble 
            isAddStory 
            onClick={handleAddStory}
          />
          {stories.map((story, index) => (
            <StoryBubble 
              key={story.id} 
              story={{
                ...story,
                user: {
                  username: story.user.username,
                  displayName: story.user.displayName,
                  isExclusive: story.user.isExclusive
                }
              }} 
              onClick={() => handleStoryClick(index)}
            />
          ))}
          {stories.length === 0 && !isFetching && (
            <div className="text-center py-8 w-full">
              <p className="text-muted-foreground">No stories yet. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {isFetching && posts.length === 0 ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-6 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-48 w-full rounded-lg mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                onLike={(id) => likePost(id)}
                onComment={(id) => console.log('Comment on', id)}
                onShare={(id) => sharePost(id)}
                onSave={(id) => console.log(`Save post ${id}`)} // TODO: Implement save
              />
            ))}
            
            {/* Load More */}
            {hasNextPage && (
              <div className="text-center py-8">
                <Button 
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Posts"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No posts in your feed yet. Follow some users or create your first post!
            </p>
            <CreatePost />
          </div>
        )}
      </div>

      {/* Story Viewer */}
      {selectedStoryIndex !== null && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          initialStoryIndex={selectedStoryIndex}
          onClose={closeStoryViewer}
        />
      )}
    </div>
  );
}