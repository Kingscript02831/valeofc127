
-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  duration INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT media_type_check CHECK (media_type IN ('image', 'video'))
);

-- Create story_views table to track which users have viewed which stories
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Set up RLS for stories table
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stories" ON stories FOR SELECT USING (true);
CREATE POLICY "Users can insert their own stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stories" ON stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- Set up RLS for story_views table
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view story_views" ON story_views FOR SELECT USING (true);
CREATE POLICY "Users can insert their own story_views" ON story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "Users can update their own story_views" ON story_views FOR UPDATE USING (auth.uid() = viewer_id);
CREATE POLICY "Users can delete their own story_views" ON story_views FOR DELETE USING (auth.uid() = viewer_id);

-- Add indexes for performance
CREATE INDEX story_user_id_idx ON stories(user_id);
CREATE INDEX story_expires_at_idx ON stories(expires_at);
CREATE INDEX story_views_story_id_idx ON story_views(story_id);
CREATE INDEX story_views_viewer_id_idx ON story_views(viewer_id);
