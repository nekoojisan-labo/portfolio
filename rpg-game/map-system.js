// ==========================================
// マップシステム (Map System)
// ==========================================

class MapSystem {
    constructor() {
        this.currentMap = 'shinjuku_center_plaza';
        this.maps = {};
        this.mapImages = {};
        this.spriteImages = {};
        this.assetVersion = '46';
        this.baseWidth = 800;
        this.baseHeight = 450;
        this.camera = { x: 0, y: 0 };
        this.npcSpriteMap = {
            'カイト': 'assets/characters/sprites/kaito_walk.png',
            'アカリ': 'assets/characters/sprites/akari_walk.png',
            'リク': 'assets/characters/sprites/riku_walk.png',
            'ヤミ': 'assets/characters/sprites/yami_walk.png',
            '感情を失った市民': 'assets/characters/sprites/npc_citizen_male_walk.png',
            '街の住民': 'assets/characters/sprites/npc_citizen_female_walk.png',
            '家族': 'assets/characters/sprites/npc_resident_walk.png',
            'おばあさん': 'assets/characters/sprites/npc_elder_walk.png',
            '住人': 'assets/characters/sprites/npc_resident_walk.png',
            '冒険者A': 'assets/characters/sprites/npc_worker_walk.png',
            '冒険者B': 'assets/characters/sprites/npc_priest_walk.png',
            '老神主': 'assets/characters/sprites/npc_priest_walk.png',
            'パトロールドローン': 'assets/enemies/deus_machina.png',
            '暴走ドローン': 'assets/enemies/watcher.png',
            'セキュリティドローン': 'assets/enemies/deus_machina.png',
            'ガードロボ': 'assets/enemies/deus_machina.png',
            'アーク・プライム': 'assets/enemies/ark_prime.png',
            'シャドウエンティティ': 'assets/enemies/abyss_ruler.png',
            'データスパイダー': 'assets/enemies/alraune.png',
            'グリッチスピリット': 'assets/enemies/watcher.png',
            'データドラゴン': 'assets/enemies/cerberus.png',
            '深淵の支配者': 'assets/enemies/abyss_ruler.png',
            '武器商人リョウ': 'assets/characters/sprites/merchant_weapon_walk.png',
            '防具商人サクラ': 'assets/characters/sprites/merchant_armor_walk.png',
            'アイテム商人ユウキ': 'assets/characters/sprites/merchant_item_walk.png',
            '魔法商人ミコト': 'assets/characters/sprites/merchant_magic_walk.png',
            '宿屋の主人': 'assets/characters/sprites/innkeeper_walk.png',
            '銀行員': 'assets/characters/sprites/banker_walk.png',
            'ギルドマスター': 'assets/characters/sprites/guildmaster_walk.png',
            '闇商人': 'assets/characters/sprites/dark_merchant_walk.png'
        };
        this.walkSprite = { frameWidth:72, frameHeight:92, frames:4, fps:7, frameSequence:[0,1,2,3], idleFrame:0, rows:{down:0,left:1,right:2,up:3} };
        this.tileSize = 32;
        this.mapWidth = 25;
        this.mapHeight = 19;
        
        // マップデータ定義
        this.initializeMaps();
        this.applyScreenMapOverrides();
        this.applyShopImageMapOverrides();
        this.removeLegacyMapDuplicates();
        this.preloadMapImages();
        this.preloadSpriteImages();
        setTimeout(() => this.preloadAdjacentMapImages(this.currentMap), 250);
        
        // デバッグ: 利用可能なマップをログ出力
        console.log('Available maps:', Object.keys(this.maps));
        
        // NPCとイベント
        this.npcs = [];
        this.events = [];
        
        // マップ遷移エフェクト
        this.transitioning = false;
        this.transitionCooldownMs = 700;
        this.transitionCooldownUntil = 0;
        this.lastNpcUpdate = performance.now();
    }
    
