-- TikTok OAuth認証のためのデータベーススキーマ

-- TikTokアカウント情報テーブル
CREATE TABLE tiktok_accounts (
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
CREATE TABLE oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  state_token VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'tiktok',
  redirect_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TikTok動画データテーブル（既存のtiktok_videosテーブルを拡張）
ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS tiktok_account_id UUID REFERENCES tiktok_accounts(id) ON DELETE CASCADE;
ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS tiktok_video_id VARCHAR(255);
ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tiktok_videos ADD COLUMN IF NOT EXISTS hashtags TEXT[];

-- インデックス作成
CREATE INDEX idx_tiktok_accounts_user_id ON tiktok_accounts(user_id);
CREATE INDEX idx_tiktok_accounts_tiktok_user_id ON tiktok_accounts(tiktok_user_id);
CREATE INDEX idx_tiktok_accounts_active ON tiktok_accounts(user_id) WHERE is_active = true;
CREATE INDEX idx_oauth_states_user_id ON oauth_states(user_id);
CREATE INDEX idx_oauth_states_token ON oauth_states(state_token);
CREATE INDEX idx_oauth_states_expires ON oauth_states(expires_at);
CREATE INDEX idx_tiktok_videos_account ON tiktok_videos(tiktok_account_id);

-- Row Level Security (RLS) ポリシー
ALTER TABLE tiktok_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- TikTokアカウントのRLSポリシー
CREATE POLICY "Users can view own TikTok accounts" ON tiktok_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own TikTok accounts" ON tiktok_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own TikTok accounts" ON tiktok_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own TikTok accounts" ON tiktok_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- OAuth状態のRLSポリシー
CREATE POLICY "Users can manage own OAuth states" ON oauth_states
  FOR ALL USING (auth.uid() = user_id);

-- 更新日時自動更新のトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tiktok_accounts_updated_at
  BEFORE UPDATE ON tiktok_accounts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 期限切れOAuth状態を削除する関数
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 自動クリーンアップ（pg_cronが利用可能な場合）
-- SELECT cron.schedule('cleanup-oauth-states', '*/15 * * * *', 'SELECT cleanup_expired_oauth_states();');

-- TikTokアカウントデータビュー（機密情報を除く）
CREATE VIEW tiktok_accounts_public AS
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

-- ビューのRLSポリシー
ALTER VIEW tiktok_accounts_public SET (security_barrier = true);
CREATE POLICY "Users can view own TikTok accounts public data" ON tiktok_accounts_public
  FOR SELECT USING (auth.uid() = user_id);

-- 統計関数
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

-- 使用例コメント
/*
-- TikTokアカウント追加
INSERT INTO tiktok_accounts (
  user_id, 
  tiktok_user_id, 
  tiktok_username, 
  display_name,
  access_token,
  refresh_token,
  token_expires_at,
  scope
) VALUES (
  auth.uid(),
  '123456789',
  'username',
  'Display Name',
  'encrypted_access_token',
  'encrypted_refresh_token',
  NOW() + INTERVAL '1 hour',
  ARRAY['user.info.basic', 'video.list']
);

-- ユーザーのTikTok統計取得
SELECT get_user_tiktok_stats(auth.uid());

-- アクティブなTikTokアカウント取得
SELECT * FROM tiktok_accounts_public 
WHERE user_id = auth.uid() AND is_active = true;
*/