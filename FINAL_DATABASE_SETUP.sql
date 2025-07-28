-- 最終版: 完全なTikTok分析ツールのデータベーススキーマ
-- 実行順序: このファイルを最初に実行してください
-- 複数回実行しても安全になるよう設計されています

-- ========================================
-- 1. 拡張機能の有効化
-- ========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 2. 基本テーブルの作成
-- ========================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  tiktok_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TikTokアカウント情報テーブル
CREATE TABLE IF NOT EXISTS tiktok_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tiktok_user_id VARCHAR(255) UNIQUE NOT NULL,
  tiktok_username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  access_token TEXT, -- 暗号化して保存
  refresh_token TEXT, -- 暗号化して保存
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT[], -- 許可されたスコープ
  is_active BOOLEAN DEFAULT true,
  last_synced TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth状態管理テーブル（セキュリティ用）
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  state_token VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'tiktok',
  redirect_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TikTok動画データテーブル
CREATE TABLE IF NOT EXISTS tiktok_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tiktok_account_id UUID REFERENCES tiktok_accounts(id) ON DELETE CASCADE,
  tiktok_video_id VARCHAR(255) NOT NULL,
  video_url TEXT,
  post_date DATE,
  post_time TIME,
  duration INTEGER, -- 動画の長さ（秒）
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  avg_watch_time INTEGER DEFAULT 0, -- 平均視聴時間（秒）
  thumbnail_url TEXT,
  description TEXT,
  hashtags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tiktok_account_id, tiktok_video_id)
);

-- Analytics reports table
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tiktok_api_credentials JSONB,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. インデックスの作成
-- ========================================

