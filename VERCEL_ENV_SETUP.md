# Vercel環境変数設定ガイド

## 🚨 重要: Vercelで環境変数を設定してください

現在、Vercelで環境変数が設定されていないため、アプリが正常に動作しません。

### 1. Vercelダッシュボードにアクセス

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. `TikTok-analytics-tool` プロジェクトを選択
3. `Settings` タブをクリック
4. `Environment Variables` セクションを選択

### 2. 以下の環境変数を追加

#### 必須: Supabase設定
```
Name: VITE_SUPABASE_URL
Value: https://bijyeptqgqkbrbopelyz.supabase.co
Environment: Production, Preview, Development (全てチェック)
```

```
Name: VITE_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpanllcHRxZ3FrYnJib3BlbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NDY3MDIsImV4cCI6MjA2OTIyMjcwMn0.uUyZ_0ixcjJ9sKizqM6E8k1i3CUUbY4RmoKhsJIzuco
Environment: Production, Preview, Development (全てチェック)
```

#### オプション: TikTok OAuth（後で設定）
```
Name: VITE_TIKTOK_CLIENT_KEY
Value: (TikTok Developer Consoleで取得したClient Key)
Environment: Production, Preview, Development (全てチェック)
```

### 3. 設定後の確認

1. 環境変数を保存
2. **重要**: 新しいデプロイをトリガーするために、以下のいずれかを実行：
   - GitHubにプッシュ
   - Vercelダッシュボードで「Redeploy」をクリック

### 4. 設定確認方法

デプロイ完了後、アプリにアクセスして：

1. 左上のデバッグパネルを確認
2. 以下が「Set」になっていることを確認：
   - `VITE_SUPABASE_URL: Set`
   - `VITE_SUPABASE_ANON_KEY: Set`

### トラブルシューティング

**問題**: 環境変数を設定したが、まだ「Missing」と表示される
**解決**: 
1. Vercelでもう一度デプロイを実行
2. ブラウザのキャッシュをクリア（Ctrl+F5 または Cmd+Shift+R）

**問題**: デバッグパネルが表示されない  
**解決**: ブラウザの開発者ツール（F12）でConsoleを確認してエラーメッセージを見る

## 🎯 設定完了の確認

環境変数が正しく設定されると：
- ✅ アプリが正常に表示される
- ✅ ログインページが表示される
- ✅ エラーメッセージがない

## 次のステップ

環境変数設定が完了したら：
1. データベースのセットアップ
2. TikTok OAuth APIの設定
3. 完全な機能テスト