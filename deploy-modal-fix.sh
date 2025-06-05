#!/bin/bash

echo "🔧 モーダル完全修正版をデプロイ中..."
echo "======================================"

cd /Users/takayamanoboruhaku/Desktop/github-website

# Git status確認
echo "📋 Git状況確認:"
git status --porcelain

# 変更をステージング
echo "📝 ファイルをステージング中..."
git add script.js

# コミット
echo "💾 コミット中..."
git commit -m "Fix modal close issue - complete rewrite with better error handling and ESC key support"

# プッシュ
echo "🚀 GitHubにプッシュ中..."
git push origin main

echo ""
echo "🎉 修正版デプロイ完了!"
echo "======================"
echo ""
echo "✅ 修正内容:"
echo "   - モーダル閉じる機能の完全書き直し"
echo "   - ESCキーでの閉じる機能追加"
echo "   - エラーハンドリング強化"
echo "   - デバッグ機能追加"
echo ""
echo "⏰ 2-3分後に以下URLで修正版が反映されます:"
echo "   🌐 https://nekoojisan-labo.github.io/portfolio/"
echo ""
echo "🔄 反映後、ページをリロード (F5 または Cmd+R) してください"
echo ""
echo "💡 モーダルの閉じ方:"
echo "   - 右上の×ボタンをクリック"
echo "   - モーダル外の暗い部分をクリック"  
echo "   - ESCキーを押す"