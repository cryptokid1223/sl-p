-- Database setup for VLEEB news website
-- Run this in your Supabase SQL editor

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    article_title TEXT NOT NULL,
    article_category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);

-- Create reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
    last_read TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article_id ON bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_article_id ON reading_progress(article_id);

-- Enable Row Level Security (RLS)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarks table
-- Allow users to read their own bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'user_%');

-- Allow users to insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'user_%');

-- Allow users to update their own bookmarks
CREATE POLICY "Users can update their own bookmarks" ON bookmarks
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'user_%');

-- Allow users to delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
    FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'user_%');

-- Create policies for reading_progress table
-- Allow users to read their own reading progress
CREATE POLICY "Users can view their own reading progress" ON reading_progress
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'user_%');

-- Allow users to insert their own reading progress
CREATE POLICY "Users can insert their own reading progress" ON reading_progress
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'user_%');

-- Allow users to update their own reading progress
CREATE POLICY "Users can update their own reading progress" ON reading_progress
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'user_%');

-- Allow users to delete their own reading progress
CREATE POLICY "Users can delete their own reading progress" ON reading_progress
    FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id LIKE 'user_%');

-- Grant necessary permissions
GRANT ALL ON bookmarks TO anon;
GRANT ALL ON reading_progress TO anon;
GRANT USAGE ON SCHEMA public TO anon; 