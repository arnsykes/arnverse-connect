import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { chatroomApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar?: string;
    is_verified?: boolean;
  };
  content: string;
  timestamp: string;
  created_at: string;
}

export default function Chatroom() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [onlineCount] = useState(42); // Mock online count
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock messages for demo
  const mockMessages: ChatMessage[] = [
    {
      id: "1",
      user: {
        id: "1",
        username: "cosmic_explorer",
        display_name: "Cosmic Explorer",
        avatar: "",
        is_verified: true
      },
      content: "Welcome to the ARNVERSE public chatroom! 🌌",
      timestamp: "2 hours ago",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "2", 
      user: {
        id: "2",
        username: "stellar_dev",
        display_name: "Stellar Dev",
        avatar: ""
      },
      content: "This is an amazing platform! Love the cosmic theme ✨",
      timestamp: "1 hour ago",
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: "3",
      user: {
        id: "3", 
        username: "galaxy_rider",
        display_name: "Galaxy Rider",
        avatar: ""
      },
      content: "Just posted my first story! Check it out 🚀",
      timestamp: "30 min ago",
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ];

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await chatroomApi.loadPublicChat();
      
      if (response.ok) {
        setMessages((response.data as any)?.items || mockMessages);
      } else {
        // Fallback to mock data
        setMessages(mockMessages);
      }
    } catch (error) {
      setMessages(mockMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await chatroomApi.sendMessage(newMessage);
      
      if (response.ok) {
        // Add optimistic message
        const optimisticMessage: ChatMessage = {
          id: Date.now().toString(),
          user: {
            id: user!.id,
            username: user!.username,
            display_name: user!.display_name,
            avatar: user!.avatar,
            is_verified: user!.is_verified
          },
          content: newMessage,
          timestamp: "now",
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage("");
        scrollToBottom();
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      toast({
        title: "Message failed",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card className="glass border-border/50 h-[calc(100vh-8rem)]">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Public Chatroom
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {onlineCount} online
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-full">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading messages...</div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.user.avatar} />
                        <AvatarFallback>
                          {message.user.display_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.user.display_name}
                          </span>
                          {message.user.is_verified && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              ✓
                            </Badge>
                          )}
                          <span className="text-muted-foreground text-xs">
                            @{message.user.username}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatTimestamp(message.created_at)}
                          </span>
                        </div>
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </ScrollArea>
          
          {/* Message Input */}
          <div className="border-t border-border/50 p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="glass flex-1"
                disabled={isSending}
                maxLength={500}
              />
              <Button 
                type="submit" 
                variant="outline" 
                size="icon"
                disabled={!newMessage.trim() || isSending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              Be respectful and follow community guidelines
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}