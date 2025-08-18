import { useState } from "react";
import { FeedCard } from "@/components/feed/FeedCard";
import { StoryBubble } from "@/components/stories/StoryBubble";
import { StoryViewer } from "@/components/stories/StoryViewer";

// Mock data - will be replaced with API calls
const mockStories = [
  {
    id: "1",
    user: { username: "alice", displayName: "Alice Cooper", isExclusive: true },
    items: [
      { id: "1", type: 'image' as const, url: "/placeholder.svg", duration: 5000 }
    ],
    timestamp: "2h",
    views: 125,
    likes: 45,
    comments: 8
  },
  {
    id: "2", 
    user: { username: "bob", displayName: "Bob Smith" },
    items: [
      { id: "2", type: 'image' as const, url: "/placeholder.svg", duration: 5000 }
    ],
    timestamp: "4h",
    views: 89,
    likes: 23,
    comments: 3
  }
];

const mockPosts = [
  {
    id: "1",
    author: {
      username: "alice_cooper",
      displayName: "Alice Cooper",
      isExclusive: true
    },
    content: "Just dropped a new cosmic track! 🎵✨ The universe is full of melodies waiting to be discovered. What's your favorite song that makes you feel like you're floating among the stars?",
    media: [
      { type: 'image' as const, url: "/placeholder.svg" }
    ],
    likes: 234,
    comments: 18,
    shares: 7,
    timestamp: "2h",
    isLiked: false,
    isSaved: false
  },
  {
    id: "2",
    author: {
      username: "cosmic_dev",
      displayName: "Cosmic Developer"
    },
    content: "Building something magical in the ARNVERSE today! 💫 The future of social connection is here, and it's more beautiful than we ever imagined.",
    likes: 187,
    comments: 25,
    shares: 12,
    timestamp: "4h",
    isLiked: true,
    isSaved: false
  },
  {
    id: "3",
    author: {
      username: "space_explorer",
      displayName: "Luna Explorer",
      isExclusive: true
    },
    content: "Captured this stunning view from my morning hike. Sometimes you need to step away from the screens and connect with the real universe around us. 🌄",
    media: [
      { type: 'image' as const, url: "/placeholder.svg" },
      { type: 'image' as const, url: "/placeholder.svg" }
    ],
    likes: 456,
    comments: 32,
    shares: 23,
    timestamp: "6h",
    isLiked: false,
    isSaved: true
  }
];

export default function Feed() {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
  };

  const handleAddStory = () => {
    // Handle add story action
    console.log("Add story clicked");
  };

  const closeStoryViewer = () => {
    setSelectedStoryIndex(null);
  };

  const handlePostAction = (action: string, postId: string) => {
    console.log(`${action} action on post ${postId}`);
  };

  return (
    <div className="space-y-6">
      {/* Stories Section */}
      <div className="glass rounded-xl p-4 border border-border/50">
        <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide pb-2">
          <StoryBubble isAddStory onClick={handleAddStory} />
          {mockStories.map((story, index) => (
            <StoryBubble 
              key={story.id} 
              story={{
                ...story,
                preview: story.items[0].url,
                isViewed: false
              }} 
              onClick={() => handleStoryClick(index)}
            />
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {mockPosts.map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            onLike={(id) => handlePostAction('like', id)}
            onComment={(id) => handlePostAction('comment', id)}
            onShare={(id) => handlePostAction('share', id)}
            onSave={(id) => handlePostAction('save', id)}
          />
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center py-8">
        <button className="cosmic-gradient text-white px-6 py-3 rounded-lg font-medium neon-glow hover:scale-105 transition-transform">
          Load More Posts
        </button>
      </div>

      {/* Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={mockStories}
          initialStoryIndex={selectedStoryIndex}
          onClose={closeStoryViewer}
        />
      )}
    </div>
  );
}