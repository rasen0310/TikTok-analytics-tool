# TikTok Analytics Tool

TikTokの動画分析データを可視化・管理するWebアプリケーション

## 🚀 機能

- **ダッシュボード**: 動画パフォーマンスの概要表示
- **データ可視化**: 再生数、いいね数、コメント数等のグラフ表示
- **日付範囲フィルター**: 7日、14日、21日、カスタム期間での分析
- **ユーザー認証**: Supabaseによるセキュアな認証システム
- **🔄 TikTok API自動切り替え**: 環境変数による開発/本番モードの自動判定
- **📊 モックデータ**: 開発時に実際のAPIキーなしで動作
- **TikTok OAuth**: TikTokアカウント連携（オプション）
- **競合分析**: 競合他社の分析機能（Coming Soon）
- **AI レポート**: AIによる分析レポート生成

## 🛠 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI) v7
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js + react-chartjs-2
- **Routing**: React Router v6
- **Deployment**: Vercel

## 📋 セットアップ

### 1. プロジェクトのクローン

```bash
git clone https://github.com/rasen0310/TikTok-analytics-tool.git
cd TikTok-analytics-tool
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定：

```env
# Supabase設定（必須）
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# TikTok API設定（オプション - 本番API使用時のみ）
VITE_TIKTOK_CLIENT_KEY=your-tiktok-client-key
```

**🔄 TikTok API自動切り替えについて:**
- `VITE_TIKTOK_CLIENT_KEY`が未設定 → **モックデータ**を使用
- `VITE_TIKTOK_CLIENT_KEY`を設定 → **本番TikTok API**に自動切り替え
- コード変更は一切不要！

### 4. データベースセットアップ

Supabaseプロジェクトで `FINAL_DATABASE_SETUP.sql` を実行してテーブルを作成

### 5. 開発サーバー起動

```bash
npm run dev
```

## 🚀 デプロイ

### Vercel デプロイ

1. GitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ実行

### TikTok API本番設定（オプション）

#### 🔧 開発フェーズ
1. **そのまま開発開始！** - モックデータで全機能が動作します
2. 実際のUIとワークフローを確認
3. 開発完了後に本番APIに切り替え

#### 🚀 本番切り替え手順
1. [TikTok for Developers](https://developers.tiktok.com/) でアプリ作成
2. Client Key を取得
3. 環境変数 `VITE_TIKTOK_CLIENT_KEY` に設定
4. **自動的に本番APIに切り替わります！**

#### 🌐 Vercel デプロイ時
```bash
# Vercelの環境変数設定
vercel env add VITE_TIKTOK_CLIENT_KEY production
```

## 📁 プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
├── contexts/           # React Context (認証等)
├── hooks/              # カスタムフック (useTikTokData等)
├── lib/                # ライブラリ設定
│   └── tiktok/         # 🔄 TikTok API自動切り替えシステム
│       ├── index.ts    # - メインクライアント（自動切り替え）
│       ├── mock-client.ts    # - モックデータクライアント
│       └── api-client.ts     # - 本番APIクライアント
├── pages/              # ページコンポーネント
├── types/              # TypeScript型定義
│   └── tiktok-api.ts   # - TikTok API統一インターフェース
└── data/               # モックデータ

supabase/
└── functions/          # Edge Functions (TikTok OAuth)
```

## 🗄 データベーススキーマ

主要テーブル:
- `users` - ユーザー情報
- `tiktok_accounts` - TikTokアカウント連携情報
- `tiktok_videos` - 動画データ
- `oauth_states` - OAuth状態管理

## 📊 使用方法

### 🚀 すぐに始める（モックデータ）
1. **Google認証**: Googleアカウントでログイン
2. **ダッシュボード**: 自動生成されたモックデータで動作確認
3. **日付フィルター**: 7日/14日/21日/カスタムで期間分析
4. **設定 > API設定**: 現在のモード（モックデータ/本番API）を確認

### 🔄 本番APIに切り替え
1. **設定 > API設定** タブを開く
2. **Client Key** を入力
3. **保存** → 自動的に本番APIに切り替わります
4. **TikTok連携** タブでOAuth認証を完了

### 📊 データ分析
- **サマリーカード**: 総再生数、いいね数、エンゲージメント率
- **グラフ表示**: 各メトリクスの時系列推移
- **動画テーブル**: 個別動画の詳細パフォーマンス

## 🆕 新機能: TikTok API自動切り替えシステム

### ✨ 特徴
- **🔄 環境変数による自動判定**: APIキーの有無で開発/本番モードを自動切り替え
- **📊 リアルなモックデータ**: 実際のTikTok APIと同じインターフェースで開発可能
- **🚀 ワンクリック切り替え**: 設定ページでAPIキーを入力するだけで本番APIに移行
- **🛡️ 型安全性**: TypeScriptで統一されたAPIインターフェース

### 🔧 技術詳細
```typescript
// 自動切り替えの仕組み
export class TikTokClient {
  constructor() {
    this.mode = this.detectMode(); // APIキーの有無を自動検出
    this.client = this.mode === 'production' 
      ? new TikTokAPIClient() 
      : new TikTokMockClient();
  }
}

// 使用者は同じメソッドを使用
const client = new TikTokClient();
const data = await client.getVideoAnalytics(params); // モード関係なく同じ
```

## 🔧 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run preview      # ビルド版のプレビュー
npm run lint         # ESLint実行
```

## 📝 ライセンス

MIT License

## 🤝 貢献

Issues やPull Requests を歓迎します。

## 📞 サポート

問題が発生した場合は Issues でお知らせください。