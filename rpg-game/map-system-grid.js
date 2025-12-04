// ==========================================
// グリッドベース・マップシステム (Grid-Based Map System)
// ドラクエ風のタイルマップ・システム
// ==========================================

class GridMapSystem {
    constructor() {
        this.currentMap = 'shinjuku_world';
        this.tileSize = 32; // 1タイルのサイズ（ピクセル）
        this.viewWidth = 25;  // 画面に表示するタイル数（横）
        this.viewHeight = 18; // 画面に表示するタイル数（縦）

        // カメラオフセット（スクロール用）
        this.cameraX = 0;
        this.cameraY = 0;

        // タイルタイプ定義
        this.TILE_TYPES = {
            FLOOR: 0,       // 床・道（通行可能）
            WALL: 1,        // 壁・ビル（通行不可）
            WATER: 2,       // 水（通行不可）
            GRASS: 3,       // 草地（通行可能、エンカウントあり）
            EXIT_NORTH: 4,  // 北への出口
            EXIT_SOUTH: 5,  // 南への出口
            EXIT_EAST: 6,   // 東への出口
            EXIT_WEST: 7,   // 西への出口
            BUILDING: 8,    // ビル入口（通行不可）
            DOOR: 9,        // ドア（調べると入れる）
            TREE: 10,       // 木（通行不可）
            ROCK: 11,       // 岩（通行不可）
            PILLAR: 12,     // 柱（通行不可）
            SAVE_POINT: 13  // セーブポイント
        };

        // タイルの描画色・記号定義
        this.tileStyles = {
            [this.TILE_TYPES.FLOOR]: { color: '#2a3555', symbol: '　', walkable: true },
            [this.TILE_TYPES.WALL]: { color: '#1a2040', symbol: '■', walkable: false },
            [this.TILE_TYPES.WATER]: { color: '#1a3a5a', symbol: '≈', walkable: false },
            [this.TILE_TYPES.GRASS]: { color: '#2a4a2a', symbol: '♣', walkable: true, encounter: true },
            [this.TILE_TYPES.EXIT_NORTH]: { color: '#4a5a7a', symbol: '↑', walkable: true, exit: 'north' },
            [this.TILE_TYPES.EXIT_SOUTH]: { color: '#4a5a7a', symbol: '↓', walkable: true, exit: 'south' },
            [this.TILE_TYPES.EXIT_EAST]: { color: '#4a5a7a', symbol: '→', walkable: true, exit: 'east' },
            [this.TILE_TYPES.EXIT_WEST]: { color: '#4a5a7a', symbol: '←', walkable: true, exit: 'west' },
            [this.TILE_TYPES.BUILDING]: { color: '#3a4a6a', symbol: '▓', walkable: false },
            [this.TILE_TYPES.DOOR]: { color: '#5a4a3a', symbol: '門', walkable: false, door: true },
            [this.TILE_TYPES.TREE]: { color: '#3a5a3a', symbol: '木', walkable: false },
            [this.TILE_TYPES.ROCK]: { color: '#4a4a4a', symbol: '石', walkable: false },
            [this.TILE_TYPES.PILLAR]: { color: '#3a3a5a', symbol: '柱', walkable: false },
            [this.TILE_TYPES.SAVE_POINT]: { color: '#6a4a3a', symbol: '⛩', walkable: true, save: true }
        };

        // マップデータ定義
        this.maps = {};
        this.initializeMaps();

        console.log('[GridMapSystem] Initialized. Current map:', this.currentMap);
    }

