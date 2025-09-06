-- Update stories API endpoint to support both GET and POST
-- GET: Fetch active stories
-- POST: Create new story

-- First ensure stories table has proper structure
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS caption TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'image';

-- Update expires_at to use proper trigger instead of default
CREATE OR REPLACE FUNCTION set_story_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Set expiration to 24 hours from creation
  NEW.expires_at = NEW.created_at + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_story_expiration ON stories;

-- Create new trigger
CREATE TRIGGER trigger_set_story_expiration
  BEFORE INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION set_story_expiration();

-- Ensure proper RLS policies for stories
DROP POLICY IF EXISTS "Stories are viewable by everyone if not expired" ON stories;
CREATE POLICY "Stories are viewable by everyone if not expired" 
ON stories FOR SELECT 
USING (expires_at > now());

DROP POLICY IF EXISTS "Users can create their own stories" ON stories;  
CREATE POLICY "Users can create their own stories"
ON stories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create stories bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for stories
DROP POLICY IF EXISTS "Stories are publicly accessible" ON storage.objects;
CREATE POLICY "Stories are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

DROP POLICY IF EXISTS "Users can upload their own stories" ON storage.objects;
CREATE POLICY "Users can upload their own stories"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own stories" ON storage.objects;
CREATE POLICY "Users can update their own stories"
ON storage.objects FOR UPDATE
USING (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own stories" ON storage.objects;
CREATE POLICY "Users can delete their own stories"
ON storage.objects FOR DELETE
USING (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);