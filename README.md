# TikTok Analytics Tool

TikTokの動画分析データを可視化・管理するWebアプリケーション

## 🚀 機能

- **ダッシュボード**: 動画パフォーマンスの概要表示
- **データ可視化**: 再生数、いいね数、コメント数等のグラフ表示
- **日付範囲フィルター**: 7日、14日、21日、カスタム期間での分析
- **ユーザー認証**: Supabaseによるセキュアな認証システム
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
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_TIKTOK_CLIENT_KEY=your-tiktok-client-key  # オプション
```

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

### TikTok OAuth 設定（オプション）

1. [TikTok for Developers](https://developers.tiktok.com/) でアプリ作成
2. Supabase Edge Functions をデプロイ
3. 環境変数に Client Key を設定

## 📁 プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
├── contexts/           # React Context (認証等)
├── hooks/              # カスタムフック
├── lib/                # ライブラリ設定
├── pages/              # ページコンポーネント
├── types/              # TypeScript型定義
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

1. **アカウント作成**: メールアドレスでアカウント登録
2. **ダッシュボード**: 動画データの概要を確認
3. **日付フィルター**: 期間を指定して分析
4. **設定**: TikTokアカウント連携（オプション）

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