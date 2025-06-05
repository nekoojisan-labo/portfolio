#!/bin/bash

# 完全自動デプロイスクリプト - nekoojisan-labo
echo "🚀 nekoojisan-labo Portfolio 完全デプロイメント"
echo "==============================================="

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# エラーハンドリング
set +e  # エラーでも続行

echo -e "${BLUE}📁 現在のディレクトリ: $(pwd)${NC}"

# 必要なファイルの確認
required_files=("index.html" "style.css" "script.js" "test.html")
echo -e "${BLUE}🔍 必要なファイルを確認中...${NC}"
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}   ✅ $file${NC}"
    else
        echo -e "${RED}   ❌ $file が見つかりません${NC}"
        exit 1
    fi
done

# Git設定確認
echo -e "${BLUE}⚙️  Git設定確認中...${NC}"
if ! git config user.name > /dev/null 2>&1; then
    git config user.name "nekoojisan-labo"
    echo -e "${GREEN}   ✅ user.name設定完了${NC}"
fi

if ! git config user.email > /dev/null 2>&1; then
    echo -e "${YELLOW}📧 Gitメールアドレスを設定してください${NC}"
    read -p "メールアドレス: " email
    git config user.email "$email"
    echo -e "${GREEN}   ✅ user.email設定完了${NC}"
fi

# Git操作
echo -e "${BLUE}📝 Gitファイル操作中...${NC}"
git add .
if git diff --staged --quiet; then
    echo -e "${YELLOW}   変更なし - 新しいコミット作成${NC}"
    git commit --allow-empty -m "Portfolio deployment - $(date '+%Y-%m-%d %H:%M:%S')"
else
    git commit -m "Portfolio update - $(date '+%Y-%m-%d %H:%M:%S')"
fi
echo -e "${GREEN}   ✅ コミット完了${NC}"

# Personal Access Token の設定
echo ""
echo -e "${PURPLE}🔐 GitHub認証設定${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}重要: Personal Access Token が必要です${NC}"
echo ""
echo "1. 以下のURLにアクセスしてトークンを作成："
echo "   👉 https://github.com/settings/tokens"
echo ""
echo "2. 設定："
echo "   📝 Note: Portfolio Deploy"
echo "   📅 Expiration: 90 days"
echo "   ✅ repo (チェック)"
echo "   💾 Generate token"
echo ""
echo "3. 表示されたトークン (ghp_xxxxx) をコピー"
echo ""

read -p "Personal Access Token を作成しましたか？ (y/N): " token_ready
if [[ ! $token_ready =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ トークンを作成してから再実行してください${NC}"
    echo "再実行: ./complete-deploy.sh"
    exit 1
fi

echo ""
read -s -p "Personal Access Token を貼り付けてください: " token
echo ""

if [ -z "$token" ]; then
    echo -e "${RED}❌ トークンが入力されていません${NC}"
    exit 1
fi

# リモートリポジトリ設定
echo -e "${BLUE}🔗 リモートリポジトリ設定中...${NC}"
if git remote -v | grep -q origin; then
    git remote remove origin
fi
git remote add origin https://$token@github.com/nekoojisan-labo/portfolio.git
echo -e "${GREEN}   ✅ リモート設定完了${NC}"

# GitHubリポジトリ作成確認
echo ""
echo -e "${PURPLE}📋 GitHubリポジトリ作成${NC}"
echo "=========================="
echo ""
echo "以下のURLでリポジトリを作成してください："
echo "👉 https://github.com/new"
echo ""
echo "設定："
echo "📝 Repository name: portfolio"
echo "📝 Description: スタイリッシュなポートフォリオサイト"
echo "✅ Public"
echo "❌ Add a README file (チェックしない)"
echo "💾 Create repository"
echo ""

read -p "リポジトリを作成しましたか？ (y/N): " repo_created
if [[ ! $repo_created =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ リポジトリを作成してから再実行してください${NC}"
    exit 1
fi

# プッシュ実行
echo -e "${BLUE}🚀 GitHubにプッシュ中...${NC}"
if git push -u origin main; then
    echo -e "${GREEN}✅ プッシュ成功！${NC}"
else
    echo -e "${RED}❌ プッシュ失敗${NC}"
    echo -e "${YELLOW}💡 考えられる原因:${NC}"
    echo "   - トークンが間違っている"
    echo "   - リポジトリ名が違う"
    echo "   - ネットワーク問題"
    exit 1
fi

# GitHub Pages設定
echo ""
echo -e "${PURPLE}🌐 GitHub Pages設定${NC}"
echo "========================="
echo ""
echo "以下のURLでGitHub Pagesを設定してください："
echo "👉 https://github.com/nekoojisan-labo/portfolio/settings/pages"
echo ""
echo "設定："
echo "📋 Source: Deploy from a branch"
echo "🌿 Branch: main"
echo "📁 Folder: / (root)"
echo "💾 Save"
echo ""

read -p "GitHub Pages を設定しましたか？ (y/N): " pages_set

# 最終結果
echo ""
echo -e "${GREEN}🎉 デプロイメント完了！${NC}"
echo "============================"
echo ""
echo -e "${BLUE}📋 作成されたもの:${NC}"
echo "✅ GitHubリポジトリ: https://github.com/nekoojisan-labo/portfolio"
echo "✅ ローカルファイル: アップロード完了"
if [[ $pages_set =~ ^[Yy]$ ]]; then
    echo "✅ GitHub Pages: 設定完了"
    echo ""
    echo -e "${GREEN}🌐 サイトURL:${NC}"
    echo "   メイン: https://nekoojisan-labo.github.io/portfolio/"
    echo "   テスト: https://nekoojisan-labo.github.io/portfolio/test.html"
    echo ""
    echo -e "${YELLOW}⏰ 反映まで2-10分程度お待ちください${NC}"
else
    echo "⏳ GitHub Pages: 設定待ち"
    echo ""
    echo -e "${BLUE}💡 GitHub Pages設定を完了してください:${NC}"
    echo "   👉 https://github.com/nekoojisan-labo/portfolio/settings/pages"
fi

echo ""
echo -e "${GREEN}✨ ポートフォリオサイトの準備が完了しました！${NC}"