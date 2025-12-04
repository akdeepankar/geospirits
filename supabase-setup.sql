-- Create pages table for storing published pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  site_name TEXT,
  slug TEXT NOT NULL UNIQUE,
  components JSONB NOT NULL,
  theme TEXT NOT NULL DEFAULT 'light',
  header_image TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  page_animation TEXT DEFAULT 'none',
  animation_intensity INTEGER DEFAULT 1,
  chatbot_enabled BOOLEAN DEFAULT false,
  chatbot_api_key TEXT,
  chatbot_character_name TEXT,
  chatbot_character_prompt TEXT,
  chatbot_button_image TEXT,
  chatbot_button_emoji TEXT,
  theme_color TEXT DEFAULT '#8b008b',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add page_animation column if it doesn't exist (for existing databases)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS page_animation TEXT DEFAULT 'none';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS animation_intensity INTEGER DEFAULT 1;

-- Add chatbot columns if they don't exist (for existing databases)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS chatbot_enabled BOOLEAN DEFAULT false;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS chatbot_api_key TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS chatbot_character_name TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS chatbot_character_prompt TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS chatbot_button_image TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS chatbot_button_emoji TEXT;

-- Add theme color column if it doesn't exist (for existing databases)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#8b008b';

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS pages_user_id_idx ON pages(user_id);

-- Create index on published_at for sorting
CREATE INDEX IF NOT EXISTS pages_published_at_idx ON pages(published_at DESC);

-- Create index on slug for faster public page lookups
CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can view published pages (public access)
CREATE POLICY "Anyone can view published pages"
  ON pages
  FOR SELECT
  USING (true);

-- Create policy: Users can view their own pages
CREATE POLICY "Users can view their own pages"
  ON pages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own pages
CREATE POLICY "Users can insert their own pages"
  ON pages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own pages
CREATE POLICY "Users can update their own pages"
  ON pages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own pages
CREATE POLICY "Users can delete their own pages"
  ON pages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
