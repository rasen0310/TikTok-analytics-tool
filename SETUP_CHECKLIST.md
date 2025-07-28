# TikTok OAuth セットアップチェックリスト

## 1. Supabase設定
- [ ] TIKTOK_OAUTH_SETUP.sqlを実行
- [ ] テーブルが作成されたことを確認
  - `tiktok_accounts`
  - `oauth_states`
  - `tiktok_accounts_public` (ビュー)
- [ ] RLSポリシーが有効になっていることを確認

## 2. TikTok Developer設定
- [ ] TikTok Developerアカウント作成
- [ ] アプリ作成
- [ ] Client Key取得
- [ ] Client Secret取得
- [ ] リダイレクトURL設定
  - 本番: `https://[your-vercel-app].vercel.app/auth/tiktok/callback`
  - 開発: `http://localhost:5173/auth/tiktok/callback`
- [ ] 必要なスコープを有効化
  - `user.info.basic`
  - `video.list`

## 3. 環境変数設定
### Vercel
- [ ] `VITE_TIKTOK_CLIENT_KEY`設定

### ローカル開発
- [ ] `.env.local`に`VITE_TIKTOK_CLIENT_KEY`追加

### Supabase Edge Functions
- [ ] `TIKTOK_CLIENT_KEY`設定
- [ ] `TIKTOK_CLIENT_SECRET`設定

## 4. Edge Functionsデプロイ
- [ ] Supabase CLIインストール
- [ ] プロジェクトリンク完了
- [ ] `tiktok-oauth`デプロイ
- [ ] `tiktok-refresh-token`デプロイ
- [ ] `tiktok-sync-data`デプロイ

## 5. 動作確認
- [ ] 設定ページでTikTok連携タブが表示される
- [ ] 「TikTokアカウントを連携」ボタンが機能する
- [ ] OAuth認証フローが完了する
- [ ] アカウント情報が表示される
- [ ] データ同期が動作する

## トラブルシューティング

### エラー: "TikTok API設定が完了していません"
→ 環境変数`VITE_TIKTOK_CLIENT_KEY`が設定されていない

### エラー: "TikTok OAuth機能は現在利用できません"
→ Edge Functionsがデプロイされていない

### エラー: "無効な状態トークンです"
→ リダイレクトURLの設定が正しくない

### エラー: "TikTokアカウントが見つかりません"
→ データベーステーブルが作成されていない