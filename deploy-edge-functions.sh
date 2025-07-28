#!/bin/bash

echo "Supabase Edge Functionsのデプロイを開始します..."

# Supabase CLIがインストールされているか確認
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLIがインストールされていません。"
    echo "以下のコマンドでインストールしてください:"
    echo "brew install supabase/tap/supabase"
    exit 1
fi

# プロジェクトIDを設定（SupabaseダッシュボードのSettings > Generalから取得）
SUPABASE_PROJECT_ID="bijyeptqgqkbrbopelyz"

# Supabaseにログイン
echo "Supabaseにログインしています..."
supabase login

# プロジェクトをリンク
echo "プロジェクトをリンクしています..."
supabase link --project-ref $SUPABASE_PROJECT_ID

# Edge Functions用の環境変数を設定
echo "環境変数を設定しています..."
echo "TIKTOK_CLIENT_KEYとTIKTOK_CLIENT_SECRETを手動で設定してください:"
echo "supabase secrets set TIKTOK_CLIENT_KEY=実際のClient Key"
echo "supabase secrets set TIKTOK_CLIENT_SECRET=実際のClient Secret"
read -p "設定が完了したらEnterを押してください..."

# Edge Functionsをデプロイ
echo "Edge Functionsをデプロイしています..."

# tiktok-oauth function
echo "デプロイ中: tiktok-oauth..."
supabase functions deploy tiktok-oauth

# tiktok-refresh-token function
echo "デプロイ中: tiktok-refresh-token..."
supabase functions deploy tiktok-refresh-token

# tiktok-sync-data function
echo "デプロイ中: tiktok-sync-data..."
supabase functions deploy tiktok-sync-data

echo "デプロイが完了しました！"
echo ""
echo "次のステップ:"
echo "1. SupabaseダッシュボードでFunctionsの動作を確認"
echo "2. VercelでVITE_TIKTOK_CLIENT_KEYを設定"
echo "3. TikTok Developer ConsoleでリダイレクトURLを設定"