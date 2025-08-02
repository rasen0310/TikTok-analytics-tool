# Google OAuth設定手順

## 1. Google Cloud Console設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth クライアント ID」を選択
5. アプリケーションの種類として「ウェブアプリケーション」を選択
6. 以下の設定を追加：
   - 承認済みのJavaScript生成元: 
     - `http://localhost:5173` (開発環境)
     - `https://your-domain.com` (本番環境)
   - 承認済みのリダイレクトURI:
     - `https://bijyeptqgqkbrbopelyz.supabase.co/auth/v1/callback`

## 2. Supabase設定

1. [Supabaseダッシュボード](https://app.supabase.com/)にアクセス
2. プロジェクトを選択
3. 「Authentication」→「Providers」に移動
4. 「Google」を有効化
5. Google Cloud ConsoleからクライアントIDとクライアントシークレットをコピーして貼り付け
6. 「Save」をクリック

## 3. 環境変数設定

`.env`ファイルに以下を追加（既に設定済み）：

```
VITE_SUPABASE_URL=https://bijyeptqgqkbrbopelyz.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. トラブルシューティング

### エラー: "redirect_uri_mismatch"
- Google Cloud ConsoleのリダイレクトURIが正しく設定されているか確認
- URLの末尾にスラッシュがないか確認

### エラー: "Google login failed"
- Supabaseの設定でGoogleプロバイダーが有効になっているか確認
- クライアントIDとクライアントシークレットが正しいか確認

### ローカル開発環境での注意点
- `localhost`と`127.0.0.1`は異なるオリジンとして扱われるため、両方を承認済みのJavaScript生成元に追加することを推奨

## 5. 使用方法

1. ログイン画面で「Googleでログイン」ボタンをクリック
2. Googleアカウントを選択
3. 権限を許可
4. 自動的にアプリケーションにリダイレクトされます