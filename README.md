# MyPortfolio - スタイリッシュなポートフォリオサイト

GitHub Pagesで公開する、ダークテーマのモダンなポートフォリオWebサイトです。

## 🎨 デザイン特徴

- **ダークテーマ**: サイバーパンク風のスタイリッシュなデザイン
- **レスポンシブ**: モバイル・タブレット・デスクトップ完全対応
- **インタラクティブ**: ホバーエフェクトとスムーズアニメーション
- **モーダル機能**: プロジェクト詳細をモーダルで表示
- **Tailwind CSS**: モダンなCSSフレームワークを使用

## 🚀 機能

### ナビゲーション
- 固定ヘッダー with ブラー効果
- スムーススクロール
- モバイルハンバーガーメニュー
- ホバーアニメーション付きリンク

### セクション
1. **ヒーローセクション**: インパクトのあるタイトルとCTA
2. **作品セクション**: グリッドレイアウトでプロジェクト表示
3. **自己紹介セクション**: プロフィール写真と説明
4. **お問い合わせセクション**: バリデーション付きフォーム

### インタラクティブ要素
- カードホバーエフェクト（浮き上がり + グロー）
- モーダルウィンドウでプロジェクト詳細表示
- スクロール連動アニメーション
- フォームバリデーション

## 📁 ファイル構成

```
├── index.html          # メインHTMLファイル
├── style.css           # カスタムCSS（Tailwindの拡張）
├── script.js           # JavaScript機能
├── README.md           # このファイル
└── deploy.sh           # デプロイメントスクリプト
```

## 🛠️ 使用技術

- **HTML5**: セマンティックマークアップ
- **CSS3**: フレックスボックス、グリッド、アニメーション
- **Tailwind CSS**: ユーティリティファーストCSS
- **JavaScript (ES6+)**: モダンJavaScript
- **Google Fonts**: Poppins & Noto Sans JP
- **Material Icons**: アイコンフォント

## 🎯 カスタマイズガイド

### 色の変更
`style.css`で以下の色をカスタマイズできます：
- プライマリカラー: `#00E5FF` (シアン)
- 背景色: `#111827` (ダークグレー)
- カード背景: `#1F2937` (グレー)

### コンテンツの変更
`index.html`で以下を編集：
- タイトルと説明文
- プロジェクト情報（タイトル、説明、画像、タグ）
- プロフィール情報
- SNSリンク

### 新しいプロジェクトの追加
作品セクションに新しいカードを追加：

```html
<div class="card overflow-hidden project-card" 
     data-title="プロジェクト名"
     data-description="詳細な説明"
     data-image="画像URL"
     data-tags="タグ1,タグ2,タグ3">
    <!-- カード内容 -->
</div>
```

## 🚀 デプロイ方法

### 1. GitHubリポジトリ作成
```bash
# GitHubで新しいリポジトリを作成
# リポジトリ名: your-username.github.io または任意の名前
```

### 2. ファイルアップロード
```bash
cd /path/to/github-website
git init
git add .
git commit -m "Initial commit: Portfolio website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

### 3. GitHub Pages有効化
1. リポジトリの **Settings** > **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **/ (root)**
4. **Save**

### 4. サイト公開
数分後に以下のURLでアクセス可能：
`https://YOUR_USERNAME.github.io/YOUR_REPOSITORY`

## 📱 対応ブラウザ

- Chrome (推奨)
- Firefox
- Safari
- Edge
- モバイルブラウザ

## 🔧 開発者向け

### ローカル開発
```bash
# ローカルサーバー起動（Python）
python -m http.server 8000

# または（Node.js）
npx serve .
```

### パフォーマンス最適化
- 画像の最適化（WebP形式推奨）
- CSS/JSのミニファイ
- CDNの活用

### SEO設定
`index.html`のメタタグを編集：
```html
<meta name="description" content="あなたの説明">
<meta property="og:title" content="ポートフォリオタイトル">
<meta property="og:description" content="説明">
<meta property="og:image" content="OG画像URL">
```

## 🎨 デザインシステム

### カラーパレット
```css
/* プライマリ */
--primary: #00E5FF;
--primary-dark: #00B8D4;

/* 背景 */
--bg-primary: #111827;
--bg-secondary: #1F2937;
--bg-tertiary: #374151;

/* テキスト */
--text-primary: #E5E7EB;
--text-secondary: #9CA3AF;
```

### タイポグラフィ
- **見出し**: Poppins (600-700)
- **本文**: Poppins (300-400)
- **日本語**: Noto Sans JP

### アニメーション
- ホバー: 0.3s ease
- スクロール: 0.6s ease
- モーダル: fade + scale

## 📄 ライセンス

MIT License - 自由に使用・改変・配布可能

## 🤝 貢献

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 サポート

問題や質問がある場合：
1. GitHub Issues で報告
2. README.mdを確認
3. コードコメントを参照

---

**Happy Coding! 🚀**