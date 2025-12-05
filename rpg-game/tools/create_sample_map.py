"""
Sample Map Creator for Blender
===============================

Blenderでこのスクリプトを実行すると、サンプルマップが自動生成されます。
これをベースに編集することで、簡単にマップを作成できます。

使い方:
1. Blenderで新規ファイルを開く
2. Scripting ワークスペースに移動
3. このスクリプトを開いて実行
4. サンプルマップが生成される
"""

import bpy
import math

def clear_scene():
    """シーン内のオブジェクトをすべて削除"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def create_tile(x, y, z, tile_type, name_suffix=""):
    """タイルを作成"""
    bpy.ops.mesh.primitive_cube_add(location=(x, y, z))
    obj = bpy.context.active_object
    obj.name = f"{tile_type}_{int(x)}_{int(y)}{name_suffix}"
    obj.scale = (0.5, 0.5, 0.5)  # サイズを小さくして見やすく
    return obj

def create_building_group(start_x, start_y, width, height):
    """建物群を作成"""
    for i in range(width):
        for j in range(height):
            obj = create_tile(start_x + i, start_y + j, 0, "Building")
            # 建物は高さを変えて見やすく
            obj.scale = (0.5, 0.5, 1.5)
            # マテリアルを設定（グレー）
            mat = bpy.data.materials.new(name="Building_Material")
            mat.diffuse_color = (0.3, 0.3, 0.3, 1.0)  # グレー
            obj.data.materials.append(mat)

def create_grass_area(start_x, start_y, width, height):
    """草地エリアを作成"""
    for i in range(width):
        for j in range(height):
            obj = create_tile(start_x + i, start_y + j, -0.1, "Grass")
            # 草は緑色
            mat = bpy.data.materials.new(name=f"Grass_Material_{i}_{j}")
            mat.diffuse_color = (0.2, 0.6, 0.2, 1.0)  # 緑
            obj.data.materials.append(mat)

def create_floor_grid(width, height):
    """床グリッドを作成"""
    for x in range(width):
        for y in range(height):
            obj = create_tile(x, y, -0.2, "Floor")
            # 床は薄いグレー
            mat = bpy.data.materials.new(name=f"Floor_Material_{x}_{y}")
            mat.diffuse_color = (0.7, 0.7, 0.7, 1.0)  # 薄いグレー
            obj.data.materials.append(mat)

def create_npc(x, y, npc_name):
    """NPCマーカーを作成"""
    bpy.ops.mesh.primitive_uv_sphere_add(location=(x, y, 0.5), radius=0.3)
    obj = bpy.context.active_object
    obj.name = f"NPC_{npc_name}"
    # NPCは黄色
    mat = bpy.data.materials.new(name=f"NPC_Material_{npc_name}")
    mat.diffuse_color = (1.0, 1.0, 0.0, 1.0)  # 黄色
    obj.data.materials.append(mat)
    return obj

def create_spawn_point(x, y):
    """スポーン地点を作成"""
    bpy.ops.mesh.primitive_cone_add(location=(x, y, 0.5), radius1=0.4)
    obj = bpy.context.active_object
    obj.name = "Spawn_Point"
    # スポーン地点は青
    mat = bpy.data.materials.new(name="Spawn_Material")
    mat.diffuse_color = (0.0, 0.5, 1.0, 1.0)  # 青
    obj.data.materials.append(mat)
    return obj

def create_exit_marker(x, y, direction):
    """出口マーカーを作成"""
    bpy.ops.mesh.primitive_cylinder_add(location=(x, y, 0.5), radius=0.3, depth=0.5)
    obj = bpy.context.active_object
    obj.name = f"Exit_{direction}"
    # 出口は赤
    mat = bpy.data.materials.new(name=f"Exit_Material_{direction}")
    mat.diffuse_color = (1.0, 0.0, 0.0, 1.0)  # 赤
    obj.data.materials.append(mat)
    return obj

def create_sample_map():
    """サンプルマップを作成（新宿風の小さいマップ）"""
    print("Creating sample RPG map...")

    # シーンをクリア
    clear_scene()

    map_width = 30
    map_height = 25

    # 1. 床グリッドを作成
    print("  Creating floor grid...")
    create_floor_grid(map_width, map_height)

    # 2. 建物を配置
    print("  Adding buildings...")
    create_building_group(3, 3, 5, 4)    # 左上のビル
    create_building_group(20, 3, 6, 5)   # 右上のビル
    create_building_group(3, 18, 6, 5)   # 左下のビル
    create_building_group(20, 17, 7, 6)  # 右下のビル
    create_building_group(12, 10, 4, 4)  # 中央のビル

    # 3. 草地エリアを配置
    print("  Adding grass areas...")
    create_grass_area(10, 5, 3, 3)   # 公園1
    create_grass_area(18, 12, 2, 2)  # 公園2

    # 4. NPCを配置
    print("  Adding NPCs...")
    create_npc(15, 12, "Citizen")
    create_npc(20, 18, "Akari")
    create_npc(8, 8, "Merchant")

    # 5. スポーン地点
    print("  Adding spawn point...")
    create_spawn_point(15, 22)

    # 6. 出口マーカー
    print("  Adding exit markers...")
    create_exit_marker(15, 0, "North")   # 北
    create_exit_marker(15, 24, "South")  # 南
    create_exit_marker(0, 12, "West")    # 西
    create_exit_marker(29, 12, "East")   # 東

    # 7. カメラを上から見下ろす位置に配置
    print("  Setting up camera...")
    bpy.ops.object.camera_add(location=(15, 12, 40))
    camera = bpy.context.active_object
    camera.rotation_euler = (0, 0, 0)
    bpy.context.scene.camera = camera

    # 8. ライトを追加
    print("  Adding lights...")
    bpy.ops.object.light_add(type='SUN', location=(15, 12, 30))
    sun = bpy.context.active_object
    sun.data.energy = 2.0

    # 9. グリッドとスナップを設定
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    space.overlay.show_floor = True
                    space.overlay.show_axis_x = True
                    space.overlay.show_axis_y = True

    print("✓ Sample map created!")
    print("")
    print("Next steps:")
    print("  1. Edit the tiles (move, add, delete)")
    print("  2. Add more NPCs or buildings")
    print("  3. Run 'Export RPG Map' from RPG Tools panel")
    print("  4. Save the exported .js file to rpg-game/")

# 実行
if __name__ == "__main__":
    create_sample_map()
