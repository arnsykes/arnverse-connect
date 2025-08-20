import { useState } from "react";
import { Search, TrendingUp, Hash, User, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FeedCard } from "@/components/feed/FeedCard";

const trendingTopics = [
  { tag: "CosmicVibes", posts: 2847 },
  { tag: "ARNVERSE", posts: 1923 },
  { tag: "SpaceExploration", posts: 1456 },
  { tag: "DigitalArt", posts: 987 },
  { tag: "TechInnovation", posts: 743 }
];

const suggestedUsers = [
  {
    id: "1",
    username: "cosmic_artist",
    displayName: "Luna Cosmic",
    avatar: "/placeholder.svg",
    isExclusive: true,
    followers: 15400,
    bio: "Digital artist exploring the cosmic realm"
  },
  {
    id: "2", 
    username: "space_photographer",
    displayName: "Stellar Shots",
    avatar: "/placeholder.svg",
    isExclusive: false,
    followers: 8900,
    bio: "Capturing the beauty of the universe"
  },
  {
    id: "3",
    username: "tech_innovator",
    displayName: "Future Tech",
    avatar: "/placeholder.svg",
    isExclusive: true,
    followers: 23100,
    bio: "Building tomorrow's technology today"
  }
];

const trendingPosts = [
  {
    id: "trending-1",
    author: {
      id: 1,
      username: "cosmic_artist",
      displayName: "Luna Cosmic",
      isExclusive: true
    },
    content: "Just finished this incredible piece inspired by the nebulae! The colors of space never cease to amaze me. #CosmicVibes #DigitalArt",
    mediaUrls: ["/placeholder.svg"],
    hashtags: ["#CosmicVibes", "#DigitalArt"],
    likes: 1247,
    comments: 89,
    shares: 45,
    views: 0,
    timestamp: "3h",
    createdAt: "2025-08-20T07:00:00Z",
    isLiked: false,
    isSaved: false
  },
  {
    id: "trending-2",
    author: {
      id: 2,
      username: "space_photographer",
      displayName: "Stellar Shots"
    },
    content: "Caught this amazing sunrise that looked like it was straight from another planet! Nature is the ultimate artist. #SpaceExploration",
    mediaUrls: ["/placeholder.svg"],
    hashtags: ["#SpaceExploration"],
    likes: 892,
    comments: 67,
    shares: 34,
    views: 0,
    timestamp: "5h",
    createdAt: "2025-08-20T05:00:00Z",
    isLiked: true,
    isSaved: false
  }
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");

  const handlePostAction = (action: string, postId: string) => {
    console.log(`${action} action on post ${postId}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for users, hashtags, or content..."
              className="pl-10 glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass">
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Trending</span>
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            <span className="hidden sm:inline">Tags</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">People</span>
          </TabsTrigger>
          <TabsTrigger value="places" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Places</span>
          </TabsTrigger>
        </TabsList>

        {/* Trending Content */}
        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trending Posts */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold">Trending Posts</h2>
              {trendingPosts.map((post) => (
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <Card className="glass border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Trending Topics</h3>
                  <div className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div key={topic.tag} className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">#{index + 1}</span>
                            <span className="font-medium">#{topic.tag}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {topic.posts.toLocaleString()} posts
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Users */}
              <Card className="glass border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Suggested for You</h3>
                  <div className="space-y-4">
                    {suggestedUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium truncate">{user.displayName}</span>
                            {user.isExclusive && (
                              <Badge variant="secondary" className="text-xs">Exclusive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Hashtags */}
        <TabsContent value="hashtags" className="space-y-6">
          <div className="text-center py-12">
            <Hash className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Hashtag Explorer</h2>
            <p className="text-muted-foreground">
              Discover trending hashtags and explore content by tags
            </p>
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-6">
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Discover People</h2>
            <p className="text-muted-foreground">
              Find new creators and connect with the ARNVERSE community
            </p>
          </div>
        </TabsContent>

        {/* Places */}
        <TabsContent value="places" className="space-y-6">
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Explore Places</h2>
            <p className="text-muted-foreground">
              Discover content from different locations around the cosmos
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}