-- users インデックス
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- tiktok_accounts インデックス
CREATE INDEX IF NOT EXISTS idx_tiktok_accounts_user_id ON tiktok_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_accounts_tiktok_user_id ON tiktok_accounts(tiktok_user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_accounts_active ON tiktok_accounts(user_id) WHERE is_active = true;

-- oauth_states インデックス
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_token ON oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- tiktok_videos インデックス
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_user_id ON tiktok_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_account_id ON tiktok_videos(tiktok_account_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_post_date ON tiktok_videos(post_date);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_views ON tiktok_videos(views DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_engagement ON tiktok_videos((likes + comments + shares) DESC);

-- analytics_reports インデックス
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_period ON analytics_reports(period_start, period_end);

-- user_settings インデックス
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ========================================
-- 4. Row Level Security (RLS) 設定
-- ========================================

-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- users RLSポリシー
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- tiktok_accounts RLSポリシー
DROP POLICY IF EXISTS "Users can view own TikTok accounts" ON tiktok_accounts;
CREATE POLICY "Users can view own TikTok accounts" ON tiktok_accounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own TikTok accounts" ON tiktok_accounts;
CREATE POLICY "Users can insert own TikTok accounts" ON tiktok_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own TikTok accounts" ON tiktok_accounts;
CREATE POLICY "Users can update own TikTok accounts" ON tiktok_accounts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own TikTok accounts" ON tiktok_accounts;
CREATE POLICY "Users can delete own TikTok accounts" ON tiktok_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- oauth_states RLSポリシー
DROP POLICY IF EXISTS "Users can manage own OAuth states" ON oauth_states;
CREATE POLICY "Users can manage own OAuth states" ON oauth_states
  FOR ALL USING (auth.uid() = user_id);

-- tiktok_videos RLSポリシー
DROP POLICY IF EXISTS "Users can view own TikTok videos" ON tiktok_videos;
CREATE POLICY "Users can view own TikTok videos" ON tiktok_videos
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own TikTok videos" ON tiktok_videos;
CREATE POLICY "Users can insert own TikTok videos" ON tiktok_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own TikTok videos" ON tiktok_videos;
CREATE POLICY "Users can update own TikTok videos" ON tiktok_videos
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own TikTok videos" ON tiktok_videos;
CREATE POLICY "Users can delete own TikTok videos" ON tiktok_videos
  FOR DELETE USING (auth.uid() = user_id);

-- analytics_reports RLSポリシー
DROP POLICY IF EXISTS "Users can view own reports" ON analytics_reports;
CREATE POLICY "Users can view own reports" ON analytics_reports
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reports" ON analytics_reports;
CREATE POLICY "Users can insert own reports" ON analytics_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reports" ON analytics_reports;
CREATE POLICY "Users can update own reports" ON analytics_reports
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reports" ON analytics_reports;
CREATE POLICY "Users can delete own reports" ON analytics_reports
  FOR DELETE USING (auth.uid() = user_id);

-- user_settings RLSポリシー
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- 5. 関数とトリガー
-- ========================================

-- 更新日時自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新日時トリガー
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_tiktok_accounts_updated_at ON tiktok_accounts;
CREATE TRIGGER update_tiktok_accounts_updated_at
  BEFORE UPDATE ON tiktok_accounts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_tiktok_videos_updated_at ON tiktok_videos;
CREATE TRIGGER update_tiktok_videos_updated_at
  BEFORE UPDATE ON tiktok_videos
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 期限切れOAuth状態を削除する関数
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- エンゲージメント率計算関数
CREATE OR REPLACE FUNCTION calculate_engagement_rate(views INTEGER, likes INTEGER, comments INTEGER, shares INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  IF views = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND(((likes + comments + shares)::DECIMAL / views * 100), 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ========================================
-- 6. ビューの作成
-- ========================================

-- TikTokアカウント公開情報ビュー
CREATE OR REPLACE VIEW tiktok_accounts_public AS
SELECT 
  id,
  user_id,
  tiktok_user_id,
  tiktok_username,
  display_name,
  avatar_url,
  is_active,
  last_synced,
  created_at,
  updated_at,
  CASE 
    WHEN token_expires_at > NOW() THEN true 
    ELSE false 
  END as token_valid
FROM tiktok_accounts;

-- 日別統計ビュー
CREATE OR REPLACE VIEW tiktok_daily_stats AS
SELECT 
  user_id,
  tiktok_account_id,
  post_date,
  COUNT(*) as video_count,
  SUM(views) as total_views,
  SUM(likes) as total_likes,
  SUM(comments) as total_comments,
  SUM(shares) as total_shares,
  AVG(views) as avg_views,
  AVG(likes) as avg_likes,
  AVG(avg_watch_time) as avg_watch_time_overall,
  MAX(views) as max_views,
  SUM(new_followers) as total_new_followers
FROM tiktok_videos
GROUP BY user_id, tiktok_account_id, post_date;

-- ビューのセキュリティ設定
ALTER VIEW tiktok_accounts_public SET (security_barrier = true);
ALTER VIEW tiktok_daily_stats SET (security_barrier = true);

-- ========================================
-- 7. 統計関数
-- ========================================

-- ユーザーのTikTok統計を取得する関数
CREATE OR REPLACE FUNCTION get_user_tiktok_stats(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- ユーザーが自分のデータのみアクセスできることを確認
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'total_accounts', COUNT(*),
    'active_accounts', COUNT(*) FILTER (WHERE is_active = true),
    'total_videos', COALESCE(SUM(video_count), 0),
    'last_sync', MAX(last_synced)
  )
  INTO result
  FROM (
    SELECT 
      ta.*,
      (SELECT COUNT(*) FROM tiktok_videos tv WHERE tv.tiktok_account_id = ta.id) as video_count
    FROM tiktok_accounts ta
    WHERE ta.user_id = target_user_id
  ) accounts;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. 実行完了確認
-- ========================================

-- テーブル作成確認
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('users', 'tiktok_accounts', 'oauth_states', 'tiktok_videos', 'analytics_reports', 'user_settings');
  
  RAISE NOTICE 'Created % tables successfully', table_count;
  
  IF table_count = 6 THEN
    RAISE NOTICE 'All required tables created successfully!';
  ELSE
    RAISE WARNING 'Some tables may not have been created properly. Expected 6, got %', table_count;
  END IF;
END $$;