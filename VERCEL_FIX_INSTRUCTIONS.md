# 🚨 Vercel環境変数 緊急設定手順

現在のステータス: ❌ 環境変数未設定

## 手順1: Vercelダッシュボードにアクセス

1. **[Vercel Dashboard](https://vercel.com/dashboard)** にアクセス
2. **TikTok-analytics-tool** プロジェクトをクリック
3. **Settings** タブをクリック
4. 左メニューから **Environment Variables** をクリック

## 手順2: 環境変数を追加

### 1つ目の環境変数
```
Name: VITE_SUPABASE_URL
Value: https://bijyeptqgqkbrbopelyz.supabase.co
Environment: ✅ Production ✅ Preview ✅ Development (全てチェック)
```
「Save」をクリック

### 2つ目の環境変数
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpanllcHRxZ3FrYnJib3BlbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NDY3MDIsImV4cCI6MjA2OTIyMjcwMn0.uUyZ_0ixcjJ9sKizqM6E8k1i3CUUbY4RmoKhsJIzuco
Environment: ✅ Production ✅ Preview ✅ Development (全てチェック)
```
「Save」をクリック

## 手順3: 再デプロイを実行

環境変数を保存した後、**必ず再デプロイが必要**です：

### 方法A: Vercelダッシュボードから
1. **Deployments** タブをクリック
2. 最新のデプロイメントの右側の **「・・・」** メニューをクリック
3. **「Redeploy」** をクリック
4. **「Redeploy」** を再度クリックして確認

### 方法B: GitHubからプッシュ
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

## 手順4: 確認

再デプロイ完了後（約2-3分）：

1. アプリのURLにアクセス
2. 左上のデバッグパネルを確認
3. **成功時の表示**:
   ```
   ✅ Debug Info (緑色背景)
   Supabase: ✅ Configured
   TikTok API: ⚠️ Optional
   ```

## 🎯 重要なポイント

- ✅ **Environment**で3つ全て（Production, Preview, Development）にチェック
- ✅ 保存後に**必ず再デプロイ**を実行
- ✅ 値はコピー&ペーストで正確に入力

## トラブルシューティング

**Q: 設定したが、まだ ❌ Missing と表示される**
A: 
1. 再デプロイを実行したか確認
2. ブラウザキャッシュをクリア（Ctrl+F5）
3. 5分程度待ってから再確認

**Q: Vercelダッシュボードが見つからない**
A: 正しいGitHubアカウントでログインしているか確認

**Q: プロジェクト名が違う**  
A: `TikTok-analytics-tool`または似た名前のプロジェクトを探す

## 📞 サポート

設定完了後、デバッグパネルの表示内容を教えてください！