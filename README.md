# 🎯 TikTok分析ツール - 開発セットアップ完全ガイド

## 📚 もくじ

1. [はじめに](#-はじめに)
2. [必要なもの](#-必要なもの)
3. [ステップ1: プロジェクトをダウンロード](#-ステップ1-プロジェクトをダウンロード)
4. [ステップ2: Supabaseのセットアップ](#-ステップ2-supabaseのセットアップ)
5. [ステップ3: Google認証のセットアップ](#-ステップ3-google認証のセットアップ)
6. [ステップ4: TikTok APIのセットアップ](#-ステップ4-tiktok-apiのセットアップ)
7. [ステップ5: 環境変数の設定](#-ステップ5-環境変数の設定)
8. [ステップ6: ローカルでの開発](#-ステップ6-ローカルでの開発)
9. [ステップ7: Vercelへのデプロイ](#-ステップ7-vercelへのデプロイ)
10. [困ったときは](#-困ったときは)
11. [必要な情報チェックリスト](#-必要な情報チェックリスト)

---

## 👋 はじめに

このTikTok分析ツールは、TikTokのデータを見やすく表示するWebアプリケーションです。
このガイドでは、小学生でもわかるように、一つずつていねいに説明します。

### このアプリでできること
- 📊 TikTokの再生回数やいいねの数を見る
- 📈 グラフで成長を確認する
- 🤖 AIがレポートを作ってくれる
- 👥 他の人と比較する

---

## 🛠 必要なもの

開発を始める前に、以下のものを準備してください：

### パソコンにインストールするもの
1. **Node.js** (バージョン18以上)
   - [ダウンロードページ](https://nodejs.org/ja/)から「LTS」と書いてあるボタンをクリック
   - ダウンロードしたファイルをダブルクリックしてインストール

2. **Git**
   - [ダウンロードページ](https://git-scm.com/downloads)からダウンロード
   - インストールは「Next」を押し続けるだけでOK

3. **Visual Studio Code** (おすすめのエディタ)
   - [ダウンロードページ](https://code.visualstudio.com/)からダウンロード

### 無料アカウントの作成
1. **GitHub** - コードを保存する場所
   - [GitHub](https://github.com)で「Sign up」をクリック

2. **Supabase** - データベースを使うため
   - [Supabase](https://supabase.com)で「Start your project」をクリック

3. **Vercel** - アプリを公開するため
   - [Vercel](https://vercel.com)で「Sign Up」をクリック

4. **Google Cloud** - Googleログインを使うため
   - [Google Cloud Console](https://console.cloud.google.com/)にGoogleアカウントでログイン

5. **TikTok for Developers** - TikTokのデータを取得するため
   - [TikTok for Developers](https://developers.tiktok.com/)でアカウント作成

---

## 📥 ステップ1: プロジェクトをダウンロード

### 1. ターミナル（黒い画面）を開く
- **Windows**: スタートメニューで「cmd」と入力
- **Mac**: Spotlightで「ターミナル」と検索

### 2. 作業フォルダを作る
```bash
# デスクトップに移動
cd Desktop

# プロジェクトをコピー（URLは実際のGitHubリポジトリに変更してください）
git clone https://github.com/your-username/tiktok-analytics-tool.git

# プロジェクトフォルダに入る
cd tiktok-analytics-tool

# 必要なファイルをインストール
npm install
```

💡 **ヒント**: コマンドは一つずつコピーして、ターミナルに貼り付けてEnterキーを押してください

---

## 🗄 ステップ2: Supabaseのセットアップ

Supabaseは、データを保存する場所です。

### 1. プロジェクトを作る
1. [Supabase](https://app.supabase.com/)にログイン
2. 「New project」をクリック
3. 以下を入力：
   - **Name**: `tiktok-analytics`（好きな名前でOK）
   - **Database Password**: 安全なパスワード（メモしておく！）
   - **Region**: `Northeast Asia (Tokyo)`を選ぶ

### 2. データベースを準備する
1. 左のメニューから「SQL Editor」をクリック
2. 「New query」をクリック
3. このプロジェクトの`FINAL_DATABASE_SETUP.sql`ファイルの内容をすべてコピー
4. エディタに貼り付けて「Run」をクリック

### 3. 必要な情報をメモする
1. 左のメニューから「Settings」→「API」をクリック
2. 以下をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`のような形
   - **anon public**: `eyJhbGci...`のような長い文字列

---

## 🔐 ステップ3: Google認証のセットアップ

Googleアカウントでログインできるようにします。

### 1. Google Cloud Consoleの設定

#### プロジェクトを作る
1. [Google Cloud Console](https://console.cloud.google.com/)を開く
2. 上の「プロジェクトを選択」をクリック
3. 「新しいプロジェクト」をクリック
4. プロジェクト名: `TikTok Analytics`（好きな名前でOK）
5. 「作成」をクリック

#### OAuth認証を設定
1. 左のメニューから「APIとサービス」→「認証情報」
2. 「+ 認証情報を作成」→「OAuth クライアント ID」
3. 「同意画面を構成」が出たら設定：
   - User Type: 「外部」を選択
   - アプリ名: `TikTok Analytics Tool`
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先: あなたのメールアドレス
4. もう一度「認証情報を作成」→「OAuth クライアント ID」
5. 以下を設定：
   - アプリケーションの種類: `ウェブアプリケーション`
   - 名前: `TikTok Analytics`
   
#### 重要な設定
**承認済みのJavaScript生成元**に追加：
```
http://localhost:5173
http://localhost:3000
https://あなたのアプリ名.vercel.app
```

**承認済みのリダイレクトURI**に追加：
```
https://あなたのSupabaseプロジェクトID.supabase.co/auth/v1/callback
```

6. 「作成」をクリック
7. **クライアントID**と**クライアントシークレット**をメモ

### 2. SupabaseでGoogle認証を有効化
1. Supabaseダッシュボードで「Authentication」→「Providers」
2. 「Google」を見つけて「Enable」をON
3. GoogleのクライアントIDとシークレットを貼り付け
4. 「Save」をクリック

---

## 📱 ステップ4: TikTok APIのセットアップ

TikTokのデータを取得できるようにします。

### 1. TikTok Developerアカウントの作成
1. [TikTok for Developers](https://developers.tiktok.com/)にアクセス
2. 「Register」をクリックしてアカウント作成
3. メールアドレスを確認

### 2. アプリを作成
1. 「Manage apps」→「Create app」
2. 以下を入力：
   - **App name**: `TikTok Analytics Tool`
   - **App description**: TikTokデータ分析ツール
   - **Category**: Analytics

### 3. 必要な権限を追加
「Add products」から以下を追加：
- **Login Kit**: ユーザーログイン用
- **Display API**: データ取得用

### 4. 設定を行う
#### Redirect URIs（リダイレクトURI）を追加：
```
http://localhost:5173/auth/tiktok/callback
https://あなたのアプリ名.vercel.app/auth/tiktok/callback
```

### 5. 必要な情報をメモ
- **Client Key**: アプリのID
- **Client Secret**: アプリの秘密の鍵

⚠️ **注意**: Client Secretは他の人に見せないでください！

---

## ⚙️ ステップ5: 環境変数の設定

アプリに必要な設定を書きます。

### 1. `.env`ファイルを作る
プロジェクトフォルダに`.env`ファイルを作成し、以下を入力：

```bash
# Supabaseの設定
VITE_SUPABASE_URL=あなたのSupabaseプロジェクトURL
VITE_SUPABASE_ANON_KEY=あなたのSupabase匿名キー

# TikTok APIの設定
VITE_TIKTOK_CLIENT_KEY=あなたのTikTokクライアントキー
VITE_TIKTOK_CLIENT_SECRET=あなたのTikTokクライアントシークレット
VITE_TIKTOK_REDIRECT_URI=http://localhost:5173/auth/tiktok/callback
```

💡 **例**：
```bash
VITE_SUPABASE_URL=https://bijyeptqgqkbrbopelyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_TIKTOK_CLIENT_KEY=awx1234567890
VITE_TIKTOK_CLIENT_SECRET=abcdef123456789...
VITE_TIKTOK_REDIRECT_URI=http://localhost:5173/auth/tiktok/callback
```

⚠️ **重要**: `.env`ファイルはGitHubにアップロードしないでください！

---

## 💻 ステップ6: ローカルでの開発

### 1. 開発サーバーを起動
```bash
# プロジェクトフォルダで実行
npm run dev
```

### 2. ブラウザで確認
1. ブラウザを開く
2. `http://localhost:5173`にアクセス
3. アプリが表示されたら成功！

### 3. 開発中によく使うコマンド
```bash
# 開発サーバーを起動
npm run dev

# アプリをビルド（本番用ファイルを作る）
npm run build

# ビルドしたファイルを確認
npm run preview

# コードのチェック
npm run lint
```

---

## 🚀 ステップ7: Vercelへのデプロイ

アプリをインターネットに公開します。

### 1. GitHubにコードをアップロード
```bash
# 変更をすべて追加
git add .

# 変更を記録
git commit -m "初回コミット"

# GitHubにアップロード
git push origin main
```

### 2. Vercelでデプロイ
1. [Vercel](https://vercel.com)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 「Import」をクリック

### 3. 環境変数を設定
「Environment Variables」で以下を追加：

| 名前 | 値 |
|------|-----|
| VITE_SUPABASE_URL | あなたのSupabaseプロジェクトURL |
| VITE_SUPABASE_ANON_KEY | あなたのSupabase匿名キー |
| VITE_TIKTOK_CLIENT_KEY | あなたのTikTokクライアントキー |
| VITE_TIKTOK_CLIENT_SECRET | あなたのTikTokクライアントシークレット |
| VITE_TIKTOK_REDIRECT_URI | https://あなたのアプリ名.vercel.app/auth/tiktok/callback |

### 4. デプロイ
「Deploy」をクリックして待つ（3〜5分）

### 5. 公開URLを確認
デプロイが完了したら、`https://あなたのアプリ名.vercel.app`でアクセスできます！

### 6. 設定の更新
#### Google Cloud Console
1. 認証情報の設定に戻る
2. 承認済みのJavaScript生成元に本番URLを追加：
   ```
   https://あなたのアプリ名.vercel.app
   ```

#### TikTok Developer
1. アプリ設定に戻る
2. Redirect URIに本番URLを追加：
   ```
   https://あなたのアプリ名.vercel.app/auth/tiktok/callback
   ```

---

## 🆘 困ったときは

### よくあるエラーと解決方法

#### 1. 「npm: command not found」と表示される
**解決方法**: Node.jsをインストールしてください

#### 2. Googleログインができない
**確認すること**:
- Google Cloud ConsoleのリダイレクトURIが正しいか
- SupabaseのGoogle認証が有効になっているか
- クライアントIDとシークレットが正しいか

#### 3. TikTokデータが表示されない
**確認すること**:
- TikTok APIキーが正しいか
- リダイレクトURIが設定されているか
- `.env`ファイルの内容が正しいか

#### 4. Vercelでビルドエラー
**確認すること**:
- 環境変数がすべて設定されているか
- package.jsonのスクリプトが正しいか

### デバッグのコツ
1. **ブラウザの開発者ツール**を使う
   - F12キーを押す
   - 「Console」タブでエラーを確認

2. **ログを確認**
   - Vercelのダッシュボードで「Functions」タブ
   - Supabaseのダッシュボードで「Logs」

---

## ✅ 必要な情報チェックリスト

開発を始める前に、以下の情報がすべて揃っているか確認してください：

### Supabase
- [ ] プロジェクトURL (`https://xxxxx.supabase.co`)
- [ ] 匿名キー (anon key)
- [ ] データベースパスワード

### Google Cloud
- [ ] クライアントID
- [ ] クライアントシークレット
- [ ] プロジェクトID

### TikTok API
- [ ] クライアントキー
- [ ] クライアントシークレット
- [ ] アプリID

### Vercel
- [ ] アカウント
- [ ] プロジェクト名
- [ ] 本番URL

### GitHub
- [ ] アカウント
- [ ] リポジトリURL

---

## 📁 プロジェクト構成

```
tiktok-analytics-tool/
├── src/                    # ソースコード
│   ├── components/         # 部品（ボタンなど）
│   ├── pages/             # ページ
│   ├── lib/               # 便利な機能
│   └── App.tsx            # メインアプリ
├── public/                # 画像など
├── supabase/              # Supabase設定
│   └── functions/         # サーバー機能
├── .env                   # 環境変数（秘密！）
├── package.json           # プロジェクト設定
├── vercel.json           # Vercel設定
└── README.md             # このファイル
```

---

## 🎉 完成！

おめでとうございます！これですべての設定が完了しました。

### 次のステップ
1. アプリをカスタマイズする
2. 新しい機能を追加する
3. デザインを変更する

### 役立つリンク
- [React公式ドキュメント](https://ja.react.dev/)
- [Supabaseドキュメント](https://supabase.com/docs)
- [Vercelドキュメント](https://vercel.com/docs)
- [TikTok API](https://developers.tiktok.com/doc/overview)

---

## 📝 メモ欄

ここに自分用のメモを書いてください：

```
例：
- Supabase URL: https://bijyeptqgqkbrbopelyz.supabase.co
- Vercel URL: https://my-tiktok-app.vercel.app
- 作成日: 2024/12/28
```

---

## 🤝 サポート

質問がある場合は：
1. このREADMEをもう一度読む
2. エラーメッセージをGoogleで検索
3. ChatGPTやClaudeに質問する
4. 開発者に連絡する

頑張ってください！ 🚀