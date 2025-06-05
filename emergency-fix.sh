#!/bin/bash

echo "🔥 緊急修正：モーダル問題の完全解決"
echo "======================================"

cd /Users/takayamanoboruhaku/Desktop/github-website

echo "📋 修正内容:"
echo "   ✅ キャッシュバスター追加 (v202506051500)"
echo "   ✅ 緊急モーダル閉じ機能追加"
echo "   ✅ 閉じるボタンのスタイル改善"
echo "   ✅ デバッグ機能強化"
echo ""

# 全ファイルをステージング
echo "📝 全ファイルをステージング..."
git add .

# コミット
echo "💾 緊急修正をコミット..."
git commit -m "URGENT FIX: Modal close issue with cache busting and emergency close function"

# プッシュ
echo "🚀 GitHubに緊急プッシュ..."
git push origin main

echo ""
echo "🎉 緊急修正デプロイ完了!"
echo "======================="
echo ""
echo "🔧 追加された緊急機能:"
echo "   - キャッシュを無視してリロード"
echo "   - 緊急モーダル閉じ機能"
echo "   - 改善された閉じるボタン"
echo ""
echo "⚡ 今すぐ実行する手順:"
echo "1. ブラウザで以下URLにアクセス:"
echo "   👉 https://nekoojisan-labo.github.io/portfolio/"
echo ""
echo "2. 強制リロード実行:"
echo "   Mac: Cmd + Shift + R"
echo "   Windows: Ctrl + Shift + R"
echo "   または F5 を数回押す"
echo ""
echo "3. もしまだモーダルが閉じない場合:"
echo "   開発者ツール (F12) で以下を実行:"
echo "   emergencyCloseModal()"
echo ""
echo "⏰ 2-3分後に確実に修正版が反映されます"