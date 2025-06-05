#!/bin/bash

# GitHub Pages 状況確認スクリプト
echo "🔍 GitHub Pages 状況確認ツール"
echo "=============================="

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

GITHUB_USER="nekoojisan-labo"
REPO_NAME="portfolio"

echo -e "${BLUE}📋 確認対象:${NC}"
echo "   ユーザー: $GITHUB_USER"
echo "   リポジトリ: $REPO_NAME"
echo ""

# 1. リポジトリ存在確認
echo -e "${BLUE}🔍 リポジトリ存在確認中...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "https://github.com/$GITHUB_USER/$REPO_NAME" | grep -q "200"; then
    echo -e "${GREEN}✅ リポジトリが存在します${NC}"
    echo "   👉 https://github.com/$GITHUB_USER/$REPO_NAME"
else
    echo -e "${RED}❌ リポジトリが見つかりません${NC}"
    echo -e "${YELLOW}💡 以下を確認してください:${NC}"
    echo "   - GitHubでリポジトリが作成されているか"
    echo "   - リポジトリ名が正しいか (portfolio)"
    echo "   - リポジトリがPublicに設定されているか"
    exit 1
fi

echo ""

# 2. GitHub Pages URL確認
echo -e "${BLUE}🌐 GitHub Pages 確認中...${NC}"

# テストページ確認
TEST_URL="https://$GITHUB_USER.github.io/$REPO_NAME/test.html"
echo "テストページ確認: $TEST_URL"
TEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL")

if [ "$TEST_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ テストページが正常に表示されます${NC}"
else
    echo -e "${YELLOW}⏳ テストページ (ステータス: $TEST_STATUS)${NC}"
fi

# メインページ確認
MAIN_URL="https://$GITHUB_USER.github.io/$REPO_NAME/"
echo "メインページ確認: $MAIN_URL"
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_URL")

if [ "$MAIN_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ メインページが正常に表示されます${NC}"
else
    echo -e "${YELLOW}⏳ メインページ (ステータス: $MAIN_STATUS)${NC}"
fi

echo ""

# 3. 状況判定とアドバイス
if [ "$TEST_STATUS" = "200" ] && [ "$MAIN_STATUS" = "200" ]; then
    echo -e "${GREEN}🎉 デプロイメント成功！${NC}"
    echo "=================================="
    echo "サイトが正常に公開されています:"
    echo "   🌐 メインサイト: $MAIN_URL"
    echo "   🔧 テストページ: $TEST_URL"
    
elif [ "$TEST_STATUS" = "200" ] || [ "$MAIN_STATUS" = "200" ]; then
    echo -e "${YELLOW}⏳ 部分的に成功${NC}"
    echo "========================"
    echo "一部のページが表示されています。"
    echo "すべてのページが表示されるまで、さらに数分お待ちください。"
    
elif [ "$TEST_STATUS" = "404" ] && [ "$MAIN_STATUS" = "404" ]; then
    echo -e "${YELLOW}⚠️  404エラー - 設定を確認してください${NC}"
    echo "============================================="
    echo -e "${BLUE}💡 解決方法:${NC}"
    echo "1. GitHub Pages設定確認:"
    echo "   👉 https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
    echo "   📋 Source: Deploy from a branch"
    echo "   🌿 Branch: main"
    echo "   📁 Folder: / (root)"
    echo ""
    echo "2. ファイル確認:"
    echo "   - index.html がリポジトリのルートにあるか"
    echo "   - ファイル名が正しいか (小文字)"
    echo ""
    echo "3. Actions確認:"
    echo "   👉 https://github.com/$GITHUB_USER/$REPO_NAME/actions"
    echo ""
    
else
    echo -e "${BLUE}⏳ まだ準備中です${NC}"
    echo "===================="
    echo "GitHub Pagesの反映には時間がかかる場合があります。"
    echo "2-10分程度お待ちいただき、再度確認してください。"
fi

echo ""
echo -e "${BLUE}🔄 このスクリプトを再実行するには:${NC}"
echo "   ./check-status.sh"