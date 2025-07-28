-- TikTok動画データテーブルの作成
-- このテーブルは、TikTokアカウントから取得した動画情報を保存します

-- 既存のテーブルがある場合は削除（開発環境のみで使用）
-- DROP TABLE IF EXISTS tiktok_videos CASCADE;

-- TikTok動画テーブル
CREATE TABLE tiktok_videos (
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

-- インデックス作成
CREATE INDEX idx_tiktok_videos_user_id ON tiktok_videos(user_id);
CREATE INDEX idx_tiktok_videos_account_id ON tiktok_videos(tiktok_account_id);
CREATE INDEX idx_tiktok_videos_post_date ON tiktok_videos(post_date);
CREATE INDEX idx_tiktok_videos_views ON tiktok_videos(views DESC);
CREATE INDEX idx_tiktok_videos_engagement ON tiktok_videos((likes + comments + shares) DESC);

-- Row Level Security (RLS) 有効化
ALTER TABLE tiktok_videos ENABLE ROW LEVEL SECURITY;

-- RLSポリシー：ユーザーは自分のTikTokアカウントの動画のみ参照可能
CREATE POLICY "Users can view own TikTok videos" ON tiktok_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own TikTok videos" ON tiktok_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own TikTok videos" ON tiktok_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own TikTok videos" ON tiktok_videos
  FOR DELETE USING (auth.uid() = user_id);

-- 更新日時自動更新のトリガー
CREATE TRIGGER update_tiktok_videos_updated_at
  BEFORE UPDATE ON tiktok_videos
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 統計ビュー：日別の動画パフォーマンス
CREATE VIEW tiktok_daily_stats AS
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

-- 統計ビューのRLS
ALTER VIEW tiktok_daily_stats SET (security_barrier = true);

-- エンゲージメント率を計算する関数
CREATE OR REPLACE FUNCTION calculate_engagement_rate(views INTEGER, likes INTEGER, comments INTEGER, shares INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  IF views = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND(((likes + comments + shares)::DECIMAL / views * 100), 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 動画データ挿入時にエンゲージメント率を自動計算するトリガー
CREATE OR REPLACE FUNCTION update_engagement_rate()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- エンゲージメント率は必要に応じて計算（現在のコードでは使用していないため、コメントアウト）
  -- NEW.engagement_rate = calculate_engagement_rate(NEW.views, NEW.likes, NEW.comments, NEW.shares);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_engagement_before_insert
  BEFORE INSERT OR UPDATE ON tiktok_videos
  FOR EACH ROW EXECUTE PROCEDURE update_engagement_rate();

-- サンプルクエリ
/*
-- 特定ユーザーの動画一覧を取得
SELECT * FROM tiktok_videos 
WHERE user_id = auth.uid() 
ORDER BY post_date DESC, post_time DESC;

-- 日別統計を取得
SELECT * FROM tiktok_daily_stats 
WHERE user_id = auth.uid() 
ORDER BY post_date DESC;

-- 最も視聴された動画TOP10
SELECT video_url, description, views, likes, comments, shares
FROM tiktok_videos 
WHERE user_id = auth.uid()
ORDER BY views DESC
LIMIT 10;

-- 期間指定でのパフォーマンス集計
SELECT 
  COUNT(*) as total_videos,
  SUM(views) as total_views,
  SUM(likes) as total_likes,
  AVG(views) as avg_views_per_video
FROM tiktok_videos
WHERE user_id = auth.uid()
  AND post_date BETWEEN '2024-01-01' AND '2024-01-31';
*/