    initializeMaps() {
        // ==========================================
        // 新宿ワールドマップ（大きなマップ）
        // ==========================================
        this.maps.shinjuku_world = {
            name: '新宿 - 都市エリア',
            width: 50,  // マップ全体の幅（タイル数）
            height: 40, // マップ全体の高さ（タイル数）
            bgm: 'shinjuku_city',
            encounterRate: 'low',

            // タイルマップ（2次元配列）
            // 0=床、1=壁、など
            tiles: this.createShinjukuWorldMap(),

            // NPC配置
            npcs: [
                { gridX: 15, gridY: 12, emoji: '👤', name: '感情を失った市民', dialogue: '...。' },
                { gridX: 20, gridY: 18, emoji: '🧙‍♀️', name: 'アカリ',
                  dialogue: 'カイト、この街の異常を感じる？AIの支配が強まっているわ。',
                  questFlag: 'metAkari',
                  questDialogue: 'カイト！神威の力に目覚めたのね。地下鉄の様子がおかしいの。一緒に調べに行きましょう！'
                }
            ],

            // スポーン地点
            spawnPoint: { gridX: 25, gridY: 20 },

            // マップ遷移定義
            exits: {
                subway_entrance: { gridX: 2, gridY: 20, direction: 'west' },
                shrine_path: { gridX: 25, gridY: 2, direction: 'north' },
                shopping_district: { gridX: 25, gridY: 38, direction: 'south' },
                tokyo_gov: { gridX: 48, gridY: 20, direction: 'east' }
            }
        };

        // ==========================================
        // 地下鉄エリア
        // ==========================================
        this.maps.subway_entrance = {
            name: '新宿駅 - 地下通路',
            width: 30,
            height: 20,
            bgm: 'subway',
            encounterRate: 'medium',
            tiles: this.createSubwayMap(),
            npcs: [
                { gridX: 15, gridY: 10, emoji: '🤖', name: 'パトロールドローン',
                  dialogue: 'スキャン中...異常なし。', hostile: true }
            ],
            spawnPoint: { gridX: 28, gridY: 10 },
            exits: {
                shinjuku_world: { gridX: 29, gridY: 10, direction: 'east' },
                deep_tunnel: { gridX: 1, gridY: 10, direction: 'west' }
            }
        };

        // ==========================================
        // 神社エリア
        // ==========================================
        this.maps.shrine_path = {
            name: '明治神宮 - 参道',
            width: 30,
            height: 25,
            bgm: 'shrine',
            encounterRate: 'none',
            tiles: this.createShrineMap(),
            npcs: [
                { gridX: 15, gridY: 12, emoji: '👴', name: '老神主',
                  dialogue: '神々の力は、まだこの地に眠っている...選ばれし者よ。',
                  questFlag: 'metPriest',
                  questDialogue: 'ついに来たか、神威を継ぐ者よ。この神社には古の神々の力が眠っている。東の植物園には、生命の力を司る神が宿る場所がある。訪ねてみるがよい。'
                }
            ],
            spawnPoint: { gridX: 15, gridY: 23 },
            savePoint: { gridX: 15, gridY: 18 },
            exits: {
                shinjuku_world: { gridX: 15, gridY: 24, direction: 'south' },
                biodome_garden: { gridX: 29, gridY: 12, direction: 'east' }
            }
        };
    }

