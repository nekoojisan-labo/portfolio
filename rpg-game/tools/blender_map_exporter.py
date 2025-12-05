"""
Blender RPG Map Exporter
========================

使い方:
1. Blenderでこのスクリプトを実行
2. グリッド上にCubeオブジェクトを配置してマップを作成
3. オブジェクト名でタイルタイプを指定:
   - "Floor_X_Y" = 床 (0)
   - "Wall_X_Y" = 壁 (1)
   - "Building_X_Y" = 建物 (8)
   - "NPC_X_Y" = NPC配置位置
4. "Export RPG Map"を実行してJSONファイルを出力

座標系:
- Blender座標(X, Y) → マップ座標(gridX, gridY)
- 1 Blender Unit = 1 タイル
"""

import bpy
import json
import os
from pathlib import Path

# タイルタイプマッピング
TILE_TYPES = {
    'FLOOR': 0,
    'WALL': 1,
    'WATER': 2,
    'GRASS': 3,
    'EXIT_NORTH': 4,
    'EXIT_SOUTH': 5,
    'EXIT_EAST': 6,
    'EXIT_WEST': 7,
    'BUILDING': 8,
    'DOOR': 9,
    'TREE': 10,
    'ROCK': 11,
    'PILLAR': 12,
    'SAVE_POINT': 13
}

class RPGMapExporter:
    def __init__(self):
        self.grid_size = 1.0  # 1 Blender Unit = 1 タイル
        self.map_data = {
            'name': 'Untitled Map',
            'width': 50,
            'height': 40,
            'bgm': 'field_default',
            'encounterRate': 'medium',
            'tiles': [],
            'npcs': [],
            'spawnPoint': {'gridX': 25, 'gridY': 20},
            'exits': {}
        }

    def get_tile_type(self, obj_name):
        """オブジェクト名からタイルタイプを取得"""
        name_upper = obj_name.upper()

        for tile_name, tile_id in TILE_TYPES.items():
            if tile_name in name_upper:
                return tile_id

        # デフォルトは床
        return TILE_TYPES['FLOOR']

    def world_to_grid(self, x, y):
        """Blender座標をグリッド座標に変換"""
        grid_x = int(round(x / self.grid_size))
        grid_y = int(round(y / self.grid_size))
        return grid_x, grid_y

    def analyze_scene(self):
        """シーン内のオブジェクトを解析してマップデータを生成"""
        print("=== Analyzing Blender Scene ===")

        # 選択されているオブジェクトを取得（なければ全オブジェクト）
        objects = bpy.context.selected_objects if bpy.context.selected_objects else bpy.data.objects

        # マップのバウンディングボックスを計算
        min_x = min_y = float('inf')
        max_x = max_y = float('-inf')

        tile_positions = {}  # (gridX, gridY) -> tile_type
        npc_positions = []
        spawn_point = None
        exits = {}

        for obj in objects:
            if obj.type != 'MESH':
                continue

            # オブジェクトの位置を取得
            x, y, z = obj.location
            grid_x, grid_y = self.world_to_grid(x, y)

            # バウンディングボックス更新
            min_x = min(min_x, grid_x)
            max_x = max(max_x, grid_x)
            min_y = min(min_y, grid_y)
            max_y = max(max_y, grid_y)

            obj_name = obj.name.upper()

            # NPCチェック
            if 'NPC' in obj_name:
                npc_data = {
                    'gridX': grid_x,
                    'gridY': grid_y,
                    'emoji': '👤',
                    'name': obj.name,
                    'dialogue': '...'
                }
                npc_positions.append(npc_data)
                print(f"  NPC: {obj.name} at ({grid_x}, {grid_y})")
                continue

            # スポーン地点チェック
            if 'SPAWN' in obj_name:
                spawn_point = {'gridX': grid_x, 'gridY': grid_y}
                print(f"  Spawn Point: ({grid_x}, {grid_y})")
                continue

            # 出口チェック
            if 'EXIT' in obj_name:
                if 'NORTH' in obj_name:
                    exits['north'] = 'next_map_north'
                elif 'SOUTH' in obj_name:
                    exits['south'] = 'next_map_south'
                elif 'EAST' in obj_name:
                    exits['east'] = 'next_map_east'
                elif 'WEST' in obj_name:
                    exits['west'] = 'next_map_west'
                print(f"  Exit: {obj.name} at ({grid_x}, {grid_y})")

            # タイルタイプを取得
            tile_type = self.get_tile_type(obj.name)
            tile_positions[(grid_x, grid_y)] = tile_type

        # マップサイズを計算
        if min_x == float('inf'):
            print("Warning: No objects found!")
            width, height = 50, 40
            offset_x, offset_y = 0, 0
        else:
            width = max_x - min_x + 1
            height = max_y - min_y + 1
            offset_x = min_x
            offset_y = min_y

        print(f"  Map Size: {width} x {height}")
        print(f"  Offset: ({offset_x}, {offset_y})")

        # 2次元配列を生成（デフォルトは床）
        tiles = []
        for y in range(height):
            row = []
            for x in range(width):
                world_x = x + offset_x
                world_y = y + offset_y
                tile_type = tile_positions.get((world_x, world_y), TILE_TYPES['FLOOR'])
                row.append(tile_type)
            tiles.append(row)

        # マップデータを更新
        self.map_data['width'] = width
        self.map_data['height'] = height
        self.map_data['tiles'] = tiles
        self.map_data['npcs'] = npc_positions
        self.map_data['exits'] = exits

        if spawn_point:
            # オフセットを適用
            spawn_point['gridX'] -= offset_x
            spawn_point['gridY'] -= offset_y
            self.map_data['spawnPoint'] = spawn_point

        print(f"  Total Tiles: {len(tile_positions)}")
        print(f"  NPCs: {len(npc_positions)}")
        print(f"  Exits: {len(exits)}")

        return self.map_data

    def export_json(self, filepath):
        """マップデータをJSONファイルにエクスポート"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.map_data, f, indent=2, ensure_ascii=False)
        print(f"✓ Exported to: {filepath}")

    def export_javascript(self, filepath, map_id):
        """マップデータをJavaScript形式でエクスポート"""
        js_code = f"""// Auto-generated from Blender
