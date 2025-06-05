#!/bin/bash

# nekoojisan-labo GitHub Pages 自動デプロイスクリプト
echo "🚀 nekoojisan-labo Portfolio 自動デプロイメント開始"
echo "=================================================="

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# エラーハンドリング
set -e
trap 'echo -e "${RED}❌ エラーが発生しました。スクリプトを中断します。${NC}"' ERR

echo -e "${BLUE}📁 現在のディレクトリ: $(pwd)${NC}"

# 1. Git初期化
echo -e "${BLUE}🔍 Git状態確認中...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${BLUE}📁 Gitリポジトリを初期化中...${NC}"
    git init
    git branch -M main
    echo -e "${GREEN}✅ Git初期化完了${NC}"
else
    echo -e "${GREEN}✅ 既存のGitリポジトリを使用${NC}"
fi

# 2. Git設定確認
echo -e "${BLUE}⚙️  Git設定確認中...${NC}"
if ! git config user.name > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Git user.name が設定されていません${NC}"
    git config user.name "nekoojisan-labo"
    echo -e "${GREEN}✅ user.name を設定しました${NC}"
fi

if ! git config user.email > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Git user.email が設定されていません${NC}"
    read -p "GitHubのメールアドレスを入力してください: " email
    git config user.email "$email"
    echo -e "${GREEN}✅ user.email を設定しました${NC}"
fi

# 3. ファイルをステージング
echo -e "${BLUE}📝 ファイルをステージング中...${NC}"
git add .

# 変更があるかチェック
if git diff --staged --quiet; then
    echo -e "${YELLOW}ℹ️  変更がないため、コミットをスキップします${NC}"
else
    # 4. コミット
    echo -e "${BLUE}💾 変更をコミット中...${NC}"
    commit_message="Portfolio website - $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$commit_message"
    echo -e "${GREEN}✅ コミット完了: $commit_message${NC}"
fi

# 5. リモートリポジトリ設定
echo -e "${BLUE}🔗 リモートリポジトリ設定中...${NC}"
if git remote -v | grep -q origin; then
    echo -e "${YELLOW}⚠️  既存のリモート設定を削除中...${NC}"
    git remote remove origin
fi

git remote add origin https://github.com/nekoojisan-labo/portfolio.git
echo -e "${GREEN}✅ リモートリポジトリ設定完了${NC}"

# 6. リポジトリ存在確認の指示
echo ""
echo -e "${YELLOW}📋 重要: GitHubでリポジトリを作成してください${NC}"
echo "=================================="
echo "1. ブラウザで以下にアクセス:"
echo "   👉 https://github.com/new"
echo ""
echo "2. 以下の設定でリポジトリを作成:"
echo "   📝 Repository name: portfolio"
echo "   📝 Description: スタイリッシュなポートフォリオサイト"
echo "   ✅ Public"
echo "   ❌ Add a README file (チェックしない)"
echo "   💾 Create repository をクリック"
echo ""

# ユーザーの確認を待つ
read -p "GitHubでリポジトリを作成しましたか？ (y/N): " repo_created
if [[ ! $repo_created =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  リポジトリ作成後に再実行してください${NC}"
    echo "再実行コマンド: ./deploy-auto.sh"
    exit 0
fi

# 7. プッシュ実行
echo -e "${BLUE}🚀 GitHubにプッシュ中...${NC}"
if git push -u origin main; then
    echo -e "${GREEN}✅ プッシュ成功！${NC}"
else
    echo -e "${RED}❌ プッシュに失敗しました${NC}"
    echo -e "${YELLOW}💡 以下を確認してください:${NC}"
    echo "   - GitHubでリポジトリが正しく作成されているか"
    echo "   - GitHubへのアクセス権限があるか"
    echo "   - Personal Access Token が必要な場合があります"
    exit 1
fi

# 8. GitHub Pages設定の指示
echo ""
echo -e "${GREEN}🎉 ファイルのアップロード完了！${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📋 次のステップ: GitHub Pages を有効化${NC}"
echo "1. リポジトリページにアクセス:"
echo "   👉 https://github.com/nekoojisan-labo/portfolio"
echo ""
echo "2. Settings タブをクリック"
echo ""
echo "3. 左メニューから Pages を選択"
echo ""
echo "4. 以下のように設定:"
echo "   📋 Source: Deploy from a branch"
echo "   🌿 Branch: main"
echo "   📁 Folder: / (root)"
echo "   💾 Save をクリック"
echo ""

# GitHub Pages設定の確認
read -p "GitHub Pages を設定しましたか？ (y/N): " pages_set
if [[ $pages_set =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}🌐 サイトURL:${NC}"
    echo "   メインサイト: https://nekoojisan-labo.github.io/portfolio/"
    echo "   テストページ: https://nekoojisan-labo.github.io/portfolio/test.html"
    echo ""
    echo -e "${BLUE}⏰ 注意: GitHub Pagesの反映には2-10分程度かかります${NC}"
    echo ""
    echo -e "${GREEN}🎯 デプロイメント完了！${NC}"
    echo "しばらく待ってからURLにアクセスしてください。"
else
    echo ""
    echo -e "${YELLOW}📋 GitHub Pages設定を完了してください:${NC}"
    echo "   👉 https://github.com/nekoojisan-labo/portfolio/settings/pages"
fi

echo ""
echo -e "${GREEN}✨ ポートフォリオサイトのデプロイメント処理が完了しました！${NC}"