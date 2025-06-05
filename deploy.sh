#!/bin/bash

# GitHub Pages Portfolio Deployment Script v2.0
echo "🚀 GitHub Pages デプロイメント・トラブルシューティングスクリプト"
echo "============================================================="

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 現在のディレクトリを確認
echo -e "${BLUE}📁 現在のディレクトリ: $(pwd)${NC}"

# 必要なファイルの存在確認
required_files=("index.html" "style.css" "script.js")
missing_files=()

echo -e "${BLUE}🔍 必要なファイルの確認中...${NC}"
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
        echo -e "${RED}   ❌ $file が見つかりません${NC}"
    else
        echo -e "${GREEN}   ✅ $file 確認${NC}"
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo -e "${RED}❌ 以下のファイルが見つかりません:${NC}"
    printf "   - %s\n" "${missing_files[@]}"
    echo -e "${YELLOW}   必要なファイルを配置してから再実行してください。${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 全ての必要なファイルが確認できました${NC}"

# Git状態確認
if [ ! -d ".git" ]; then
    echo -e "${BLUE}📁 Gitリポジトリを初期化中...${NC}"
    git init
    git branch -M main
    echo -e "${GREEN}✅ Git初期化完了${NC}"
else
    echo -e "${BLUE}📁 既存のGitリポジトリを使用${NC}"
fi

# .gitignoreファイルの作成
if [ ! -f ".gitignore" ]; then
    echo -e "${BLUE}📄 .gitignoreファイルを作成中...${NC}"
    cat > .gitignore << 'EOL'
# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo
*~

# Node modules (if using build tools)
node_modules/
npm-debug.log*

# Temporary files
*.tmp
*.temp

# Jekyll
_site/
.jekyll-cache/
.jekyll-metadata
EOL
    echo -e "${GREEN}✅ .gitignore作成完了${NC}"
fi

# 現在のファイル一覧表示
echo -e "${BLUE}📋 現在のファイル構成:${NC}"
ls -la | grep -v "^total" | while read line; do
    echo "   $line"
done

# ファイルをステージング
echo -e "${BLUE}📝 ファイルをステージング中...${NC}"
git add .

# コミット状況を確認
if git diff --staged --quiet; then
    echo -e "${YELLOW}ℹ️  変更がないため、コミットをスキップします${NC}"
else
    # コミット
    echo -e "${BLUE}💾 変更をコミット中...${NC}"
    commit_message="Portfolio website update - $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$commit_message"
    echo -e "${GREEN}✅ コミット完了: $commit_message${NC}"
fi

# リモートリポジトリの状態確認
if git remote -v | grep -q origin; then
    echo -e "${GREEN}✅ リモートリポジトリが設定されています${NC}"
    git remote -v
    echo -e "${BLUE}🚀 リモートにプッシュ中...${NC}"
    
    # プッシュの実行
    if git push origin main; then
        echo -e "${GREEN}✅ プッシュが成功しました！${NC}"
    else
        echo -e "${RED}❌ プッシュに失敗しました${NC}"
        echo -e "${YELLOW}💡 以下を確認してください:${NC}"
        echo "   - GitHubでリポジトリが作成されているか"
        echo "   - リモートURLが正しいか"
        echo "   - 認証情報が正しいか"
    fi
else
    echo -e "${YELLOW}⚠️  リモートリポジトリが設定されていません${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 ローカル準備完了！${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! git remote -v | grep -q origin; then
    echo -e "${YELLOW}🔗 次のステップ - リモートリポジトリの設定:${NC}"
    echo "=================================="
    echo ""
    echo -e "${BLUE}1. GitHubで新しいリポジトリを作成${NC}"
    echo "   👉 https://github.com/new"
    echo "   📝 リポジトリ名の推奨:"
    echo "      - 個人サイト: YOUR_USERNAME.github.io"
    echo "      - プロジェクトサイト: portfolio または任意の名前"
    echo ""
    echo -e "${BLUE}2. リモートリポジトリを追加:${NC}"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git"
    echo ""
    echo -e "${BLUE}3. 初回プッシュ:${NC}"
    echo "   git push -u origin main"
    echo ""
fi

echo -e "${BLUE}🌐 GitHub Pages を有効化:${NC}"
echo "=============================="
echo "👉 リポジトリの Settings > Pages"
echo "📋 Source: 'Deploy from a branch'"
echo "🌿 Branch: 'main' / '/ (root)'"
echo "💾 Save をクリック"
echo ""

echo -e "${GREEN}🚀 予想されるサイトURL:${NC}"
echo "========================"
echo "🌐 https://YOUR_USERNAME.github.io/YOUR_REPOSITORY"
echo ""

echo -e "${YELLOW}⏰ 注意事項:${NC}"
echo "============"
echo "• GitHub Pagesの反映には2-10分程度かかります"
echo "• 404エラーが出る場合は以下を確認:"
echo "  - リポジトリ名が正しいか"
echo "  - index.htmlファイルがルートディレクトリにあるか"
echo "  - GitHub Pagesの設定が有効になっているか"
echo "  - ブランチがmainに設定されているか"
echo ""

echo -e "${BLUE}🔧 トラブルシューティング:${NC}"
echo "=========================="
echo "📝 404エラーの解決方法:"
echo "1. test.html で動作確認 (https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/test.html)"
echo "2. Settings > Pages で Source設定を再確認"
echo "3. Actions タブでビルド状況を確認"
echo "4. ファイル名が index.html (小文字) であることを確認"
echo ""

echo -e "${GREEN}🎨 カスタマイズのヒント:${NC}"
echo "======================"
echo "• index.html でコンテンツを編集"
echo "• style.css で色やデザインを変更"
echo "• script.js で機能を追加"
echo "• 画像はUnsplashやPixabayなどから追加可能"
echo ""

echo -e "${BLUE}📚 詳細な手順は README.md をご確認ください${NC}"
echo ""
echo -e "${GREEN}🎯 成功をお祈りしています！${NC}"