#!/bin/bash

# 最終確認・テストスクリプト
echo "🔍 nekoojisan-labo Portfolio 状況確認"
echo "====================================="

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

# 1. ローカルファイル確認
echo -e "${BLUE}📁 ローカルファイル確認${NC}"
echo "========================"
required_files=("index.html" "style.css" "script.js" "test.html")
local_ok=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file が見つかりません${NC}"
        local_ok=false
    fi
done

if [ "$local_ok" = true ]; then
    echo -e "${GREEN}✅ ローカルファイル: OK${NC}"
else
    echo -e "${RED}❌ ローカルファイル: 問題あり${NC}"
fi

echo ""

# 2. Git状態確認
echo -e "${BLUE}📝 Git状態確認${NC}"
echo "=================="
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Gitリポジトリ初期化済み${NC}"
    
    # リモート確認
    if git remote -v | grep -q "nekoojisan-labo/portfolio"; then
        echo -e "${GREEN}✅ リモートリポジトリ設定済み${NC}"
    else
        echo -e "${YELLOW}⚠️  リモートリポジトリ未設定${NC}"
    fi
    
    # コミット確認
    if git log --oneline -1 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ コミット存在${NC}"
        echo "   最新: $(git log --oneline -1 --format='%s')"
    else
        echo -e "${YELLOW}⚠️  コミットなし${NC}"
    fi
else
    echo -e "${RED}❌ Git未初期化${NC}"
fi

echo ""

# 3. GitHub リポジトリ確認
echo -e "${BLUE}🌐 GitHub確認中...${NC}"
echo "==================="

# curlでリポジトリ存在確認
repo_status=$(curl -s -o /dev/null -w "%{http_code}" "https://api.github.com/repos/$GITHUB_USER/$REPO_NAME")

if [ "$repo_status" = "200" ]; then
    echo -e "${GREEN}✅ GitHubリポジトリ存在${NC}"
    
    # GitHub Pages URL確認
    echo -e "${BLUE}🔍 GitHub Pages確認中...${NC}"
    
    # テストページ確認
    test_url="https://$GITHUB_USER.github.io/$REPO_NAME/test.html"
    test_status=$(curl -s -o /dev/null -w "%{http_code}" "$test_url")
    
    # メインページ確認
    main_url="https://$GITHUB_USER.github.io/$REPO_NAME/"
    main_status=$(curl -s -o /dev/null -w "%{http_code}" "$main_url")
    
    echo "   テストページ ($test_url): $test_status"
    echo "   メインページ ($main_url): $main_status"
    
    if [ "$test_status" = "200" ] && [ "$main_status" = "200" ]; then
        echo -e "${GREEN}✅ サイト公開済み${NC}"
        echo ""
        echo -e "${GREEN}🎉 すべて完了！サイトは正常に動作しています${NC}"
        echo "========================================="
        echo -e "${BLUE}🌐 アクセスURL:${NC}"
        echo "   メインサイト: $main_url"
        echo "   テストページ: $test_url"
        
    elif [ "$test_status" = "200" ] || [ "$main_status" = "200" ]; then
        echo -e "${YELLOW}⏳ 部分的に公開済み${NC}"
        echo "   完全な反映まで数分お待ちください"
        
    else
        echo -e "${YELLOW}⏳ GitHub Pages未反映 ($test_status/$main_status)${NC}"
        echo ""
        echo -e "${BLUE}💡 確認事項:${NC}"
        echo "1. GitHub Pages設定:"
        echo "   👉 https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
        echo "   📋 Source: Deploy from a branch"
        echo "   🌿 Branch: main"
        echo ""
        echo "2. 反映待ち (2-10分程度)"
    fi
    
elif [ "$repo_status" = "404" ]; then
    echo -e "${RED}❌ GitHubリポジトリが見つかりません${NC}"
    echo ""
    echo -e "${BLUE}💡 リポジトリを作成してください:${NC}"
    echo "   👉 https://github.com/new"
    echo "   📝 Repository name: portfolio"
    
else
    echo -e "${YELLOW}⚠️  リポジトリ状況不明 (HTTP: $repo_status)${NC}"
fi

echo ""

# 4. 総合判定
echo -e "${BLUE}📊 総合判定${NC}"
echo "============"

if [ "$local_ok" = true ] && [ "$repo_status" = "200" ] && [ "$test_status" = "200" ] && [ "$main_status" = "200" ]; then
    echo -e "${GREEN}🎯 完璧！すべて完了しています${NC}"
    status="PERFECT"
elif [ "$local_ok" = true ] && [ "$repo_status" = "200" ]; then
    echo -e "${YELLOW}⏳ ほぼ完了（GitHub Pages反映待ち）${NC}"
    status="ALMOST"
elif [ "$local_ok" = true ]; then
    echo -e "${YELLOW}⚠️  GitHubへのアップロードが必要${NC}"
    status="UPLOAD_NEEDED"
else
    echo -e "${RED}❌ 複数の問題があります${NC}"
    status="ISSUES"
fi

echo ""

# 5. 次のアクション提案
echo -e "${BLUE}🎯 次のアクション${NC}"
echo "=================="

case $status in
    "PERFECT")
        echo -e "${GREEN}✨ 完了！サイトをお楽しみください${NC}"
        echo "   🌐 $main_url"
        ;;
    "ALMOST")
        echo -e "${YELLOW}⏰ 2-10分待ってから再確認${NC}"
        echo "   再確認: ./final-check.sh"
        ;;
    "UPLOAD_NEEDED")
        echo -e "${BLUE}🚀 デプロイスクリプトを実行${NC}"
        echo "   実行: ./complete-deploy.sh"
        ;;
    "ISSUES")
        echo -e "${RED}🔧 問題を解決してから再実行${NC}"
        echo "   確認: ./final-check.sh"
        ;;
esac