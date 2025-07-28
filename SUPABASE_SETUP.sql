-- TikTok Analytics Tool - Supabase Database Setup

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  tiktok_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TikTok videos data table
CREATE TABLE tiktok_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_url VARCHAR(500) NOT NULL,
  post_date DATE NOT NULL,
  post_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  views BIGINT NOT NULL,
  likes BIGINT NOT NULL,
  comments BIGINT NOT NULL,
  shares BIGINT NOT NULL,
  new_followers INTEGER NOT NULL,
  avg_watch_time DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics reports table
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  tiktok_api_credentials JSONB,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for tiktok_videos table
CREATE POLICY "Users can view own videos" ON tiktok_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos" ON tiktok_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos" ON tiktok_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos" ON tiktok_videos
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for analytics_reports table
CREATE POLICY "Users can view own reports" ON analytics_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON analytics_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON analytics_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON analytics_reports
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_settings table
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();