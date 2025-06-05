#!/bin/bash

# GitHub認証修復スクリプト
echo "🔐 GitHub認証設定を修復します"
echo "============================="

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Personal Access Token を設定します${NC}"
echo ""
echo "1. まず、GitHub でトークンを作成してください："
echo "   👉 https://github.com/settings/tokens"
echo "   📝 Note: Portfolio Deploy Token"
echo "   📅 Expiration: 90 days"
echo "   ✅ repo にチェック"
echo ""

read -p "Personal Access Token を作成しましたか？ (y/N): " token_created
if [[ ! $token_created =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  トークン作成後に再実行してください${NC}"
    exit 0
fi

echo ""
read -s -p "Personal Access Token を入力してください (ghp_xxxxx): " token
echo ""

if [ -z "$token" ]; then
    echo -e "${RED}❌ トークンが入力されていません${NC}"
    exit 1
fi

# リモートURLを更新
echo -e "${BLUE}🔗 リモートURL更新中...${NC}"
git remote set-url origin https://$token@github.com/nekoojisan-labo/portfolio.git

echo -e "${GREEN}✅ 認証設定完了${NC}"

# プッシュ再実行
echo -e "${BLUE}🚀 GitHubにプッシュ中...${NC}"
if git push -u origin main; then
    echo -e "${GREEN}✅ プッシュ成功！${NC}"
    echo ""
    echo -e "${GREEN}🎉 GitHub Pages設定に進んでください${NC}"
    echo "=================================="
    echo "1. リポジトリページにアクセス:"
    echo "   👉 https://github.com/nekoojisan-labo/portfolio"
    echo ""
    echo "2. Settings > Pages で設定:"
    echo "   📋 Source: Deploy from a branch"
    echo "   🌿 Branch: main"
    echo "   📁 Folder: / (root)"
    echo "   💾 Save をクリック"
    echo ""
    echo -e "${GREEN}🌐 完成予定URL:${NC}"
    echo "   https://nekoojisan-labo.github.io/portfolio/"
else
    echo -e "${RED}❌ まだプッシュに失敗しています${NC}"
    echo -e "${YELLOW}💡 以下を確認してください:${NC}"
    echo "   - トークンが正しくコピーされているか"
    echo "   - リポジトリが正しく作成されているか"
fi