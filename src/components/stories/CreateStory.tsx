import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useStories } from '@/hooks/useStories';
import { validateImageFile, validateVideoFile } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Play, Pause, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateStoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStory({ open, onOpenChange }: CreateStoryProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [duration, setDuration] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { uploadStory, isUploading } = useStories();

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;

    // Validate file
    if (selectedFile.type.startsWith('image/')) {
      const validation = validateImageFile(selectedFile);
      if (!validation.valid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }
    } else if (selectedFile.type.startsWith('video/')) {
      const validation = await validateVideoFile(selectedFile);
      if (!validation.valid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an image or video file",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    
    // Set default duration based on file type
    if (selectedFile.type.startsWith('video/')) {
      setDuration(30);
    } else {
      setDuration(15);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setDuration(15);
    setUploadProgress(0);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image or video to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('caption', caption);
      formData.append('duration', duration.toString());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await uploadStory({
        media: file,
        duration
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Close dialog after successful upload
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 1000);

    } catch (error) {
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: "Failed to upload story. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const isVideo = file?.type.startsWith('video/');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Images (JPEG, PNG, WebP) or Videos (MP4, max 60s)
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              {/* Preview */}
              <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                {isVideo && preview ? (
                  <video
                    ref={videoRef}
                    src={preview}
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                ) : preview ? (
                  <img
                    src={preview}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                ) : null}
                
                {/* Media type indicator */}
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                    {isVideo ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                    {isVideo ? 'Video' : 'Image'}
                  </div>
                </div>

                {/* Video controls */}
                {isVideo && (
                  <button
                    onClick={toggleVideoPlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-12 w-12 text-white" />
                    ) : (
                      <Play className="h-12 w-12 text-white" />
                    )}
                  </button>
                )}

                {/* Remove file button */}
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Caption */}
              <div className="mt-4">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption to your story..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={200}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {caption.length}/200 characters
                </p>
              </div>

              {/* Duration for images */}
              {!isVideo && (
                <div>
                  <Label htmlFor="duration">Display Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={5}
                    max={30}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How long to display your image (5-30 seconds)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Uploading story... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || isUploading}
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : 'Share Story'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}