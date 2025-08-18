import { useState } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Chat {
  id: string;
  type: 'dm' | 'group';
  name: string;
  avatar?: string;
  lastMessage: {
    content: string;
    timestamp: string;
    sender: string;
    isRead: boolean;
  };
  unreadCount: number;
  isOnline?: boolean;
}

const mockChats: Chat[] = [
  {
    id: "1",
    type: "dm",
    name: "Alice Cooper",
    avatar: "/placeholder.svg",
    lastMessage: {
      content: "Hey! Check out my new cosmic track 🎵",
      timestamp: "2m",
      sender: "Alice Cooper",
      isRead: false
    },
    unreadCount: 2,
    isOnline: true
  },
  {
    id: "2",
    type: "group",
    name: "Cosmic Creators",
    avatar: "/placeholder.svg",
    lastMessage: {
      content: "Sarah shared a story",
      timestamp: "1h",
      sender: "Sarah",
      isRead: true
    },
    unreadCount: 0
  },
  {
    id: "3",
    type: "dm",
    name: "Bob Smith",
    avatar: "/placeholder.svg",
    lastMessage: {
      content: "Thanks for sharing that post!",
      timestamp: "3h",
      sender: "You",
      isRead: true
    },
    unreadCount: 0,
    isOnline: false
  }
];

export default function Inbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Chat List */}
      <div className="w-full md:w-80 flex flex-col border-r border-border/50">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Messages</h1>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 border-b border-border/30 cursor-pointer hover:bg-surface/50 transition-colors ${
                selectedChat === chat.id ? 'bg-surface/70' : ''
              }`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {chat.type === 'dm' && chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {chat.lastMessage.timestamp}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${
                      chat.lastMessage.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'
                    }`}>
                      {chat.lastMessage.sender === "You" ? "You: " : ""}
                      {chat.lastMessage.content}
                    </p>
                    
                    {chat.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        {selectedChat ? (
          <div className="text-center">
            <div className="cosmic-gradient w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              Chat interface will be implemented in the next phase
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="cosmic-gradient w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Select a Conversation</h2>
            <p className="text-muted-foreground">
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}