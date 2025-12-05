# Blender RPG Map Editor

Blenderを使ってRPGゲームのマップを視覚的に作成し、ゲームデータとしてエクスポートできます。

## 📦 セットアップ

### 1. Blenderにスクリプトをインストール

1. Blenderを開く
2. `Scripting` ワークスペースに移動
3. `Text` > `Open` から `blender_map_exporter.py` を開く
4. `Run Script` ボタンをクリック

または：

1. `Edit` > `Preferences` > `Add-ons`
2. `Install...` をクリック
3. `blender_map_exporter.py` を選択
4. アドオンを有効化

### 2. RPG Toolsパネルが表示される

- 3D Viewport の右側のパネルに「RPG Tools」タブが追加されます

## 🎨 マップの作成方法

### 基本的な手順

1. **グリッドを有効化**
   - `Shift + S` → `Cursor to World Origin`
   - `N` キー → `View` タブ → `Snap to Grid` を有効化

2. **タイルを配置**
   - `Shift + A` → `Mesh` → `Cube` でキューブを追加
   - グリッドに沿って配置（1 Blender Unit = 1 タイル）
   - オブジェクト名でタイルタイプを指定：

| オブジェクト名 | タイルタイプ | 説明 |
|-------------|------------|------|
| `Floor_X_Y` | 床 (0) | 通行可能な床 |
| `Wall_X_Y` | 壁 (1) | 通行不可の壁 |
| `Water_X_Y` | 水 (2) | 通行不可の水 |
| `Grass_X_Y` | 草 (3) | 通行可能な草地 |
| `Building_X_Y` | 建物 (8) | 通行不可の建物 |
| `Tree_X_Y` | 木 (10) | 通行不可の木 |
| `Rock_X_Y` | 岩 (11) | 通行不可の岩 |
| `Pillar_X_Y` | 柱 (12) | 通行不可の柱 |
| `SavePoint_X_Y` | セーブポイント (13) | セーブポイント |

3. **特殊オブジェクト**

| オブジェクト名 | 用途 |
|-------------|------|
| `NPC_Name` | NPC配置位置 |
| `Spawn_Point` | プレイヤーの初期位置 |
| `Exit_North` | 北の出口 |
| `Exit_South` | 南の出口 |
| `Exit_East` | 東の出口 |
| `Exit_West` | 西の出口 |

### 例：新宿マップを作成

```python
# Blenderで実行
import bpy

# グリッド上にビルを配置
def create_building(x, y, width, height):
    for i in range(width):
        for j in range(height):
            bpy.ops.mesh.primitive_cube_add(location=(x + i, y + j, 0))
            obj = bpy.context.active_object
            obj.name = f"Building_{x+i}_{y+j}"

# 新宿のビル群を作成
create_building(3, 3, 8, 6)   # 左上
create_building(38, 3, 9, 7)  # 右上
create_building(3, 30, 10, 7) # 左下
create_building(38, 29, 9, 8) # 右下

# NPCを配置
bpy.ops.mesh.primitive_cube_add(location=(15, 12, 0))
bpy.context.active_object.name = "NPC_Citizen"

bpy.ops.mesh.primitive_cube_add(location=(20, 18, 0))
bpy.context.active_object.name = "NPC_Akari"

# スポーン地点
bpy.ops.mesh.primitive_cube_add(location=(25, 20, 0))
bpy.context.active_object.name = "Spawn_Point"
```

## 📤 エクスポート

### 方法1: パネルから

1. 3D Viewport 右側の「RPG Tools」タブを開く
2. 「Export RPG Map」ボタンをクリック
3. マップ名とIDを入力
4. フォーマット（JSON/JavaScript/Both）を選択
5. 保存先を選択

### 方法2: Pythonコンソールから

```python
import bpy
from blender_map_exporter import RPGMapExporter

exporter = RPGMapExporter()
exporter.map_data['name'] = '新宿 - 都市エリア'
exporter.analyze_scene()
exporter.export_javascript('/path/to/shinjuku_world.js', 'shinjuku_world')
```

## 📥 ゲームに読み込む

### エクスポートされたJavaScriptファイルを使用

```javascript
// map-system-grid.js の中で

constructor() {
    this.maps = {};

    // Blenderからエクスポートしたマップを読み込み
    // （エクスポートされたコードをここに貼り付け）
    this.maps.shinjuku_world = {
        name: '新宿 - 都市エリア',
        width: 50,
        height: 40,
        // ... エクスポートされたデータ
    };
}
```

### JSONファイルを動的に読み込む

```javascript
// 動的読み込みの例
async loadMapFromJSON(mapId, jsonPath) {
    const response = await fetch(jsonPath);
    const mapData = await response.json();
    this.maps[mapId] = mapData;
}

// 使用例
await gridMapSystem.loadMapFromJSON('shinjuku_world', 'maps/shinjuku_world.json');
```

## 🎯 高度な使い方

### カスタムタイルタイプを追加

```python
# blender_map_exporter.py を編集

TILE_TYPES = {
    'FLOOR': 0,
    'WALL': 1,
    # ... 既存のタイプ
    'CUSTOM_TILE': 14,  # 新しいタイプを追加
}
```

### マテリアルでタイルタイプを指定

```python
def get_tile_type(self, obj):
    # マテリアル名でタイルタイプを判定
    if obj.material_slots:
        mat_name = obj.material_slots[0].material.name.upper()
        for tile_name, tile_id in TILE_TYPES.items():
            if tile_name in mat_name:
                return tile_id

    # フォールバック: オブジェクト名で判定
    return self.get_tile_type_from_name(obj.name)
```

### 3Dビジュアルプレビュー

Blenderでマップを3D表示しながら編集できます：

1. タイルごとに異なるマテリアルを割り当て
2. カメラを上から見下ろす角度に配置
3. ライティングを追加して見やすくする
4. レンダリングしてマップのプレビュー画像を作成

## 🔧 トラブルシューティング

### エクスポートされたマップがゲームで表示されない

- ブラウザのキャッシュをクリア（Ctrl + Shift + R）
- JavaScriptコンソールでエラーを確認
- マップIDが正しいか確認

### タイルが意図した位置に配置されない

- オブジェクトがグリッドにスナップしているか確認
- `Location` の値が整数になっているか確認（X=3.0, Y=5.0 等）

### NPCが表示されない

- オブジェクト名に "NPC" が含まれているか確認
- `npcs` 配列にデータが含まれているか確認

## 📚 参考

- [Blender Python API](https://docs.blender.org/api/current/)
- タイルタイプ定義: `map-system-grid.js` の `TILE_TYPES`
- サンプルマップ: `map-system-grid.js` の `createShinjukuWorldMap()`

## 💡 Tips

1. **コレクションを使ってマップを整理**
   - Building Collection（建物）
   - NPC Collection（NPC）
   - Terrain Collection（地形）

2. **配列モディファイアで繰り返しパターンを作成**
   - 同じビルを複数配置する場合に便利

3. **親子関係でグループ化**
   - 複雑な建物を1つのオブジェクトとして扱える

4. **レイヤーを使って複数のマップバリエーションを管理**
   - 昼/夜バージョン
   - 破壊前/破壊後