    // ==========================================
    // 新宿ワールドマップ生成
    // ==========================================
    createShinjukuWorldMap() {
        const width = 50;
        const height = 40;
        const T = this.TILE_TYPES;

        // 初期化（全て床）
        let map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = T.FLOOR;
            }
        }

        // 外周を壁で囲む
        for (let x = 0; x < width; x++) {
            map[0][x] = T.WALL;
            map[height - 1][x] = T.WALL;
        }
        for (let y = 0; y < height; y++) {
            map[y][0] = T.WALL;
            map[y][width - 1] = T.WALL;
        }

        // 出口を配置
        // 北（神社へ）
        for (let x = 23; x < 28; x++) {
            map[0][x] = T.EXIT_NORTH;
        }
        // 南（商店街へ）
        for (let x = 23; x < 28; x++) {
            map[height - 1][x] = T.EXIT_SOUTH;
        }
        // 西（地下鉄へ）
        for (let y = 18; y < 23; y++) {
            map[y][0] = T.EXIT_WEST;
        }
        // 東（都庁へ）
        for (let y = 18; y < 23; y++) {
            map[y][width - 1] = T.EXIT_EAST;
        }

        // ビルを配置（通行不可のエリア）
        // 左上のビル群
        this.fillRect(map, 3, 3, 8, 6, T.BUILDING);
        this.fillRect(map, 12, 3, 7, 5, T.BUILDING);

        // 右上のビル群
        this.fillRect(map, 38, 3, 9, 7, T.BUILDING);
        this.fillRect(map, 30, 5, 6, 5, T.BUILDING);

        // 左下のビル群
        this.fillRect(map, 3, 30, 10, 7, T.BUILDING);
        this.fillRect(map, 14, 32, 6, 5, T.BUILDING);

        // 右下のビル群
        this.fillRect(map, 38, 29, 9, 8, T.BUILDING);
        this.fillRect(map, 30, 31, 6, 6, T.BUILDING);

        // 中央のビル
        this.fillRect(map, 22, 15, 8, 8, T.BUILDING);

        // 公園エリア（草地）
        this.fillRect(map, 15, 20, 6, 6, T.GRASS);
        this.fillRect(map, 33, 15, 5, 5, T.GRASS);

        return map;
    }

    // ==========================================
    // 地下鉄マップ生成
    // ==========================================
    createSubwayMap() {
        const width = 30;
        const height = 20;
        const T = this.TILE_TYPES;

        let map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = T.FLOOR;
            }
        }

        // 外周を壁で囲む
        for (let x = 0; x < width; x++) {
            map[0][x] = T.WALL;
            map[height - 1][x] = T.WALL;
        }
        for (let y = 0; y < height; y++) {
            map[y][0] = T.WALL;
            map[y][width - 1] = T.WALL;
        }

        // 出口
        for (let y = 8; y < 13; y++) {
            map[y][0] = T.EXIT_WEST;  // 西（深層トンネルへ）
            map[y][width - 1] = T.EXIT_EAST;  // 東（新宿へ）
        }

        // 上下の壁
        this.fillRect(map, 5, 4, 20, 2, T.WALL);
        this.fillRect(map, 5, 14, 20, 2, T.WALL);

        // 柱
        this.fillRect(map, 8, 8, 2, 4, T.PILLAR);
        this.fillRect(map, 20, 8, 2, 4, T.PILLAR);

        return map;
    }

    // ==========================================
    // 神社マップ生成
    // ==========================================
    createShrineMap() {
        const width = 30;
        const height = 25;
        const T = this.TILE_TYPES;

        let map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = T.GRASS;  // 神社エリアは草地
            }
        }

        // 外周を木で囲む
        for (let x = 0; x < width; x++) {
            map[0][x] = T.TREE;
            map[height - 1][x] = T.TREE;
        }
        for (let y = 0; y < height; y++) {
            map[y][0] = T.TREE;
            map[y][width - 1] = T.TREE;
        }

        // 参道（床）
        this.fillRect(map, 13, 15, 5, 10, T.FLOOR);

        // 出口
        for (let x = 13; x < 18; x++) {
            map[height - 1][x] = T.EXIT_SOUTH;  // 南（新宿へ）
        }
        for (let y = 10; y < 15; y++) {
            map[y][width - 1] = T.EXIT_EAST;  // 東（植物園へ）
        }

        // 鳥居エリア
        this.fillRect(map, 13, 5, 5, 3, T.FLOOR);

        // セーブポイント
        map[18][15] = T.SAVE_POINT;

        // 装飾の木
        map[8][8] = T.TREE;
        map[8][21] = T.TREE;
        map[20][8] = T.TREE;
        map[20][21] = T.TREE;

        return map;
    }

    // ==========================================
    // ユーティリティ: 矩形領域を塗りつぶし
    // ==========================================
    fillRect(map, x, y, width, height, tileType) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                if (map[y + dy] && map[y + dy][x + dx] !== undefined) {
                    map[y + dy][x + dx] = tileType;
                }
            }
        }
    }

    // ==========================================
    // タイルの通行可否判定
    // ==========================================
    isWalkable(gridX, gridY) {
        const currentMapData = this.maps[this.currentMap];
        if (!currentMapData) return false;

        // マップ外
        if (gridX < 0 || gridY < 0 ||
            gridX >= currentMapData.width || gridY >= currentMapData.height) {
            return false;
        }

        const tile = currentMapData.tiles[gridY][gridX];
        const style = this.tileStyles[tile];

        return style && style.walkable;
    }

    // ==========================================
    // 出口チェック
    // ==========================================
    checkExit(gridX, gridY) {
        const currentMapData = this.maps[this.currentMap];
        if (!currentMapData) return null;

        const tile = currentMapData.tiles[gridY][gridX];
        const style = this.tileStyles[tile];

        if (style && style.exit) {
            // exitsオブジェクトから該当する出口を探す
            for (const [targetMap, exitData] of Object.entries(currentMapData.exits)) {
                if (exitData.gridX === gridX && exitData.gridY === gridY) {
                    return { targetMap, direction: exitData.direction };
                }
            }
        }

        return null;
    }

    // ==========================================
    // エンカウント判定
    // ==========================================
    shouldEncounter(gridX, gridY) {
        const currentMapData = this.maps[this.currentMap];
        if (!currentMapData) return false;

        const tile = currentMapData.tiles[gridY][gridX];
        const style = this.tileStyles[tile];

        return style && style.encounter;
    }

    // ==========================================
    // カメラ更新（プレイヤー中心）
    // ==========================================
    updateCamera(playerGridX, playerGridY) {
        const currentMapData = this.maps[this.currentMap];
        if (!currentMapData) return;

        // プレイヤーを画面中央に
        this.cameraX = playerGridX - Math.floor(this.viewWidth / 2);
        this.cameraY = playerGridY - Math.floor(this.viewHeight / 2);

        // カメラがマップ外に出ないように制限
        this.cameraX = Math.max(0, Math.min(this.cameraX, currentMapData.width - this.viewWidth));
        this.cameraY = Math.max(0, Math.min(this.cameraY, currentMapData.height - this.viewHeight));
    }

    // ==========================================
    // マップ描画
    // ==========================================
    render(ctx, canvas) {
        const currentMapData = this.maps[this.currentMap];
        if (!currentMapData) return;

        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // タイル描画
        for (let y = 0; y < this.viewHeight; y++) {
            for (let x = 0; x < this.viewWidth; x++) {
                const mapX = this.cameraX + x;
                const mapY = this.cameraY + y;

                if (mapY >= 0 && mapY < currentMapData.height &&
                    mapX >= 0 && mapX < currentMapData.width) {

                    const tile = currentMapData.tiles[mapY][mapX];
                    const style = this.tileStyles[tile];

                    if (style) {
                        // タイル背景
                        ctx.fillStyle = style.color;
                        ctx.fillRect(
                            x * this.tileSize,
                            y * this.tileSize,
                            this.tileSize,
                            this.tileSize
                        );

                        // グリッド線
                        ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
                        ctx.strokeRect(
                            x * this.tileSize,
                            y * this.tileSize,
                            this.tileSize,
                            this.tileSize
                        );

                        // タイル記号
                        if (style.symbol !== '　') {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                            ctx.font = '16px monospace';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(
                                style.symbol,
                                x * this.tileSize + this.tileSize / 2,
                                y * this.tileSize + this.tileSize / 2
                            );
                        }
                    }
                }
            }
        }
    }

    // ==========================================
    // マップ切り替え
    // ==========================================
    changeMap(mapId, spawnGridX = null, spawnGridY = null) {
        if (!this.maps[mapId]) {
            console.error('[GridMapSystem] Map not found:', mapId);
            return null;
        }

        this.currentMap = mapId;
        const mapData = this.maps[mapId];

        // スポーン座標
        const spawnX = spawnGridX !== null ? spawnGridX : mapData.spawnPoint.gridX;
        const spawnY = spawnGridY !== null ? spawnGridY : mapData.spawnPoint.gridY;

        console.log(`[GridMapSystem] Changed to map: ${mapData.name} at (${spawnX}, ${spawnY})`);

        // BGM変更
        if (window.bgmSystem && mapData.bgm) {
            window.bgmSystem.changeFieldBGM(mapData.bgm);
        }

        return { gridX: spawnX, gridY: spawnY };
    }
}

// グローバルに公開
window.GridMapSystem = GridMapSystem;
