import { useState } from "react";
import { Search as SearchIcon, TrendingUp, Hash, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const trendingTopics = [
  { tag: "ARNVERSE", posts: 1234 },
  { tag: "CosmicLife", posts: 892 },
  { tag: "DigitalUniverse", posts: 567 },
  { tag: "ExclusiveContent", posts: 334 },
  { tag: "SpaceVibes", posts: 289 }
];

const suggestedUsers = [
  {
    id: "1",
    username: "cosmic_artist",
    displayName: "Cosmic Artist",
    followers: 15600,
    isExclusive: true,
    avatar: "/placeholder.svg"
  },
  {
    id: "2",
    username: "space_explorer",
    displayName: "Luna Explorer", 
    followers: 8920,
    isExclusive: false,
    avatar: "/placeholder.svg"
  },
  {
    id: "3",
    username: "digital_nomad",
    displayName: "Digital Nomad",
    followers: 12400,
    isExclusive: true,
    avatar: "/placeholder.svg"
  }
];

const recentSearches = [
  "cosmic vibes",
  "space photography",
  "digital art",
  "exclusive content"
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("explore");

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass rounded-xl p-4 border border-border/50">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ARNVERSE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface/50 rounded-lg border border-border/50 focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
        </div>

        {/* Recent searches */}
        {!searchQuery && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="text-sm bg-surface/50 hover:bg-surface border border-border/50 rounded-full px-3 py-1 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results or Explore */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass border border-border/50">
          <TabsTrigger value="explore" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Explore</span>
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">People</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center space-x-2">
            <Hash className="h-4 w-4" />
            <span className="hidden sm:inline">Tags</span>
          </TabsTrigger>
          <TabsTrigger value="places" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Places</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="mt-6 space-y-6">
          {/* Trending Topics */}
          <div className="glass rounded-xl p-6 border border-border/50">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Trending in ARNVERSE
            </h2>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={topic.tag} className="flex items-center justify-between py-2 hover:bg-surface/50 rounded-lg px-2 -mx-2 cursor-pointer transition-colors">
                  <div>
                    <p className="font-medium">#{topic.tag}</p>
                    <p className="text-sm text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm cosmic-gradient bg-clip-text text-transparent font-medium">
                      #{index + 1} Trending
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Users */}
          <div className="glass rounded-xl p-6 border border-border/50">
            <h2 className="text-lg font-semibold mb-4">Suggested for you</h2>
            <div className="space-y-4">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full cosmic-gradient p-0.5">
                      <div 
                        className="h-full w-full rounded-full bg-surface bg-cover bg-center"
                        style={{ backgroundImage: `url(${user.avatar})` }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{user.displayName}</p>
                        {user.isExclusive && (
                          <Badge className="cosmic-gradient border-0 text-white text-xs">
                            Exclusive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{user.username} • {user.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="cosmic-gradient border-0 text-white">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="people" className="mt-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Search for people to see results here</p>
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {trendingTopics.map((topic) => (
              <div key={topic.tag} className="glass rounded-xl p-4 border border-border/50 hover-lift cursor-pointer">
                <p className="font-semibold text-lg">#{topic.tag}</p>
                <p className="text-sm text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="places" className="mt-6">
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Search for places to see results here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}