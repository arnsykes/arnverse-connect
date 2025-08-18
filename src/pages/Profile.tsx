import { useState } from "react";
import { Settings, Share, Grid, Bookmark, UserCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockProfile = {
  username: "arnverse_user",
  displayName: "ARNVERSE User",
  bio: "Exploring the cosmic connections in the digital universe ✨\nCreator | Dreamer | Explorer\n🌌 Join me on this journey",
  isExclusive: true,
  followers: 1240,
  following: 456,
  posts: 89,
  isOwn: true,
  isFollowing: false,
  avatar: "/placeholder.svg"
};

const mockPosts = Array.from({ length: 12 }, (_, i) => ({
  id: `post-${i}`,
  thumbnail: "/placeholder.svg",
  type: i % 3 === 0 ? 'video' : 'image' as const,
  likes: Math.floor(Math.random() * 500) + 50
}));

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass rounded-xl p-6 border border-border/50">
        <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0 self-center md:self-start">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full cosmic-gradient p-1">
              <div 
                className="h-full w-full rounded-full bg-surface bg-cover bg-center"
                style={{ backgroundImage: `url(${mockProfile.avatar})` }}
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <h1 className="text-2xl font-bold">{mockProfile.displayName}</h1>
                  {mockProfile.isExclusive && (
                    <Badge className="cosmic-gradient border-0 text-white">
                      Exclusive
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{mockProfile.username}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-2 mt-4 md:mt-0">
                {mockProfile.isOwn ? (
                  <>
                    <Button variant="outline" className="glass border-border/50">
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="cosmic-gradient border-0 text-white">
                      <UserCheck className="h-4 w-4 mr-2" />
                      {mockProfile.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline" className="glass border-border/50">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center md:justify-start space-x-8 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold">{mockProfile.posts}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{mockProfile.followers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{mockProfile.following}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>

            {/* Bio */}
            <div className="text-center md:text-left">
              <p className="text-foreground whitespace-pre-line">{mockProfile.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass border border-border/50">
          <TabsTrigger value="posts" className="flex items-center space-x-2">
            <Grid className="h-4 w-4" />
            <span>Posts</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center space-x-2">
            <Bookmark className="h-4 w-4" />
            <span>Saved</span>
          </TabsTrigger>
          <TabsTrigger value="tagged" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Tagged</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {mockPosts.map((post) => (
              <div 
                key={post.id}
                className="aspect-square bg-surface rounded-lg overflow-hidden hover-lift cursor-pointer group"
              >
                <div 
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage: `url(${post.thumbnail})` }}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="text-center py-12">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No saved posts yet</p>
          </div>
        </TabsContent>

        <TabsContent value="tagged" className="mt-6">
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tagged posts yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}