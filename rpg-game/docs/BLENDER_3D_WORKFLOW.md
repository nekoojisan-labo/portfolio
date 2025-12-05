# Blender 3Dマップ制作ワークフロー

## 🎯 目標

新宿中央区画の3Dマップを制作し、Three.jsで動作するRPGゲームに組み込む

---

## 📋 前提条件

### 必須ソフトウェア
- **Blender 3.6以上**: https://www.blender.org/
- **テキストエディタ**: VS Code推奨
- **画像編集**: GIMP or Photoshop（テクスチャ作成用）

### 必須知識
- Blender基本操作
- PBRマテリアルの理解
- UV展開の基礎
- GLTF/GLB形式の知識

---

## 🚀 セットアップ

### 1. Blenderプロジェクト作成

```python
# Blender起動後、以下を実行（Scripting ワークスペース）

import bpy

# 既存オブジェクトを削除
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# シーン設定
scene = bpy.context.scene
scene.render.engine = 'CYCLES'  # またはEEVEE
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# グリッド設定（2m間隔）
space = bpy.context.space_data
space.overlay.grid_scale = 2.0
space.clip_start = 0.1
space.clip_end = 1000

print("✓ Scene setup complete")
```

### 2. プロジェクト構成

```
rpg-game/
├── blender/
│   ├── shinjuku_start.blend      # メインファイル
│   ├── characters/
│   │   ├── kaito.blend
│   │   ├── akari.blend
│   │   └── npc_citizen.blend
│   ├── props/
│   │   ├── streetlight.blend
│   │   ├── bench.blend
│   │   └── vending_machine.blend
│   └── textures/
│       ├── asphalt_base.png
│       ├── concrete_wall.png
│       └── metal_rusty.png
└── assets/
    └── models/
        └── shinjuku_start.glb     # エクスポート先
```

---

## 🏗️ 制作プロセス

### Step 1: 地形・通り作成（30分）

```python
import bpy
import math

def create_street_base(width=50, length=40, tile_size=2):
    """
    メインストリート作成
    width: タイル数（横）
    length: タイル数（縦）
    tile_size: 1タイルのサイズ（メートル）
    """
    # 地面プレーン
    bpy.ops.mesh.primitive_plane_add(
        size=1,
        location=(width/2 * tile_size, length/2 * tile_size, 0)
    )
    ground = bpy.context.active_object
    ground.name = "Ground_Street"
    ground.scale = (width * tile_size / 2, length * tile_size / 2, 1)

    # SubdivisionでUV展開用
    mod = ground.modifiers.new('Subsurf', 'SUBSURF')
    mod.levels = 2

    # マテリアル作成
    mat = bpy.data.materials.new(name="Material_Asphalt")
    mat.use_nodes = True
    ground.data.materials.append(mat)

    # PBR Shaderセットアップ
    nodes = mat.node_tree.nodes
    nodes.clear()

    # プリンシプルBSDFノード
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.05, 0.05, 0.05, 1.0)  # ダークグレー
    bsdf.inputs['Roughness'].default_value = 0.9
    bsdf.inputs['Metallic'].default_value = 0.0

    # 出力ノード
    output = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    print(f"✓ Street base created: {width}x{length} tiles ({width*tile_size}m x {length*tile_size}m)")

    return ground

# 実行
street = create_street_base(50, 40, 2)
```

#### 水たまり追加（オプション）

```python
def add_puddles(count=5):
    """ランダムに水たまりを配置"""
    import random

    for i in range(count):
        x = random.uniform(10, 90)
        y = random.uniform(10, 70)
        scale = random.uniform(1, 3)

        bpy.ops.mesh.primitive_plane_add(location=(x, y, 0.01))
        puddle = bpy.context.active_object
        puddle.name = f"Puddle_{i}"
        puddle.scale = (scale, scale * 0.7, 1)

        # 水マテリアル
        mat = bpy.data.materials.new(name=f"Material_Water_{i}")
        mat.use_nodes = True
        puddle.data.materials.append(mat)

        bsdf = mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs['Base Color'].default_value = (0.1, 0.15, 0.2, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.1  # 反射しやすい
        bsdf.inputs['Metallic'].default_value = 0.9
        bsdf.inputs['Alpha'].default_value = 0.7  # 半透明

        mat.blend_method = 'BLEND'

    print(f"✓ {count} puddles created")

add_puddles(8)
```

---

### Step 2: ビル群作成（60分）

#### 簡易ビルジェネレーター

