# 🚀 GitHub Pages 自動デプロイメント手順

## 📋 実行手順

### ステップ1: スクリプトに実行権限を付与
```bash
cd /Users/takayamanoboruhaku/Desktop/github-website
chmod +x deploy-auto.sh
chmod +x check-status.sh
```

### ステップ2: 自動デプロイスクリプトを実行
```bash
./deploy-auto.sh
```

このスクリプトが以下を自動実行します：
- ✅ Git初期化
- ✅ ファイルのステージング
- ✅ コミット作成
- ✅ リモートリポジトリ設定
- ✅ GitHubへプッシュ

### ステップ3: GitHubでの手動作業

スクリプトの指示に従って以下を実行：

1. **リポジトリ作成**
   - https://github.com/new にアクセス
   - Repository name: `portfolio`
   - Public設定
   - Create repository

2. **GitHub Pages設定**
   - https://github.com/nekoojisan-labo/portfolio/settings/pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Save

### ステップ4: 状況確認
```bash
./check-status.sh
```

## 🌐 完成予定URL

- **メインサイト**: https://nekoojisan-labo.github.io/portfolio/
- **テストページ**: https://nekoojisan-labo.github.io/portfolio/test.html

## 🔧 トラブルシューティング

### 404エラーの場合
1. GitHub Pages設定を再確認
2. index.html がルートディレクトリにあるか確認
3. 2-10分待ってから再確認

### プッシュエラーの場合
1. GitHubにログインしているか確認
2. Personal Access Token が必要な場合があります

### 権限エラーの場合
```bash
chmod +x *.sh
```

## 📱 実行例

```bash
# 作業ディレクトリに移動
cd /Users/takayamanoboruhaku/Desktop/github-website

# 実行権限付与
chmod +x deploy-auto.sh check-status.sh

# デプロイ実行
./deploy-auto.sh

# 状況確認
./check-status.sh
```

## ⏰ 注意事項

- GitHub Pagesの反映には2-10分程度かかります
- 初回設定時は認証が必要な場合があります
- エラーが発生した場合は、メッセージを確認してください

---

**準備完了！上記の手順に従って実行してください。** 🎯