    initializeMaps() {
        // 新宿都市エリア
        this.maps.shinjuku_city = {
            name: '新宿 - 中央区画',
            bgColor: '#1a1a2e',
            gridColor: '#0f3460',
            encounterRate: 'low',  // 街の中心部は比較的安全
            area: 'city',
            bgm: 'shinjuku_city',  // BGM追加
            buildings: [
                // 左上のビル（移動経路を確保するため位置調整）
                { x: 50, y: 50, width: 80, height: 60, color: '#2a3555', borderColor: '#4a5575', type: 'building' },
                // 中央上のビル（北の出口から離す）
                { x: 550, y: 50, width: 90, height: 70, color: '#253550', borderColor: '#455570', type: 'office' },
                // 右側のビル（東の出口から離す）
                { x: 650, y: 180, width: 70, height: 80, color: '#2a3a55', borderColor: '#4a5a75', type: 'building' },
                // 左下のビル（西の出口から離す）
                { x: 50, y: 320, width: 100, height: 70, color: '#283555', borderColor: '#485575', type: 'office' },
                // 中央下のビル（南の出口から離す）
                { x: 550, y: 320, width: 85, height: 65, color: '#2a3050', borderColor: '#4a5070', type: 'building' }
            ],
            exits: [
                { x: 0, y: 200, width: 30, height: 200, to: 'subway_entrance', direction: 'west' },
                { x: 770, y: 200, width: 30, height: 200, to: 'tokyo_gov', direction: 'east' },
                { x: 300, y: 0, width: 200, height: 20, to: 'shrine_path', direction: 'north' },
                { x: 300, y: 410, width: 200, height: 20, to: 'shopping_district', direction: 'south' }
            ],
            npcs: [
                { x: 300, y: 200, emoji: '👤', name: '感情を失った市民', dialogue: '...。' },
                {
                    x: 450,
                    y: 350,
                    emoji: '🧙‍♀️',
                    name: 'アカリ',
                    dialogue: 'カイト、この街の異常を感じる？AIの支配が強まっているわ。',
                    questFlag: 'metAkari',
                    questDialogue: 'カイト！神威の力に目覚めたのね。地下鉄の様子がおかしいの。一緒に調べに行きましょう！'
                }
            ]
        };
        
        // 地下鉄エリア
        this.maps.subway_entrance = {
            name: '新宿駅 - 地下通路',
            bgColor: '#0a0a0a',
            gridColor: '#2a2a2a',
            encounterRate: 'medium',  // 地下は少し危険
            area: 'subway',
            bgm: 'subway',  // BGM追加
            buildings: [
                // 上の壁
                { x: 130, y: 120, width: 420, height: 35, color: '#2a2a2a', borderColor: '#4a4a4a', type: 'wall' },
                // 下の壁
                { x: 130, y: 375, width: 420, height: 35, color: '#2a2a2a', borderColor: '#4a4a4a', type: 'wall' },
                // 左の柱
                { x: 230, y: 220, width: 42, height: 125, color: '#3a3a3a', borderColor: '#5a5a5a', type: 'pillar' },
                // 右の柱
                { x: 528, y: 220, width: 42, height: 125, color: '#3a3a3a', borderColor: '#5a5a5a', type: 'pillar' }
            ],
            exits: [
                { x: 770, y: 200, width: 30, height: 200, to: 'shinjuku_city', direction: 'east' },
                { x: 0, y: 200, width: 30, height: 200, to: 'deep_tunnel', direction: 'west' }
            ],
            npcs: [
                { x: 400, y: 300, emoji: '🤖', name: 'パトロールドローン', dialogue: 'スキャン中...異常なし。', hostile: true }
            ]
        };
        
        // 植物園エリア
        this.maps.biodome_garden = {
            name: 'バイオドーム植物園',
            bgColor: '#0d1f0d',
            gridColor: '#1a3a1a',
            encounterRate: 'none',  // 管理された安全地帯
            area: 'garden',
            bgm: 'biodome',  // BGM追加
            buildings: [
                { x: 180, y: 170, width: 70, height: 70, color: '#2a4a2a', borderColor: '#4a6a4a', type: 'tree' },
                { x: 550, y: 170, width: 70, height: 70, color: '#2a4a2a', borderColor: '#4a6a4a', type: 'tree' },
                { x: 370, y: 260, width: 70, height: 105, color: '#3a5a5a', borderColor: '#5a7a7a', type: 'pond' },
                { x: 180, y: 330, width: 70, height: 55, color: '#2a4a2a', borderColor: '#4a6a4a', type: 'tree' },
                { x: 550, y: 330, width: 70, height: 55, color: '#2a4a2a', borderColor: '#4a6a4a', type: 'tree' }
            ],
            exits: [
                { x: 0, y: 200, width: 30, height: 200, to: 'shrine_path', direction: 'west' }
            ],
            npcs: [
                { x: 400, y: 300, emoji: '🧑‍🔧', name: 'リク', dialogue: '本物の植物を見たことがなかったんだ...これも作り物だけど、美しいね。' }
            ]
        };
        
        // 闇市エリア
        this.maps.black_market = {
            name: '闇市 - 地下マーケット',
            bgColor: '#1a0a1a',
            gridColor: '#3a0a3a',
            encounterRate: 'low',  // 住民がいるので比較的安全
            area: 'market',
            bgm: 'black_market',  // BGM追加
            buildings: [
                { x: 70, y: 110, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' },
                { x: 165, y: 110, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' },
                { x: 260, y: 110, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' },
                { x: 485, y: 110, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' },
                { x: 580, y: 110, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' },
                { x: 675, y: 110, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' },
                { x: 70, y: 360, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' },
                { x: 165, y: 360, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' },
                { x: 580, y: 360, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' },
                { x: 675, y: 360, width: 55, height: 42, color: '#3a2a3a', borderColor: '#5a4a5a', type: 'stall' }
            ],
            exits: [
                { x: 770, y: 200, width: 30, height: 200, to: 'shopping_district', direction: 'east' }
            ],
            npcs: [
                {
                    x: 200,
                    y: 300,
                    emoji: '🧑‍💻',
                    name: 'ヤミ',
                    dialogue: 'ここならアークの監視も届かない。必要な物資があれば言ってくれ。',
                    questFlag: 'metYami',
                    questDialogue: 'よく来たね、カイト。神威の力を持つ者の噂は聞いていた。この闇市では、アークの目を逃れた者たちが集まっている。力を貸してくれないか？'
                },
                { x: 600, y: 300, emoji: '👨‍🔧', name: '闇市の案内人', dialogue: '珍しい品は闇市の奥の店で扱っている。入口から中へ入ってくれ。' }
            ]
        };
        
        // 神社エリア
        this.maps.shrine_path = {
            name: '明治神宮 - 参道',
            bgColor: '#1a1a0a',
            gridColor: '#2a2a1a',
            encounterRate: 'none',
            area: 'shrine',
            bgm: 'shrine',
            buildings: [
                { x: 370, y: 120, width: 70, height: 105, color: '#5a4a3a', borderColor: '#7a6a5a', type: 'torii', enterable: true, enterTo: 'shrine_inner' },
                { x: 130, y: 220, width: 42, height: 140, color: '#4a3a2a', borderColor: '#6a5a4a', type: 'lantern' },
                { x: 628, y: 220, width: 42, height: 140, color: '#4a3a2a', borderColor: '#6a5a4a', type: 'lantern' }
            ],
            exits: [
                { x: 300, y: 410, width: 200, height: 20, to: 'shinjuku_city', direction: 'south' },
                { x: 770, y: 200, width: 30, height: 200, to: 'biodome_garden', direction: 'east' },
                { x: 370, y: 100, width: 70, height: 20, to: 'shrine_inner', direction: 'north', label: '本殿へ' }
            ],
            npcs: [
                {
                    x: 400,
                    y: 280,
                    emoji: '👴',
                    name: '老神主',
                    dialogue: '神々の力は、まだこの地に眠っている...選ばれし者よ。',
                    questFlag: 'metPriest',
                    questDialogue: 'ついに来たか、神威を継ぐ者よ。この神社には古の神々の力が眠っている。東の植物園には、生命の力を司る神が宿る場所がある。訪ねてみるがよい。'
                }
            ],
            savePoint: { x: 400, y: 370, emoji: '⛩️', name: 'セーブポイント' }
        };
        
        // 都庁エリア
        this.maps.tokyo_gov = {
            name: '東京都庁 - エントランス',
            bgColor: '#0a0a1a',
            gridColor: '#1a1a3a',
            encounterRate: 'high',
            area: 'city',
            bgm: 'tokyo_gov',
            buildings: [
                // 上の壁
                { x: 230, y: 120, width: 280, height: 35, color: '#2a2a4a', borderColor: '#4a4a6a', type: 'wall' },
                // 下の壁
                { x: 230, y: 375, width: 280, height: 35, color: '#2a2a4a', borderColor: '#4a4a6a', type: 'wall' },
                // エレベーター（上階へ）
                { x: 370, y: 220, width: 70, height: 70, color: '#4a4a7a', borderColor: '#6a6a9a', type: 'elevator', enterable: true, enterTo: 'tokyo_gov_floor2' }
            ],
            exits: [
                { x: 0, y: 200, width: 30, height: 200, to: 'shinjuku_city', direction: 'west' },
                { x: 370, y: 200, width: 70, height: 20, to: 'tokyo_gov_floor2', direction: 'north', label: '2階へ' }
            ],
            npcs: [
                { x: 300, y: 300, emoji: '🤖', name: 'セキュリティドローン', dialogue: '警告：不正アクセスを検知。', hostile: true },
                { x: 500, y: 300, emoji: '🤖', name: 'セキュリティドローン', dialogue: '警告：不正アクセスを検知。', hostile: true }
            ]
        };
        
        // 深層地下トンネル（ダンジョン）
        this.maps.deep_tunnel = {
            name: '深層地下トンネル - 第1層',
            bgColor: '#0f0f0f',
            gridColor: '#2f1f1f',
            encounterRate: 'very_high',  // ダンジョンは高い遭遇率
            area: 'dungeon',
            bgm: 'dungeon',  // BGM追加
            buildings: [
                // 壁や障害物（外周壁を薄くして移動可能領域を拡大）
                { x: 0, y: 0, width: 800, height: 35, color: '#1f1f1f', borderColor: '#3f3f3f', type: 'wall' },
                { x: 0, y: 395, width: 800, height: 35, color: '#1f1f1f', borderColor: '#3f3f3f', type: 'wall' },
                { x: 0, y: 0, width: 35, height: 430, color: '#1f1f1f', borderColor: '#3f3f3f', type: 'wall' },
                { x: 765, y: 0, width: 35, height: 430, color: '#1f1f1f', borderColor: '#3f3f3f', type: 'wall' },

                // 内部の柱や障害物（サイズ縮小）
                { x: 210, y: 160, width: 28, height: 28, color: '#3f2f2f', borderColor: '#5f4f4f', type: 'pillar' },
                { x: 562, y: 160, width: 28, height: 28, color: '#3f2f2f', borderColor: '#5f4f4f', type: 'pillar' },
                { x: 210, y: 332, width: 28, height: 28, color: '#3f2f2f', borderColor: '#5f4f4f', type: 'pillar' },
                { x: 562, y: 332, width: 28, height: 28, color: '#3f2f2f', borderColor: '#5f4f4f', type: 'pillar' },
                { x: 386, y: 246, width: 28, height: 28, color: '#3f2f2f', borderColor: '#5f4f4f', type: 'pillar' },

                // 宝箱
                { x: 100, y: 350, width: 25, height: 25, color: '#8B6513', borderColor: '#CD8533', type: 'treasure' },
                { x: 675, y: 100, width: 25, height: 25, color: '#8B6513', borderColor: '#CD8533', type: 'treasure' }
            ],
            exits: [
                { x: 770, y: 200, width: 30, height: 200, to: 'subway_entrance', direction: 'east' },
                { x: 300, y: 410, width: 200, height: 20, to: 'deep_tunnel_2', direction: 'south' }
            ],
            npcs: [
                { x: 300, y: 200, emoji: '👹', name: 'シャドウエンティティ', dialogue: 'この領域は...我々のものだ。', hostile: true, level: 3 },
                { x: 500, y: 350, emoji: '🕷️', name: 'データスパイダー', dialogue: 'ジジジ...侵入者発見...', hostile: true, level: 2 },
                { x: 150, y: 360, emoji: '⚡', name: 'グリッチスピリット', dialogue: 'エラー...エラー...削除シマス...', hostile: true, level: 2 }
            ],
            treasures: [
                { x: 100, y: 350, item: 'ヒールポーション', opened: false },
                { x: 675, y: 100, item: 'エナジーコア', opened: false }
            ]
        };
        
        // 深層地下トンネル第2層
        this.maps.deep_tunnel_2 = {
            name: '深層地下トンネル - 第2層',
            bgColor: '#0a0a0f',
            gridColor: '#2f1f2f',
            encounterRate: 'extreme',
            area: 'dungeon',
            bgm: 'deep_dungeon',
            buildings: [
                { x: 0, y: 0, width: 800, height: 35, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                { x: 0, y: 395, width: 800, height: 35, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                { x: 0, y: 0, width: 35, height: 430, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                { x: 765, y: 0, width: 35, height: 430, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },

                // 複雑な迷路構造
                { x: 170, y: 110, width: 140, height: 28, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' },
                { x: 490, y: 110, width: 140, height: 28, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' },
                { x: 170, y: 342, width: 140, height: 28, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' },
                { x: 490, y: 342, width: 140, height: 28, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' },
                { x: 370, y: 210, width: 70, height: 100, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' }
            ],
            exits: [
                { x: 300, y: 0, width: 200, height: 20, to: 'deep_tunnel', direction: 'north' },
                { x: 300, y: 410, width: 200, height: 20, to: 'deep_tunnel_3', direction: 'south' }
            ],
            npcs: [
                { x: 200, y: 200, emoji: '💀', name: 'ネクロマンサー', dialogue: '死者の軍団よ、目覚めよ！', hostile: true, level: 5 },
                { x: 600, y: 200, emoji: '🐉', name: 'データドラゴン', dialogue: 'この深淵で眠りを妨げるとは...', hostile: true, level: 6 }
            ]
        };
        
        // 商業街エリア（ショップが充実）
        this.maps.shopping_district = {
            name: '渋谷商業街 - ショッピングモール',
            bgColor: '#1a1a3e',
            gridColor: '#3a3a5e',
            encounterRate: 'none',  // ショッピング街は安全
            area: 'town',
            bgm: 'shopping',  // BGM追加
            buildings: [
                // ショップ建物（サイズ縮小）
                { x: 70, y: 110, width: 84, height: 56, color: '#2a4a2a', borderColor: '#4a6a4a', type: 'weapon_shop' },
                { x: 220, y: 110, width: 84, height: 56, color: '#4a2a2a', borderColor: '#6a4a4a', type: 'armor_shop' },
                { x: 370, y: 110, width: 84, height: 56, color: '#2a2a4a', borderColor: '#4a4a6a', type: 'item_shop' },
                { x: 520, y: 110, width: 84, height: 56, color: '#4a4a2a', borderColor: '#6a6a4a', type: 'magic_shop' },

                { x: 70, y: 310, width: 84, height: 56, color: '#3a3a4a', borderColor: '#5a5a6a', type: 'inn' },
                { x: 220, y: 310, width: 84, height: 56, color: '#4a3a3a', borderColor: '#6a5a5a', type: 'bank' },
                { x: 520, y: 310, width: 84, height: 56, color: '#3a4a3a', borderColor: '#5a6a5a', type: 'guild' },

                // 中央広場
                { x: 320, y: 260, width: 140, height: 105, color: '#2e4e6e', borderColor: '#4e6e8e', type: 'plaza' }
            ],
            exits: [
                { x: 0, y: 200, width: 30, height: 200, to: 'black_market', direction: 'west' },
                { x: 770, y: 200, width: 30, height: 200, to: 'residential_area', direction: 'east' },
                { x: 300, y: 0, width: 200, height: 20, to: 'shinjuku_city', direction: 'north' }
            ],
            npcs: [
                { x: 112, y: 150, emoji: '🗡️', name: '武器店の呼び込み', dialogue: '武器店は建物の中だ。入口から入ってスタッフに話しかけてくれ。' },
                { x: 262, y: 150, emoji: '🛡️', name: '防具店の呼び込み', dialogue: '防具を買うなら店内のカウンターへどうぞ。' },
                { x: 412, y: 150, emoji: '🧪', name: '道具店の呼び込み', dialogue: '回復アイテムは道具店の中で扱っているよ。' },
                { x: 562, y: 150, emoji: '🔮', name: '魔法店の呼び込み', dialogue: '魔法具は店内のスタッフに聞いてくれ。' },

                { x: 112, y: 350, emoji: '🏠', name: '宿屋の案内人', dialogue: '休むなら宿屋の中で受付に声をかけてください。' },
                { x: 262, y: 350, emoji: '💰', name: '銀行の案内人', dialogue: '預け入れと引き出しは銀行内の窓口でお願いします。' },
                { x: 562, y: 350, emoji: '⚔️', name: 'ギルド案内人', dialogue: '依頼はギルドの中でギルドマスターに確認してくれ。' },

                { x: 390, y: 315, emoji: '👥', name: '街の住民', dialogue: 'この街は平和でいいところよ。でも最近、地下で変な音が...' }
            ]
        };
        
        // 住宅街エリア
        this.maps.residential_area = {
            name: '住宅街 - 平和な街並み',
            bgColor: '#1e2e1e',
            gridColor: '#2e4e2e',
            encounterRate: 'none',
            area: 'town',
            bgm: 'residential',
            buildings: [
                { x: 120, y: 110, width: 70, height: 56, color: '#3e4e3e', borderColor: '#5e6e5e', type: 'house', enterable: true, enterTo: 'house_1' },
                { x: 270, y: 110, width: 70, height: 56, color: '#4e3e3e', borderColor: '#6e5e5e', type: 'house' },
                { x: 520, y: 110, width: 70, height: 56, color: '#3e3e4e', borderColor: '#5e5e6e', type: 'house' },
                { x: 120, y: 310, width: 70, height: 56, color: '#4e4e3e', borderColor: '#6e6e5e', type: 'house' },
                { x: 520, y: 310, width: 70, height: 56, color: '#3e5e3e', borderColor: '#5e7e5e', type: 'house' },
                { x: 270, y: 210, width: 70, height: 56, color: '#5e3e3e', borderColor: '#7e5e5e', type: 'house' },
                { x: 420, y: 210, width: 70, height: 56, color: '#3e3e5e', borderColor: '#5e5e7e', type: 'house' }
            ],
            exits: [
                { x: 0, y: 200, width: 30, height: 200, to: 'shopping_district', direction: 'west' }
            ],
            npcs: [
                { x: 155, y: 145, emoji: '👨‍👩‍👧‍👦', name: '家族', dialogue: '平和な毎日に感謝しています。' },
                { x: 305, y: 200, emoji: '🐱', name: 'ミケ', dialogue: 'にゃーん（人懐っこい猫のようだ）' },
                { x: 555, y: 345, emoji: '👵', name: 'おばあさん', dialogue: '昔はもっと賑やかな街だったのよ...'},
                { x: 455, y: 370, emoji: '📮', name: '郵便ポスト', dialogue: '手紙を出しますか？（まだ実装されていません）' }
            ],
            savePoint: { x: 350, y: 250, emoji: '💤', name: '公園のベンチ' }
        };

        // ==========================================
        // ショップ内部マップ
        // ==========================================

        // 武器店内
        this.maps.shop_weapon = {
            name: '武器店 - リョウの店',
            image: 'assets/maps/shop_weapon.png',
            bgColor: '#111821',
            gridColor: 'transparent',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'shop',
            drawProceduralObjects: false,
            walkableRects: [
                { x: 82, y: 168, width: 636, height: 238 },
                { x: 352, y: 120, width: 96, height: 64 },
                { x: 350, y: 405, width: 100, height: 45 }
            ],
            buildings: [
                { x: 0, y: 0, width: 800, height: 58, type: 'collision', collisionOnly: true },
                { x: 0, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 776, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 52, y: 82, width: 106, height: 186, type: 'collision', collisionOnly: true },
                { x: 642, y: 82, width: 106, height: 186, type: 'collision', collisionOnly: true },
                { x: 210, y: 250, width: 92, height: 80, type: 'collision', collisionOnly: true },
                { x: 498, y: 250, width: 92, height: 80, type: 'collision', collisionOnly: true }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 40, to: 'shopping_street_north', direction: 'south', spawnX: 119, spawnY: 196 }
            ],
            npcs: [
                { x: 400, y: 190, emoji: '🗡️', name: '武器商人リョウ', dialogue: 'いらっしゃい！最新の神器武器を取り揃えてるよ！', shop: true, shopType: 'weapons', static: true }
            ]
        };

        // 防具店内
        this.maps.shop_armor = {
            name: '防具店 - サクラの店',
            image: 'assets/maps/shop_armor.png',
            bgColor: '#171420',
            gridColor: 'transparent',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'shop',
            drawProceduralObjects: false,
            walkableRects: [
                { x: 82, y: 170, width: 636, height: 236 },
                { x: 352, y: 120, width: 96, height: 70 },
                { x: 350, y: 405, width: 100, height: 45 }
            ],
            buildings: [
                { x: 0, y: 0, width: 800, height: 58, type: 'collision', collisionOnly: true },
                { x: 0, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 776, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 48, y: 76, width: 120, height: 204, type: 'collision', collisionOnly: true },
                { x: 632, y: 76, width: 120, height: 204, type: 'collision', collisionOnly: true },
                { x: 218, y: 240, width: 64, height: 88, type: 'collision', collisionOnly: true },
                { x: 518, y: 240, width: 64, height: 88, type: 'collision', collisionOnly: true }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 40, to: 'shopping_street_north', direction: 'south', spawnX: 120, spawnY: 385 }
            ],
            npcs: [
                { x: 400, y: 190, emoji: '🛡️', name: '防具商人サクラ', dialogue: 'お疲れさま！丈夫な防具なら任せて！', shop: true, shopType: 'armor', static: true }
            ]
        };

        // 道具店内
        this.maps.shop_item = {
            name: '道具店 - ユウキの店',
            image: 'assets/maps/shop_item.png',
            bgColor: '#101827',
            gridColor: 'transparent',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'shop',
            drawProceduralObjects: false,
            walkableRects: [
                { x: 82, y: 170, width: 636, height: 236 },
                { x: 352, y: 120, width: 96, height: 70 },
                { x: 350, y: 405, width: 100, height: 45 }
            ],
            buildings: [
                { x: 0, y: 0, width: 800, height: 58, type: 'collision', collisionOnly: true },
                { x: 0, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 776, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 46, y: 78, width: 134, height: 228, type: 'collision', collisionOnly: true },
                { x: 620, y: 78, width: 134, height: 228, type: 'collision', collisionOnly: true },
                { x: 300, y: 250, width: 200, height: 75, type: 'collision', collisionOnly: true }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 40, to: 'shopping_street_north', direction: 'south', spawnX: 670, spawnY: 385 }
            ],
            npcs: [
                { x: 400, y: 190, emoji: '🧪', name: 'アイテム商人ユウキ', dialogue: 'ポーション、回復アイテム何でもあります！', shop: true, shopType: 'items', static: true }
            ]
        };

        // 魔法店内
        this.maps.shop_magic = {
            name: '魔法店 - ミコトの店',
            image: 'assets/maps/shop_magic.png',
            bgColor: '#171122',
            gridColor: 'transparent',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'shop_magic',
            drawProceduralObjects: false,
            walkableRects: [
                { x: 82, y: 170, width: 636, height: 236 },
                { x: 352, y: 120, width: 96, height: 70 },
                { x: 350, y: 405, width: 100, height: 45 }
            ],
            buildings: [
                { x: 0, y: 0, width: 800, height: 58, type: 'collision', collisionOnly: true },
                { x: 0, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 776, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 46, y: 72, width: 102, height: 188, type: 'collision', collisionOnly: true },
                { x: 652, y: 72, width: 102, height: 188, type: 'collision', collisionOnly: true },
                { x: 156, y: 206, width: 108, height: 108, type: 'collision', collisionOnly: true },
                { x: 536, y: 206, width: 108, height: 108, type: 'collision', collisionOnly: true }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 40, to: 'shopping_street_north', direction: 'south', spawnX: 680, spawnY: 200 }
            ],
            npcs: [
                { x: 400, y: 190, emoji: '🔮', name: '魔法商人ミコト', dialogue: '古の魔法アイテムを求めるなら...', shop: true, shopType: 'magic', static: true }
            ]
        };

        // 宿屋内
        this.maps.shop_inn = {
            name: '宿屋 - やすらぎの宿',
            image: 'assets/maps/shop_inn.png',
            bgColor: '#201812',
            gridColor: 'transparent',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'inn',
            drawProceduralObjects: false,
            walkableRects: [
                { x: 82, y: 158, width: 636, height: 248 },
                { x: 352, y: 108, width: 96, height: 72 },
                { x: 350, y: 405, width: 100, height: 45 }
            ],
            buildings: [
                { x: 0, y: 0, width: 800, height: 58, type: 'collision', collisionOnly: true },
                { x: 0, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 776, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 48, y: 150, width: 142, height: 100, type: 'collision', collisionOnly: true },
                { x: 610, y: 150, width: 142, height: 100, type: 'collision', collisionOnly: true },
                { x: 305, y: 270, width: 190, height: 80, type: 'collision', collisionOnly: true }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 40, to: 'shopping_street_south', direction: 'south', spawnX: 182, spawnY: 206 }
            ],
            npcs: [
                { x: 400, y: 180, emoji: '🏠', name: '宿屋の主人', dialogue: 'お疲れ様！ゆっくり休んでいってくださいな。', shop: true, shopType: 'inn', static: true }
            ],
            savePoint: { x: 400, y: 350, emoji: '🛏️', name: 'ベッド' }
        };

        // ギルド内
        this.maps.shop_guild = {
            name: '冒険者ギルド',
            image: 'assets/maps/shop_guild.png',
            bgColor: '#161a1e',
            gridColor: 'transparent',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'guild',
            drawProceduralObjects: false,
            walkableRects: [
                { x: 82, y: 160, width: 636, height: 246 },
                { x: 352, y: 106, width: 96, height: 78 },
                { x: 350, y: 405, width: 100, height: 45 }
            ],
            buildings: [
                { x: 0, y: 0, width: 800, height: 58, type: 'collision', collisionOnly: true },
                { x: 0, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 776, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 48, y: 145, width: 122, height: 177, type: 'collision', collisionOnly: true },
                { x: 630, y: 145, width: 122, height: 177, type: 'collision', collisionOnly: true },
                { x: 250, y: 250, width: 110, height: 85, type: 'collision', collisionOnly: true },
                { x: 440, y: 250, width: 110, height: 85, type: 'collision', collisionOnly: true }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 40, to: 'shopping_street_south', direction: 'south', spawnX: 616, spawnY: 209 }
            ],
            npcs: [
                { x: 400, y: 185, emoji: '⚔️', name: 'ギルドマスター', dialogue: 'クエストの受注・報告はこちらで。', static: true },
                { x: 210, y: 350, emoji: '🧝', name: '冒険者A', dialogue: '最近、地下ダンジョンが活発だって噂だぜ。' },
                { x: 590, y: 350, emoji: '🧙', name: '冒険者B', dialogue: '神威の力...伝説だと思っていたが...' }
            ]
        };

        // 銀行内
        this.maps.shop_bank = {
            name: '新宿中央銀行',
            image: 'assets/maps/shop_bank.png',
            bgColor: '#121928',
            gridColor: 'transparent',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'bank',
            drawProceduralObjects: false,
            walkableRects: [
                { x: 82, y: 170, width: 636, height: 236 },
                { x: 352, y: 110, width: 96, height: 78 },
                { x: 350, y: 405, width: 100, height: 45 }
            ],
            buildings: [
                { x: 0, y: 0, width: 800, height: 58, type: 'collision', collisionOnly: true },
                { x: 0, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 776, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 72, y: 205, width: 82, height: 121, type: 'collision', collisionOnly: true },
                { x: 650, y: 205, width: 82, height: 121, type: 'collision', collisionOnly: true },
                { x: 330, y: 245, width: 140, height: 115, type: 'collision', collisionOnly: true }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 40, to: 'shopping_street_south', direction: 'south', spawnX: 205, spawnY: 404 }
            ],
            npcs: [
                { x: 400, y: 185, emoji: '💰', name: '銀行員', dialogue: 'お金の預入・引出しをどうぞ。', static: true }
            ]
        };

        // 闇市の裏商店内
        this.maps.shop_black_market = {
            name: '闇市 - 裏商店',
            image: 'assets/maps/shop_black_market.png',
            bgColor: '#120c18',
            gridColor: 'transparent',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'black_market',
            drawProceduralObjects: false,
            walkableRects: [
                { x: 82, y: 176, width: 636, height: 230 },
                { x: 352, y: 122, width: 96, height: 76 },
                { x: 350, y: 405, width: 100, height: 45 }
            ],
            buildings: [
                { x: 0, y: 0, width: 800, height: 58, type: 'collision', collisionOnly: true },
                { x: 0, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 776, y: 0, width: 24, height: 450, type: 'collision', collisionOnly: true },
                { x: 48, y: 90, width: 120, height: 202, type: 'collision', collisionOnly: true },
                { x: 632, y: 90, width: 120, height: 202, type: 'collision', collisionOnly: true },
                { x: 284, y: 252, width: 232, height: 82, type: 'collision', collisionOnly: true }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 40, to: 'black_market_entrance', direction: 'south', spawnX: 460, spawnY: 260 }
            ],
            npcs: [
                { x: 400, y: 190, emoji: '👨‍🔧', name: '闇商人', dialogue: '珍しい神器があるよ...高いけどね。', shop: true, shopType: 'black_market', static: true }
            ]
        };

        // ==========================================
        // 施設内部マップ
        // ==========================================

        // 民家1
        this.maps.house_1 = {
            name: '民家',
            bgColor: '#2a2a2a',
            gridColor: '#3a3a3a',
            encounterRate: 'none',
            area: 'house',
            bgm: 'residential',
            buildings: [
                { x: 50, y: 50, width: 150, height: 100, color: '#4a3a3a', borderColor: '#6a5a5a', type: 'bed' },
                { x: 600, y: 50, width: 150, height: 100, color: '#3a4a3a', borderColor: '#5a6a5a', type: 'kitchen' },
                { x: 300, y: 200, width: 200, height: 100, color: '#3a3a4a', borderColor: '#5a5a6a', type: 'living_table' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'residential_area', direction: 'south', spawnX: 165, spawnY: 240 }
            ],
            npcs: [
                { x: 400, y: 250, emoji: '👨', name: '住人', dialogue: 'うちは普通の家だよ。でも地下に何かあるって噂が...' }
            ],
            treasures: [
                { x: 700, y: 350, item: 'ヒールポーション', opened: false }
            ]
        };

        // 神社本殿内
        this.maps.shrine_inner = {
            name: '明治神宮 - 本殿',
            bgColor: '#1a1a0a',
            gridColor: '#2a2a1a',
            encounterRate: 'none',
            area: 'shrine',
            bgm: 'shrine_inner',
            buildings: [
                { x: 300, y: 50, width: 200, height: 80, color: '#5a4a2a', borderColor: '#7a6a4a', type: 'altar' },
                { x: 100, y: 150, width: 60, height: 150, color: '#4a3a1a', borderColor: '#6a5a3a', type: 'shrine_pillar' },
                { x: 640, y: 150, width: 60, height: 150, color: '#4a3a1a', borderColor: '#6a5a3a', type: 'shrine_pillar' },
                { x: 350, y: 200, width: 100, height: 60, color: '#6a5a3a', borderColor: '#8a7a5a', type: 'offering_box' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'shrine_path', direction: 'south', spawnX: 400, spawnY: 280 }
            ],
            npcs: [
                { x: 400, y: 100, emoji: '⛩️', name: '御神体', dialogue: '（神聖な力を感じる...）' }
            ],
            savePoint: { x: 400, y: 300, emoji: '✨', name: '神聖なる祭壇' }
        };

        // 都庁2階
        this.maps.tokyo_gov_floor2 = {
            name: '東京都庁 - 2階',
            bgColor: '#0a0a1a',
            gridColor: '#1a1a3a',
            encounterRate: 'high',
            area: 'dungeon',
            bgm: 'tokyo_gov',
            buildings: [
                { x: 0, y: 0, width: 800, height: 35, color: '#1a1a3a', borderColor: '#3a3a5a', type: 'wall' },
                { x: 0, y: 395, width: 800, height: 35, color: '#1a1a3a', borderColor: '#3a3a5a', type: 'wall' },
                { x: 0, y: 0, width: 35, height: 430, color: '#1a1a3a', borderColor: '#3a3a5a', type: 'wall' },
                { x: 765, y: 0, width: 35, height: 430, color: '#1a1a3a', borderColor: '#3a3a5a', type: 'wall' },
                { x: 200, y: 150, width: 150, height: 100, color: '#2a2a4a', borderColor: '#4a4a6a', type: 'server_room' },
                { x: 450, y: 150, width: 150, height: 100, color: '#2a2a4a', borderColor: '#4a4a6a', type: 'control_room' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'tokyo_gov', direction: 'south', spawnX: 405, spawnY: 280 },
                { x: 350, y: 0, width: 100, height: 20, to: 'tokyo_gov_floor3', direction: 'north' }
            ],
            npcs: [
                { x: 300, y: 300, emoji: '🤖', name: 'ガードロボ', dialogue: '侵入者を排除する。', hostile: true, level: 4 },
                { x: 500, y: 300, emoji: '🤖', name: 'ガードロボ', dialogue: '侵入者を排除する。', hostile: true, level: 4 }
            ]
        };

        // 都庁3階（ボスエリア前）
        this.maps.tokyo_gov_floor3 = {
            name: '東京都庁 - 最上階',
            bgColor: '#050510',
            gridColor: '#151530',
            encounterRate: 'very_high',
            area: 'dungeon',
            bgm: 'boss_area',
            buildings: [
                { x: 0, y: 0, width: 800, height: 35, color: '#1a1a3a', borderColor: '#3a3a5a', type: 'wall' },
                { x: 0, y: 395, width: 800, height: 35, color: '#1a1a3a', borderColor: '#3a3a5a', type: 'wall' },
                { x: 0, y: 0, width: 35, height: 430, color: '#1a1a3a', borderColor: '#3a3a5a', type: 'wall' },
                { x: 765, y: 0, width: 35, height: 430, color: '#1a1a3a', borderColor: '#3a3a5a', type: 'wall' },
                { x: 300, y: 100, width: 200, height: 150, color: '#4a1a1a', borderColor: '#6a3a3a', type: 'boss_throne' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'tokyo_gov_floor2', direction: 'south' }
            ],
            npcs: [
                { x: 400, y: 180, emoji: '🦾', name: 'アーク・プライム', dialogue: '人間よ...お前たちの時代は終わりだ。', hostile: true, level: 10, boss: true }
            ],
            savePoint: { x: 100, y: 350, emoji: '💠', name: '緊急セーブポイント' }
        };

        // ==========================================
        // ダンジョン追加階層
        // ==========================================

        // 深層地下トンネル第3層
        this.maps.deep_tunnel_3 = {
            name: '深層地下トンネル - 第3層',
            bgColor: '#080810',
            gridColor: '#1f1f2f',
            encounterRate: 'extreme',
            area: 'dungeon',
            bgm: 'deep_dungeon',
            buildings: [
                { x: 0, y: 0, width: 800, height: 35, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                { x: 0, y: 395, width: 800, height: 35, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                { x: 0, y: 0, width: 35, height: 430, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                { x: 765, y: 0, width: 35, height: 430, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                // 複雑な迷路
                { x: 100, y: 100, width: 200, height: 25, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' },
                { x: 500, y: 100, width: 200, height: 25, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' },
                { x: 250, y: 200, width: 25, height: 150, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' },
                { x: 525, y: 200, width: 25, height: 150, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' },
                { x: 350, y: 300, width: 100, height: 25, color: '#2a2a3f', borderColor: '#4a4a5f', type: 'wall' }
            ],
            exits: [
                { x: 350, y: 0, width: 100, height: 20, to: 'deep_tunnel_2', direction: 'north' },
                { x: 350, y: 410, width: 100, height: 20, to: 'deep_tunnel_4', direction: 'south' }
            ],
            npcs: [
                { x: 150, y: 250, emoji: '👻', name: 'ファントム', dialogue: 'ウゥゥ...', hostile: true, level: 6 },
                { x: 650, y: 250, emoji: '🦇', name: 'ダークバット群', dialogue: 'キィィィ！', hostile: true, level: 5 },
                { x: 400, y: 350, emoji: '💀', name: 'スケルトンナイト', dialogue: '...侵入者を...排除...', hostile: true, level: 7 }
            ],
            treasures: [
                { x: 100, y: 350, item: 'メガヒールポーション', opened: false },
                { x: 700, y: 100, item: 'パワーリング', opened: false }
            ]
        };

        // 深層地下トンネル第4層
        this.maps.deep_tunnel_4 = {
            name: '深層地下トンネル - 第4層（最深部）',
            bgColor: '#050508',
            gridColor: '#151520',
            encounterRate: 'extreme',
            area: 'dungeon',
            bgm: 'abyss',
            buildings: [
                { x: 0, y: 0, width: 800, height: 35, color: '#0f0f1f', borderColor: '#2f2f3f', type: 'wall' },
                { x: 0, y: 395, width: 800, height: 35, color: '#0f0f1f', borderColor: '#2f2f3f', type: 'wall' },
                { x: 0, y: 0, width: 35, height: 430, color: '#0f0f1f', borderColor: '#2f2f3f', type: 'wall' },
                { x: 765, y: 0, width: 35, height: 430, color: '#0f0f1f', borderColor: '#2f2f3f', type: 'wall' },
                // 中央のボス部屋への道
                { x: 100, y: 150, width: 250, height: 25, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                { x: 450, y: 150, width: 250, height: 25, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                { x: 100, y: 300, width: 250, height: 25, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' },
                { x: 450, y: 300, width: 250, height: 25, color: '#1a1a2f', borderColor: '#3a3a4f', type: 'wall' }
            ],
            exits: [
                { x: 350, y: 0, width: 100, height: 20, to: 'deep_tunnel_3', direction: 'north' },
                { x: 350, y: 410, width: 100, height: 20, to: 'deep_tunnel_boss', direction: 'south' }
            ],
            npcs: [
                { x: 200, y: 220, emoji: '🕷️', name: 'クイーンスパイダー', dialogue: 'シャアアア...', hostile: true, level: 8 },
                { x: 600, y: 220, emoji: '👹', name: 'デーモンロード', dialogue: '愚かな人間め...', hostile: true, level: 8 }
            ],
            treasures: [
                { x: 100, y: 80, item: 'エリクサー', opened: false }
            ],
            savePoint: { x: 700, y: 350, emoji: '🔮', name: '古代の魔法陣' }
        };

        // 深層地下トンネル ボス部屋
        this.maps.deep_tunnel_boss = {
            name: '深淵の玉座',
            bgColor: '#030305',
            gridColor: '#101015',
            encounterRate: 'none',
            area: 'dungeon',
            bgm: 'boss_battle',
            buildings: [
                { x: 0, y: 0, width: 800, height: 35, color: '#0a0a1a', borderColor: '#2a2a3a', type: 'wall' },
                { x: 0, y: 395, width: 800, height: 35, color: '#0a0a1a', borderColor: '#2a2a3a', type: 'wall' },
                { x: 0, y: 0, width: 35, height: 430, color: '#0a0a1a', borderColor: '#2a2a3a', type: 'wall' },
                { x: 765, y: 0, width: 35, height: 430, color: '#0a0a1a', borderColor: '#2a2a3a', type: 'wall' },
                // ボスの玉座
                { x: 300, y: 80, width: 200, height: 120, color: '#3a1a3a', borderColor: '#5a3a5a', type: 'dark_throne' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'deep_tunnel_4', direction: 'south' }
            ],
            npcs: [
                { x: 400, y: 150, emoji: '👁️', name: '深淵の支配者', dialogue: 'ようこそ...永遠の闇へ...', hostile: true, level: 15, boss: true }
            ],
            treasures: [
                { x: 400, y: 350, item: '神威の欠片', opened: false }
            ]
        };
    }

    applyScreenMapOverrides() {
        const screenMaps = {
            shinjuku_center_plaza: {
                name: '新宿 - 中央広場',
                image: 'assets/maps/shinjuku_center_plaza.png',
                bgColor: '#101626',
                gridColor: 'transparent',
                encounterRate: 'low',
                area: 'city',
                bgm: 'shinjuku_city',
                // map-editor.html (タイルペイント版) で生成
                walkableRects: [
                    { x: 296, y: 128, width: 200, height: 200 },
                    { x: 104, y: 200, width: 192, height: 48  },
                    { x: 496, y: 200, width: 160, height: 48  },
                    { x: 200, y: 128, width: 88,  height: 48  },
                    { x: 376, y: 336, width: 56,  height: 72  },
                    { x: 496, y: 136, width: 56,  height: 64  },
                    { x: 584, y: 24,  width: 24,  height: 136 },
                    { x: 368, y: 80,  width: 56,  height: 48  },
                    { x: 664, y: 248, width: 88,  height: 24  },
                    { x: 24,  y: 224, width: 80,  height: 24  },
                    { x: 656, y: 232, width: 112, height: 16  },
                    { x: 232, y: 176, width: 64,  height: 24  },
                    { x: 496, y: 248, width: 48,  height: 32  },
                    { x: 280, y: 248, width: 16,  height: 72  },
                    { x: 552, y: 144, width: 32,  height: 32  },
                    { x: 496, y: 280, width: 40,  height: 24  },
                    { x: 168, y: 128, width: 32,  height: 24  },
                    { x: 496, y: 304, width: 32,  height: 24  },
                    { x: 48,  y: 248, width: 80,  height: 8   },
                    { x: 360, y: 328, width: 80,  height: 8   },
                    { x: 576, y: 72,  width: 8,   height: 72  },
                    { x: 256, y: 248, width: 24,  height: 24  },
                    { x: 608, y: 32,  width: 8,   height: 48  },
                    { x: 552, y: 176, width: 16,  height: 24  },
                    { x: 736, y: 216, width: 24,  height: 16  },
                    { x: 424, y: 88,  width: 8,   height: 40  },
                    { x: 288, y: 136, width: 8,   height: 40  },
                    { x: 184, y: 152, width: 16,  height: 16  },
                    { x: 584, y: 160, width: 16,  height: 16  },
                    { x: 360, y: 88,  width: 8,   height: 24  },
                    { x: 656, y: 208, width: 8,   height: 24  },
                    { x: 32,  y: 216, width: 24,  height: 8   },
                    { x: 216, y: 176, width: 16,  height: 8   },
                    { x: 96,  y: 208, width: 8,   height: 16  },
                    { x: 720, y: 224, width: 16,  height: 8   },
                    { x: 248, y: 248, width: 8,   height: 16  },
                    { x: 656, y: 248, width: 8,   height: 16  },
                    { x: 264, y: 272, width: 16,  height: 8   },
                    { x: 432, y: 96,  width: 8,   height: 8   },
                    { x: 472, y: 120, width: 8,   height: 8   },
                    { x: 176, y: 152, width: 8,   height: 8   },
                    { x: 664, y: 224, width: 8,   height: 8   },
                    { x: 760, y: 224, width: 8,   height: 8   },
                    { x: 272, y: 280, width: 8,   height: 8   }
                ],
                buildings: [
                    // 外周の壁のみ（建物群は walkable に含まれていない範囲が自動的に通行不可）
                    { x: 0,   y: 0,   width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 426, width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true },
                    { x: 776, y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 出口は walkable と十分にオーバーラップさせて 3px歩幅でも確実にトリガーする
                    { x: 370, y: 40,  width: 51, height: 60, to: 'shrine_south_gate',     direction: 'north', spawnX: 400, spawnY: 365 },
                    { x: 360, y: 395, width: 80, height: 55, to: 'shopping_street_north', direction: 'south', spawnX: 400, spawnY: 85  },
                    { x: 740, y: 215, width: 55, height: 50, to: 'tokyo_gov_approach',    direction: 'east',  spawnX: 50,  spawnY: 220 },
                    { x: 6,   y: 210, width: 30, height: 60, to: 'shinjuku_station_gate', direction: 'west',  spawnX: 715, spawnY: 235 }
                ],
                npcs: [
                    { x: 360, y: 250, emoji: '👤', name: '感情を失った市民', dialogue: '...。' },
                    {
                        x: 440,
                        y: 320,
                        emoji: '🧙‍♀️',
                        name: 'アカリ',
                        dialogue: 'カイト、この街の異常を感じる？AIの支配が強まっているわ。',
                        questFlag: 'metAkari',
                        questDialogue: 'カイト！神威の力に目覚めたのね。地下鉄の様子がおかしいの。一緒に調べに行きましょう！'
                    }
                ]
            },
            shinjuku_station_gate: {
                name: '新宿駅 - 改札前',
                image: 'assets/maps/shinjuku_station_gate.png',
                bgColor: '#101014',
                gridColor: 'transparent',
                encounterRate: 'medium',
                area: 'subway',
                bgm: 'subway',
                // map-editor.html (タイルペイント版) で生成
                walkableRects: [
                    { x: 168, y: 240, width: 408, height: 48  },
                    { x: 64,  y: 128, width: 216, height: 56  },
                    { x: 520, y: 296, width: 80,  height: 104 },
                    { x: 688, y: 176, width: 72,  height: 104 },
                    { x: 328, y: 120, width: 112, height: 56  },
                    { x: 224, y: 288, width: 48,  height: 120 },
                    { x: 504, y: 96,  width: 88,  height: 64  },
                    { x: 56,  y: 392, width: 168, height: 32  },
                    { x: 512, y: 168, width: 64,  height: 72  },
                    { x: 592, y: 240, width: 96,  height: 48  },
                    { x: 160, y: 200, width: 96,  height: 40  },
                    { x: 336, y: 184, width: 64,  height: 56  },
                    { x: 328, y: 296, width: 112, height: 32  },
                    { x: 176, y: 96,  width: 104, height: 32  },
                    { x: 64,  y: 184, width: 208, height: 16  },
                    { x: 312, y: 288, width: 296, height: 8   },
                    { x: 728, y: 280, width: 40,  height: 56  },
                    { x: 72,  y: 200, width: 56,  height: 32  },
                    { x: 440, y: 136, width: 64,  height: 24  },
                    { x: 32,  y: 144, width: 32,  height: 40  },
                    { x: 488, y: 296, width: 32,  height: 32  },
                    { x: 184, y: 288, width: 40,  height: 24  },
                    { x: 480, y: 160, width: 104, height: 8   },
                    { x: 336, y: 328, width: 96,  height: 8   },
                    { x: 72,  y: 112, width: 40,  height: 16  },
                    { x: 256, y: 232, width: 80,  height: 8   },
                    { x: 400, y: 232, width: 80,  height: 8   },
                    { x: 576, y: 248, width: 16,  height: 40  },
                    { x: 344, y: 112, width: 72,  height: 8   },
                    { x: 336, y: 176, width: 72,  height: 8   },
                    { x: 760, y: 184, width: 16,  height: 32  },
                    { x: 760, y: 216, width: 8,   height: 64  },
                    { x: 648, y: 288, width: 64,  height: 8   },
                    { x: 768, y: 304, width: 16,  height: 32  },
                    { x: 680, y: 184, width: 8,   height: 56  },
                    { x: 592, y: 104, width: 8,   height: 48  },
                    { x: 320, y: 120, width: 8,   height: 48  },
                    { x: 656, y: 296, width: 48,  height: 8   },
                    { x: 184, y: 88,  width: 40,  height: 8   },
                    { x: 736, y: 336, width: 40,  height: 8   },
                    { x: 224, y: 408, width: 40,  height: 8   },
                    { x: 496, y: 104, width: 8,   height: 32  },
                    { x: 664, y: 304, width: 32,  height: 8   },
                    { x: 512, y: 368, width: 8,   height: 32  },
                    { x: 168, y: 104, width: 8,   height: 24  },
                    { x: 136, y: 120, width: 24,  height: 8   },
                    { x: 488, y: 168, width: 24,  height: 8   },
                    { x: 736, y: 168, width: 24,  height: 8   },
                    { x: 40,  y: 184, width: 24,  height: 8   },
                    { x: 400, y: 224, width: 24,  height: 8   },
                    { x: 160, y: 240, width: 8,   height: 24  },
                    { x: 688, y: 280, width: 24,  height: 8   },
                    { x: 480, y: 296, width: 8,   height: 24  },
                    { x: 496, y: 328, width: 24,  height: 8   },
                    { x: 272, y: 336, width: 8,   height: 24  },
                    { x: 48,  y: 392, width: 8,   height: 24  },
                    { x: 88,  y: 104, width: 16,  height: 8   },
                    { x: 488, y: 120, width: 8,   height: 16  },
                    { x: 312, y: 128, width: 8,   height: 16  },
                    { x: 280, y: 144, width: 8,   height: 16  },
                    { x: 24,  y: 152, width: 8,   height: 16  },
                    { x: 440, y: 160, width: 16,  height: 8   },
                    { x: 576, y: 192, width: 8,   height: 16  },
                    { x: 288, y: 224, width: 16,  height: 8   },
                    { x: 168, y: 288, width: 16,  height: 8   },
                    { x: 312, y: 296, width: 16,  height: 8   },
                    { x: 512, y: 336, width: 8,   height: 16  },
                    { x: 224, y: 416, width: 16,  height: 8   },
                    { x: 64,  y: 120, width: 8,   height: 8   },
                    { x: 112, y: 120, width: 8,   height: 8   },
                    { x: 464, y: 128, width: 8,   height: 8   },
                    { x: 464, y: 160, width: 8,   height: 8   },
                    { x: 440, y: 168, width: 8,   height: 8   },
                    { x: 504, y: 176, width: 8,   height: 8   },
                    { x: 576, y: 176, width: 8,   height: 8   },
                    { x: 400, y: 216, width: 8,   height: 8   },
                    { x: 256, y: 224, width: 8,   height: 8   },
                    { x: 488, y: 232, width: 8,   height: 8   },
                    { x: 504, y: 232, width: 8,   height: 8   },
                    { x: 672, y: 232, width: 8,   height: 8   },
                    { x: 176, y: 296, width: 8,   height: 8   },
                    { x: 768, y: 296, width: 8,   height: 8   },
                    { x: 320, y: 304, width: 8,   height: 8   },
                    { x: 216, y: 312, width: 8,   height: 8   },
                    { x: 720, y: 312, width: 8,   height: 8   },
                    { x: 272, y: 320, width: 8,   height: 8   },
                    { x: 216, y: 384, width: 8,   height: 8   },
                    { x: 144, y: 424, width: 8,   height: 8   },
                    { x: 168, y: 424, width: 8,   height: 8   }
                ],
                buildings: [
                    // 外周の壁のみ
                    { x: 0,   y: 0,   width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 426, width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true },
                    { x: 776, y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 東 → 新宿中央広場、南 → 地下コンコース
                    // ※ 西側 (72, 231) は隣接マップ未定義のため一旦保留
                    { x: 761, y: 207, width: 38, height: 104, to: 'shinjuku_center_plaza', direction: 'east',  spawnX: 85,  spawnY: 235 },
                    { x: 516, y: 396, width: 82, height: 48,  to: 'subway_concourse_a',    direction: 'south', spawnX: 670, spawnY: 130 }
                ],
                npcs: [
                    { x: 400, y: 240, emoji: '🤖', name: 'パトロールドローン', dialogue: 'スキャン中...異常なし。', hostile: true }
                ]
            },
            subway_concourse_a: {
                name: '新宿駅 - 地下コンコースA',
                image: 'assets/maps/subway_concourse_a.png',
                bgColor: '#08090d',
                gridColor: 'transparent',
                encounterRate: 'medium',
                area: 'subway',
                bgm: 'subway',
                // map-editor.html (タイルペイント版) で生成
                walkableRects: [
                    { x: 104, y: 208, width: 656, height: 24 },
                    { x: 104, y: 112, width: 600, height: 16 },
                    { x: 392, y: 320, width: 312, height: 24 },
                    { x: 104, y: 128, width: 80,  height: 80 },
                    { x: 640, y: 128, width: 64,  height: 80 },
                    { x: 112, y: 232, width: 600, height: 8  },
                    { x: 648, y: 256, width: 56,  height: 64 },
                    { x: 128, y: 264, width: 40,  height: 80 },
                    { x: 104, y: 96,  width: 192, height: 16 },
                    { x: 480, y: 96,  width: 160, height: 16 },
                    { x: 112, y: 240, width: 312, height: 8  },
                    { x: 320, y: 128, width: 280, height: 8  },
                    { x: 368, y: 296, width: 88,  height: 24 },
                    { x: 168, y: 320, width: 224, height: 8  },
                    { x: 400, y: 344, width: 224, height: 8  },
                    { x: 168, y: 328, width: 208, height: 8  },
                    { x: 648, y: 80,  width: 48,  height: 32 },
                    { x: 352, y: 136, width: 184, height: 8  },
                    { x: 184, y: 200, width: 168, height: 8  },
                    { x: 200, y: 336, width: 160, height: 8  },
                    { x: 656, y: 344, width: 40,  height: 32 },
                    { x: 392, y: 88,  width: 48,  height: 24 },
                    { x: 56,  y: 200, width: 48,  height: 24 },
                    { x: 496, y: 200, width: 144, height: 8  },
                    { x: 648, y: 240, width: 64,  height: 16 },
                    { x: 224, y: 344, width: 120, height: 8  },
                    { x: 496, y: 240, width: 112, height: 8  },
                    { x: 488, y: 88,  width: 104, height: 8  },
                    { x: 224, y: 248, width: 96,  height: 8  },
                    { x: 496, y: 248, width: 96,  height: 8  },
                    { x: 184, y: 192, width: 80,  height: 8  },
                    { x: 520, y: 352, width: 40,  height: 16 },
                    { x: 120, y: 248, width: 64,  height: 8  },
                    { x: 376, y: 288, width: 64,  height: 8  },
                    { x: 128, y: 344, width: 32,  height: 16 },
                    { x: 704, y: 200, width: 56,  height: 8  },
                    { x: 128, y: 256, width: 48,  height: 8  },
                    { x: 168, y: 272, width: 8,   height: 48 },
                    { x: 296, y: 104, width: 40,  height: 8  },
                    { x: 560, y: 136, width: 40,  height: 8  },
                    { x: 96,  y: 128, width: 8,   height: 32 },
                    { x: 728, y: 232, width: 32,  height: 8  },
                    { x: 352, y: 304, width: 16,  height: 16 },
                    { x: 408, y: 80,  width: 24,  height: 8  },
                    { x: 120, y: 88,  width: 24,  height: 8  },
                    { x: 568, y: 144, width: 24,  height: 8  },
                    { x: 272, y: 192, width: 24,  height: 8  },
                    { x: 360, y: 200, width: 24,  height: 8  },
                    { x: 728, y: 240, width: 24,  height: 8  },
                    { x: 176, y: 312, width: 24,  height: 8  },
                    { x: 208, y: 312, width: 24,  height: 8  },
                    { x: 624, y: 312, width: 24,  height: 8  },
                    { x: 648, y: 344, width: 8,   height: 24 },
                    { x: 408, y: 352, width: 24,  height: 8  },
                    { x: 528, y: 368, width: 24,  height: 8  },
                    { x: 672, y: 72,  width: 16,  height: 8  },
                    { x: 344, y: 104, width: 16,  height: 8  },
                    { x: 624, y: 128, width: 16,  height: 8  },
                    { x: 64,  y: 224, width: 16,  height: 8  },
                    { x: 632, y: 240, width: 16,  height: 8  },
                    { x: 456, y: 304, width: 8,   height: 16 },
                    { x: 336, y: 312, width: 16,  height: 8  },
                    { x: 136, y: 360, width: 16,  height: 8  },
                    { x: 440, y: 96,  width: 8,   height: 8  },
                    { x: 640, y: 104, width: 8,   height: 8  },
                    { x: 696, y: 104, width: 8,   height: 8  },
                    { x: 184, y: 184, width: 8,   height: 8  },
                    { x: 96,  y: 192, width: 8,   height: 8  },
                    { x: 600, y: 192, width: 8,   height: 8  },
                    { x: 632, y: 192, width: 8,   height: 8  },
                    { x: 88,  y: 224, width: 8,   height: 8  },
                    { x: 384, y: 328, width: 8,   height: 8  },
                    { x: 184, y: 336, width: 8,   height: 8  }
                ],
                buildings: [
                    // 外周の壁のみ
                    { x: 0,   y: 0,   width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 426, width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true },
                    { x: 776, y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 北 → 新宿駅 改札前。spawnは station_gate の南通路（出口手前）
                    // ※ 西 (35, 199) と 南 (399, 359) は隣接マップ未定義のため保留
                    { x: 653, y: 34, width: 43, height: 59, to: 'shinjuku_station_gate', direction: 'north', spawnX: 550, spawnY: 380 }
                ],
                npcs: [
                    { x: 400, y: 245, emoji: '🤖', name: '暴走ドローン', dialogue: '警告...感情反応を検知。', hostile: true }
                ]
            },
            shopping_street_north: {
                name: '渋谷商業街 - 北通り',
                image: 'assets/maps/shopping_street_north.png',
                bgColor: '#14142a',
                gridColor: 'transparent',
                encounterRate: 'none',
                area: 'town',
                bgm: 'shopping',
                // walkability-editor で生成（shopping_district レイアウトを反映）
                walkableRects: [
                    { x: 329, y: 54,  width: 124, height: 139 },
                    { x: 360, y: 24,  width: 60,  height: 30  },
                    { x: 230, y: 86,  width: 97,  height: 81  },
                    { x: 3,   y: 156, width: 272, height: 63  },
                    { x: 213, y: 222, width: 62,  height: 66  },
                    { x: 231, y: 286, width: 130, height: 37  },
                    { x: 312, y: 165, width: 50,  height: 118 },
                    { x: 455, y: 92,  width: 110, height: 88  },
                    { x: 507, y: 184, width: 293, height: 35  },
                    { x: 565, y: 162, width: 231, height: 21  },
                    { x: 662, y: 139, width: 27,  height: 19  },
                    { x: 425, y: 184, width: 42,  height: 143 },
                    { x: 364, y: 267, width: 59,  height: 33  },
                    { x: 331, y: 327, width: 28,  height: 79  },
                    { x: 423, y: 330, width: 30,  height: 74  },
                    { x: 28,  y: 366, width: 738, height: 39  },
                    { x: 361, y: 343, width: 63,  height: 22  },
                    { x: 506, y: 226, width: 62,  height: 101 }
                ],
                buildings: [
                    { x: 278, y: 172, width: 36,  height: 110, type: 'collision', collisionOnly: true },
                    { x: 359, y: 197, width: 65,  height: 65,  type: 'collision', collisionOnly: true },
                    { x: 468, y: 184, width: 36,  height: 94,  type: 'collision', collisionOnly: true },
                    { x: 456, y: 36,  width: 123, height: 51,  type: 'collision', collisionOnly: true },
                    { x: 568, y: 90,  width: 90,  height: 70,  type: 'collision', collisionOnly: true },
                    { x: 693, y: 93,  width: 107, height: 68,  type: 'collision', collisionOnly: true },
                    { x: 586, y: 222, width: 181, height: 68,  type: 'collision', collisionOnly: true },
                    { x: 697, y: 292, width: 70,  height: 73,  type: 'collision', collisionOnly: true },
                    { x: 572, y: 296, width: 78,  height: 69,  type: 'collision', collisionOnly: true },
                    { x: 456, y: 328, width: 113, height: 47,  type: 'collision', collisionOnly: true },
                    { x: 363, y: 304, width: 59,  height: 36,  type: 'collision', collisionOnly: true },
                    { x: 34,  y: 223, width: 176, height: 66,  type: 'collision', collisionOnly: true },
                    { x: 140, y: 291, width: 89,  height: 75,  type: 'collision', collisionOnly: true },
                    { x: 232, y: 328, width: 96,  height: 43,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 292, width: 97,  height: 75,  type: 'collision', collisionOnly: true },
                    { x: 417, y: 411, width: 380, height: 26,  type: 'collision', collisionOnly: true },
                    { x: 1,   y: 410, width: 361, height: 30,  type: 'collision', collisionOnly: true },
                    { x: 135, y: 86,  width: 92,  height: 76,  type: 'collision', collisionOnly: true },
                    { x: 227, y: 22,  width: 101, height: 58,  type: 'collision', collisionOnly: true },
                    { x: 333, y: 27,  width: 26,  height: 22,  type: 'collision', collisionOnly: true },
                    { x: 422, y: 27,  width: 29,  height: 19,  type: 'collision', collisionOnly: true },
                    { x: 1,   y: 82,  width: 98,  height: 69,  type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 本道（北↔中央広場、南↔南通り）
                    { x: 367, y: 25,  width: 50, height: 38, to: 'shinjuku_center_plaza', direction: 'north', spawnX: 400, spawnY: 365 },
                    { x: 364, y: 402, width: 46, height: 35, to: 'shopping_street_south', direction: 'south', spawnX: 400, spawnY: 85  },
                    // 4店舗入口（位置で割当: 上=武器/魔法 下=防具/道具）
                    // ※ 必要なら shop_weapon/shop_armor/shop_item/shop_magic のマッピングを変更
                    { x: 99,  y: 147, width: 40, height: 37, to: 'shop_weapon', direction: 'north', spawnX: 400, spawnY: 380, visible: false, autoEnter: true },
                    { x: 660, y: 149, width: 35, height: 41, to: 'shop_magic',  direction: 'north', spawnX: 400, spawnY: 380, visible: false, autoEnter: true },
                    { x: 104, y: 342, width: 31, height: 28, to: 'shop_armor',  direction: 'north', spawnX: 400, spawnY: 380, visible: false, autoEnter: true },
                    { x: 656, y: 352, width: 34, height: 27, to: 'shop_item',   direction: 'north', spawnX: 400, spawnY: 380, visible: false, autoEnter: true }
                ],
                npcs: [
                    { x: 110, y: 270, image: 'assets/characters/sprites/merchant_weapon_walk.png', emoji: '🗡️', name: '武器店の呼び込み', dialogue: '武器店は左上の入口から入って、店内スタッフに話しかけてくれ。', static: true },
                    { x: 245, y: 270, image: 'assets/characters/sprites/merchant_armor_walk.png', emoji: '🛡️', name: '防具店の呼び込み', dialogue: '防具店は左下の建物だ。入口に立てば入れる。', static: true },
                    { x: 555, y: 270, image: 'assets/characters/sprites/merchant_item_walk.png', emoji: '🧪', name: '道具店の呼び込み', dialogue: '道具店は右下。買い物は店内カウンターでどうぞ。', static: true },
                    { x: 695, y: 270, image: 'assets/characters/sprites/merchant_magic_walk.png', emoji: '🔮', name: '魔法店の呼び込み', dialogue: '魔法店は右上の入口だ。中のミコトに聞いてくれ。', static: true }
                ]
            },
            shopping_street_south: {
                name: '渋谷商業街 - 南広場',
                image: 'assets/maps/shopping_street_south.png',
                bgColor: '#17182d',
                gridColor: 'transparent',
                encounterRate: 'none',
                area: 'town',
                bgm: 'shopping',
                // map-editor.html (タイルペイント版) で生成
                walkableRects: [
                    { x: 368, y: 144, width: 96,  height: 304 },
                    { x: 16,  y: 416, width: 352, height: 32 },
                    { x: 512, y: 240, width: 184, height: 48 },
                    { x: 112, y: 192, width: 128, height: 64 },
                    { x: 464, y: 416, width: 328, height: 24 },
                    { x: 256, y: 224, width: 112, height: 56 },
                    { x: 728, y: 288, width: 40,  height: 128 },
                    { x: 376, y: 56,  width: 56,  height: 88 },
                    { x: 584, y: 192, width: 136, height: 32 },
                    { x: 32,  y: 296, width: 40,  height: 104 },
                    { x: 344, y: 280, width: 24,  height: 136 },
                    { x: 504, y: 200, width: 80,  height: 40 },
                    { x: 40,  y: 152, width: 32,  height: 72 },
                    { x: 464, y: 440, width: 272, height: 8 },
                    { x: 56,  y: 72,  width: 24,  height: 80 },
                    { x: 464, y: 224, width: 40,  height: 48 },
                    { x: 464, y: 360, width: 32,  height: 56 },
                    { x: 320, y: 352, width: 24,  height: 64 },
                    { x: 544, y: 392, width: 56,  height: 24 },
                    { x: 160, y: 160, width: 40,  height: 32 },
                    { x: 664, y: 288, width: 32,  height: 40 },
                    { x: 184, y: 408, width: 136, height: 8 },
                    { x: 600, y: 160, width: 32,  height: 32 },
                    { x: 584, y: 224, width: 128, height: 8 },
                    { x: 16,  y: 408, width: 128, height: 8 },
                    { x: 608, y: 448, width: 128, height: 8 },
                    { x: 72,  y: 192, width: 40,  height: 24 },
                    { x: 584, y: 232, width: 120, height: 8 },
                    { x: 184, y: 384, width: 32,  height: 24 },
                    { x: 368, y: 56,  width: 8,   height: 64 },
                    { x: 464, y: 160, width: 8,   height: 64 },
                    { x: 240, y: 208, width: 32,  height: 16 },
                    { x: 240, y: 224, width: 16,  height: 32 },
                    { x: 728, y: 272, width: 32,  height: 16 },
                    { x: 768, y: 352, width: 8,   height: 64 },
                    { x: 376, y: 48,  width: 48,  height: 8 },
                    { x: 32,  y: 280, width: 24,  height: 16 },
                    { x: 24,  y: 296, width: 8,   height: 48 },
                    { x: 744, y: 440, width: 48,  height: 8 },
                    { x: 80,  y: 80,  width: 8,   height: 40 },
                    { x: 504, y: 240, width: 8,   height: 40 },
                    { x: 312, y: 368, width: 8,   height: 40 },
                    { x: 40,  y: 400, width: 40,  height: 8 },
                    { x: 600, y: 408, width: 40,  height: 8 },
                    { x: 48,  y: 120, width: 8,   height: 32 },
                    { x: 176, y: 144, width: 16,  height: 16 },
                    { x: 352, y: 208, width: 16,  height: 16 },
                    { x: 720, y: 304, width: 8,   height: 32 },
                    { x: 464, y: 344, width: 16,  height: 16 },
                    { x: 496, y: 400, width: 16,  height: 16 },
                    { x: 600, y: 152, width: 24,  height: 8 },
                    { x: 592, y: 168, width: 8,   height: 24 },
                    { x: 32,  y: 200, width: 8,   height: 24 },
                    { x: 648, y: 408, width: 24,  height: 8 },
                    { x: 704, y: 408, width: 24,  height: 8 },
                    { x: 8,   y: 416, width: 8,   height: 24 },
                    { x: 368, y: 128, width: 8,   height: 16 },
                    { x: 632, y: 176, width: 8,   height: 16 },
                    { x: 720, y: 200, width: 8,   height: 16 },
                    { x: 72,  y: 216, width: 16,  height: 8 },
                    { x: 96,  y: 216, width: 16,  height: 8 },
                    { x: 272, y: 216, width: 16,  height: 8 },
                    { x: 248, y: 256, width: 8,   height: 16 },
                    { x: 464, y: 272, width: 8,   height: 16 },
                    { x: 648, y: 288, width: 16,  height: 8 },
                    { x: 328, y: 344, width: 16,  height: 8 },
                    { x: 568, y: 384, width: 16,  height: 8 },
                    { x: 536, y: 400, width: 8,   height: 16 },
                    { x: 776, y: 400, width: 8,   height: 16 },
                    { x: 512, y: 408, width: 16,  height: 8 },
                    { x: 680, y: 408, width: 16,  height: 8 },
                    { x: 792, y: 424, width: 8,   height: 16 },
                    { x: 440, y: 136, width: 8,   height: 8 },
                    { x: 168, y: 152, width: 8,   height: 8 },
                    { x: 72,  y: 184, width: 8,   height: 8 },
                    { x: 584, y: 184, width: 8,   height: 8 },
                    { x: 240, y: 200, width: 8,   height: 8 },
                    { x: 360, y: 200, width: 8,   height: 8 },
                    { x: 344, y: 216, width: 8,   height: 8 },
                    { x: 480, y: 216, width: 8,   height: 8 },
                    { x: 496, y: 216, width: 8,   height: 8 },
                    { x: 736, y: 264, width: 8,   height: 8 },
                    { x: 336, y: 280, width: 8,   height: 8 },
                    { x: 56,  y: 288, width: 8,   height: 8 },
                    { x: 464, y: 336, width: 8,   height: 8 },
                    { x: 480, y: 352, width: 8,   height: 8 },
                    { x: 256, y: 400, width: 8,   height: 8 },
                    { x: 304, y: 400, width: 8,   height: 8 },
                    { x: 720, y: 400, width: 8,   height: 8 },
                    { x: 784, y: 408, width: 8,   height: 8 }
                ],
                buildings: [
                    // 外周の壁のみ
                    { x: 0,   y: 0,   width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 426, width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true },
                    { x: 776, y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 本道
                    { x: 375, y: 15,  width: 52, height: 52, to: 'shopping_street_north', direction: 'north', spawnX: 400, spawnY: 365 },
                    { x: 732, y: 266, width: 35, height: 50, to: 'residential_street',    direction: 'east',  spawnX: 85,  spawnY: 235 },
                    { x: 24,  y: 296, width: 48, height: 96, to: 'black_market_entrance', direction: 'west',  spawnX: 700, spawnY: 200, visible: false, autoEnter: true },
                    // 店舗入口（位置で割当: 上左=宿屋, 上右=ギルド, 下左=銀行）
                    { x: 163, y: 134, width: 38, height: 54, to: 'shop_inn',   direction: 'north', spawnX: 400, spawnY: 380, visible: false, autoEnter: true },
                    { x: 594, y: 145, width: 43, height: 48, to: 'shop_guild', direction: 'north', spawnX: 400, spawnY: 380, visible: false, autoEnter: true },
                    { x: 189, y: 366, width: 27, height: 48, to: 'shop_bank',  direction: 'north', spawnX: 400, spawnY: 380, visible: false, autoEnter: true }
                    // ※ (546, 379) の出口は隣接マップ未定義のため一旦保留
                ],
                npcs: [
                    { x: 160, y: 240, image: 'assets/characters/sprites/innkeeper_walk.png', emoji: '🏠', name: '宿屋の案内人', dialogue: '宿泊は建物の中の受付でお願いします。', static: true },
                    { x: 400, y: 250, image: 'assets/characters/sprites/banker_walk.png', emoji: '💰', name: '銀行の案内人', dialogue: '銀行機能は店内の窓口で使えます。', static: true },
                    { x: 645, y: 240, image: 'assets/characters/sprites/guildmaster_walk.png', emoji: '⚔️', name: 'ギルド案内人', dialogue: 'ギルドの依頼は中のギルドマスターに聞いてください。', static: true }
                ]
            },
            black_market_entrance: {
                name: '闇市 - 入口路地',
                image: 'assets/maps/black_market_entrance.png',
                bgColor: '#180b1b',
                gridColor: 'transparent',
                encounterRate: 'low',
                area: 'market',
                bgm: 'black_market',
                // map-editor.html (タイルペイント版) で生成
                walkableRects: [
                    { x: 368, y: 136, width: 304, height: 32 },
                    { x: 152, y: 224, width: 168, height: 48 },
                    { x: 272, y: 192, width: 272, height: 24 },
                    { x: 128, y: 104, width: 152, height: 24 },
                    { x: 528, y: 288, width: 80,  height: 40 },
                    { x: 272, y: 272, width: 48,  height: 64 },
                    { x: 304, y: 152, width: 64,  height: 40 },
                    { x: 360, y: 368, width: 72,  height: 32 },
                    { x: 64,  y: 216, width: 272, height: 8 },
                    { x: 280, y: 336, width: 256, height: 8 },
                    { x: 384, y: 96,  width: 48,  height: 40 },
                    { x: 496, y: 216, width: 48,  height: 40 },
                    { x: 152, y: 304, width: 48,  height: 40 },
                    { x: 288, y: 344, width: 240, height: 8 },
                    { x: 688, y: 232, width: 32,  height: 56 },
                    { x: 368, y: 168, width: 216, height: 8 },
                    { x: 80,  y: 224, width: 72,  height: 24 },
                    { x: 152, y: 272, width: 72,  height: 24 },
                    { x: 608, y: 296, width: 104, height: 16 },
                    { x: 368, y: 176, width: 200, height: 8 },
                    { x: 296, y: 352, width: 200, height: 8 },
                    { x: 368, y: 184, width: 184, height: 8 },
                    { x: 656, y: 168, width: 32,  height: 40 },
                    { x: 328, y: 360, width: 144, height: 8 },
                    { x: 520, y: 256, width: 32,  height: 32 },
                    { x: 416, y: 328, width: 120, height: 8 },
                    { x: 144, y: 360, width: 40,  height: 24 },
                    { x: 368, y: 400, width: 56,  height: 16 },
                    { x: 280, y: 112, width: 16,  height: 48 },
                    { x: 752, y: 176, width: 24,  height: 32 },
                    { x: 688, y: 200, width: 64,  height: 16 },
                    { x: 40,  y: 184, width: 32,  height: 24 },
                    { x: 144, y: 344, width: 48,  height: 16 },
                    { x: 584, y: 128, width: 80,  height: 8 },
                    { x: 608, y: 312, width: 80,  height: 8 },
                    { x: 672, y: 216, width: 72,  height: 8 },
                    { x: 120, y: 248, width: 32,  height: 16 },
                    { x: 152, y: 296, width: 64,  height: 8 },
                    { x: 608, y: 320, width: 64,  height: 8 },
                    { x: 120, y: 96,  width: 56,  height: 8 },
                    { x: 656, y: 288, width: 56,  height: 8 },
                    { x: 368, y: 112, width: 16,  height: 24 },
                    { x: 184, y: 128, width: 48,  height: 8 },
                    { x: 72,  y: 200, width: 24,  height: 16 },
                    { x: 480, y: 216, width: 16,  height: 24 },
                    { x: 264, y: 272, width: 8,   height: 48 },
                    { x: 152, y: 384, width: 24,  height: 16 },
                    { x: 240, y: 128, width: 40,  height: 8 },
                    { x: 296, y: 128, width: 8,   height: 40 },
                    { x: 688, y: 224, width: 40,  height: 8 },
                    { x: 488, y: 320, width: 40,  height: 8 },
                    { x: 672, y: 152, width: 16,  height: 16 },
                    { x: 288, y: 176, width: 16,  height: 16 },
                    { x: 736, y: 184, width: 16,  height: 16 },
                    { x: 256, y: 200, width: 16,  height: 16 },
                    { x: 320, y: 320, width: 16,  height: 16 },
                    { x: 392, y: 88,  width: 24,  height: 8 },
                    { x: 432, y: 112, width: 8,   height: 24 },
                    { x: 344, y: 144, width: 24,  height: 8 },
                    { x: 664, y: 208, width: 24,  height: 8 },
                    { x: 120, y: 104, width: 8,   height: 16 },
                    { x: 360, y: 120, width: 8,   height: 16 },
                    { x: 304, y: 136, width: 8,   height: 16 },
                    { x: 48,  y: 176, width: 16,  height: 8 },
                    { x: 776, y: 184, width: 8,   height: 16 },
                    { x: 720, y: 192, width: 16,  height: 8 },
                    { x: 56,  y: 208, width: 16,  height: 8 },
                    { x: 256, y: 272, width: 8,   height: 16 },
                    { x: 520, y: 304, width: 8,   height: 16 },
                    { x: 344, y: 368, width: 16,  height: 8 },
                    { x: 384, y: 416, width: 16,  height: 8 },
                    { x: 376, y: 104, width: 8,   height: 8 },
                    { x: 616, y: 120, width: 8,   height: 8 },
                    { x: 272, y: 136, width: 8,   height: 8 },
                    { x: 312, y: 144, width: 8,   height: 8 },
                    { x: 672, y: 144, width: 8,   height: 8 },
                    { x: 288, y: 160, width: 8,   height: 8 },
                    { x: 592, y: 168, width: 8,   height: 8 },
                    { x: 280, y: 184, width: 8,   height: 8 },
                    { x: 32,  y: 192, width: 8,   height: 8 },
                    { x: 72,  y: 192, width: 8,   height: 8 },
                    { x: 688, y: 192, width: 8,   height: 8 },
                    { x: 96,  y: 208, width: 8,   height: 8 },
                    { x: 184, y: 208, width: 8,   height: 8 },
                    { x: 224, y: 208, width: 8,   height: 8 },
                    { x: 248, y: 208, width: 8,   height: 8 },
                    { x: 752, y: 208, width: 8,   height: 8 },
                    { x: 472, y: 216, width: 8,   height: 8 },
                    { x: 72,  y: 224, width: 8,   height: 8 },
                    { x: 488, y: 240, width: 8,   height: 8 },
                    { x: 112, y: 248, width: 8,   height: 8 },
                    { x: 544, y: 248, width: 8,   height: 8 },
                    { x: 552, y: 280, width: 8,   height: 8 },
                    { x: 680, y: 280, width: 8,   height: 8 },
                    { x: 520, y: 288, width: 8,   height: 8 },
                    { x: 320, y: 312, width: 8,   height: 8 },
                    { x: 512, y: 312, width: 8,   height: 8 },
                    { x: 336, y: 328, width: 8,   height: 8 },
                    { x: 352, y: 376, width: 8,   height: 8 },
                    { x: 144, y: 384, width: 8,   height: 8 },
                    { x: 360, y: 400, width: 8,   height: 8 }
                ],
                buildings: [
                    // 外周の壁のみ
                    { x: 0,   y: 0,   width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 426, width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true },
                    { x: 776, y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 東 → 渋谷商業街(南)。spawnは shopping_street_south の左端 walkable 内
                    { x: 752, y: 182, width: 32, height: 32, to: 'shopping_street_south', direction: 'east', spawnX: 50, spawnY: 200 },
                    { x: 432, y: 234, width: 56, height: 54, to: 'shop_black_market', direction: 'north', spawnX: 400, spawnY: 380, visible: false, autoEnter: true }
                    // ※ 西 (37, 182) と 南 (361, 389) の出口は隣接マップ未定義のため保留
                ],
                npcs: [
                    {
                        x: 360,
                        y: 240,
                        emoji: '🧑‍💻',
                        name: 'ヤミ',
                        dialogue: 'ここならアークの監視も届かない。必要な物資があれば言ってくれ。',
                        questFlag: 'metYami',
                        questDialogue: 'よく来たね、カイト。神威の力を持つ者の噂は聞いていた。この闇市では、アークの目を逃れた者たちが集まっている。力を貸してくれないか？',
                        static: true
                    },
                    { x: 460, y: 260, image: 'assets/characters/sprites/dark_merchant_walk.png', emoji: '👨‍🔧', name: '闇市の案内人', dialogue: '珍しい品は奥の裏商店で扱っている。入口で決定キーを押して中へ入ってくれ。', static: true }
                ]
            },
            residential_street: {
                name: '住宅街 - 東通り',
                image: 'assets/maps/residential_street.png',
                bgColor: '#17251d',
                gridColor: 'transparent',
                encounterRate: 'none',
                area: 'town',
                bgm: 'residential',
                // map-editor.html (タイルペイント版) で生成
                walkableRects: [
                    { x: 40,  y: 192, width: 760, height: 64 },
                    { x: 176, y: 256, width: 584, height: 8 },
                    { x: 296, y: 184, width: 272, height: 8 },
                    { x: 8,   y: 192, width: 32,  height: 48 },
                    { x: 96,  y: 184, width: 160, height: 8 },
                    { x: 680, y: 128, width: 16,  height: 56 },
                    { x: 688, y: 184, width: 112, height: 8 },
                    { x: 648, y: 104, width: 24,  height: 32 },
                    { x: 720, y: 112, width: 32,  height: 24 },
                    { x: 704, y: 128, width: 16,  height: 32 },
                    { x: 696, y: 136, width: 8,   height: 48 },
                    { x: 672, y: 120, width: 8,   height: 40 },
                    { x: 0,   y: 200, width: 8,   height: 32 },
                    { x: 768, y: 256, width: 32,  height: 8 },
                    { x: 720, y: 136, width: 24,  height: 8 },
                    { x: 704, y: 160, width: 8,   height: 24 },
                    { x: 16,  y: 240, width: 24,  height: 8 },
                    { x: 640, y: 112, width: 8,   height: 16 },
                    { x: 656, y: 136, width: 16,  height: 8 },
                    { x: 720, y: 144, width: 16,  height: 8 },
                    { x: 736, y: 104, width: 8,   height: 8 },
                    { x: 712, y: 120, width: 8,   height: 8 },
                    { x: 664, y: 144, width: 8,   height: 8 },
                    { x: 368, y: 176, width: 8,   height: 8 },
                    { x: 24,  y: 184, width: 8,   height: 8 }
                ],
                buildings: [
                    // 外周の壁のみ
                    { x: 0,   y: 0,   width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 426, width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true },
                    { x: 776, y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 西 → 渋谷商業街(南)。spawnは shopping_street_south の東 walkable 内
                    { x: 1,   y: 192, width: 42, height: 57, to: 'shopping_street_south', direction: 'west', spawnX: 685, spawnY: 290 }
                    // ※ 東 (764, 198) は隣接マップ未定義のため一旦保留
                ],
                npcs: [
                    { x: 380, y: 240, emoji: '👵', name: 'おばあさん', dialogue: '昔はもっと賑やかな街だったのよ...' },
                    { x: 540, y: 250, emoji: '📮', name: '郵便ポスト', dialogue: '手紙を出しますか？（まだ実装されていません）', static: true }
                ],
                savePoint: { x: 320, y: 260, emoji: '💤', name: '公園のベンチ' }
            },
            shrine_south_gate: {
                name: '明治神宮 - 南参道',
                image: 'assets/maps/shrine_south_gate.png',
                bgColor: '#11180c',
                gridColor: 'transparent',
                encounterRate: 'none',
                area: 'shrine',
                bgm: 'shrine',
                // map-editor.html (タイルペイント版) で生成
                walkableRects: [
                    { x: 376, y: 56,  width: 56,  height: 360 },
                    { x: 624, y: 168, width: 144, height: 48 },
                    { x: 488, y: 304, width: 224, height: 16 },
                    { x: 304, y: 304, width: 72,  height: 48 },
                    { x: 496, y: 120, width: 64,  height: 48 },
                    { x: 256, y: 112, width: 120, height: 24 },
                    { x: 264, y: 136, width: 32,  height: 72 },
                    { x: 664, y: 232, width: 24,  height: 72 },
                    { x: 256, y: 264, width: 40,  height: 40 },
                    { x: 432, y: 104, width: 88,  height: 16 },
                    { x: 368, y: 136, width: 8,   height: 168 },
                    { x: 584, y: 160, width: 40,  height: 32 },
                    { x: 192, y: 232, width: 80,  height: 16 },
                    { x: 512, y: 288, width: 80,  height: 16 },
                    { x: 648, y: 216, width: 144, height: 8 },
                    { x: 160, y: 216, width: 128, height: 8 },
                    { x: 176, y: 224, width: 104, height: 8 },
                    { x: 376, y: 40,  width: 48,  height: 16 },
                    { x: 352, y: 80,  width: 24,  height: 32 },
                    { x: 128, y: 160, width: 24,  height: 32 },
                    { x: 152, y: 184, width: 24,  height: 32 },
                    { x: 768, y: 184, width: 24,  height: 32 },
                    { x: 272, y: 304, width: 32,  height: 24 },
                    { x: 584, y: 320, width: 96,  height: 8 },
                    { x: 432, y: 64,  width: 16,  height: 40 },
                    { x: 352, y: 136, width: 16,  height: 40 },
                    { x: 560, y: 136, width: 16,  height: 40 },
                    { x: 360, y: 216, width: 8,   height: 72 },
                    { x: 432, y: 328, width: 72,  height: 8 },
                    { x: 464, y: 120, width: 32,  height: 16 },
                    { x: 296, y: 160, width: 16,  height: 32 },
                    { x: 248, y: 248, width: 32,  height: 16 },
                    { x: 432, y: 336, width: 64,  height: 8 },
                    { x: 368, y: 352, width: 8,   height: 64 },
                    { x: 272, y: 104, width: 56,  height: 8 },
                    { x: 456, y: 320, width: 56,  height: 8 },
                    { x: 656, y: 240, width: 8,   height: 48 },
                    { x: 688, y: 288, width: 24,  height: 16 },
                    { x: 432, y: 344, width: 48,  height: 8 },
                    { x: 248, y: 208, width: 40,  height: 8 },
                    { x: 656, y: 224, width: 40,  height: 8 },
                    { x: 608, y: 328, width: 40,  height: 8 },
                    { x: 320, y: 352, width: 40,  height: 8 },
                    { x: 448, y: 88,  width: 16,  height: 16 },
                    { x: 432, y: 120, width: 8,   height: 32 },
                    { x: 592, y: 192, width: 32,  height: 8 },
                    { x: 176, y: 200, width: 16,  height: 16 },
                    { x: 296, y: 288, width: 16,  height: 16 },
                    { x: 520, y: 112, width: 24,  height: 8 },
                    { x: 328, y: 136, width: 24,  height: 8 },
                    { x: 576, y: 160, width: 8,   height: 24 },
                    { x: 360, y: 176, width: 8,   height: 24 },
                    { x: 792, y: 192, width: 8,   height: 24 },
                    { x: 248, y: 264, width: 8,   height: 24 },
                    { x: 280, y: 328, width: 24,  height: 8 },
                    { x: 432, y: 352, width: 24,  height: 8 },
                    { x: 360, y: 72,  width: 16,  height: 8 },
                    { x: 296, y: 144, width: 8,   height: 16 },
                    { x: 576, y: 152, width: 16,  height: 8 },
                    { x: 152, y: 168, width: 8,   height: 16 },
                    { x: 768, y: 176, width: 16,  height: 8 },
                    { x: 136, y: 192, width: 16,  height: 8 },
                    { x: 608, y: 200, width: 16,  height: 8 },
                    { x: 544, y: 280, width: 16,  height: 8 },
                    { x: 312, y: 296, width: 16,  height: 8 },
                    { x: 592, y: 296, width: 16,  height: 8 },
                    { x: 472, y: 312, width: 16,  height: 8 },
                    { x: 376, y: 416, width: 16,  height: 8 },
                    { x: 448, y: 80,  width: 8,   height: 8 },
                    { x: 464, y: 96,  width: 8,   height: 8 },
                    { x: 456, y: 120, width: 8,   height: 8 },
                    { x: 560, y: 128, width: 8,   height: 8 },
                    { x: 256, y: 136, width: 8,   height: 8 },
                    { x: 256, y: 152, width: 8,   height: 8 },
                    { x: 120, y: 168, width: 8,   height: 8 },
                    { x: 552, y: 168, width: 8,   height: 8 },
                    { x: 160, y: 176, width: 8,   height: 8 },
                    { x: 176, y: 192, width: 8,   height: 8 },
                    { x: 296, y: 192, width: 8,   height: 8 },
                    { x: 144, y: 200, width: 8,   height: 8 },
                    { x: 256, y: 200, width: 8,   height: 8 },
                    { x: 192, y: 208, width: 8,   height: 8 },
                    { x: 184, y: 232, width: 8,   height: 8 },
                    { x: 352, y: 232, width: 8,   height: 8 },
                    { x: 272, y: 240, width: 8,   height: 8 },
                    { x: 280, y: 256, width: 8,   height: 8 },
                    { x: 296, y: 280, width: 8,   height: 8 },
                    { x: 688, y: 280, width: 8,   height: 8 },
                    { x: 360, y: 296, width: 8,   height: 8 },
                    { x: 504, y: 296, width: 8,   height: 8 },
                    { x: 264, y: 304, width: 8,   height: 8 },
                    { x: 296, y: 336, width: 8,   height: 8 },
                    { x: 432, y: 376, width: 8,   height: 8 },
                    { x: 432, y: 400, width: 8,   height: 8 },
                    { x: 416, y: 416, width: 8,   height: 8 }
                ],
                buildings: [
                    // 外周の壁のみ
                    { x: 0,   y: 0,   width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 426, width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true },
                    { x: 776, y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 南 → 新宿中央広場、東 → バイオドーム
                    { x: 372, y: 384, width: 64, height: 40, to: 'shinjuku_center_plaza', direction: 'south', spawnX: 400, spawnY: 130 },
                    { x: 763, y: 177, width: 34, height: 43, to: 'biodome_gate',          direction: 'east',  spawnX: 85,  spawnY: 235 }
                    // ※ 北 (374, 38) は神宮の奥（shrine_path）として未実装のため保留
                ],
                npcs: [
                    {
                        x: 400,
                        y: 245,
                        emoji: '👴',
                        name: '老神主',
                        dialogue: '神々の力は、まだこの地に眠っている...選ばれし者よ。',
                        questFlag: 'metPriest',
                        questDialogue: 'ついに来たか、神威を継ぐ者よ。この神社には古の神々の力が眠っている。東の植物園には、生命の力を司る神が宿る場所がある。訪ねてみるがよい。',
                        static: true
                    }
                ],
                savePoint: { x: 400, y: 360, emoji: '⛩️', name: 'セーブポイント' }
            },
            tokyo_gov_approach: {
                name: '東京都庁 - アーク前庭',
                image: 'assets/maps/tokyo_gov_approach.png',
                bgColor: '#0a0c18',
                gridColor: 'transparent',
                encounterRate: 'high',
                area: 'city',
                bgm: 'tokyo_gov',
                // map-editor.html (タイルペイント版) で生成
                walkableRects: [
                    { x: 344, y: 120, width: 112, height: 256 },
                    { x: 96,  y: 264, width: 248, height: 24 },
                    { x: 480, y: 248, width: 144, height: 40 },
                    { x: 456, y: 352, width: 240, height: 24 },
                    { x: 64,  y: 160, width: 48,  height: 104 },
                    { x: 680, y: 200, width: 120, height: 40 },
                    { x: 104, y: 360, width: 240, height: 16 },
                    { x: 240, y: 104, width: 56,  height: 64 },
                    { x: 464, y: 128, width: 96,  height: 32 },
                    { x: 368, y: 80,  width: 72,  height: 40 },
                    { x: 8,   y: 200, width: 56,  height: 40 },
                    { x: 656, y: 296, width: 40,  height: 56 },
                    { x: 576, y: 168, width: 88,  height: 24 },
                    { x: 184, y: 376, width: 264, height: 8 },
                    { x: 680, y: 160, width: 80,  height: 24 },
                    { x: 680, y: 240, width: 56,  height: 32 },
                    { x: 624, y: 256, width: 56,  height: 32 },
                    { x: 168, y: 152, width: 72,  height: 24 },
                    { x: 176, y: 256, width: 168, height: 8 },
                    { x: 104, y: 296, width: 40,  height: 32 },
                    { x: 360, y: 392, width: 80,  height: 16 },
                    { x: 296, y: 120, width: 48,  height: 24 },
                    { x: 136, y: 160, width: 32,  height: 32 },
                    { x: 104, y: 328, width: 32,  height: 32 },
                    { x: 192, y: 336, width: 40,  height: 24 },
                    { x: 488, y: 160, width: 112, height: 8 },
                    { x: 552, y: 88,  width: 24,  height: 32 },
                    { x: 584, y: 224, width: 32,  height: 24 },
                    { x: 568, y: 288, width: 48,  height: 16 },
                    { x: 248, y: 352, width: 96,  height: 8 },
                    { x: 552, y: 376, width: 96,  height: 8 },
                    { x: 112, y: 176, width: 8,   height: 88 },
                    { x: 360, y: 384, width: 88,  height: 8 },
                    { x: 496, y: 120, width: 72,  height: 8 },
                    { x: 288, y: 168, width: 24,  height: 24 },
                    { x: 680, y: 184, width: 72,  height: 8 },
                    { x: 192, y: 232, width: 24,  height: 24 },
                    { x: 456, y: 256, width: 24,  height: 24 },
                    { x: 104, y: 288, width: 72,  height: 8 },
                    { x: 104, y: 376, width: 72,  height: 8 },
                    { x: 184, y: 384, width: 72,  height: 8 },
                    { x: 296, y: 144, width: 32,  height: 16 },
                    { x: 168, y: 176, width: 64,  height: 8 },
                    { x: 192, y: 288, width: 64,  height: 8 },
                    { x: 488, y: 288, width: 32,  height: 16 },
                    { x: 456, y: 344, width: 64,  height: 8 },
                    { x: 368, y: 408, width: 64,  height: 8 },
                    { x: 376, y: 72,  width: 56,  height: 8 },
                    { x: 680, y: 192, width: 56,  height: 8 },
                    { x: 648, y: 288, width: 56,  height: 8 },
                    { x: 192, y: 296, width: 56,  height: 8 },
                    { x: 568, y: 384, width: 56,  height: 8 },
                    { x: 560, y: 144, width: 24,  height: 16 },
                    { x: 48,  y: 152, width: 48,  height: 8 },
                    { x: 48,  y: 160, width: 16,  height: 24 },
                    { x: 608, y: 160, width: 48,  height: 8 },
                    { x: 488, y: 168, width: 48,  height: 8 },
                    { x: 496, y: 176, width: 24,  height: 16 },
                    { x: 640, y: 192, width: 24,  height: 16 },
                    { x: 336, y: 208, width: 8,   height: 48 },
                    { x: 72,  y: 264, width: 24,  height: 16 },
                    { x: 680, y: 272, width: 48,  height: 8 },
                    { x: 280, y: 288, width: 48,  height: 8 },
                    { x: 336, y: 160, width: 8,   height: 40 },
                    { x: 184, y: 184, width: 40,  height: 8 },
                    { x: 152, y: 352, width: 40,  height: 8 },
                    { x: 440, y: 88,  width: 8,   height: 32 },
                    { x: 232, y: 96,  width: 32,  height: 8 },
                    { x: 536, y: 104, width: 16,  height: 16 },
                    { x: 128, y: 168, width: 8,   height: 32 },
                    { x: 584, y: 192, width: 32,  height: 8 },
                    { x: 0,   y: 208, width: 8,   height: 32 },
                    { x: 680, y: 280, width: 32,  height: 8 },
                    { x: 200, y: 304, width: 32,  height: 8 },
                    { x: 576, y: 304, width: 32,  height: 8 },
                    { x: 576, y: 344, width: 32,  height: 8 },
                    { x: 360, y: 96,  width: 8,   height: 24 },
                    { x: 320, y: 112, width: 24,  height: 8 },
                    { x: 216, y: 144, width: 24,  height: 8 },
                    { x: 296, y: 160, width: 24,  height: 8 },
                    { x: 552, y: 168, width: 24,  height: 8 },
                    { x: 136, y: 192, width: 24,  height: 8 },
                    { x: 192, y: 192, width: 24,  height: 8 },
                    { x: 456, y: 224, width: 8,   height: 24 },
                    { x: 544, y: 288, width: 24,  height: 8 },
                    { x: 304, y: 296, width: 24,  height: 8 },
                    { x: 648, y: 296, width: 8,   height: 24 },
                    { x: 528, y: 344, width: 24,  height: 8 },
                    { x: 664, y: 376, width: 24,  height: 8 },
                    { x: 104, y: 384, width: 24,  height: 8 },
                    { x: 136, y: 384, width: 24,  height: 8 },
                    { x: 576, y: 96,  width: 8,   height: 16 },
                    { x: 232, y: 104, width: 8,   height: 16 },
                    { x: 456, y: 136, width: 8,   height: 16 },
                    { x: 144, y: 152, width: 16,  height: 8 },
                    { x: 728, y: 152, width: 16,  height: 8 },
                    { x: 240, y: 168, width: 16,  height: 8 },
                    { x: 272, y: 168, width: 16,  height: 8 },
                    { x: 592, y: 200, width: 16,  height: 8 },
                    { x: 576, y: 232, width: 8,   height: 16 },
                    { x: 616, y: 232, width: 8,   height: 16 },
                    { x: 184, y: 240, width: 8,   height: 16 },
                    { x: 464, y: 248, width: 16,  height: 8 },
                    { x: 208, y: 312, width: 16,  height: 8 },
                    { x: 376, y: 416, width: 16,  height: 8 },
                    { x: 544, y: 96,  width: 8,   height: 8 },
                    { x: 528, y: 112, width: 8,   height: 8 },
                    { x: 584, y: 152, width: 8,   height: 8 },
                    { x: 40,  y: 168, width: 8,   height: 8 },
                    { x: 280, y: 176, width: 8,   height: 8 },
                    { x: 488, y: 176, width: 8,   height: 8 },
                    { x: 568, y: 176, width: 8,   height: 8 },
                    { x: 144, y: 200, width: 8,   height: 8 },
                    { x: 568, y: 240, width: 8,   height: 8 },
                    { x: 216, y: 248, width: 8,   height: 8 },
                    { x: 120, y: 256, width: 8,   height: 8 },
                    { x: 480, y: 288, width: 8,   height: 8 },
                    { x: 288, y: 296, width: 8,   height: 8 },
                    { x: 184, y: 344, width: 8,   height: 8 },
                    { x: 232, y: 344, width: 8,   height: 8 },
                    { x: 336, y: 344, width: 8,   height: 8 },
                    { x: 136, y: 352, width: 8,   height: 8 }
                ],
                buildings: [
                    // 外周の壁のみ
                    { x: 0,   y: 0,   width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 426, width: 800, height: 24,  type: 'collision', collisionOnly: true },
                    { x: 0,   y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true },
                    { x: 776, y: 0,   width: 24,  height: 450, type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 西 → 新宿中央広場。spawnは center_plaza の東側 walkable 内
                    { x: 6, y: 206, width: 33, height: 33, to: 'shinjuku_center_plaza', direction: 'west', spawnX: 660, spawnY: 240 }
                    // ※ 北 (360, 72) は tokyo_gov(legacy) 用、東 (764, 201) と 南 (364, 394) は隣接マップ未定義のため保留
                ],
                npcs: [
                    { x: 340, y: 320, emoji: '🤖', name: 'セキュリティドローン', dialogue: '警告：不正アクセスを検知。', hostile: true },
                    { x: 460, y: 320, emoji: '🤖', name: 'セキュリティドローン', dialogue: '警告：不正アクセスを検知。', hostile: true }
                ]
            },
            biodome_gate: {
                name: 'バイオドーム - 西ゲート',
                image: 'assets/maps/biodome_gate.png',
                bgColor: '#0d1f16',
                gridColor: 'transparent',
                encounterRate: 'none',
                area: 'garden',
                bgm: 'biodome',
                // walkability-editor で生成（biodome_garden レイアウトを反映）
                walkableRects: [
                    { x: 417, y: 71,  width: 32,  height: 87  },
                    { x: 371, y: 159, width: 123, height: 42  },
                    { x: 37,  y: 199, width: 761, height: 59  },
                    { x: 177, y: 156, width: 27,  height: 41  },
                    { x: 252, y: 156, width: 23,  height: 40  },
                    { x: 205, y: 178, width: 43,  height: 17  },
                    { x: 201, y: 260, width: 67,  height: 41  },
                    { x: 269, y: 261, width: 229, height: 9   },
                    { x: 366, y: 273, width: 132, height: 43  },
                    { x: 413, y: 321, width: 45,  height: 76  },
                    { x: 406, y: 399, width: 17,  height: 18  },
                    { x: 444, y: 401, width: 14,  height: 16  },
                    { x: 615, y: 260, width: 77,  height: 14  },
                    { x: 614, y: 276, width: 32,  height: 119 },
                    { x: 408, y: 421, width: 51,  height: 24  }
                ],
                buildings: [
                    { x: 452, y: 71,  width: 348, height: 87,  type: 'collision', collisionOnly: true },
                    { x: 499, y: 161, width: 106, height: 40,  type: 'collision', collisionOnly: true },
                    { x: 657, y: 166, width: 143, height: 29,  type: 'collision', collisionOnly: true },
                    { x: 461, y: 318, width: 50,  height: 123, type: 'collision', collisionOnly: true },
                    { x: 500, y: 263, width: 111, height: 55,  type: 'collision', collisionOnly: true },
                    { x: 513, y: 319, width: 96,  height: 45,  type: 'collision', collisionOnly: true },
                    { x: 514, y: 367, width: 64,  height: 82,  type: 'collision', collisionOnly: true },
                    { x: 582, y: 400, width: 217, height: 48,  type: 'collision', collisionOnly: true },
                    { x: 649, y: 279, width: 147, height: 115, type: 'collision', collisionOnly: true },
                    { x: 696, y: 257, width: 102, height: 18,  type: 'collision', collisionOnly: true },
                    { x: 1,   y: 77,  width: 414, height: 76,  type: 'collision', collisionOnly: true },
                    { x: 278, y: 155, width: 94,  height: 36,  type: 'collision', collisionOnly: true },
                    { x: 46,  y: 157, width: 127, height: 34,  type: 'collision', collisionOnly: true },
                    { x: 207, y: 156, width: 42,  height: 17,  type: 'collision', collisionOnly: true },
                    { x: 31,  y: 265, width: 168, height: 125, type: 'collision', collisionOnly: true },
                    { x: 202, y: 304, width: 67,  height: 84,  type: 'collision', collisionOnly: true },
                    { x: 269, y: 272, width: 95,  height: 112, type: 'collision', collisionOnly: true },
                    { x: 366, y: 316, width: 45,  height: 68,  type: 'collision', collisionOnly: true },
                    { x: 32,  y: 390, width: 369, height: 59,  type: 'collision', collisionOnly: true },
                    { x: 425, y: 399, width: 16,  height: 19,  type: 'collision', collisionOnly: true }
                ],
                exits: [
                    // 西 → 明治神宮 南参道。spawnは shrine の東側 walkable 内
                    { x: 1, y: 186, width: 39, height: 89, to: 'shrine_south_gate', direction: 'west', spawnX: 700, spawnY: 195 }
                    // ※ 北 (414, 54) と 東 (754, 207) と 南 (415, 384) は隣接マップ未定義のため保留
                ],
                npcs: [
                    { x: 400, y: 250, emoji: '🧑‍🔧', name: 'リク', dialogue: '本物の植物を見たことがなかったんだ...これも作り物だけど、美しいね。' }
                ]
            }
        };

        Object.values(screenMaps).forEach(map => this.prepareScrollableMap(map));
        Object.assign(this.maps, screenMaps);
        this.applyLegacyImageFallbacks();
        this.applyWalkabilityOverrides();
    }

    applyWalkabilityOverrides() {
        const overridesDisabled = (() => {
            try {
                const params = new URLSearchParams(window.location.search || '');
                const value = params.get('walkabilityPreview');
                return value === '0' || value === 'false' || value === 'off';
            } catch {
                return false;
            }
        })();

        if (overridesDisabled || typeof localStorage === 'undefined') return;

        const storageKeys = [
            'rpg-map-editor-v1',
            'deusCodeWalkabilityOverrides'
        ];
        const overrides = {};

        storageKeys.forEach(storageKey => {
            try {
                const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
                Object.entries(stored).forEach(([mapId, data]) => {
                    overrides[mapId] = {
                        ...(overrides[mapId] || {}),
                        ...(data || {})
                    };
                });
            } catch (error) {
                console.warn(`[Map] Failed to parse ${storageKey}:`, error);
            }
        });

        Object.entries(overrides).forEach(([mapId, data]) => {
            const targetMapId = this.normalizeMapId(mapId);
            const map = this.maps[targetMapId] || this.maps[mapId];
            if (!map || !data) return;

            const scale = map.worldScale || 1;
            const normalizeRect = rect => {
                const x = Number(rect.x);
                const y = Number(rect.y);
                const width = Number(rect.width);
                const height = Number(rect.height);
                if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
                return {
                    x: Math.round(x * scale),
                    y: Math.round(y * scale),
                    width: Math.round(width * scale),
                    height: Math.round(height * scale)
                };
            };

            const normalizeExit = exit => {
                if (!exit.to) return null;
                const rect = normalizeRect(exit);
                if (!rect) return null;

                const spawnX = Number(exit.spawnX);
                const spawnY = Number(exit.spawnY);
                return {
                    ...exit,
                    ...rect,
                    to: exit.to || '',
                    direction: exit.direction || '',
                    spawnX: Number.isFinite(spawnX) ? Math.round(spawnX) : undefined,
                    spawnY: Number.isFinite(spawnY) ? Math.round(spawnY) : undefined
                };
            };

            if (Array.isArray(data.walkableRects)) {
                const walkableRects = data.walkableRects.map(normalizeRect).filter(Boolean);
                if (walkableRects.length > 0) map.walkableRects = walkableRects;
            }

            if (Array.isArray(data.collisionRects)) {
                map.buildings = data.collisionRects
                    .map(normalizeRect)
                    .filter(Boolean)
                    .map(rect => ({
                        ...rect,
                        type: 'collision',
                        collisionOnly: true
                    }));
            }

            if (Array.isArray(data.exits)) {
                const exits = data.exits.map(normalizeExit).filter(Boolean);
                if (exits.length > 0) map.exits = exits;
            }

            this.constrainMapNPCsToWalkable(map);
            console.log(`[Map] Applied walkability override: ${mapId} -> ${targetMapId}`);
        });
    }

    prepareScrollableMap(map) {
        if (!map || map.preparedForScroll) return;

        const scale = 1.55;
        map.preparedForScroll = true;
        map.worldScale = scale;
        map.worldWidth = Math.round(this.baseWidth * scale);
        map.worldHeight = Math.round(this.baseHeight * scale);

        const scaleRect = rect => ({
            ...rect,
            x: Math.round(rect.x * scale),
            y: Math.round(rect.y * scale),
            width: Math.round(rect.width * scale),
            height: Math.round(rect.height * scale)
        });

        if (map.walkableRects) map.walkableRects = map.walkableRects.map(scaleRect);
        if (map.buildings) map.buildings = map.buildings.map(scaleRect);
        if (map.exits) map.exits = map.exits.map(scaleRect);
        if (map.npcs) {
            map.npcs = map.npcs.map(npc => ({
                ...npc,
                x: Math.round(npc.x * scale),
                y: Math.round(npc.y * scale),
                originX: Math.round(npc.x * scale),
                originY: Math.round(npc.y * scale),
                wanderRadius: npc.static ? 0 : Math.round((npc.hostile ? 18 : 12) * scale),
                wanderPhase: Math.random() * Math.PI * 2,
                wanderSpeed: npc.hostile ? 0.0007 : 0.00045,
                facing: npc.facing || 'down',
                animTime: 0
            }));
            this.constrainMapNPCsToWalkable(map);
        }
        if (map.savePoint) {
            map.savePoint = {
                ...map.savePoint,
                x: Math.round(map.savePoint.x * scale),
                y: Math.round(map.savePoint.y * scale)
            };
        }
    }

    applyLegacyImageFallbacks() {
        const fallbackMapImages = {
            shinjuku_city: 'assets/maps/shinjuku_center_plaza.png',
            subway_entrance: 'assets/maps/shinjuku_station_gate.png',
            biodome_garden: 'assets/maps/biodome_gate.png',
            black_market: 'assets/maps/black_market_entrance.png',
            shrine_path: 'assets/maps/shrine_south_gate.png',
            tokyo_gov: 'assets/maps/tokyo_gov_approach.png',
            deep_tunnel: 'assets/maps/subway_concourse_a.png',
            deep_tunnel_2: 'assets/maps/subway_concourse_a.png',
            deep_tunnel_3: 'assets/maps/subway_concourse_a.png',
            deep_tunnel_4: 'assets/maps/subway_concourse_a.png',
            deep_tunnel_boss: 'assets/maps/tokyo_gov_approach.png',
            shopping_district: 'assets/maps/shopping_street_north.png',
            residential_area: 'assets/maps/residential_street.png',
            house_1: 'assets/maps/residential_street.png',
            shrine_inner: 'assets/maps/shrine_south_gate.png',
            tokyo_gov_floor2: 'assets/maps/tokyo_gov_approach.png',
            tokyo_gov_floor3: 'assets/maps/tokyo_gov_approach.png'
        };

        // legacy マップ用の詳細 walkable データ（walkability-editor で生成）
        const legacyWalkabilityDetails = {
            deep_tunnel_boss: {
                walkableRects: [
                    { x: 226, y: 94,  width: 71,  height: 82  },
                    { x: 299, y: 116, width: 151, height: 58  },
                    { x: 452, y: 103, width: 116, height: 47  },
                    { x: 484, y: 151, width: 46,  height: 80  },
                    { x: 532, y: 148, width: 130, height: 24  },
                    { x: 282, y: 180, width: 37,  height: 46  },
                    { x: 344, y: 175, width: 107, height: 232 },
                    { x: 186, y: 270, width: 432, height: 39  },
                    { x: 178, y: 227, width: 51,  height: 46  },
                    { x: 158, y: 251, width: 122, height: 33  },
                    { x: 574, y: 174, width: 45,  height: 28  },
                    { x: 683, y: 151, width: 67,  height: 30  },
                    { x: 682, y: 182, width: 48,  height: 111 },
                    { x: 646, y: 267, width: 54,  height: 113 },
                    { x: 453, y: 357, width: 193, height: 24  },
                    { x: 574, y: 332, width: 46,  height: 23  },
                    { x: 732, y: 208, width: 50,  height: 32  },
                    { x: 32,  y: 154, width: 87,  height: 31  },
                    { x: 72,  y: 191, width: 49,  height: 85  },
                    { x: 3,   y: 204, width: 65,  height: 36  },
                    { x: 92,  y: 283, width: 63,  height: 98  },
                    { x: 127, y: 266, width: 29,  height: 14  },
                    { x: 157, y: 356, width: 187, height: 25  },
                    { x: 188, y: 335, width: 41,  height: 17  }
                ],
                collisionRects: [
                    { x: 453, y: 154, width: 30,  height: 113 },
                    { x: 488, y: 233, width: 43,  height: 26  },
                    { x: 529, y: 175, width: 44,  height: 75  },
                    { x: 576, y: 207, width: 48,  height: 17  },
                    { x: 620, y: 182, width: 26,  height: 74  },
                    { x: 648, y: 199, width: 33,  height: 68  },
                    { x: 666, y: 148, width: 14,  height: 52  },
                    { x: 677, y: 136, width: 90,  height: 13  },
                    { x: 732, y: 186, width: 68,  height: 17  },
                    { x: 751, y: 152, width: 49,  height: 26  },
                    { x: 570, y: 59,  width: 102, height: 88  },
                    { x: 4,   y: 75,  width: 221, height: 78  },
                    { x: 95,  y: 3,   width: 246, height: 63  },
                    { x: 247, y: 71,  width: 104, height: 20  },
                    { x: 298, y: 93,  width: 54,  height: 21  },
                    { x: 230, y: 179, width: 50,  height: 68  },
                    { x: 122, y: 157, width: 11,  height: 104 },
                    { x: 156, y: 178, width: 21,  height: 74  },
                    { x: 180, y: 206, width: 46,  height: 17  },
                    { x: 137, y: 211, width: 20,  height: 51  },
                    { x: 1,   y: 157, width: 28,  height: 40  },
                    { x: 30,  y: 188, width: 40,  height: 13  },
                    { x: 4,   y: 244, width: 54,  height: 37  },
                    { x: 4,   y: 281, width: 85,  height: 155 },
                    { x: 90,  y: 387, width: 91,  height: 52  },
                    { x: 182, y: 384, width: 163, height: 59  },
                    { x: 157, y: 287, width: 28,  height: 64  },
                    { x: 186, y: 316, width: 56,  height: 15  },
                    { x: 233, y: 310, width: 86,  height: 44  },
                    { x: 320, y: 179, width: 23,  height: 73  },
                    { x: 284, y: 231, width: 33,  height: 27  },
                    { x: 323, y: 312, width: 20,  height: 34  },
                    { x: 462, y: 310, width: 109, height: 45  },
                    { x: 574, y: 317, width: 43,  height: 13  },
                    { x: 623, y: 285, width: 21,  height: 61  },
                    { x: 736, y: 244, width: 64,  height: 190 },
                    { x: 705, y: 296, width: 28,  height: 83  },
                    { x: 452, y: 383, width: 284, height: 54  }
                ]
            },
            tokyo_gov_floor3: {
                walkableRects: [
                    { x: 49,  y: 160, width: 73,  height: 26  },
                    { x: 3,   y: 203, width: 115, height: 51  },
                    { x: 67,  y: 161, width: 48,  height: 129 },
                    { x: 89,  y: 260, width: 263, height: 28  },
                    { x: 352, y: 259, width: 378, height: 30  },
                    { x: 684, y: 168, width: 73,  height: 15  },
                    { x: 685, y: 186, width: 47,  height: 98  },
                    { x: 734, y: 206, width: 51,  height: 32  },
                    { x: 352, y: 88,  width: 99,  height: 321 },
                    { x: 270, y: 119, width: 84,  height: 50  },
                    { x: 453, y: 115, width: 80,  height: 49  },
                    { x: 105, y: 287, width: 45,  height: 87  },
                    { x: 155, y: 349, width: 548, height: 26  },
                    { x: 644, y: 292, width: 57,  height: 57  }
                ],
                collisionRects: [
                    { x: 451, y: 168, width: 40,  height: 87  },
                    { x: 497, y: 219, width: 184, height: 36  },
                    { x: 636, y: 132, width: 46,  height: 80  },
                    { x: 688, y: 90,  width: 111, height: 72  },
                    { x: 761, y: 164, width: 32,  height: 19  },
                    { x: 738, y: 187, width: 47,  height: 14  },
                    { x: 737, y: 243, width: 57,  height: 197 },
                    { x: 626, y: 378, width: 105, height: 53  },
                    { x: 705, y: 293, width: 28,  height: 82  },
                    { x: 455, y: 292, width: 186, height: 54  },
                    { x: 154, y: 294, width: 196, height: 54  },
                    { x: 106, y: 379, width: 242, height: 60  },
                    { x: 455, y: 379, width: 168, height: 56  },
                    { x: 123, y: 149, width: 144, height: 108 },
                    { x: 269, y: 173, width: 82,  height: 83  },
                    { x: 275, y: 63,  width: 73,  height: 53  },
                    { x: 454, y: 74,  width: 82,  height: 37  },
                    { x: 538, y: 120, width: 95,  height: 49  },
                    { x: 497, y: 169, width: 37,  height: 25  },
                    { x: 0,   y: 98,  width: 127, height: 59  },
                    { x: 0,   y: 161, width: 42,  height: 38  },
                    { x: 5,   y: 262, width: 59,  height: 31  },
                    { x: 30,  y: 294, width: 70,  height: 88  }
                ]
            }
        };

        Object.entries(fallbackMapImages).forEach(([mapId, image]) => {
            const map = this.maps[mapId];
            if (!map) return;

            map.image = map.image || image;
            map.gridColor = 'transparent';
            map.drawProceduralObjects = false;

            const detail = legacyWalkabilityDetails[mapId];
            if (detail && Array.isArray(detail.walkableRects) && detail.walkableRects.length > 0) {
                map.walkableRects = detail.walkableRects.map(rect => ({ ...rect }));
                map.buildings = (detail.collisionRects || []).map(rect => ({
                    ...rect,
                    type: 'collision',
                    collisionOnly: true
                }));
            } else {
                map.buildings = [];
                map.walkableRects = [
                    { x: 18, y: 18, width: this.baseWidth - 36, height: this.baseHeight - 36 }
                ];
            }

            this.prepareScrollableMap(map);
        });

        this.retargetLegacyExits();
    }

    retargetLegacyExits() {
        const retargets = {
            shopping_district: 'shopping_street_north',
            residential_area: 'residential_street',
            shinjuku_city: 'shinjuku_center_plaza',
            subway_entrance: 'shinjuku_station_gate',
            shrine_path: 'shrine_south_gate',
            tokyo_gov: 'tokyo_gov_approach'
        };

        const screenMapIds = new Set([
            'shinjuku_center_plaza',
            'shinjuku_station_gate',
            'subway_concourse_a',
            'shopping_street_north',
            'shopping_street_south',
            'black_market_entrance',
            'residential_street',
            'shrine_south_gate',
            'tokyo_gov_approach',
            'biodome_gate'
        ]);

        Object.entries(this.maps).forEach(([mapId, map]) => {
            if (screenMapIds.has(mapId)) return;
            (map.exits || []).forEach(exit => {
                if (retargets[exit.to]) exit.to = retargets[exit.to];
            });
        });
    }

    applyShopImageMapOverrides() {
        const shopMapIds = [
            'shop_weapon',
            'shop_armor',
            'shop_item',
            'shop_magic',
            'shop_inn',
            'shop_guild',
            'shop_bank',
            'shop_black_market'
        ];

        const shopNpcLayouts = {
            shop_weapon: {
                '武器商人リョウ': { x: 400, y: 292 }
            },
            shop_armor: {
                '防具商人サクラ': { x: 400, y: 292 }
            },
            shop_item: {
                'アイテム商人ユウキ': { x: 400, y: 292 }
            },
            shop_magic: {
                '魔法商人ミコト': { x: 400, y: 292 }
            },
            shop_inn: {
                '宿屋の主人': { x: 400, y: 292 }
            },
            shop_guild: {
                'ギルドマスター': { x: 400, y: 292 },
                '冒険者A': { x: 300, y: 355 },
                '冒険者B': { x: 500, y: 355 }
            },
            shop_bank: {
                '銀行員': { x: 400, y: 335 }
            },
            shop_black_market: {
                '闇商人': { x: 400, y: 292 }
            }
        };

        // walkability-editor で個別調整したショップの詳細データ
        const shopWalkabilityDetails = {
            shop_bank: {
                walkableRects: [
                    { x: 350, y: 405, width: 100, height: 45  },
                    { x: 125, y: 141, width: 103, height: 59  },
                    { x: 554, y: 151, width: 147, height: 53  },
                    { x: 234, y: 174, width: 316, height: 37  },
                    { x: 158, y: 205, width: 86,  height: 179 },
                    { x: 544, y: 203, width: 104, height: 184 },
                    { x: 139, y: 330, width: 16,  height: 64  },
                    { x: 247, y: 308, width: 296, height: 43  },
                    { x: 489, y: 355, width: 57,  height: 35  },
                    { x: 248, y: 357, width: 44,  height: 39  },
                    { x: 345, y: 353, width: 99,  height: 48  }
                ],
                collisionRects: [
                    { x: 0,   y: 0,   width: 800, height: 58  },
                    { x: 0,   y: 0,   width: 24,  height: 450 },
                    { x: 776, y: 0,   width: 24,  height: 450 },
                    { x: 72,  y: 205, width: 82,  height: 121 },
                    { x: 650, y: 205, width: 82,  height: 121 },
                    { x: 246, y: 218, width: 296, height: 85  },
                    { x: 230, y: 75,  width: 321, height: 95  },
                    { x: 555, y: 64,  width: 201, height: 83  },
                    { x: 707, y: 153, width: 67,  height: 45  },
                    { x: 26,  y: 67,  width: 202, height: 71  },
                    { x: 24,  y: 147, width: 101, height: 54  },
                    { x: 80,  y: 331, width: 57,  height: 60  },
                    { x: 83,  y: 399, width: 211, height: 36  },
                    { x: 294, y: 355, width: 47,  height: 88  },
                    { x: 445, y: 358, width: 39,  height: 43  },
                    { x: 489, y: 393, width: 283, height: 52  },
                    { x: 649, y: 328, width: 110, height: 55  }
                ]
            },
            shop_black_market: {
                walkableRects: [
                    { x: 350, y: 405, width: 100, height: 45  },
                    { x: 338, y: 200, width: 126, height: 164 },
                    { x: 352, y: 366, width: 98,  height: 42  }
                ],
                collisionRects: [
                    { x: 0,   y: 0,   width: 800, height: 58  },
                    { x: 0,   y: 0,   width: 24,  height: 450 },
                    { x: 776, y: 0,   width: 24,  height: 450 },
                    { x: 466, y: 189, width: 288, height: 218 },
                    { x: 297, y: 122, width: 199, height: 77  },
                    { x: 78,  y: 122, width: 250, height: 304 },
                    { x: 452, y: 363, width: 24,  height: 68  },
                    { x: 322, y: 368, width: 27,  height: 73  }
                ]
            }
        };

        shopMapIds.forEach(mapId => {
            const map = this.maps[mapId];
            if (!map) return;

            map.gridColor = 'transparent';
            map.drawProceduralObjects = false;

            const detail = shopWalkabilityDetails[mapId];
            if (detail && Array.isArray(detail.walkableRects) && detail.walkableRects.length > 0) {
                map.walkableRects = detail.walkableRects.map(rect => ({ ...rect }));
                map.buildings = (detail.collisionRects || []).map(rect => ({
                    ...rect,
                    type: 'collision',
                    collisionOnly: true
                }));
            } else {
                map.walkableRects = [
                    { x: 24, y: 72, width: 752, height: 354 }
                ];
                map.buildings = [
                    { x: 0, y: 0, width: 800, height: 24, type: 'collision', collisionOnly: true },
                    { x: 0, y: 0, width: 18, height: 450, type: 'collision', collisionOnly: true },
                    { x: 782, y: 0, width: 18, height: 450, type: 'collision', collisionOnly: true },
                    { x: 0, y: 426, width: 800, height: 24, type: 'collision', collisionOnly: true },
                    { x: 48, y: 112, width: 170, height: 230, type: 'collision', collisionOnly: true },
                    { x: 582, y: 112, width: 170, height: 230, type: 'collision', collisionOnly: true },
                    { x: 235, y: 126, width: 330, height: 96, type: 'collision', collisionOnly: true }
                ];
            }

            const npcLayout = shopNpcLayouts[mapId] || {};
            (map.npcs || []).forEach(npc => {
                const layout = npcLayout[npc.name];
                if (!layout) return;

                npc.x = layout.x;
                npc.y = layout.y;
                npc.originX = layout.x;
                npc.originY = layout.y;
                npc.facing = 'down';
                npc.static = true;
            });

            this.constrainMapNPCsToWalkable(map);
        });
    }

    removeLegacyMapDuplicates() {
        const legacyAliases = {
            shinjuku_city: 'shinjuku_center_plaza',
            subway_entrance: 'shinjuku_station_gate',
            biodome_garden: 'biodome_gate',
            shrine_path: 'shrine_south_gate',
            tokyo_gov: 'tokyo_gov_approach',
            shopping_district: 'shopping_street_north',
            residential_area: 'residential_street',
            black_market: 'black_market_entrance'
        };

        Object.entries(legacyAliases).forEach(([legacyId, canonicalId]) => {
            if (this.maps[canonicalId]) delete this.maps[legacyId];
        });
    }

    getMapScale(mapId = this.currentMap) {
        const map = this.maps[mapId];
        return map && map.worldScale ? map.worldScale : 1;
    }

    normalizeMapId(mapId) {
        const aliases = {
            shopping_district: 'shopping_street_north',
            residential_area: 'residential_street',
            shinjuku_city: 'shinjuku_center_plaza',
            subway_entrance: 'shinjuku_station_gate',
            black_market: 'black_market_entrance',
            shrine_path: 'shrine_south_gate',
            tokyo_gov: 'tokyo_gov_approach',
            biodome_garden: 'biodome_gate'
        };

        return aliases[mapId] || mapId;
    }

    getMapBounds(mapId = this.currentMap) {
        const map = this.maps[mapId];
        return {
            width: map && map.worldWidth ? map.worldWidth : this.baseWidth,
            height: map && map.worldHeight ? map.worldHeight : this.baseHeight
        };
    }

    updateCamera(playerX, playerY, canvas) {
        const bounds = this.getMapBounds();
        this.camera.x = Math.max(0, Math.min(bounds.width - canvas.width, playerX - canvas.width / 2));
        this.camera.y = Math.max(0, Math.min(bounds.height - canvas.height, playerY - canvas.height / 2));
    }

    worldToScreenPoint(x, y) {
        // 整数スナップ: 描画先を非整数にしないことで移動中スプライトの滲み/チラつきを防ぐ
        return {
            x: Math.round(x - this.camera.x),
            y: Math.round(y - this.camera.y)
        };
    }

    getSpawnPoint(exit, canvas) {
        const targetMap = this.normalizeMapId(exit.to);
        const map = this.maps[targetMap];
        const scale = this.getMapScale(targetMap);
        let spawn;

        if (Number.isFinite(exit.spawnX) && Number.isFinite(exit.spawnY)) {
            // 【店からの退出時のみ】手書きの spawnX/spawnY は worldScale(=1.55)と
            // 噛み合わず、スケール後の入口判定の外側／壁の向こうに落ちて再入店不能になる。
            // → 戻り先マップにある「元の店へ通じる入口」のスケール済みボックスの
            //   直下（歩行可能床）へアンカーし直す。通常の街↔街遷移には影響させない。
            const fromMapObj = this.previousMap
                ? this.maps[this.normalizeMapId(this.previousMap)]
                : null;
            if (fromMapObj && fromMapObj.area === 'shop' && map && map.exits) {
                const back = map.exits.find(e =>
                    this.normalizeMapId(e.to) === this.normalizeMapId(this.previousMap));
                if (back) {
                    const doorScale = map.worldScale && map.worldScale > 0 ? map.worldScale : 1;
                    const cx = back.x + back.width / 2;
                    const cy = back.y + back.height + Math.round(28 * doorScale);
                    return this.findSafeSpawnPoint(map, cx, cy, 24);
                }
            }

            spawn = {
                x: Math.round(exit.spawnX * scale),
                y: Math.round(exit.spawnY * scale)
            };
            return this.findSafeSpawnPoint(map, spawn.x, spawn.y, 24);
        }

        const width = (canvas ? canvas.width : this.baseWidth) * scale;
        const height = (canvas ? canvas.height : this.baseHeight) * scale;

        if (exit.direction === 'north') spawn = { x: Math.round(width / 2), y: Math.round(height - 90 * scale) };
        else if (exit.direction === 'south') spawn = { x: Math.round(width / 2), y: Math.round(70 * scale) };
        else if (exit.direction === 'west') spawn = { x: Math.round(width - 90 * scale), y: Math.round(height / 2) };
        else if (exit.direction === 'east') spawn = { x: Math.round(90 * scale), y: Math.round(height / 2) };
        else spawn = { x: Math.round(width / 2), y: Math.round(height / 2) };

        return this.findSafeSpawnPoint(map, spawn.x, spawn.y, 24);
    }

    getOptimizedImagePath(path) {
        if (typeof path !== 'string') return path;
        const webpEligible = (
            path.startsWith('assets/maps/') ||
            path.startsWith('assets/characters/') ||
            path.startsWith('assets/enemies/')
        );
        if (webpEligible && path.endsWith('.png')) {
            return path.replace(/\.png$/, '.webp');
        }
        return path;
    }

    getOptimizedMapImagePath(path) {
        return this.getOptimizedImagePath(path);
    }

    loadImageWithFallback(cache, cacheKey, originalPath, label = 'Image') {
        if (!originalPath) return null;
        if (cache[cacheKey]) return cache[cacheKey];

        const image = new Image();
        const optimizedPath = this.getOptimizedImagePath(originalPath);
        let usingFallback = optimizedPath === originalPath;

        image.decoding = 'async';
        image.onload = () => {
            console.log(`[${label}] Loaded image: ${usingFallback ? originalPath : optimizedPath}`);
        };
        image.onerror = () => {
            if (!usingFallback) {
                console.warn(`[${label}] Failed to load optimized image: ${optimizedPath}. Falling back to ${originalPath}`);
                usingFallback = true;
                image.src = `${originalPath}?v=${this.assetVersion}`;
                return;
            }
            console.warn(`[${label}] Failed to load image: ${originalPath}`);
        };

        cache[cacheKey] = image;
        image.src = `${optimizedPath}?v=${this.assetVersion}`;
        return image;
    }

    loadMapImage(mapOrId) {
        const map = typeof mapOrId === 'string'
            ? this.maps[this.normalizeMapId(mapOrId)]
            : mapOrId;
        if (!map || !map.image) return null;
        return this.loadImageWithFallback(this.mapImages, map.image, map.image, 'Map');
    }

    loadSpriteImage(path) {
        if (!path) return null;
        return this.loadImageWithFallback(this.spriteImages, path, path, 'Sprite');
    }

    preloadMapImages(mapId = this.currentMap) {
        this.loadMapImage(mapId);
    }

    preloadAdjacentMapImages(mapId = this.currentMap) {
        const map = this.maps[this.normalizeMapId(mapId)];
        if (!map || !Array.isArray(map.exits)) return;

        const adjacentMapIds = new Set();
        map.exits.forEach(exit => {
            const targetMapId = exit && exit.to ? this.normalizeMapId(exit.to) : null;
            if (targetMapId && this.maps[targetMapId]) adjacentMapIds.add(targetMapId);
        });

        adjacentMapIds.forEach(targetMapId => this.loadMapImage(targetMapId));
    }

    preloadSpriteImages(mapId = this.currentMap) {
        const map = this.maps[this.normalizeMapId(mapId)];
        if (!map || !Array.isArray(map.npcs)) return;

        map.npcs.forEach(npc => {
            const path = this.getNPCSpritePath(npc);
            this.loadSpriteImage(path);
        });
    }

    getNPCSpritePath(npc) {
        return npc.image || this.npcSpriteMap[npc.name] || null;
    }

    isWalkSpriteSheet(spritePath, sprite) {
        return Boolean(
            spritePath &&
            spritePath.includes('/sprites/') &&
            sprite &&
            sprite.naturalWidth >= this.walkSprite.frameWidth * this.walkSprite.frames &&
            sprite.naturalHeight >= this.walkSprite.frameHeight * 4
        );
    }

    getDirectionRow(direction = 'down') {
        return this.walkSprite.rows[direction] ?? this.walkSprite.rows.down;
    }

    computeWalkFrame(facing, isMoving, animTimeMs) {
        const ws = this.walkSprite;
        const row = ws.rows[facing] ?? ws.rows.down;
        let col;
        if (!isMoving) { col = ws.idleFrame; }
        else { const seq = ws.frameSequence; const idx = Math.floor((animTimeMs / 1000) * ws.fps) % seq.length; col = seq[idx]; }
        return { sx: col * ws.frameWidth, sy: row * ws.frameHeight, sw: ws.frameWidth, sh: ws.frameHeight };
    }

    computeWalkJuice(isMoving, animTimeMs) {
        // 歩行の躍動を上乗せ(元アートに脚スイングが無いため演出で補う)。
        // bob: 体が上下に弾む / 接地時に横へ潰れ縦に縮むスクワッシュ / 左右スウェイ。
        const cyc = (animTimeMs / 1000) * Math.PI * 2 * 2.2;
        const s = isMoving ? Math.sin(cyc) : 0;
        const up = Math.abs(s);        // 0(接地)〜1(最高到達)
        const ground = 1 - up;         // 1(接地)〜0
        const dy = isMoving ? -up * 5.0 : 0;
        const sx = isMoving ? (1 + ground * 0.12) : 1;
        const sy = isMoving ? (1 - ground * 0.10 + up * 0.04) : 1;
        const sway = isMoving ? s * 1.8 : 0;
        return { dy, sx, sy, sway };
    }

    updateFacingFromDelta(npc, dx, dy) {
        if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15) return;

        if (Math.abs(dx) > Math.abs(dy)) {
            npc.facing = dx > 0 ? 'right' : 'left';
        } else {
            npc.facing = dy > 0 ? 'down' : 'up';
        }
    }

    // ==========================================
    // ショップ建物から内部への遷移を追加
    // ==========================================

    // 建物入口チェック（ドアや入口に近づいた時）
    checkBuildingEntrance(playerX, playerY) {
        const map = this.maps[this.currentMap];
        if (!map || !map.buildings) return null;

        const interactionRange = 40;

        for (const building of map.buildings) {
            if (!building.enterable && !this.getBuildingEnterMap(building.type)) continue;

            // 建物の入口位置（建物の下端中央）
            const entranceX = building.x + building.width / 2;
            const entranceY = building.y + building.height;

            const distance = Math.sqrt(
                Math.pow(playerX - entranceX, 2) +
                Math.pow(playerY - entranceY, 2)
            );

            if (distance < interactionRange) {
                const targetMap = building.enterTo || this.getBuildingEnterMap(building.type);
                if (targetMap && this.maps[targetMap]) {
                    return { building: building, targetMap: targetMap };
                }
            }
        }

        return null;
    }

    // 建物タイプから内部マップIDを取得
    getBuildingEnterMap(buildingType) {
        const buildingMapMapping = {
            'weapon_shop': 'shop_weapon',
            'armor_shop': 'shop_armor',
            'item_shop': 'shop_item',
            'magic_shop': 'shop_magic',
            'inn': 'shop_inn',
            'guild': 'shop_guild',
            'bank': 'shop_bank',
            'house': null  // 個別に設定
        };
        return buildingMapMapping[buildingType] || null;
    }
    
    // 現在のマップを描画
    drawCurrentMap(ctx, canvas) {
        const map = this.maps[this.currentMap];
        if (!map) return;
        
        // 背景色
        ctx.fillStyle = map.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const mapImage = map.image ? this.loadMapImage(map) : null;
        if (mapImage && mapImage.complete && mapImage.naturalWidth > 0) {
            const bounds = this.getMapBounds();
            ctx.drawImage(mapImage, -this.camera.x, -this.camera.y, bounds.width, bounds.height);
        }
        
        // グリッド
        if (map.gridColor && map.gridColor !== 'transparent') {
            ctx.strokeStyle = map.gridColor;
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += this.tileSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += this.tileSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
        
        // 建物・オブジェクト
        if (map.drawProceduralObjects === false) {
            return;
        }

        map.buildings.forEach(building => {
            if (building.collisionOnly) {
                return;
            }

            building = {
                ...building,
                x: building.x - this.camera.x,
                y: building.y - this.camera.y
            };

            if (
                building.x + building.width < 0 ||
                building.y + building.height < 0 ||
                building.x > canvas.width ||
                building.y > canvas.height
            ) {
                return;
            }

            // 建物の背景色
            ctx.fillStyle = building.color;
            ctx.fillRect(building.x, building.y, building.width, building.height);

            // 建物の枠線（視認性向上）
            ctx.strokeStyle = building.borderColor || '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(building.x, building.y, building.width, building.height);

            // タイプに応じた装飾
            if (building.type === 'building' || building.type === 'office') {
                // 都市の建物（ビル風）
                ctx.font = '32px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🏢', building.x + building.width/2, building.y + building.height/2);

                // 窓の表現
                ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 2; j++) {
                        const wx = building.x + 10 + i * 20;
                        const wy = building.y + 10 + j * 20;
                        if (wx + 8 < building.x + building.width && wy + 8 < building.y + building.height) {
                            ctx.fillRect(wx, wy, 8, 8);
                        }
                    }
                }
            } else if (building.type === 'tree') {
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🌳', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'torii') {
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⛩️', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'stall') {
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏪', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'pillar') {
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏛️', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'treasure') {
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('📦', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'weapon_shop') {
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🗡️', building.x + building.width/2, building.y + building.height/2);
                ctx.font = '10px Courier New';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('武器店', building.x + building.width/2, building.y + building.height/2 + 15);
            } else if (building.type === 'armor_shop') {
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🛡️', building.x + building.width/2, building.y + building.height/2);
                ctx.font = '10px Courier New';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('防具店', building.x + building.width/2, building.y + building.height/2 + 15);
            } else if (building.type === 'item_shop') {
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🧪', building.x + building.width/2, building.y + building.height/2);
                ctx.font = '10px Courier New';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('道具店', building.x + building.width/2, building.y + building.height/2 + 15);
            } else if (building.type === 'magic_shop') {
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🔮', building.x + building.width/2, building.y + building.height/2);
                ctx.font = '10px Courier New';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('魔法店', building.x + building.width/2, building.y + building.height/2 + 15);
            } else if (building.type === 'inn') {
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏠', building.x + building.width/2, building.y + building.height/2);
                ctx.font = '10px Courier New';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('宿屋', building.x + building.width/2, building.y + building.height/2 + 15);
            } else if (building.type === 'house') {
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏘️', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'wall') {
                // 壁の表現（レンガ模様）
                ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
                const brickWidth = 20;
                const brickHeight = 10;
                for (let y = 0; y < building.height; y += brickHeight) {
                    for (let x = 0; x < building.width; x += brickWidth) {
                        const offset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
                        ctx.strokeRect(building.x + x + offset, building.y + y, brickWidth, brickHeight);
                    }
                }
            } else if (building.type === 'pond') {
                // 池の表現
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('💧', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'elevator') {
                // エレベーターの表現
                ctx.font = '32px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🚪', building.x + building.width/2, building.y + building.height/2);

                // エレベーターボタン
                ctx.fillStyle = '#ff6666';
                ctx.fillRect(building.x + building.width - 15, building.y + 10, 8, 8);
                ctx.fillStyle = '#66ff66';
                ctx.fillRect(building.x + building.width - 15, building.y + 25, 8, 8);
            } else if (building.type === 'plaza') {
                // 広場の表現
                ctx.fillStyle = 'rgba(100, 150, 200, 0.2)';
                ctx.fillRect(building.x, building.y, building.width, building.height);
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('広場', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'boss_area') {
                // ボスエリアの表現（赤く警告的に）
                ctx.fillStyle = 'rgba(200, 50, 50, 0.3)';
                ctx.fillRect(building.x, building.y, building.width, building.height);
                ctx.font = '32px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⚠️', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'shrine') {
                // 神社の表現
                ctx.font = '32px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⛩️', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'lantern') {
                // 灯篭の表現
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🏮', building.x + building.width/2, building.y + building.height/2);
            } else if (building.type === 'bank') {
                // 銀行の表現
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('💰', building.x + building.width/2, building.y + building.height/2);
                ctx.font = '10px Courier New';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('銀行', building.x + building.width/2, building.y + building.height/2 + 15);
            } else if (building.type === 'guild') {
                // ギルドの表現
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⚔️', building.x + building.width/2, building.y + building.height/2);
                ctx.font = '10px Courier New';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('ギルド', building.x + building.width/2, building.y + building.height/2 + 15);
            }
        });
        
        // セーブポイント
        if (map.savePoint) {
            const savePoint = this.worldToScreenPoint(map.savePoint.x, map.savePoint.y);
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(map.savePoint.emoji, savePoint.x, savePoint.y);
            
            // 光るエフェクト
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(savePoint.x, savePoint.y - 10, 20, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // NPCを描画
    drawNPCs(ctx, storyFlags) {
        const map = this.maps[this.currentMap];
        if (!map || !map.npcs) return;

        map.npcs.forEach(npc => {
            const spritePath = this.getNPCSpritePath(npc);
            const sprite = spritePath ? this.loadSpriteImage(spritePath) : null;
            const position = this.worldToScreenPoint(npc.x, npc.y);

            // 影（NPCも濃く・大きく）
            const shadowRadiusX = npc.hostile ? 19 : 16;
            const shadowRadiusY = npc.hostile ? 7 : 6;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.beginPath();
            ctx.ellipse(position.x, position.y + 4, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
            ctx.fill();

            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                if (this.isWalkSpriteSheet(spritePath, sprite)) {
                    // フルフレーム再生(本物の歩行コマをそのまま送る・整数スナップ)
                    const f = this.computeWalkFrame(npc.facing, npc.isMoving, npc.animTime || 0);
                    const dw = npc.hostile ? 56 : 48, dh = npc.hostile ? 72 : 62;
                    const dx = Math.round(position.x - dw / 2);
                    const dy = Math.round(position.y - dh + 6);
                    const ps = ctx.imageSmoothingEnabled;
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(sprite, f.sx, f.sy, f.sw, f.sh, dx, dy, dw, dh);
                    ctx.imageSmoothingEnabled = ps;
                } else {
                    const size = npc.hostile ? 50 : 44;
                    ctx.drawImage(sprite, position.x - size / 2, position.y - size, size, size * 1.25);
                }
            } else {
                ctx.font = '32px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(npc.emoji, position.x, position.y);
            }

            // クエストマーカー表示（ストーリーNPC用）
            if (npc.questFlag && storyFlags) {
                // フラグが立っていない場合、クエストマーカーを表示
                if (!storyFlags[npc.questFlag]) {
                    ctx.font = '16px Arial';
                    ctx.fillStyle = '#ffff00';
                    ctx.fillText('！', position.x - 20, position.y - 15);

                    // 光るエフェクト
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(position.x - 20, position.y - 20, 10, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            if (npc.shop && !npc.questFlag) {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#f5d76e';
                ctx.fillText('●', position.x + 13, position.y - 20);
            }
        });
    }

    updateNPCs() {
        const now = performance.now();
        const dt = this._lastNpcUpdate ? (now - this._lastNpcUpdate) : 16;
        this._lastNpcUpdate = now;
        const map = this.maps[this.currentMap];
        if (!map || !map.npcs) return;

        // 会話・オープニング・メッセージ表示中は NPC の徘徊を停止
        // （NPCがプレイヤーに寄ってきて詰まるのを防ぐ）
        const paused = (
            (typeof window !== 'undefined' && window.storyEventSystem && window.storyEventSystem.isEventPlaying) ||
            (typeof window !== 'undefined' && window.openingTypewriterActive) ||
            (typeof window !== 'undefined' && window.isMessageShown === true) ||
            (typeof isMessageShown !== 'undefined' && isMessageShown === true)
        );
        if (paused) {
            map.npcs.forEach(npc => { npc.isMoving = false; });
            return;
        }

        map.npcs.forEach(npc => {
            if (!this.isMapPositionWalkable(map, npc.x, npc.y, 22)) {
                const corrected = this.findNearestWalkablePoint(map, npc.x, npc.y, 22);
                npc.x = corrected.x;
                npc.y = corrected.y;
                npc.originX = corrected.x;
                npc.originY = corrected.y;
            }

            if (!npc.wanderRadius || npc.static) {
                npc.isMoving = false;
                return;
            }

            const t = now * npc.wanderSpeed + npc.wanderPhase;
            const candidateX = npc.originX + Math.sin(t) * npc.wanderRadius;
            const candidateY = npc.originY + Math.cos(t * 0.72) * npc.wanderRadius * 0.45;
            const oldX = npc.x;
            const oldY = npc.y;

            // 可動域チェック: 候補位置が歩行可能かつ建物・collision矩形に重ならない場合のみ移動
            if (this.isMapPositionWalkable(map, candidateX, candidateY, 22)) {
                npc.x = candidateX;
                npc.y = candidateY;
            } else if (this.isMapPositionWalkable(map, npc.originX, npc.originY, 22)) {
                // 候補が不可なら原点へ寄せる（原点が可動域内の場合）
                npc.x = npc.originX;
                npc.y = npc.originY;
            } else {
                const corrected = this.findNearestWalkablePoint(map, npc.originX, npc.originY, 22);
                npc.x = corrected.x;
                npc.y = corrected.y;
                npc.originX = corrected.x;
                npc.originY = corrected.y;
            }

            const dx = npc.x - oldX;
            const dy = npc.y - oldY;
            npc.isMoving = Math.hypot(dx, dy) > 0.2;
            this.updateFacingFromDelta(npc, dx, dy);
            if (npc.isMoving) { npc.animTime = (npc.animTime || 0) + dt; }
        });
    }

    constrainMapNPCsToWalkable(map) {
        if (!map || !map.npcs || !map.walkableRects || map.walkableRects.length === 0) return;

        map.npcs.forEach(npc => {
            if (this.isMapPositionWalkable(map, npc.x, npc.y, 22)) {
                npc.originX = npc.originX ?? npc.x;
                npc.originY = npc.originY ?? npc.y;
                return;
            }

            const corrected = this.findNearestWalkablePoint(map, npc.x, npc.y, 22);
            npc.x = corrected.x;
            npc.y = corrected.y;
            npc.originX = corrected.x;
            npc.originY = corrected.y;
        });
    }

    // 指定座標がwalkableRects内かつcollision矩形に重ならないかを判定
    isPositionWalkable(x, y, size = 24) {
        const map = this.maps[this.currentMap];
        return this.isMapPositionWalkable(map, x, y, size);
    }

    isPointInsideRect(x, y, rect) {
        return (
            x >= rect.x &&
            x <= rect.x + rect.width &&
            y >= rect.y &&
            y <= rect.y + rect.height
        );
    }

    isBoxCoveredByWalkableRects(box, walkableRects) {
        if (!walkableRects || walkableRects.length === 0) return true;

        const centerX = (box.left + box.right) / 2;
        const centerY = (box.top + box.bottom) / 2;
        const points = [
            { x: centerX, y: centerY },
            { x: box.left, y: box.top },
            { x: box.right, y: box.top },
            { x: box.left, y: box.bottom },
            { x: box.right, y: box.bottom },
            { x: centerX, y: box.top },
            { x: centerX, y: box.bottom },
            { x: box.left, y: centerY },
            { x: box.right, y: centerY }
        ];

        return points.every(point => (
            walkableRects.some(rect => this.isPointInsideRect(point.x, point.y, rect))
        ));
    }

    isMapPositionWalkable(map, x, y, size = 24) {
        if (!map) return false;

        const radius = size / 2;
        const box = {
            left: x - radius,
            right: x + radius,
            top: y - radius,
            bottom: y + radius
        };

        if (map.walkableRects && map.walkableRects.length > 0) {
            if (!this.isBoxCoveredByWalkableRects(box, map.walkableRects)) return false;
        }

        if (map.buildings) {
            for (const b of map.buildings) {
                if (
                    box.right > b.x &&
                    box.left < b.x + b.width &&
                    box.bottom > b.y &&
                    box.top < b.y + b.height
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    findNearestWalkablePoint(map, x, y, size = 24) {
        if (!map || !map.walkableRects || map.walkableRects.length === 0) return { x, y };

        const radius = size / 2;
        const candidates = [];

        map.walkableRects.forEach(rect => {
            const minX = rect.x + radius;
            const maxX = rect.x + rect.width - radius;
            const minY = rect.y + radius;
            const maxY = rect.y + rect.height - radius;
            if (minX > maxX || minY > maxY) return;

            const clamped = {
                x: Math.max(minX, Math.min(maxX, x)),
                y: Math.max(minY, Math.min(maxY, y))
            };
            candidates.push(clamped);
            candidates.push({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
        });

        let best = { x, y };
        let bestDistance = Infinity;

        candidates.forEach(candidate => {
            if (!this.isMapPositionWalkable(map, candidate.x, candidate.y, size)) return;
            const distance = Math.hypot(candidate.x - x, candidate.y - y);
            if (distance < bestDistance) {
                best = candidate;
                bestDistance = distance;
            }
        });

        return {
            x: Math.round(best.x),
            y: Math.round(best.y)
        };
    }

    isPointInsideExit(map, x, y, includeHidden = true) {
        if (!map || !map.exits) return false;
        return map.exits.some(exit => {
            if (!includeHidden && exit.visible === false) return false;
            return (
                x >= exit.x &&
                x <= exit.x + exit.width &&
                y >= exit.y &&
                y <= exit.y + exit.height
            );
        });
    }

    isSafeSpawnPoint(map, x, y, size = 24) {
        return this.isMapPositionWalkable(map, x, y, size) && !this.isPointInsideExit(map, x, y, true);
    }

    findSafeSpawnPoint(map, x, y, size = 24) {
        if (!map) return { x, y };
        if (this.isSafeSpawnPoint(map, x, y, size)) {
            return { x: Math.round(x), y: Math.round(y) };
        }

        const radius = size / 2;
        const candidates = [
            { x, y },
            this.findNearestWalkablePoint(map, x, y, size)
        ];

        (map.exits || []).forEach(exit => {
            const centerX = exit.x + exit.width / 2;
            const centerY = exit.y + exit.height / 2;
            const margin = Math.max(36, size + 12);
            candidates.push(
                { x: centerX, y: exit.y - margin },
                { x: centerX, y: exit.y + exit.height + margin },
                { x: exit.x - margin, y: centerY },
                { x: exit.x + exit.width + margin, y: centerY }
            );
        });

        [36, 64, 96, 140, 180].forEach(offset => {
            candidates.push(
                { x: x + offset, y },
                { x: x - offset, y },
                { x, y: y + offset },
                { x, y: y - offset },
                { x: x + offset, y: y + offset },
                { x: x - offset, y: y + offset },
                { x: x + offset, y: y - offset },
                { x: x - offset, y: y - offset }
            );
        });

        (map.walkableRects || []).forEach(rect => {
            const minX = rect.x + radius;
            const maxX = rect.x + rect.width - radius;
            const minY = rect.y + radius;
            const maxY = rect.y + rect.height - radius;
            if (minX > maxX || minY > maxY) return;
            candidates.push(
                { x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) },
                { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
            );
        });

        let best = null;
        let bestDistance = Infinity;
        candidates.forEach(candidate => {
            if (!candidate) return;
            if (!this.isSafeSpawnPoint(map, candidate.x, candidate.y, size)) return;
            const distance = Math.hypot(candidate.x - x, candidate.y - y);
            if (distance < bestDistance) {
                best = candidate;
                bestDistance = distance;
            }
        });

        if (best) {
            return { x: Math.round(best.x), y: Math.round(best.y) };
        }

        const nearest = this.findNearestWalkablePoint(map, x, y, size);
        return { x: Math.round(nearest.x), y: Math.round(nearest.y) };
    }

    getNow() {
        return (typeof performance !== 'undefined' && typeof performance.now === 'function')
            ? performance.now()
            : Date.now();
    }

    startTransitionCooldown(ms = this.transitionCooldownMs) {
        this.transitionCooldownUntil = Math.max(this.transitionCooldownUntil || 0, this.getNow() + ms);
    }

    isTransitionCoolingDown() {
        return this.getNow() < (this.transitionCooldownUntil || 0);
    }
    
    // マップ遷移チェック
    checkMapTransition(playerX, playerY, playerFacing = null) {
        const map = this.maps[this.currentMap];
        if (!map || this.transitioning || this.isTransitionCoolingDown()) return null;

        for (const exit of (map.exits || [])) {
            if (exit.visible === false && !exit.autoEnter) continue;

            // 方向制限付きの出口（建物入口など）はプレイヤーの向きが一致する時だけ反応
            if (exit.requireFacing && playerFacing && exit.requireFacing !== playerFacing) continue;

            if (playerX >= exit.x && playerX <= exit.x + exit.width &&
                playerY >= exit.y && playerY <= exit.y + exit.height) {
                
                // ロックチェック
                if (exit.locked) {
                    return { locked: true, requirement: exit.requirement, message: `${exit.requirement}が必要です` };
                }
                
                return { nextMap: this.normalizeMapId(exit.to), exit: exit };
            }
        }
        
        return null;
    }

    checkMapEntranceInteraction(playerX, playerY) {
        const map = this.maps[this.currentMap];
        if (!map || !map.exits || this.transitioning || this.isTransitionCoolingDown()) return null;

        // worldScale(1.55等)のマップでは入口ボックスも拡大される為、Z判定半径も同率で拡大する。
        // （拡大しないと退出スポーンが入口中心から ~47px 離れ、固定34pxでは再入店できない）
        const rangeScale = (map.worldScale && map.worldScale > 0) ? map.worldScale : 1;
        const interactionRange = 34 * rangeScale;

        for (const exit of map.exits) {
            if (exit.visible !== false) continue;

            const centerX = exit.x + exit.width / 2;
            const centerY = exit.y + exit.height / 2;
            const distance = Math.sqrt(
                Math.pow(playerX - centerX, 2) +
                Math.pow(playerY - centerY, 2)
            );

            if (distance < interactionRange || (
                playerX >= exit.x && playerX <= exit.x + exit.width &&
                playerY >= exit.y && playerY <= exit.y + exit.height
            )) {
                return { nextMap: this.normalizeMapId(exit.to), exit };
            }
        }

        return null;
    }
    
    // 前方の自動入口チェック（向いている方向の少し先に autoEnter 出口があれば返す）
    // 建物コリジョンで入口ボックス手前が塞がれていても、ドアに向かって歩けば入れるようにする。
    // 方向ベースなので、入口の脇を素通りしても誤発火しない。
    checkAutoEnterAhead(playerX, playerY, facing, reach = 22) {
        const map = this.maps[this.currentMap];
        if (!map || !map.exits || this.transitioning || this.isTransitionCoolingDown()) return null;

        const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
        const d = dirs[facing];
        if (!d) return null;

        const px = playerX + d[0] * reach;
        const py = playerY + d[1] * reach;

        for (const exit of map.exits) {
            if (!exit.autoEnter) continue;          // 自動入口のみ対象（街の端の出口は対象外）
            if (exit.requireFacing && exit.requireFacing !== facing) continue;
            if (px >= exit.x && px <= exit.x + exit.width &&
                py >= exit.y && py <= exit.y + exit.height) {
                if (exit.locked) {
                    return { locked: true, requirement: exit.requirement, message: `${exit.requirement}が必要です` };
                }
                return { nextMap: this.normalizeMapId(exit.to), exit };
            }
        }

        return null;
    }

    // マップ遷移実行
    transitionToMap(mapId) {
        mapId = this.normalizeMapId(mapId);
        if (!this.maps[mapId]) return false;

        // 遷移元マップを記録（getSpawnPoint で「戻り先の入口」を特定する為。
        // currentMap は下の setTimeout 内で書き換わり、getSpawnPoint 実行時には
        // 既に遷移先になっている為、ここで控える）
        this.previousMap = this.currentMap;

        this.loadMapImage(mapId);
        this.preloadSpriteImages(mapId);
        
        this.transitioning = true;
        this.startTransitionCooldown();
        
        // フェードアウト効果
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.opacity = '0';
            
            setTimeout(() => {
                this.currentMap = mapId;
                canvas.style.opacity = '1';
                this.transitioning = false;
                this.startTransitionCooldown();

                // マップ名表示
                this.showMapName();

                // BGM切り替え（新しいBGMシステムを使用）
                const newMap = this.maps[mapId];
                if (newMap && newMap.bgm && window.bgmSystem) {
                    // フィールドBGM切り替えメソッドを使用（適切なフラグ管理）
                    window.bgmSystem.changeFieldBGM(newMap.bgm);
                } else if (newMap && !newMap.bgm) {
                    console.log(`[Map] No BGM defined for map: ${newMap.name}`);
                }

                // デバッグ: 遷移完了
                console.log(`Map transition completed! New map: ${this.currentMap}`);
                setTimeout(() => this.preloadAdjacentMapImages(mapId), 250);
            }, 300);
        } else {
            this.currentMap = mapId;
            this.transitioning = false;
            this.startTransitionCooldown();
            setTimeout(() => this.preloadAdjacentMapImages(mapId), 250);
        }
        
        return true;
    }
    
    // マップ名表示
    showMapName() {
        const map = this.maps[this.currentMap];
        if (!map) return;
        
        const messageBox = document.getElementById('messageBox');
        if (messageBox) {
            messageBox.textContent = `${map.name}に 入った`;
            
            setTimeout(() => {
                messageBox.textContent = '';
            }, 2000);
        }
    }
    
    // NPC対話チェック
    checkNPCInteraction(playerX, playerY) {
        const map = this.maps[this.currentMap];
        if (!map || !map.npcs) return null;
        
        const interactionRange = 50;
        
        for (const npc of map.npcs) {
            const distance = Math.sqrt(
                Math.pow(playerX - npc.x, 2) + 
                Math.pow(playerY - npc.y, 2)
            );
            
            if (distance < interactionRange) {
                return npc;
            }
        }
        
        return null;
    }
    
    // エンカウント率取得
    getEncounterRate() {
        const map = this.maps[this.currentMap];
        if (!map) return 'medium';
        
        return map.encounterRate || 'medium';
    }
    
    // 現在のエリア取得
    getCurrentArea() {
        const map = this.maps[this.currentMap];
        if (!map) return 'city';
        
        return map.area || 'city';
    }
    
    // 衝突判定（建物）
    checkBuildingCollision(x, y, playerSize = 24) {
        const map = this.maps[this.currentMap];
        if (!map) return false;

        const playerRadius = playerSize / 2;
        const playerBox = {
            left: x - playerRadius,
            right: x + playerRadius,
            top: y - playerRadius,
            bottom: y + playerRadius
        };

        const inExit = (map.exits || []).some(exit => this.isPointInsideRect(x, y, exit));
        if (inExit) {
            return false; // 出口は通行可能
        }

        if (map.walkableRects && map.walkableRects.length > 0) {
            if (!this.isBoxCoveredByWalkableRects(playerBox, map.walkableRects)) {
                return true; // 歩行可能領域外
            }
        }

        // 建物 / 障害物の衝突は引き続きボックス判定
        for (const building of (map.buildings || [])) {
            const bLeft = building.x;
            const bRight = building.x + building.width;
            const bTop = building.y;
            const bBottom = building.y + building.height;

            if (playerBox.right > bLeft && playerBox.left < bRight && playerBox.bottom > bTop && playerBox.top < bBottom) {
                return true;
            }
        }

        return false;
    }
    
    // 衝突判定（NPC）
    // oldX/oldY を渡すと「現在NPCと重なっている場合は離れる方向への移動を許可」
    // ＝NPCに挟まれて詰まる事を防ぐ「逃げモード」
    checkNPCCollision(x, y, playerSize = 24, oldX = null, oldY = null) {
        const map = this.maps[this.currentMap];
        if (!map || !map.npcs) return false;

        const playerRadius = playerSize / 2;
        const npcRadius = 14; // NPC衝突半径を縮小（旧20で詰まりやすかった）
        const threshold = playerRadius + npcRadius;
        const useEscapeMode = oldX !== null && oldY !== null;

        for (const npc of map.npcs) {
            const newDist = Math.hypot(x - npc.x, y - npc.y);
            if (newDist >= threshold) continue;

            if (useEscapeMode) {
                const oldDist = Math.hypot(oldX - npc.x, oldY - npc.y);
                // 既にNPCに重なっている場合、「離れる動き」なら許可
                if (oldDist < threshold && newDist >= oldDist) {
                    continue;
                }
            }
            return true;
        }

        return false;
    }
    
    // 総合衝突判定
    checkCollision(x, y, playerSize = 24, oldX = null, oldY = null) {
        return this.checkBuildingCollision(x, y, playerSize) ||
               this.checkNPCCollision(x, y, playerSize, oldX, oldY);
    }
    
    // 宝箱チェック
    checkTreasureInteraction(playerX, playerY) {
        const map = this.maps[this.currentMap];
        if (!map || !map.treasures) return null;
        
        const interactionRange = 40;
        
        for (const treasure of map.treasures) {
            if (treasure.opened) continue;
            
            const distance = Math.sqrt(
                Math.pow(playerX - treasure.x, 2) + 
                Math.pow(playerY - treasure.y, 2)
            );
            
            if (distance < interactionRange) {
                return treasure;
            }
        }
        
        return null;
    }
    
    // 宝箱を開く
    openTreasure(treasure) {
        if (treasure && !treasure.opened) {
            treasure.opened = true;
            return treasure.item;
        }
        return null;
    }
}

// ==========================================
// ショップシステム (Shop System)
// ==========================================

class ShopSystem {
    constructor() {
        // 装備システムとアイテムシステムのデータを参照
        this.selectedItemIndex = 0;
        this.shopItems = [];
        this.currentShopkeeper = null;
        this.shopData = {
            weapons: [
                { id: 'wooden_sword', equipmentId: 'wooden_sword' },
                { id: 'iron_sword', equipmentId: 'iron_sword' },
                { id: 'plasma_blade', equipmentId: 'plasma_blade' },
                { id: 'cyber_gun', equipmentId: 'cyber_gun' },
                { id: 'kamui_katana', equipmentId: 'kamui_katana' }
            ],
            armor: [
                { id: 'cloth_armor', equipmentId: 'cloth_armor' },
                { id: 'leather_armor', equipmentId: 'leather_armor' },
                { id: 'chain_mail', equipmentId: 'chain_mail' },
                { id: 'cloth_hat', equipmentId: 'cloth_hat' },
                { id: 'iron_helmet', equipmentId: 'iron_helmet' },
                { id: 'cyber_helmet', equipmentId: 'cyber_helmet' },
                { id: 'cloth_gloves', equipmentId: 'cloth_gloves' },
                { id: 'iron_gauntlets', equipmentId: 'iron_gauntlets' },
                { id: 'power_gloves', equipmentId: 'power_gloves' },
                { id: 'health_ring', equipmentId: 'health_ring' },
                { id: 'power_ring', equipmentId: 'power_ring' },
                { id: 'defense_ring', equipmentId: 'defense_ring' },
                { id: 'mana_amulet', equipmentId: 'mana_amulet' },
                { id: 'kamui_talisman', equipmentId: 'kamui_talisman' }
            ],
            items: [
                { id: 'heal_potion', itemId: 'heal_potion' },
                { id: 'mega_heal_potion', itemId: 'mega_heal_potion' },
                { id: 'full_heal_potion', itemId: 'full_heal_potion' },
                { id: 'energy_core', itemId: 'energy_core' },
                { id: 'mega_energy_core', itemId: 'mega_energy_core' },
                { id: 'elixir', itemId: 'elixir' },
                { id: 'attack_boost', itemId: 'attack_boost' },
                { id: 'defense_boost', itemId: 'defense_boost' },
                { id: 'speed_boost', itemId: 'speed_boost' },
                { id: 'escape_rope', itemId: 'escape_rope' }
            ],
            magic: [
                { id: 'heal', magicId: 'heal' },
                { id: 'fire_bolt', magicId: 'fire_bolt' },
                { id: 'protect', magicId: 'protect' },
                { id: 'ice_lance', magicId: 'ice_lance' },
                { id: 'haste', magicId: 'haste' },
                { id: 'mega_heal', magicId: 'mega_heal' },
                { id: 'thunder_strike', magicId: 'thunder_strike' },
                { id: 'kamui_storm', magicId: 'kamui_storm' },
                { id: 'explosion', magicId: 'explosion' },
                { id: 'kamui_blessing', magicId: 'kamui_blessing' }
            ],
            black_market: [
                { id: 'cyber_gun', equipmentId: 'cyber_gun' },
                { id: 'cyber_suit', equipmentId: 'cyber_suit' },
                { id: 'kamui_katana', equipmentId: 'kamui_katana' },
                { id: 'kamui_talisman', equipmentId: 'kamui_talisman' },
                { id: 'elixir', itemId: 'elixir' },
                { id: 'kamui_storm', magicId: 'kamui_storm' },
                { id: 'kamui_blessing', magicId: 'kamui_blessing' }
            ]
        };
        
        this.currentShop = null;
        this.isShopOpen = false;
        this.commonShopItemsPerPage = 3;
        this.shopItemsPerPage = this.commonShopItemsPerPage;
    }
    
    // ショップアイテムの詳細情報を取得
    getItemDetails(shopType, itemIndex) {
        const list = this.shopData[shopType];
        if (!Array.isArray(list)) return null;
        const shopItem = list[itemIndex];
        if (!shopItem) return null;
        
        // 装備の場合
        if (shopItem.equipmentId && window.equipmentSystem) {
            const equipment = window.equipmentSystem.equipmentDatabase[shopItem.equipmentId];
            if (equipment) {
                return {
                    ...equipment,
                    isEquipment: true
                };
            }
        }
        
        // 魔法の場合
        if (shopItem.magicId && window.magicSystem) {
            const magic = window.magicSystem.magicDatabase[shopItem.magicId];
            if (magic) {
                const learned = window.magicSystem.hasLearned(shopItem.magicId, window.player);
                return {
                    ...magic,
                    isMagic: true,
                    alreadyLearned: learned
                };
            }
        }
        
        // アイテムの場合
        if (shopItem.itemId && window.itemSystem) {
            const item = window.itemSystem.itemDatabase[shopItem.itemId];
            if (item) {
                return {
                    ...item,
                    isItem: true
                };
            }
        }
        
        return null;
    }
    
    // ショップを開く
    openShop(shopType, shopkeeper) {
        const supportedTypes = [...Object.keys(this.shopData), 'inn'];
        if (!supportedTypes.includes(shopType)) {
            const name = shopkeeper && shopkeeper.name ? shopkeeper.name : '?';
            const dialogue = shopkeeper && shopkeeper.dialogue ? shopkeeper.dialogue : '...';
            if (typeof window.showMessage === 'function') {
                window.showMessage(`${name}: 「${dialogue}」`);
            } else {
                console.log(`[Shop] ${name}: ${dialogue} (shopType '${shopType}' は未実装)`);
            }
            return;
        }
        this.currentShop = shopType;
        this.currentShopkeeper = shopkeeper;
        this.isShopOpen = true;
        this.selectedItemIndex = 0;
        this.showShopUI(shopType, shopkeeper);
    }
    
    // ショップUIを表示
    showShopUI(shopType, shopkeeper) {
        // 既存のショップUIを削除
        const existing = document.getElementById('shopUI');
        if (existing) {
            existing.remove();
        }

        // 宿屋は別UI
        if (shopType === 'inn') {
            this.showInnUI(shopkeeper);
            return;
        }

        const titleMap = {
            weapons: '🗡️ 武器店',
            armor: '🛡️ 防具店',
            items: '🧪 道具店',
            magic: '🔮 魔法店',
            black_market: '🕶️ 闇市'
        };
        const shopTitle = titleMap[shopType] || '🏪 一般店';

        const items = this.shopData[shopType] || this.shopData.items;
        this.shopItems = items;
        this.shopItemsPerPage = this.commonShopItemsPerPage;
        this.shopType = shopType;
        this.shopTitle = shopTitle;
        this.shopkeeper = shopkeeper;
        this.selectedItemIndex = 0;

        // viewport にオーバーレイを追加
        const viewport = document.querySelector('.game-viewport');
        if (!viewport) {
            console.error('[ShopSystem] .game-viewport not found');
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'shopUI';
        overlay.className = 'shop-overlay';
        overlay.innerHTML = `
            <div class="shop-container shop-list-panel">
                <div class="shop-title" id="shopTitleEl"></div>
                <div class="shop-keeper-line" id="shopKeeperLine"></div>
                <div class="shop-meta">
                    <span class="shop-gold">所持: <span id="shopPlayerGold">0</span> G</span>
                    <span class="shop-page-indicator" id="shopPageIndicator">1 / 1</span>
                </div>
                <div class="shop-items" id="shopItems"></div>
                <div class="shop-hint">↑↓ 選択 / ←→ ページ切替 / Z 購入 / X 閉じる</div>
            </div>
        `;
        viewport.appendChild(overlay);

        this.renderShopUI();
        this.setupShopKeyboard();
    }

    // ショップUI内容を再描画（ページ切替やステート反映）
    renderShopUI() {
        const overlay = document.getElementById('shopUI');
        if (!overlay) return;

        // 宿屋モードは別レンダラ
        if (this.shopType === 'inn') {
            this.renderInnUI();
            return;
        }

        const titleEl = overlay.querySelector('#shopTitleEl');
        const keeperEl = overlay.querySelector('#shopKeeperLine');
        const goldEl = overlay.querySelector('#shopPlayerGold');
        const pageEl = overlay.querySelector('#shopPageIndicator');
        const itemsEl = overlay.querySelector('#shopItems');
        if (!titleEl || !keeperEl || !goldEl || !pageEl || !itemsEl) return;

        if (titleEl) titleEl.textContent = this.shopTitle || '';
        if (keeperEl) {
            const dialogue = (this.shopkeeper && this.shopkeeper.dialogue) || '';
            keeperEl.textContent = dialogue ? `「${dialogue}」` : '';
        }
        if (goldEl) goldEl.textContent = window.player ? window.player.gold : 0;

        const items = this.shopItems || [];
        const perPage = this.shopItemsPerPage || this.commonShopItemsPerPage || 3;
        const totalPages = Math.max(1, Math.ceil(items.length / perPage));
        const currentPage = Math.floor(this.selectedItemIndex / perPage);
        if (pageEl) pageEl.textContent = `${currentPage + 1} / ${totalPages}`;

        itemsEl.innerHTML = '';
        const start = currentPage * perPage;
        const end = Math.min(items.length, start + perPage);
        for (let i = start; i < end; i++) {
            const details = this.getItemDetails(this.shopType, i);
            if (!details) {
                continue;
            }

            let statsText = '';
            if (details.attack > 0) statsText += ` 攻+${details.attack}`;
            if (details.defense > 0) statsText += ` 防+${details.defense}`;
            if (details.hp > 0) statsText += ` HP+${details.hp}`;
            if (details.mp > 0) statsText += ` MP+${details.mp}`;

            const levelReq = details.requiredLevel ? ` (Lv.${details.requiredLevel}〜)` : '';
            const emoji = details.emoji || '';
            const name = details.name || '';
            const desc = (details.description || '') + statsText;

            const entry = document.createElement('div');
            entry.className = 'shop-item-entry' + (i === this.selectedItemIndex ? ' selected' : '');

            // 所持金不足/レベル不足は淡く
            const player = window.player;
            const cantAfford = player && player.gold < (details.price || 0);
            const lvLocked = player && details.requiredLevel && player.level < details.requiredLevel;
            const alreadyLearned = details.alreadyLearned;
            if (cantAfford || lvLocked || alreadyLearned) {
                entry.classList.add('disabled');
            }

            entry.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-name">${emoji} ${name}${levelReq}${alreadyLearned ? ' (習得済み)' : ''}</div>
                    <div class="shop-item-desc">${desc}</div>
                </div>
                <div class="shop-item-price">${details.price || 0} G</div>
            `;
            itemsEl.appendChild(entry);
        }

        // ページに足りない分は空行で埋め、レイアウトを安定させる
        const filled = end - start;
        for (let k = filled; k < perPage; k++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'shop-item-entry shop-empty-row';
            placeholder.style.visibility = 'hidden';
            itemsEl.appendChild(placeholder);
        }
    }

    // キーボード操作のセットアップ
    setupShopKeyboard() {
        if (this.shopKeyHandler) {
            document.removeEventListener('keydown', this.shopKeyHandler, true);
        }
        this.shopKeyHandler = (e) => {
            this.handleKeyboardInput(e);
        };

        document.addEventListener('keydown', this.shopKeyHandler, true);
    }

    handleKeyboardInput(e) {
        if (!this.isShopOpen) return;

        e.preventDefault();
        if (typeof e.stopImmediatePropagation === 'function') {
            e.stopImmediatePropagation();
        } else if (typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }

        const items = this.shopItems || [];
        const perPage = this.shopItemsPerPage || this.commonShopItemsPerPage || 3;

        if (this.shopType === 'inn') {
            // 宿屋: 左右で 宿泊/やめる、Enter/Z/Space で決定
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                this.innSelectedOption = (this.innSelectedOption === 0) ? 1 : 0;
                this.renderShopUI();
                return;
            }
            if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z' || e.key === ' ') {
                if (this.innSelectedOption === 0) {
                    this.stayAtInn();
                } else {
                    this.closeShop();
                }
                return;
            }
            if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
                this.closeShop();
            }
            return;
        }

        if (e.key === 'ArrowUp') {
            if (items.length === 0) return;
            this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
            this.renderShopUI();
        } else if (e.key === 'ArrowDown') {
            if (items.length === 0) return;
            this.selectedItemIndex = Math.min(items.length - 1, this.selectedItemIndex + 1);
            this.renderShopUI();
        } else if (e.key === 'ArrowLeft') {
            if (items.length === 0) return;
            const currentPage = Math.floor(this.selectedItemIndex / perPage);
            if (currentPage > 0) {
                this.selectedItemIndex = Math.max(0, (currentPage - 1) * perPage);
                this.renderShopUI();
            }
        } else if (e.key === 'ArrowRight') {
            if (items.length === 0) return;
            const currentPage = Math.floor(this.selectedItemIndex / perPage);
            const totalPages = Math.max(1, Math.ceil(items.length / perPage));
            if (currentPage < totalPages - 1) {
                this.selectedItemIndex = Math.min(items.length - 1, (currentPage + 1) * perPage);
                this.renderShopUI();
            }
        } else if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z' || e.key === ' ') {
            this.buyItem(this.shopType, this.selectedItemIndex);
        } else if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
            this.closeShop();
        }
    }

    // 宿屋UI（在 viewport）
    showInnUI(shopkeeper) {
        const existing = document.getElementById('shopUI');
        if (existing) existing.remove();

        const viewport = document.querySelector('.game-viewport');
        if (!viewport) {
            console.error('[ShopSystem] .game-viewport not found');
            return;
        }

        this.shopType = 'inn';
        this.shopkeeper = shopkeeper;
        this.innSelectedOption = 0; // 0: 宿泊, 1: やめる

        const overlay = document.createElement('div');
        overlay.id = 'shopUI';
        overlay.className = 'shop-overlay';
        overlay.innerHTML = `
            <div class="shop-container shop-inn-panel">
                <div class="shop-title" id="shopTitleEl">🏠 ${shopkeeper.name || ''}の宿屋</div>
                <div class="shop-keeper-line">「${shopkeeper.dialogue || ''}」</div>
                <div class="shop-inn-body">
                    <div>一晩 ぐっすり休みますか？</div>
                    <div class="shop-inn-price">50 G</div>
                    <div style="font-size:12px; color:#88aab8;">HP・MP が全回復します</div>
                </div>
                <div class="shop-inn-options" id="shopInnOptions"></div>
                <div class="shop-hint">←→ 選択 / Z 決定 / X 閉じる</div>
            </div>
        `;
        viewport.appendChild(overlay);

        this.isShopOpen = true;
        this.currentShopkeeper = shopkeeper;
        this.renderShopUI();
        this.setupShopKeyboard();
    }

    // 宿屋UIの内容更新
    renderInnUI() {
        const optionsEl = document.querySelector('#shopUI #shopInnOptions');
        if (!optionsEl) return;
        const labels = ['宿泊する (50 G)', 'やめる'];
        optionsEl.innerHTML = '';
        labels.forEach((text, idx) => {
            const btn = document.createElement('div');
            btn.className = 'shop-inn-option' + (idx === this.innSelectedOption ? ' selected' : '');
            btn.textContent = text;
            optionsEl.appendChild(btn);
        });
    }

    // アイテム購入
    buyItem(shopType, itemIndex) {
        const shopItem = this.shopData[shopType][itemIndex];
        const player = window.player;

        if (!player) {
            this.showShopNotice('プレイヤーが見つかりません');
            return;
        }

        const itemDetails = this.getItemDetails(shopType, itemIndex);
        if (!itemDetails) {
            this.showShopNotice('アイテム情報が見つかりません');
            return;
        }

        if (player.gold < itemDetails.price) {
            this.showShopNotice('ゴールドが足りません');
            return;
        }

        if (itemDetails.requiredLevel && player.level < itemDetails.requiredLevel) {
            this.showShopNotice(`レベル ${itemDetails.requiredLevel} 以上で購入可能です`);
            return;
        }

        let success = false;
        let message = '';

        if (shopItem.magicId && window.magicSystem) {
            const result = window.magicSystem.buyMagic(shopItem.magicId, player);
            if (!result.success) {
                this.showShopNotice(result.message);
                return;
            }
            success = true;
            message = result.message;
        } else if (shopItem.equipmentId && window.equipmentSystem) {
            player.gold -= itemDetails.price;
            window.equipmentSystem.addEquipment(shopItem.equipmentId, 1);
            success = true;
            message = `${itemDetails.name} を購入した！\n${itemDetails.price} G を支払った。`;
        } else if (shopItem.itemId && window.itemSystem) {
            player.gold -= itemDetails.price;
            window.itemSystem.addItem(shopItem.itemId, 1);
            success = true;
            message = `${itemDetails.name} を購入した！\n${itemDetails.price} G を支払った。`;
        } else {
            this.showShopNotice('購入システムに問題があります');
            return;
        }

        if (success) {
            this.showShopNotice(message);
            if (window.updateUI) window.updateUI();
            this.renderShopUI();
        }
    }

    // 宿屋に泊まる
    stayAtInn() {
        const player = window.player;
        if (player && player.gold < 50) {
            this.showShopNotice('ゴールドが足りません');
            return;
        }
        if (player) {
            player.gold -= 50;
            player.hp = player.maxHp;
            player.mp = player.maxMp;
            // パーティメンバー回復（party-system 互換）
            if (window.party && window.party.members) {
                window.party.members.forEach(m => {
                    if (m && typeof m === 'object') {
                        if (typeof m.hp !== 'undefined' && typeof m.maxHp !== 'undefined') m.hp = m.maxHp;
                        if (typeof m.mp !== 'undefined' && typeof m.maxMp !== 'undefined') m.mp = m.maxMp;
                    }
                });
            }
        }
        if (window.updateUI) window.updateUI();
        this.showShopNotice('ぐっすり眠った…\nHP・MP が全回復した！', () => {
            this.closeShop();
        });
    }

    // ショップ内に通知を表示（パネル流用 → 自動で閉じる）
    showShopNotice(text, onClose) {
        if (window.GameMessagePanel && typeof window.GameMessagePanel.showDescription === 'function') {
            const safe = String(text == null ? '' : text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');
            window.GameMessagePanel.showDescription(safe);
            // 1.6 秒後に自動で閉じる（ショップのキー入力と競合しないように）
            this.shopNoticeAutoCloseTimer = setTimeout(() => {
                if (window.GameMessagePanel && typeof window.GameMessagePanel.hide === 'function') {
                    window.GameMessagePanel.hide();
                }
                if (typeof onClose === 'function') onClose();
            }, 1600);
            return;
        }
        // フォールバック: viewport 内モーダル
        if (typeof window.showGameModal === 'function') {
            window.showGameModal({
                title: '',
                body: text,
                options: [{ label: 'OK', value: 'ok' }],
                onSelect: () => {
                    if (typeof onClose === 'function') onClose();
                }
            });
        }
    }

    // ショップを閉じる
    closeShop() {
        const shopUI = document.getElementById('shopUI');
        if (shopUI) {
            shopUI.remove();
        }
        if (this.shopKeyHandler) {
            document.removeEventListener('keydown', this.shopKeyHandler, true);
            this.shopKeyHandler = null;
        }
        if (this.shopNoticeAutoCloseTimer) {
            clearTimeout(this.shopNoticeAutoCloseTimer);
            this.shopNoticeAutoCloseTimer = null;
        }
        // 表示中のメッセージパネルも閉じる
        if (window.GameMessagePanel && typeof window.GameMessagePanel.hide === 'function') {
            window.GameMessagePanel.hide();
        }
        this.isShopOpen = false;
        this.currentShop = null;
        this.shopType = null;
        this.selectedItemIndex = 0;
        this.shopItems = [];
        this.shopkeeper = null;
        this.innSelectedOption = 0;
    }
}

// グローバルにエクスポート
window.MapSystem = MapSystem;
window.ShopSystem = ShopSystem;
window.gameShop = new ShopSystem();