```python
def create_building(name, location, width, depth, height, floors=10):
    """
    ビルを作成
    location: (x, y, z)
    width, depth: 底面サイズ（メートル）
    height: 高さ（メートル）
    floors: 階数
    """
    bpy.ops.mesh.primitive_cube_add(
        size=1,
        location=location
    )
    building = bpy.context.active_object
    building.name = f"Building_{name}"
    building.scale = (width/2, depth/2, height/2)
    building.location.z = height/2  # 地面に接地

    # Array Modifierで窓パターン
    # （詳細は後述のセクションで）

    # マテリアル
    mat = bpy.data.materials.new(name=f"Material_Building_{name}")
    mat.use_nodes = True
    building.data.materials.append(mat)

    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = (0.15, 0.17, 0.2, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.7
    bsdf.inputs['Metallic'].default_value = 0.3

    print(f"✓ Building '{name}' created at {location}")
    return building

# ビル配置（設計書に基づく）
buildings = []

# 左上のオフィスビル
buildings.append(create_building("WestOffice", (15, 15, 0), 16, 12, 45, 15))

# 右上の商業施設
buildings.append(create_building("EastCommercial", (85, 15, 0), 14, 14, 40, 12))

# 左下の居住ブロック
buildings.append(create_building("WestResidential", (15, 70, 0), 20, 14, 30, 10))

# 右下の集合住宅
buildings.append(create_building("EastResidential", (85, 70, 0), 17, 14, 35, 11))

# 中央ビル（小さめ）
buildings.append(create_building("CenterBlock", (50, 40, 0), 16, 16, 40, 12))
```

#### 窓パターンの追加

```python
def add_windows_to_building(building, window_spacing=3, window_size=1.5):
    """
    ビルに窓パターンを追加
    """
    bpy.ops.object.select_all(action='DESELECT')
    building.select_set(True)
    bpy.context.view_layer.objects.active = building

    # 編集モードに入る
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='DESELECT')

    # 側面を選択してInsertで窓を作成
    # （この部分は手動編集推奨）

    bpy.ops.object.mode_set(mode='OBJECT')

    print(f"✓ Windows added to {building.name}")

# 各ビルに窓を追加
for bld in buildings:
    add_windows_to_building(bld)
```

---

### Step 3: 街灯・小物配置（40分）

#### 街灯作成

```python
def create_streetlight(location):
    """
    街灯を作成（簡易版）
    """
    # ポール
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.1,
        depth=5,
        location=(location[0], location[1], 2.5)
    )
    pole = bpy.context.active_object
    pole.name = f"Streetlight_Pole_{location}"

    # ランプヘッド
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.3,
        location=(location[0], location[1], 5.5)
    )
    lamp_head = bpy.context.active_object
    lamp_head.name = f"Streetlight_Head_{location}"

    # エミッシブマテリアル（光る）
    mat = bpy.data.materials.new(name=f"Material_Light_{location}")
    mat.use_nodes = True
    lamp_head.data.materials.append(mat)

    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Emission'].default_value = (0.7, 0.9, 1.0, 1.0)  # 青白い光
    bsdf.inputs['Emission Strength'].default_value = 10.0

    # 実際のライト（ポイントライト）
    bpy.ops.object.light_add(
        type='POINT',
        location=(location[0], location[1], 5.0)
    )
    light = bpy.context.active_object
    light.name = f"Light_Street_{location}"
    light.data.energy = 500  # W
    light.data.color = (0.7, 0.9, 1.0)

    # 親子関係
    pole.parent = None
    lamp_head.parent = pole
    light.parent = pole

    return pole

# 街灯を等間隔配置（通り沿い）
streetlights = []
for i in range(0, 100, 10):  # 10m間隔
    streetlights.append(create_streetlight((i, 40, 0)))  # 中央通り
```

---

### Step 4: キャラクターモデル（Humanoid）

#### カイト（主人公）モデリング方針

```
推奨ワークフロー:
1. Blenderでベースメッシュ作成
   - MakeHumanまたはManuel Bastioni LAB使用
   - または手動モデリング

2. スカルプティング（オプション）

3. リトポロジー
   - 目標ポリゴン数: 3000-5000（LOD0）

4. UVマッピング

5. テクスチャペイント
   - Substance Painter推奨
   - またはBlender Texture Paint

6. リギング
   - Rigifyアドオン使用
   - または手動ボーン作成

7. ウェイトペイント

8. アニメーション
   - 歩行サイクル
   - 待機モーション
   - 攻撃モーション
```

#### 簡易キャラクター（プレースホルダー）

```python
def create_placeholder_character(name, location):
    """
    プレースホルダーキャラクター（カプセル型）
    """
    # 体（カプセル）
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.3,
        depth=1.6,
        location=(location[0], location[1], 0.8)
    )
    body = bpy.context.active_object
    body.name = f"Character_{name}_Body"

    # 頭（球）
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.2,
        location=(location[0], location[1], 1.8)
    )
    head = bpy.context.active_object
    head.name = f"Character_{name}_Head"
    head.parent = body

    # マテリアル（カイトは青系、アカリは赤系）
    mat = bpy.data.materials.new(name=f"Material_{name}")
    mat.use_nodes = True
    body.data.materials.append(mat)

    if name == "Kaito":
        color = (0.2, 0.4, 0.8, 1.0)  # 青
    elif name == "Akari":
        color = (0.9, 0.3, 0.4, 1.0)  # 赤
    else:
        color = (0.5, 0.5, 0.5, 1.0)  # グレー

    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = color

    return body

# キャラクター配置
kaito = create_placeholder_character("Kaito", (50, 50, 0))  # スタート地点
akari = create_placeholder_character("Akari", (40, 30, 0))  # イベント地点
citizen1 = create_placeholder_character("Citizen1", (30, 20, 0))
```

