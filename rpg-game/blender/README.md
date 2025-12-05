# Blender 3Dマップ制作

## 🚀 クイックスタート（5分で開始）

### 1. Blenderを開く

```bash
# Blenderがインストールされていない場合
# https://www.blender.org/ からダウンロード
```

### 2. プロトタイプ自動生成

1. **Blenderを起動**
2. **上部のタブから `Scripting` をクリック**
3. **`Text` > `Open`** をクリック
4. **`shinjuku_prototype_generator.py`** を選択
5. **画面中央上部の `▶ Run Script` ボタンをクリック**

### 3. 完成！

1-2分で新宿の街の基本形が生成されます：
- ビル 5棟
- 街灯 9本
- キャラクター 5体
- 水たまり 6個
- ライティング

---

## 📸 確認方法

### マウス操作
- **回転**: マウス中ボタン（ホイール）ドラッグ
- **拡大/縮小**: マウスホイール
- **移動**: Shift + マウス中ボタンドラッグ

### カメラビュー
- **Numpad 0**: カメラ視点に切り替え
- **Numpad 7**: 真上から見る
- **Numpad 1**: 正面から見る

### シェーディング
- **右上のアイコン**: `Material Preview` モードに切り替え
  - 💎マークのアイコン（マテリアルプレビュー）をクリック

---

## 💾 エクスポート手順

### GLB形式でエクスポート（Three.js用）

1. **`File` > `Export` > `glTF 2.0 (.glb/.gltf)`**
2. **設定:**
   - Format: `glTF Binary (.glb)` ✅
   - Include > Limit to > Selected Objects: オフ（全体をエクスポート）
   - Transform > +Y Up: オン ✅
3. **保存先:**
   ```
   /home/user/portfolio/rpg-game/assets/models/shinjuku_prototype.glb
   ```
4. **`Export glTF 2.0` ボタンをクリック**

---

## 🎨 カスタマイズ

### 色を変更

1. **オブジェクトを選択**（右クリック）
2. **右側のパネル > 🔴マテリアルプロパティ**
3. **Base Color** をクリック
4. **好きな色を選択**

### オブジェクト追加

1. **`Add` > `Mesh` > お好きな形状**
2. **G キー**: 移動モード
   - X, Y, Z キーで軸固定
3. **S キー**: スケールモード
4. **R キー**: 回転モード

### ライト追加

1. **`Add` > `Light` > `Point`**
2. **右側パネル > 💡ライトプロパティ**
3. **Power（W）**: 数値を調整
4. **Color**: 色を変更

---

## 📂 ファイル構成

```
blender/
├── README.md                          ← このファイル
├── shinjuku_prototype_generator.py    ← 自動生成スクリプト
├── shinjuku_start.blend               ← 編集中のBlenderファイル（後で保存）
└── exports/
    └── shinjuku_prototype.glb         ← エクスポート先
```

---

## 🔧 次のステップ

### Phase 1: プロトタイプ確認（完了）
- ✅ 基本形生成
- ⬜ エクスポート
- ⬜ Three.jsで読み込みテスト

### Phase 2: ディテール追加
- ⬜ ビルに窓を追加
- ⬜ 看板、自動販売機配置
- ⬜ テクスチャ適用

### Phase 3: キャラクター改善
- ⬜ リアルなキャラクターモデリング
- ⬜ リギング
- ⬜ アニメーション

### Phase 4: 最適化
- ⬜ LOD作成
- ⬜ ライティングベイク
- ⬜ ポリゴン削減

---

## 💡 よくある質問

### Q: スクリプト実行後、何も表示されない
**A**: カメラビューに切り替えてください（Numpad 0）

### Q: マテリアルの色が表示されない
**A**: 右上のシェーディングモードを `Material Preview` に変更

### Q: エクスポートしたGLBが大きすぎる
**A**: テクスチャサイズを削減するか、Decimateモディファイアでポリゴン削減

### Q: ライトが暗い
**A**: ライトの Power（W）値を上げるか、ライトを追加

---

## 📚 参考リンク

- [Blender公式マニュアル](https://docs.blender.org/)
- [glTFエクスポート設定](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)
- [Three.js GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)

---

## ⚡ ショートカット一覧

| キー | 動作 |
|------|------|
| G | 移動 (Grab) |
| S | 拡大/縮小 (Scale) |
| R | 回転 (Rotate) |
| X, Y, Z | 軸固定 |
| Tab | Edit Mode 切り替え |
| Numpad 0 | カメラビュー |
| Numpad 7 | 真上から見る |
| Shift + A | オブジェクト追加 |
| Delete | 削除 |

---

**作成日**: 2025-12-05
**対象**: 新宿中央区画プロトタイプ
