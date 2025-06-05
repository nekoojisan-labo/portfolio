#!/bin/bash

# モーダル修正版をデプロイ
echo "🔧 モーダル修正版をデプロイ中..."

cd /Users/takayamanoboruhaku/Desktop/github-website

# 変更をコミット
git add script.js
git commit -m "Fix modal close issue - improve click handlers"

# プッシュ
git push origin main

echo "✅ 修正版デプロイ完了"
echo "⏰ 数分後にサイトに反映されます"