// Map ID: {map_id}

this.maps.{map_id} = {{
    name: '{self.map_data['name']}',
    width: {self.map_data['width']},
    height: {self.map_data['height']},
    bgm: '{self.map_data['bgm']}',
    encounterRate: '{self.map_data['encounterRate']}',

    tiles: {json.dumps(self.map_data['tiles'], indent=8)},

    npcs: {json.dumps(self.map_data['npcs'], indent=8, ensure_ascii=False)},

    spawnPoint: {json.dumps(self.map_data['spawnPoint'])},

    exits: {json.dumps(self.map_data['exits'], indent=8, ensure_ascii=False)}
}};
"""

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(js_code)
        print(f"✓ Exported JavaScript to: {filepath}")


# ==========================================
# Blender Operator
# ==========================================
class OBJECT_OT_ExportRPGMap(bpy.types.Operator):
    """Export RPG Map Data"""
    bl_idname = "object.export_rpg_map"
    bl_label = "Export RPG Map"
    bl_options = {'REGISTER', 'UNDO'}

    filepath: bpy.props.StringProperty(
        name="File Path",
        description="Path to save the map data",
        subtype='FILE_PATH'
    )

    map_name: bpy.props.StringProperty(
        name="Map Name",
        description="Name of the map",
        default="New Map"
    )

    map_id: bpy.props.StringProperty(
        name="Map ID",
        description="Map identifier (e.g., 'shinjuku_world')",
        default="new_map"
    )

    export_format: bpy.props.EnumProperty(
        name="Format",
        description="Export format",
        items=[
            ('JSON', 'JSON', 'Export as JSON'),
            ('JS', 'JavaScript', 'Export as JavaScript'),
            ('BOTH', 'Both', 'Export both formats')
        ],
        default='BOTH'
    )

    def execute(self, context):
        exporter = RPGMapExporter()
        exporter.map_data['name'] = self.map_name

        # シーンを解析
        exporter.analyze_scene()

        # ファイルパスを決定
        base_path = bpy.path.abspath("//") if bpy.data.filepath else os.path.expanduser("~")

        if self.export_format in ['JSON', 'BOTH']:
            json_path = os.path.join(base_path, f"{self.map_id}.json")
            exporter.export_json(json_path)

        if self.export_format in ['JS', 'BOTH']:
            js_path = os.path.join(base_path, f"{self.map_id}.js")
            exporter.export_javascript(js_path, self.map_id)

        self.report({'INFO'}, f"Map exported successfully!")
        return {'FINISHED'}

    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}


# ==========================================
# Blender Panel
# ==========================================
class VIEW3D_PT_RPGMapExporter(bpy.types.Panel):
    """RPG Map Exporter Panel"""
    bl_label = "RPG Map Exporter"
    bl_idname = "VIEW3D_PT_rpg_map_exporter"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'RPG Tools'

    def draw(self, context):
        layout = self.layout

        layout.label(text="Export Map Data")
        layout.operator("object.export_rpg_map")

        layout.separator()
        layout.label(text="Quick Guide:")
        box = layout.box()
        box.label(text="1. Create mesh objects on grid", icon='MESH_CUBE')
        box.label(text="2. Name: Floor_X_Y, Wall_X_Y, etc.")
        box.label(text="3. Use NPC_X for NPCs")
        box.label(text="4. Use Spawn_Point for player start")
        box.label(text="5. Export to JSON or JavaScript")


# ==========================================
# Register
# ==========================================
def register():
    bpy.utils.register_class(OBJECT_OT_ExportRPGMap)
    bpy.utils.register_class(VIEW3D_PT_RPGMapExporter)

def unregister():
    bpy.utils.unregister_class(OBJECT_OT_ExportRPGMap)
    bpy.utils.unregister_class(VIEW3D_PT_RPGMapExporter)

if __name__ == "__main__":
    register()
    print("RPG Map Exporter loaded!")
