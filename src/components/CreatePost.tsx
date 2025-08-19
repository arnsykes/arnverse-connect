import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, X, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { postsApi, validateImageFile, validateVideoFile } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface CreatePostProps {
  trigger?: React.ReactNode;
}

export function CreatePost({ trigger }: CreatePostProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const validation = validateImageFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          toast({
            title: "Invalid image",
            description: validation.error,
            variant: "destructive"
          });
        }
      } else if (file.type.startsWith('video/')) {
        const validation = await validateVideoFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          toast({
            title: "Invalid video",
            description: validation.error,
            variant: "destructive"
          });
        }
      }
    }

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 4)); // Max 4 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or media to your post.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      selectedFiles.forEach((file, index) => {
        formData.append(`media[]`, file);
      });

      const response = await postsApi.upload(formData);
      
      if (response.ok) {
        toast({
          title: "Post created!",
          description: "Your post has been shared with the cosmos.",
        });
        
        // Reset form and close dialog
        setContent("");
        setSelectedFiles([]);
        setIsOpen(false);
        
        // Invalidate feed to refresh
        queryClient.invalidateQueries({ queryKey: ['feed'] });
      } else {
        throw new Error(response.error || 'Failed to create post');
      }
    } catch (error) {
      toast({
        title: "Post failed",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="cosmic" size="lg" className="rounded-full">
      <Plus className="h-5 w-5 mr-2" />
      Create Post
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg glass border-border/50">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.display_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="What's happening in your universe?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="glass border-0 resize-none text-lg placeholder:text-muted-foreground/70 focus-visible:ring-0"
                  rows={3}
                />
              </div>
            </div>

            {/* Media Preview */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedFiles.length >= 4}
                >
                  <Image className="h-5 w-5 mr-2" />
                  Photo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedFiles.length >= 4}
                >
                  <Video className="h-5 w-5 mr-2" />
                  Video
                </Button>
              </div>

              <Button 
                type="submit" 
                variant="cosmic"
                disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}