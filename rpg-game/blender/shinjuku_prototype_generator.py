"""
新宿中央区画 - 3Dマッププロトタイプ自動生成
================================================

使い方:
1. Blenderを起動
2. Scriptingワークスペースに移動
3. このファイルを開く（Text > Open）
4. "Run Script"ボタンをクリック
5. 新宿の街の基本形が自動生成されます！

所要時間: 約1-2分
"""

import bpy
import math
import random

print("=" * 60)
print("🏙️ 新宿中央区画 プロトタイプ生成開始")
print("=" * 60)

# ==========================================
# Step 0: シーンクリア
# ==========================================
print("\n[Step 0] シーンをクリア中...")
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# カメラとライトも削除
for obj in bpy.data.objects:
    bpy.data.objects.remove(obj)

print("✓ シーンクリア完了")

# ==========================================
# Step 1: シーン設定
# ==========================================
print("\n[Step 1] シーン設定中...")
scene = bpy.context.scene
scene.render.engine = 'EEVEE'  # リアルタイムプレビュー用
scene.eevee.use_bloom = True  # ネオン光用
scene.eevee.use_ssr = True  # 反射用
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# グリッド設定
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for space in area.spaces:
            if space.type == 'VIEW_3D':
                space.overlay.grid_scale = 2.0
                space.shading.type = 'MATERIAL'  # マテリアルプレビュー

print("✓ シーン設定完了（EEVEE、グリッド2m）")

# ==========================================
# Step 2: 地面（通り）作成
# ==========================================
print("\n[Step 2] 地面・通り作成中...")

# メインストリート
bpy.ops.mesh.primitive_plane_add(size=1, location=(50, 40, 0))
ground = bpy.context.active_object
ground.name = "Ground_Street"
ground.scale = (50, 40, 1)

# マテリアル: アスファルト
mat_asphalt = bpy.data.materials.new(name="Material_Asphalt")
mat_asphalt.use_nodes = True
ground.data.materials.append(mat_asphalt)

nodes = mat_asphalt.node_tree.nodes
bsdf = nodes["Principled BSDF"]
bsdf.inputs['Base Color'].default_value = (0.05, 0.05, 0.06, 1.0)  # ダークグレー
bsdf.inputs['Roughness'].default_value = 0.8
bsdf.inputs['Metallic'].default_value = 0.0

print("✓ 地面作成完了（100m x 80m）")

# 水たまり追加
print("  - 水たまり追加中...")
for i in range(6):
    x = random.uniform(10, 90)
    y = random.uniform(10, 70)
    scale = random.uniform(0.8, 2.5)

    bpy.ops.mesh.primitive_plane_add(location=(x, y, 0.01))
    puddle = bpy.context.active_object
    puddle.name = f"Puddle_{i}"
    puddle.scale = (scale, scale * 0.6, 1)

    # 水マテリアル
    mat_water = bpy.data.materials.new(name=f"Material_Water_{i}")
    mat_water.use_nodes = True
    puddle.data.materials.append(mat_water)

    bsdf_water = mat_water.node_tree.nodes["Principled BSDF"]
    bsdf_water.inputs['Base Color'].default_value = (0.08, 0.12, 0.18, 1.0)
    bsdf_water.inputs['Roughness'].default_value = 0.05  # 反射しやすい
    bsdf_water.inputs['Metallic'].default_value = 0.95
    bsdf_water.inputs['Alpha'].default_value = 0.6

    mat_water.blend_method = 'BLEND'

print(f"✓ 水たまり {6}個 配置完了")

# ==========================================
# Step 3: ビル群作成
# ==========================================
print("\n[Step 3] ビル群作成中...")

