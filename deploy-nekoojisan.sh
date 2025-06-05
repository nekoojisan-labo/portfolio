#!/bin/bash

# nekoojisan-labo GitHub Pages デプロイメントスクリプト
echo "🚀 nekoojisan-labo Portfolio デプロイメント"
echo "============================================"

# カラー定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📁 現在のディレクトリ: $(pwd)${NC}"

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

# リモート設定確認
if ! git remote -v | grep -q origin; then
    echo -e "${BLUE}🔗 リモートリポジトリを設定中...${NC}"
    git remote add origin https://github.com/nekoojisan-labo/portfolio.git
fi

# プッシュ
echo -e "${BLUE}🚀 GitHubにプッシュ中...${NC}"
if git push -u origin main; then
    echo -e "${GREEN}✅ プッシュ成功！${NC}"
else
    echo -e "${YELLOW}⚠️  初回プッシュの場合、以下を実行してください:${NC}"
    echo "git push -u origin main"
fi

echo ""
echo -e "${GREEN}🎉 デプロイ完了！${NC}"
echo "=========================="
echo ""
echo -e "${BLUE}📋 次のステップ:${NC}"
echo "1. GitHubリポジトリページにアクセス:"
echo "   👉 https://github.com/nekoojisan-labo/portfolio"
echo ""
echo "2. Settings > Pages で以下を設定:"
echo "   📋 Source: Deploy from a branch"
echo "   🌿 Branch: main"
echo "   📁 Folder: / (root)"
echo "   💾 Save をクリック"
echo ""
echo -e "${GREEN}🌐 完成予定URL:${NC}"
echo "   https://nekoojisan-labo.github.io/portfolio/"
echo ""
echo -e "${BLUE}🕒 反映まで2-10分程度お待ちください${NC}"
echo ""
echo -e "${YELLOW}🔧 テスト用URL (先に確認):${NC}"
echo "   https://nekoojisan-labo.github.io/portfolio/test.html"