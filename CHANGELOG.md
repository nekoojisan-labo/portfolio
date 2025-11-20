# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **RPG Game**: 魔法システムを実装
- **RPG Game**: 装備システムを実装
- **RPG Game**: メニューのキーボード操作とアイテムシステムを実装
- **RPG Game**: フィールド画面のメニューボタンと神威機能を実装
- **Kawaii Omikuji**: ローカルアプリを統合し、戻るボタンを追加
- **Games**: すべてのゲームに「ポートフォリオに戻る」ボタンを追加
- **Docs**: RPGゲームのキー入力テストページと操作方法ドキュメントを追加

### Fixed
- **RPG Game**: すべてのマップに対称的な帰還出口を追加
- **RPG Game**: shopping_districtの出口をブロックしていた建物を削除
- **RPG Game**: UI オーバーレイの上にアクセス可能なように下部出口の位置を調整
- **RPG Game**: 自然なゲームプレイのためにMAPとUIエリアを分離
- **RPG Game**: 購入した装備が所持品に反映されない問題を修正
- **RPG Game**: ショップで購入した装備とアイテムがインベントリに反映されるように修正
- **RPG Game**: 装備変更機能とステータス反映を修正
- **RPG Game**: 戦闘シーンのコマンド実行を修正
- **GitHub Pages**: Jekyll処理を無効化し、静的ファイル配信を確保するため.nojekyllを追加
- **Puyo Puzzle**: GitHub Pagesでの表示を修正

### Changed
- **RPG Game**: 衝突判定とショップ制御を改善
- **Docs**: RPGゲームの操作方法ドキュメントを更新

### Removed
- **Cleanup**: 一時的なsupervisorファイルを削除（.nojekyllのみ保持）
