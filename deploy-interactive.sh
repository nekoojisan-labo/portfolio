#!/bin/bash

# GitHub Pages Portfolio デプロイメント - 汎用版
echo "🚀 GitHub Pages Portfolio デプロイメント"
echo "========================================"

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📁 現在のディレクトリ: $(pwd)${NC}"

# GitHubユーザー名の入力
echo ""
echo -e "${YELLOW}🔍 GitHubユーザー名を確認してください${NC}"
echo "例: username, company-name, your-github-name"
echo ""
read -p "GitHubユーザー名を入力してください: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}❌ ユーザー名が入力されていません${NC}"
    exit 1
fi

# リポジトリ名の入力
echo ""
read -p "リポジトリ名を入力してください (portfolio): " REPO_NAME
REPO_NAME=${REPO_NAME:-portfolio}

echo ""
echo -e "${BLUE}📋 設定確認:${NC}"
echo "   ユーザー名: $GITHUB_USERNAME"
echo "   リポジトリ名: $REPO_NAME"
echo "   完成予定URL: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo ""

read -p "この設定で続行しますか？ (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ キャンセルされました${NC}"
    exit 1
fi

# Git初期化確認
if [ ! -d ".git" ]; then
    echo -e "${BLUE}📁 Gitリポジトリを初期化中...${NC}"
    git init
    git branch -M main
fi

# ファイルをステージング
echo -e "${BLUE}📝 ファイルをステージング中...${NC}"
git add .

# コミット
if ! git diff --staged --quiet; then
    echo -e "${BLUE}💾 変更をコミット中...${NC}"
    git commit -m "Portfolio website update - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 既存のリモートを削除（もしあれば）
if git remote -v | grep -q origin; then
    echo -e "${BLUE}🔄 既存のリモート設定を更新中...${NC}"
    git remote remove origin
fi

# 新しいリモート設定
echo -e "${BLUE}🔗 リモートリポジトリを設定中...${NC}"
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo ""
echo -e "${GREEN}✅ ローカル設定完了！${NC}"
echo ""
echo -e "${YELLOW}📋 次のステップ:${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}1. GitHubでリポジトリを作成:${NC}"
echo "   👉 https://github.com/new"
echo "   📝 Repository name: $REPO_NAME"
echo "   📋 Public を選択"
echo "   💾 Create repository をクリック"
echo ""
echo -e "${BLUE}2. 以下のコマンドでプッシュ:${NC}"
echo "   git push -u origin main"
echo ""
echo -e "${BLUE}3. GitHub Pages を有効化:${NC}"
echo "   👉 https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
echo "   📋 Source: Deploy from a branch"
echo "   🌿 Branch: main"
echo "   📁 Folder: / (root)"
echo "   💾 Save をクリック"
echo ""
echo -e "${GREEN}🌐 完成予定URL:${NC}"
echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo ""
echo -e "${BLUE}🔧 テスト用URL:${NC}"
echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME/test.html"
echo ""
echo -e "${YELLOW}⏰ GitHub Pagesの反映には2-10分程度かかります${NC}"