# データベースセットアップガイド

## 必要なデータベース構成

### 1. データベースの選択肢

#### オプション1: Supabase（推奨）
- **メリット**: 無料プラン、簡単セットアップ、リアルタイム機能、認証機能内蔵
- **URL**: https://supabase.com

#### オプション2: PostgreSQL + Prisma
- **メリット**: 完全なコントロール、TypeScript型安全性
- **必要**: PostgreSQLサーバー

#### オプション3: MongoDB Atlas
- **メリット**: NoSQL、スケーラブル、無料プラン
- **URL**: https://www.mongodb.com/atlas

### 2. 必要なテーブル/コレクション

```sql
-- users テーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  tiktok_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- sessions テーブル（認証用）
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- tiktok_videos テーブル（将来的なデータ保存用）
CREATE TABLE tiktok_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- analytics_reports テーブル（AIレポート保存用）
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Supabaseでのセットアップ手順

1. **アカウント作成**
   - https://supabase.com にアクセス
   - GitHubアカウントでサインアップ

2. **プロジェクト作成**
   - 「New project」をクリック
   - プロジェクト名: `tiktok-analytics`
   - データベースパスワードを設定（安全に保管）
   - リージョン: Tokyo を選択

3. **テーブル作成**
   - SQL Editorタブに移動
   - 上記のSQLスクリプトを実行

4. **API情報の取得**
   - Settings → API
   - 以下をコピー：
     - Project URL
     - anon public key
     - service_role key（サーバー側で使用）

### 4. 環境変数の設定

`.env.local`ファイルを作成：

```env
# Supabase
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# バックエンド用（別途作成が必要）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### 5. バックエンドAPIの実装

`server/`ディレクトリに以下のファイルを作成：

#### server/index.js
```javascript
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ユーザー登録
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: hashedPassword, name }])
      .select()
      .single();
    
    if (error) throw error;
    
    const token = jwt.sign(
      { userId: data.id, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ user: data, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ログイン
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 6. フロントエンドの更新

AuthContext.tsxを実際のAPIに接続：

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const { user, token } = await response.json();
  localStorage.setItem('token', token);
  setUser(user);
};
```

### 7. セキュリティ注意事項

1. **パスワード**: 必ずハッシュ化（bcrypt使用）
2. **CORS**: 本番環境では適切に設定
3. **環境変数**: 絶対にGitにコミットしない
4. **HTTPS**: 本番環境では必須
5. **レート制限**: API攻撃対策を実装

### 8. Vercelデプロイ時の設定

1. Vercelダッシュボードで環境変数を設定
2. バックエンドAPIを別途デプロイ（Vercel Functions推奨）
3. CORSの設定を本番URLに更新

これで認証機能付きのTikTok分析ツールが完成します！