---

### Step 5: コリジョン設定

```python
def add_collision_mesh(obj):
    """
    簡易コリジョンメッシュ作成
    """
    # 元オブジェクトを複製
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.object.duplicate()
    collision = bpy.context.active_object
    collision.name = f"{obj.name}_Collision"

    # Decimate Modifierで簡略化
    mod = collision.modifiers.new('Decimate', 'DECIMATE')
    mod.ratio = 0.1  # 10%に削減

    # カスタムプロパティ追加（Three.js用）
    collision["isCollision"] = True
    collision.hide_render = True  # レンダリング時は非表示

    return collision

# 全ビルにコリジョン追加
for bld in buildings:
    add_collision_mesh(bld)
```

---

### Step 6: ライティング

#### 環境ライト

```python
# HDRIまたはSky Texture
world = bpy.data.worlds["World"]
world.use_nodes = True

nodes = world.node_tree.nodes
nodes.clear()

# Sky Texture
sky = nodes.new(type='ShaderNodeTexSky')
sky.sky_type = 'HOSEK_WILKIE'
sky.sun_elevation = math.radians(15)  # 低い太陽（夕暮れ）
sky.turbidity = 8.0  # 濁った空

output = nodes.new(type='ShaderNodeOutputWorld')
world.node_tree.links.new(sky.outputs['Color'], output.inputs['Surface'])
```

#### ベイクドライティング（パフォーマンス向上）

```python
def bake_lighting(obj):
    """
    間接照明をベイク
    """
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    # UV Mapがあるか確認
    if not obj.data.uv_layers:
        bpy.ops.uv.smart_project()

    # ベイク設定
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.bake_type = 'COMBINED'

    # ベイク実行
    bpy.ops.object.bake(type='COMBINED')

    print(f"✓ Lighting baked for {obj.name}")
```

---

### Step 7: エクスポート

#### GLBエクスポート設定

```python
import bpy

def export_to_glb(filepath):
    """
    GLB形式でエクスポート
    """
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        export_textures=True,
        export_colors=True,
        export_cameras=False,  # カメラは除外
        export_lights=True,
        export_apply=True,  # モディファイア適用
        export_yup=True,  # Y-Upに変換
        export_animations=True,
        export_force_sampling=False
    )
    print(f"✓ Exported to: {filepath}")

# エクスポート実行
export_path = "/home/user/portfolio/rpg-game/assets/models/shinjuku_start.glb"
export_to_glb(export_path)
```

---

## 🎨 テクスチャワークフロー

### PBRテクスチャセット

各マテリアルに必要なテクスチャ：
1. **Base Color** (Diffuse)
2. **Normal Map**
3. **Roughness**
4. **Metallic**
5. **AO (Ambient Occlusion)** - オプション

### 推奨解像度
- 主要オブジェクト: 2048x2048
- 小物: 1024x1024
- 地面: 4096x4096（タイリング）

### 無料テクスチャリソース
- **Poly Haven**: https://polyhaven.com/textures
- **Textures.com**: https://www.textures.com/
- **CC0 Textures**: https://cc0textures.com/

---

## 🔧 トラブルシューティング

### 問題: エクスポート後、テクスチャが表示されない
**解決**:
- テクスチャをBlenderファイルにパック: `File > External Data > Pack All Into .blend`
- または、相対パス使用: `File > External Data > Make All Paths Relative`

### 問題: ポリゴン数が多すぎる
**解決**:
- Decimate Modifierで削減
- LOD作成
- 不要な頂点削除: `Edit Mode > Mesh > Clean Up > Merge by Distance`

### 問題: ライティングが暗すぎる
**解決**:
- エミッション強度を上げる
- ポイントライト追加
- HDRI照明使用

---

## 📚 参考資料

### 公式ドキュメント
- **Blender Manual**: https://docs.blender.org/
- **GLTF Export**: https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html
- **Three.js GLTFLoader**: https://threejs.org/docs/#examples/en/loaders/GLTFLoader

### チュートリアル
- **Blender Guru** (YouTube): 初心者向けチュートリアル
- **Grant Abbitt**: 低ポリゴンモデリング
- **CG Cookie**: PBRワークフロー

---

**次のステップ**: [Three.js統合ガイド](./THREEJS_INTEGRATION.md)