def create_building(name, x, y, width, depth, height):
    """ビル作成ヘルパー関数"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, height/2))
    building = bpy.context.active_object
    building.name = f"Building_{name}"
    building.scale = (width/2, depth/2, height/2)

    # マテリアル
    mat = bpy.data.materials.new(name=f"Material_Building_{name}")
    mat.use_nodes = True
    building.data.materials.append(mat)

    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = (0.12, 0.14, 0.18, 1.0)  # ダークブルーグレー
    bsdf.inputs['Roughness'].default_value = 0.6
    bsdf.inputs['Metallic'].default_value = 0.4

    return building

# ビル配置（5棟）
buildings = []

print("  - 左上のオフィスビル...")
buildings.append(create_building("WestOffice", 15, 15, 16, 12, 45))

print("  - 右上の商業施設...")
buildings.append(create_building("EastCommercial", 85, 15, 14, 14, 40))

print("  - 左下の居住ブロック...")
buildings.append(create_building("WestResidential", 15, 65, 20, 14, 30))

print("  - 右下の集合住宅...")
buildings.append(create_building("EastResidential", 85, 65, 17, 14, 35))

print("  - 中央のビル...")
buildings.append(create_building("CenterBlock", 50, 40, 16, 16, 38))

print(f"✓ ビル {len(buildings)}棟 配置完了")

# ==========================================
# Step 4: 街灯配置
# ==========================================
print("\n[Step 4] 街灯配置中...")

def create_streetlight(x, y, index):
    """街灯作成"""
    # ポール
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.1, depth=5, location=(x, y, 2.5)
    )
    pole = bpy.context.active_object
    pole.name = f"Streetlight_Pole_{index}"

    # ポールマテリアル（金属）
    mat_pole = bpy.data.materials.new(name=f"Material_Pole_{index}")
    mat_pole.use_nodes = True
    pole.data.materials.append(mat_pole)

    bsdf_pole = mat_pole.node_tree.nodes["Principled BSDF"]
    bsdf_pole.inputs['Base Color'].default_value = (0.2, 0.2, 0.22, 1.0)
    bsdf_pole.inputs['Roughness'].default_value = 0.3
    bsdf_pole.inputs['Metallic'].default_value = 0.9

    # ランプヘッド（光る球）
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.3, location=(x, y, 5.3)
    )
    lamp_head = bpy.context.active_object
    lamp_head.name = f"Streetlight_Head_{index}"

    # エミッシブマテリアル（発光）
    mat_light = bpy.data.materials.new(name=f"Material_Light_{index}")
    mat_light.use_nodes = True
    lamp_head.data.materials.append(mat_light)

    bsdf_light = mat_light.node_tree.nodes["Principled BSDF"]
    bsdf_light.inputs['Base Color'].default_value = (0.7, 0.9, 1.0, 1.0)
    bsdf_light.inputs['Emission'].default_value = (0.7, 0.9, 1.0, 1.0)
    bsdf_light.inputs['Emission Strength'].default_value = 8.0

    # 実際のライト（ポイントライト）
    bpy.ops.object.light_add(type='POINT', location=(x, y, 5.0))
    light = bpy.context.active_object
    light.name = f"Light_Street_{index}"
    light.data.energy = 300
    light.data.color = (0.7, 0.9, 1.0)

    # 親子関係
    lamp_head.parent = pole
    light.parent = pole

    return pole

# 街灯を配置（通り沿い、10m間隔）
streetlights = []
light_positions = [
    (20, 40), (35, 40), (50, 40), (65, 40), (80, 40),  # 中央通り
    (30, 15), (70, 15),  # 北側
    (30, 65), (70, 65),  # 南側
]

for i, (x, y) in enumerate(light_positions):
    streetlights.append(create_streetlight(x, y, i))

print(f"✓ 街灯 {len(streetlights)}本 配置完了")

# ==========================================
# Step 5: キャラクター（プレースホルダー）
# ==========================================
print("\n[Step 5] キャラクター配置中...")

def create_character(name, x, y, color):
    """簡易キャラクター作成"""
    # 体（カプセル）
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.3, depth=1.6, location=(x, y, 0.8)
    )
    body = bpy.context.active_object
    body.name = f"Character_{name}_Body"

    # マテリアル
    mat = bpy.data.materials.new(name=f"Material_{name}")
    mat.use_nodes = True
    body.data.materials.append(mat)

    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = 0.5

    # 頭（球）
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.2, location=(x, y, 1.8)
    )
    head = bpy.context.active_object
    head.name = f"Character_{name}_Head"
    head.parent = body
    head.data.materials.append(mat)

    return body

# キャラクター配置
characters = []

print("  - カイト（主人公）...")
characters.append(create_character("Kaito", 50, 50, (0.2, 0.5, 0.9, 1.0)))  # 青

print("  - アカリ（幼馴染）...")
characters.append(create_character("Akari", 40, 30, (0.9, 0.3, 0.4, 1.0)))  # 赤

print("  - 市民1...")
characters.append(create_character("Citizen1", 30, 20, (0.4, 0.4, 0.4, 1.0)))  # グレー

print("  - 市民2...")
characters.append(create_character("Citizen2", 70, 25, (0.35, 0.35, 0.35, 1.0)))

print("  - 市民3...")
characters.append(create_character("Citizen3", 45, 60, (0.42, 0.42, 0.42, 1.0)))

print(f"✓ キャラクター {len(characters)}体 配置完了")

# ==========================================
# Step 6: 環境ライティング
# ==========================================
print("\n[Step 6] 環境ライティング設定中...")

# ワールド設定（夕暮れの空）
world = bpy.data.worlds["World"]
world.use_nodes = True

nodes = world.node_tree.nodes
nodes.clear()

# Sky Texture
sky = nodes.new(type='ShaderNodeTexSky')
sky.sky_type = 'HOSEK_WILKIE'
sky.sun_elevation = math.radians(10)  # 低い太陽
sky.sun_rotation = math.radians(45)
sky.turbidity = 6.0
sky.ground_albedo = 0.1

# Background
bg = nodes.new(type='ShaderNodeBackground')
bg.inputs['Strength'].default_value = 0.3  # 暗め

output = nodes.new(type='ShaderNodeOutputWorld')

world.node_tree.links.new(sky.outputs['Color'], bg.inputs['Color'])
world.node_tree.links.new(bg.outputs['Background'], output.inputs['Surface'])

print("✓ 環境ライティング完了（夕暮れの空）")

# ==========================================
# Step 7: カメラ設定
# ==========================================
print("\n[Step 7] カメラ設定中...")

# 上から見下ろすカメラ
bpy.ops.object.camera_add(location=(50, 20, 60))
camera = bpy.context.active_object
camera.name = "Camera_Main"
camera.rotation_euler = (math.radians(50), 0, math.radians(0))

# カメラを設定
scene.camera = camera

# カメラビューに切り替え
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for space in area.spaces:
            if space.type == 'VIEW_3D':
                space.region_3d.view_perspective = 'CAMERA'

print("✓ カメラ配置完了（俯瞰視点）")

# ==========================================
# Step 8: コレクション整理
# ==========================================
print("\n[Step 8] コレクション整理中...")

# コレクション作成
collections = {
    'Buildings': [],
    'Streetlights': [],
    'Characters': [],
    'Ground': []
}

# オブジェクトを分類
for obj in bpy.data.objects:
    if 'Building' in obj.name:
        collections['Buildings'].append(obj)
    elif 'Streetlight' in obj.name or 'Light_Street' in obj.name:
        collections['Streetlights'].append(obj)
    elif 'Character' in obj.name:
        collections['Characters'].append(obj)
    elif 'Ground' in obj.name or 'Puddle' in obj.name:
        collections['Ground'].append(obj)

# コレクション作成とオブジェクト移動
for coll_name, objs in collections.items():
    if objs:
        # 既存コレクションを探す
        if coll_name not in bpy.data.collections:
            new_coll = bpy.data.collections.new(coll_name)
            bpy.context.scene.collection.children.link(new_coll)
        else:
            new_coll = bpy.data.collections[coll_name]

        # オブジェクトを移動
        for obj in objs:
            # 既存のコレクションから削除
            for old_coll in obj.users_collection:
                old_coll.objects.unlink(obj)
            # 新しいコレクションに追加
            new_coll.objects.link(obj)

print("✓ コレクション整理完了")

# ==========================================
# 完了！
# ==========================================
print("\n" + "=" * 60)
print("🎉 新宿中央区画プロトタイプ生成完了！")
print("=" * 60)
print("\n📊 生成された要素:")
print(f"  - ビル: {len(buildings)}棟")
print(f"  - 街灯: {len(streetlights)}本")
print(f"  - キャラクター: {len(characters)}体")
print(f"  - 水たまり: 6個")
print("\n💡 次のステップ:")
print("  1. シーンを確認（マウスホイールで拡大/縮小）")
print("  2. カメラビューを確認（Numpad 0）")
print("  3. マテリアルプレビューモード確認")
print("  4. File > Export > glTF 2.0 (.glb) でエクスポート")
print("\n📁 推奨保存先:")
print("  /home/user/portfolio/rpg-game/assets/models/shinjuku_prototype.glb")
print("\n" + "=" * 60)
