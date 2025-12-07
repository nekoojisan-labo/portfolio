// ==========================================
// マップシステム (Map System)
// ==========================================

class MapSystem {
    constructor() {
        this.currentMap = 'shinjuku_city';
        this.maps = {};
        this.tileSize = 32;
        this.mapWidth = 25;
        this.mapHeight = 19;
        
        // マップデータ定義
        this.initializeMaps();
        
        // デバッグ: 利用可能なマップをログ出力
        console.log('Available maps:', Object.keys(this.maps));
        
        // NPCとイベント
        this.npcs = [];
        this.events = [];
        
        // マップ遷移エフェクト
        this.transitioning = false;
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
                { x: 600, y: 300, emoji: '👨‍🔧', name: '闇商人', dialogue: '珍しい神器があるよ...高いけどね。', shop: true }
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
                { x: 112, y: 150, emoji: '🗡️', name: '武器商人リョウ', dialogue: 'いらっしゃい！最新の神器武器を取り揃えてるよ！', shop: true, shopType: 'weapons' },
                { x: 262, y: 150, emoji: '🛡️', name: '防具商人サクラ', dialogue: 'お疲れさま！丈夫な防具なら任せて！', shop: true, shopType: 'armor' },
                { x: 412, y: 150, emoji: '🧪', name: 'アイテム商人ユウキ', dialogue: 'ポーション、回復アイテム何でもあります！', shop: true, shopType: 'items' },
                { x: 562, y: 150, emoji: '🔮', name: '魔法商人ミコト', dialogue: '古の魔法アイテムを求めるなら...', shop: true, shopType: 'magic' },

                { x: 112, y: 350, emoji: '🏠', name: '宿屋の主人', dialogue: 'お疲れ様！ゆっくり休んでいってくださいな。', shop: true, shopType: 'inn' },
                { x: 262, y: 350, emoji: '💰', name: '銀行員', dialogue: 'お金の預入・引出しをどうぞ。', shop: true, shopType: 'bank' },
                { x: 562, y: 350, emoji: '⚔️', name: 'ギルドマスター', dialogue: 'クエストの受注・報告はこちらで。', shop: true, shopType: 'guild' },

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
            bgColor: '#1a2a1a',
            gridColor: '#2a3a2a',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'shop',
            buildings: [
                // カウンター
                { x: 300, y: 100, width: 200, height: 40, color: '#5a4a2a', borderColor: '#7a6a4a', type: 'counter' },
                // 武器陳列棚
                { x: 50, y: 50, width: 80, height: 120, color: '#3a3a2a', borderColor: '#5a5a4a', type: 'shelf' },
                { x: 670, y: 50, width: 80, height: 120, color: '#3a3a2a', borderColor: '#5a5a4a', type: 'shelf' },
                // 武器ラック
                { x: 150, y: 200, width: 60, height: 100, color: '#4a3a2a', borderColor: '#6a5a4a', type: 'weapon_rack' },
                { x: 590, y: 200, width: 60, height: 100, color: '#4a3a2a', borderColor: '#6a5a4a', type: 'weapon_rack' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'shopping_district', direction: 'south', spawnX: 112, spawnY: 180 }
            ],
            npcs: [
                { x: 400, y: 120, emoji: '🗡️', name: '武器商人リョウ', dialogue: 'いらっしゃい！最新の神器武器を取り揃えてるよ！', shop: true, shopType: 'weapons' }
            ]
        };

        // 防具店内
        this.maps.shop_armor = {
            name: '防具店 - サクラの店',
            bgColor: '#2a1a1a',
            gridColor: '#3a2a2a',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'shop',
            buildings: [
                { x: 300, y: 100, width: 200, height: 40, color: '#5a3a3a', borderColor: '#7a5a5a', type: 'counter' },
                { x: 50, y: 50, width: 100, height: 150, color: '#3a2a2a', borderColor: '#5a4a4a', type: 'armor_display' },
                { x: 650, y: 50, width: 100, height: 150, color: '#3a2a2a', borderColor: '#5a4a4a', type: 'armor_display' },
                { x: 200, y: 250, width: 80, height: 80, color: '#4a3a3a', borderColor: '#6a5a5a', type: 'mannequin' },
                { x: 520, y: 250, width: 80, height: 80, color: '#4a3a3a', borderColor: '#6a5a5a', type: 'mannequin' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'shopping_district', direction: 'south', spawnX: 262, spawnY: 180 }
            ],
            npcs: [
                { x: 400, y: 120, emoji: '🛡️', name: '防具商人サクラ', dialogue: 'お疲れさま！丈夫な防具なら任せて！', shop: true, shopType: 'armor' }
            ]
        };

        // 道具店内
        this.maps.shop_item = {
            name: '道具店 - ユウキの店',
            bgColor: '#1a1a2a',
            gridColor: '#2a2a3a',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'shop',
            buildings: [
                { x: 300, y: 100, width: 200, height: 40, color: '#3a3a5a', borderColor: '#5a5a7a', type: 'counter' },
                { x: 50, y: 80, width: 120, height: 200, color: '#2a2a4a', borderColor: '#4a4a6a', type: 'potion_shelf' },
                { x: 630, y: 80, width: 120, height: 200, color: '#2a2a4a', borderColor: '#4a4a6a', type: 'potion_shelf' },
                { x: 350, y: 250, width: 100, height: 60, color: '#3a3a4a', borderColor: '#5a5a6a', type: 'display_case' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'shopping_district', direction: 'south', spawnX: 412, spawnY: 180 }
            ],
            npcs: [
                { x: 400, y: 120, emoji: '🧪', name: 'アイテム商人ユウキ', dialogue: 'ポーション、回復アイテム何でもあります！', shop: true, shopType: 'items' }
            ]
        };

        // 魔法店内
        this.maps.shop_magic = {
            name: '魔法店 - ミコトの店',
            bgColor: '#2a1a2a',
            gridColor: '#3a2a3a',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'shop_magic',
            buildings: [
                { x: 300, y: 100, width: 200, height: 40, color: '#4a2a4a', borderColor: '#6a4a6a', type: 'counter' },
                { x: 100, y: 150, width: 80, height: 80, color: '#3a1a3a', borderColor: '#5a3a5a', type: 'crystal_ball' },
                { x: 620, y: 150, width: 80, height: 80, color: '#3a1a3a', borderColor: '#5a3a5a', type: 'magic_circle' },
                { x: 50, y: 50, width: 60, height: 100, color: '#2a1a2a', borderColor: '#4a3a4a', type: 'bookshelf' },
                { x: 690, y: 50, width: 60, height: 100, color: '#2a1a2a', borderColor: '#4a3a4a', type: 'bookshelf' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'shopping_district', direction: 'south', spawnX: 562, spawnY: 180 }
            ],
            npcs: [
                { x: 400, y: 120, emoji: '🔮', name: '魔法商人ミコト', dialogue: '古の魔法アイテムを求めるなら...', shop: true, shopType: 'magic' }
            ]
        };

        // 宿屋内
        this.maps.shop_inn = {
            name: '宿屋 - やすらぎの宿',
            bgColor: '#2a2a1a',
            gridColor: '#3a3a2a',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'inn',
            buildings: [
                { x: 300, y: 80, width: 200, height: 40, color: '#5a4a3a', borderColor: '#7a6a5a', type: 'reception' },
                { x: 50, y: 150, width: 120, height: 100, color: '#4a3a2a', borderColor: '#6a5a4a', type: 'bed' },
                { x: 630, y: 150, width: 120, height: 100, color: '#4a3a2a', borderColor: '#6a5a4a', type: 'bed' },
                { x: 350, y: 280, width: 100, height: 80, color: '#3a3a2a', borderColor: '#5a5a4a', type: 'table' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'shopping_district', direction: 'south', spawnX: 112, spawnY: 380 }
            ],
            npcs: [
                { x: 400, y: 100, emoji: '🏠', name: '宿屋の主人', dialogue: 'お疲れ様！ゆっくり休んでいってくださいな。', shop: true, shopType: 'inn' }
            ],
            savePoint: { x: 400, y: 350, emoji: '🛏️', name: 'ベッド' }
        };

        // ギルド内
        this.maps.shop_guild = {
            name: '冒険者ギルド',
            bgColor: '#1a1a1a',
            gridColor: '#2a2a2a',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'guild',
            buildings: [
                { x: 250, y: 80, width: 300, height: 50, color: '#4a4a4a', borderColor: '#6a6a6a', type: 'guild_counter' },
                { x: 50, y: 150, width: 100, height: 150, color: '#3a3a3a', borderColor: '#5a5a5a', type: 'quest_board' },
                { x: 650, y: 150, width: 100, height: 150, color: '#3a3a3a', borderColor: '#5a5a5a', type: 'ranking_board' },
                { x: 300, y: 280, width: 200, height: 80, color: '#2a2a2a', borderColor: '#4a4a4a', type: 'lounge_table' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'shopping_district', direction: 'south', spawnX: 562, spawnY: 380 }
            ],
            npcs: [
                { x: 400, y: 100, emoji: '⚔️', name: 'ギルドマスター', dialogue: 'クエストの受注・報告はこちらで。', shop: true, shopType: 'guild' },
                { x: 200, y: 320, emoji: '🧝', name: '冒険者A', dialogue: '最近、地下ダンジョンが活発だって噂だぜ。' },
                { x: 600, y: 320, emoji: '🧙', name: '冒険者B', dialogue: '神威の力...伝説だと思っていたが...' }
            ]
        };

        // 銀行内
        this.maps.shop_bank = {
            name: '新宿中央銀行',
            bgColor: '#1a1a2a',
            gridColor: '#2a2a3a',
            encounterRate: 'none',
            area: 'shop',
            bgm: 'bank',
            buildings: [
                { x: 200, y: 80, width: 400, height: 50, color: '#3a3a5a', borderColor: '#5a5a7a', type: 'bank_counter' },
                { x: 50, y: 200, width: 80, height: 120, color: '#2a2a4a', borderColor: '#4a4a6a', type: 'atm' },
                { x: 670, y: 200, width: 80, height: 120, color: '#2a2a4a', borderColor: '#4a4a6a', type: 'atm' },
                { x: 350, y: 300, width: 100, height: 60, color: '#4a4a5a', borderColor: '#6a6a7a', type: 'vault_door' }
            ],
            exits: [
                { x: 350, y: 410, width: 100, height: 20, to: 'shopping_district', direction: 'south', spawnX: 262, spawnY: 380 }
            ],
            npcs: [
                { x: 400, y: 100, emoji: '💰', name: '銀行員', dialogue: 'お金の預入・引出しをどうぞ。', shop: true, shopType: 'bank' }
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
                { x: 350, y: 410, width: 100, height: 20, to: 'residential_area', direction: 'south', spawnX: 155, spawnY: 180 }
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
        
        // グリッド
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
        
        // 建物・オブジェクト
        map.buildings.forEach(building => {
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
        
        // 出口マーカー（方向表示のみ）
        map.exits.forEach(exit => {
            // 出口エリアのハイライト（控えめに）
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(exit.x, exit.y, exit.width, exit.height);

            // 矢印表示（大きく見やすく）
            ctx.font = '24px Arial';
            ctx.fillStyle = '#00ffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 方向に応じた矢印表示
            if (exit.direction === 'north' || exit.y <= 20) {
                ctx.fillText('↑', exit.x + exit.width/2, exit.y + 15);
            } else if (exit.direction === 'south' || exit.y >= 390) {
                ctx.fillText('↓', exit.x + exit.width/2, exit.y + 10);
            } else if (exit.direction === 'west' || exit.x <= 30) {
                ctx.fillText('←', exit.x + 15, exit.y + exit.height/2);
            } else if (exit.direction === 'east' || exit.x >= 760) {
                ctx.fillText('→', exit.x + 15, exit.y + exit.height/2);
            }
        });
        
        // セーブポイント
        if (map.savePoint) {
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(map.savePoint.emoji, map.savePoint.x, map.savePoint.y);
            
            // 光るエフェクト
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(map.savePoint.x, map.savePoint.y - 10, 20, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // NPCを描画
    drawNPCs(ctx, storyFlags) {
        const map = this.maps[this.currentMap];
        if (!map || !map.npcs) return;

        map.npcs.forEach(npc => {
            // NPCスプライト
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(npc.emoji, npc.x, npc.y);

            // 名前表示
            ctx.font = '10px Courier New';
            ctx.fillStyle = npc.hostile ? '#ff4444' : (npc.shop ? '#44ff44' : '#ffffff');
            ctx.fillText(npc.name, npc.x, npc.y + 20);

            // クエストマーカー表示（ストーリーNPC用）
            if (npc.questFlag && storyFlags) {
                // フラグが立っていない場合、クエストマーカーを表示
                if (!storyFlags[npc.questFlag]) {
                    ctx.font = '16px Arial';
                    ctx.fillStyle = '#ffff00';
                    ctx.fillText('！', npc.x - 20, npc.y - 15);

                    // 光るエフェクト
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(npc.x - 20, npc.y - 20, 10, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // ショップマーク表示
            if (npc.shop) {
                ctx.font = '12px Arial';
                ctx.fillStyle = '#44ff44';
                ctx.fillText('💰', npc.x + 15, npc.y - 15);
            }
        });
    }
    
    // マップ遷移チェック
    checkMapTransition(playerX, playerY) {
        const map = this.maps[this.currentMap];
        if (!map || this.transitioning) return null;
        
        for (const exit of map.exits) {
            if (playerX >= exit.x && playerX <= exit.x + exit.width &&
                playerY >= exit.y && playerY <= exit.y + exit.height) {
                
                // ロックチェック
                if (exit.locked) {
                    return { locked: true, requirement: exit.requirement, message: `${exit.requirement}が必要です` };
                }
                
                return { nextMap: exit.to, exit: exit };
            }
        }
        
        return null;
    }
    
    // マップ遷移実行
    transitionToMap(mapId) {
        if (!this.maps[mapId]) return false;
        
        this.transitioning = true;
        
        // フェードアウト効果
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.opacity = '0';
            
            setTimeout(() => {
                this.currentMap = mapId;
                canvas.style.opacity = '1';
                this.transitioning = false;

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
            }, 300);
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
        if (!map || !map.buildings) return false;
        
        const playerRadius = playerSize / 2;
        
        for (const building of map.buildings) {
            // 建物の矩形
            const bLeft = building.x;
            const bRight = building.x + building.width;
            const bTop = building.y;
            const bBottom = building.y + building.height;
            
            // プレイヤーの矩形
            const pLeft = x - playerRadius;
            const pRight = x + playerRadius;
            const pTop = y - playerRadius;
            const pBottom = y + playerRadius;
            
            // 矩形の衝突判定
            if (pRight > bLeft && pLeft < bRight && pBottom > bTop && pTop < bBottom) {
                return true;
            }
        }
        
        return false;
    }
    
    // 衝突判定（NPC）
    checkNPCCollision(x, y, playerSize = 24) {
        const map = this.maps[this.currentMap];
        if (!map || !map.npcs) return false;
        
        const playerRadius = playerSize / 2;
        const npcRadius = 20; // NPCのサイズ
        
        for (const npc of map.npcs) {
            const distance = Math.sqrt(
                Math.pow(x - npc.x, 2) + 
                Math.pow(y - npc.y, 2)
            );
            
            if (distance < (playerRadius + npcRadius)) {
                return true;
            }
        }
        
        return false;
    }
    
    // 総合衝突判定
    checkCollision(x, y, playerSize = 24) {
        return this.checkBuildingCollision(x, y, playerSize) || 
               this.checkNPCCollision(x, y, playerSize);
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
            ]
        };
        
        this.currentShop = null;
        this.isShopOpen = false;
    }
    
    // ショップアイテムの詳細情報を取得
    getItemDetails(shopType, itemIndex) {
        const shopItem = this.shopData[shopType][itemIndex];
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
                const learned = window.magicSystem.hasLearned(shopItem.magicId);
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
        this.currentShop = shopType;
        this.currentShopkeeper = shopkeeper;
        this.isShopOpen = true;
        this.selectedItemIndex = 0;
        this.showShopUI(shopType, shopkeeper);
        this.setupShopKeyboard();
    }
    
    // ショップUIを表示
    showShopUI(shopType, shopkeeper) {
        // 既存のショップUIを削除
        const existingShop = document.getElementById('shopUI');
        if (existingShop) {
            existingShop.remove();
        }
        
        // ショップUI作成
        const shopUI = document.createElement('div');
        shopUI.id = 'shopUI';
        shopUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(20, 20, 40, 0.95);
            border: 3px solid #0f3460;
            border-radius: 10px;
            padding: 20px;
            color: white;
            font-family: 'Courier New', monospace;
            z-index: 1000;
            max-width: 600px;
            max-height: 500px;
            overflow-y: auto;
        `;
        
        let shopTitle = '';
        let items = [];
        
        switch(shopType) {
            case 'weapons': 
                shopTitle = '🗡️ 武器店';
                items = this.shopData.weapons;
                break;
            case 'armor':
                shopTitle = '🛡️ 防具店';
                items = this.shopData.armor;
                break;
            case 'items':
                shopTitle = '🧪 道具店';
                items = this.shopData.items;
                break;
            case 'magic':
                shopTitle = '🔮 魔法店';
                items = this.shopData.magic;
                break;
            case 'inn':
                this.showInnUI(shopkeeper);
                return;
            default:
                shopTitle = '🏪 一般店';
                items = this.shopData.items;
        }
        
        shopUI.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2>${shopTitle}</h2>
                <p>"${shopkeeper.dialogue}"</p>
                <p>所持金: <span id="playerMoney">${window.player ? window.player.gold : 100}</span> ギル</p>
                <p style="font-size: 12px; color: #aaa;">↑↓: 選択 | Enter: 購入 | X: 閉じる</p>
            </div>
            <div id="shopItems"></div>
        `;

        this.shopItems = items;
        const itemsContainer = shopUI.querySelector('#shopItems');
        items.forEach((shopItem, index) => {
            // アイテムの詳細情報を取得
            const itemDetails = this.getItemDetails(shopType, index);
            if (!itemDetails) return;

            const itemDiv = document.createElement('div');
            itemDiv.id = `shop-item-${index}`;
            itemDiv.className = 'shop-item';
            itemDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                margin: 5px 0;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
                cursor: pointer;
                border: 2px solid transparent;
            `;
            
            // ステータス表示
            let statsText = '';
            if (itemDetails.attack > 0) statsText += ` 攻+${itemDetails.attack}`;
            if (itemDetails.defense > 0) statsText += ` 防+${itemDetails.defense}`;
            if (itemDetails.hp > 0) statsText += ` HP+${itemDetails.hp}`;
            if (itemDetails.mp > 0) statsText += ` MP+${itemDetails.mp}`;
            
            // レベル要件
            const levelReq = itemDetails.requiredLevel ? ` (Lv.${itemDetails.requiredLevel})` : '';
            
            itemDiv.innerHTML = `
                <div>
                    <strong>${itemDetails.emoji || ''} ${itemDetails.name}${levelReq}</strong><br>
                    <small style="color: #aaa;">${itemDetails.description}${statsText}</small>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 16px; font-weight: bold;">${itemDetails.price} G</div>
                </div>
            `;

            itemsContainer.appendChild(itemDiv);
        });

        document.body.appendChild(shopUI);

        // 最初のアイテムを選択状態にする
        this.updateShopSelection();
    }

    // ショップの選択を更新
    updateShopSelection() {
        const items = document.querySelectorAll('.shop-item');
        items.forEach((item, index) => {
            if (index === this.selectedItemIndex) {
                item.style.background = 'rgba(15, 52, 96, 0.8)';
                item.style.borderColor = '#00ffff';
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.style.background = 'rgba(255, 255, 255, 0.1)';
                item.style.borderColor = 'transparent';
            }
        });
    }

    // キーボード操作のセットアップ
    setupShopKeyboard() {
        this.shopKeyHandler = (e) => {
            if (!this.isShopOpen) return;

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
                this.updateShopSelection();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedItemIndex = Math.min(this.shopItems.length - 1, this.selectedItemIndex + 1);
                this.updateShopSelection();
            } else if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
                e.preventDefault();
                this.buyItem(this.currentShop, this.selectedItemIndex);
            } else if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
                e.preventDefault();
                this.closeShop();
            }
        };

        document.addEventListener('keydown', this.shopKeyHandler);
    }
    
    // 宿屋UI
    showInnUI(shopkeeper) {
        const innUI = document.createElement('div');
        innUI.id = 'shopUI';
        innUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(40, 30, 20, 0.95);
            border: 3px solid #8B4513;
            border-radius: 10px;
            padding: 30px;
            color: white;
            font-family: 'Courier New', monospace;
            z-index: 1000;
            text-align: center;
        `;
        
        innUI.innerHTML = `
            <h2>🏠 ${shopkeeper.name}の宿屋</h2>
            <p>"${shopkeeper.dialogue}"</p>
            <br>
            <p>一晩: 50ギル</p>
            <p>HP・MPが全回復します</p>
            <br>
            <button onclick="window.gameShop.stayAtInn()" 
                    style="padding: 15px 30px; background: #8B4513; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px;">
                宿泊する (50ギル)
            </button>
            <button onclick="window.gameShop.closeShop()" 
                    style="padding: 15px 30px; background: #444; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px;">
                やめる
            </button>
        `;
        
        document.body.appendChild(innUI);
    }
    
    // アイテム購入
    buyItem(shopType, itemIndex) {
        const shopItem = this.shopData[shopType][itemIndex];
        const player = window.player;
        
        if (!player) {
            alert('プレイヤーが見つかりません');
            return;
        }
        
        // アイテム詳細を取得
        const itemDetails = this.getItemDetails(shopType, itemIndex);
        if (!itemDetails) {
            alert('アイテム情報が見つかりません');
            return;
        }
        
        // 所持金チェック
        if (player.gold < itemDetails.price) {
            alert('ゴールドが足りません！');
            return;
        }
        
        // レベル要件チェック
        if (itemDetails.requiredLevel && player.level < itemDetails.requiredLevel) {
            alert(`レベル${itemDetails.requiredLevel}以上で購入可能です`);
            return;
        }
        
        let success = false;
        let message = '';
        
        // 魔法の購入
        if (shopItem.magicId && window.magicSystem) {
            const result = window.magicSystem.buyMagic(shopItem.magicId, player);
            if (!result.success) {
                alert(result.message);
                return;
            }
            success = true;
            message = result.message;
            console.log('Magic purchased:', shopItem.magicId);
        }
        // 装備の購入
        else if (shopItem.equipmentId && window.equipmentSystem) {
            player.gold -= itemDetails.price;
            const addResult = window.equipmentSystem.addEquipment(shopItem.equipmentId, 1);
            success = true;
            message = `${itemDetails.name}を購入しました！\n${itemDetails.price}ゴールドを支払った。`;
            console.log('Equipment purchased:', shopItem.equipmentId, 'Add result:', addResult);
            console.log('Current equipment inventory:', window.equipmentSystem.inventory);
        }
        // アイテムの購入
        else if (shopItem.itemId && window.itemSystem) {
            player.gold -= itemDetails.price;
            window.itemSystem.addItem(shopItem.itemId, 1);
            success = true;
            message = `${itemDetails.name}を購入しました！\n${itemDetails.price}ゴールドを支払った。`;
            console.log('Item purchased:', shopItem.itemId);
        }
        else {
            alert('購入システムに問題があります');
            return;
        }
        
        if (success) {
            alert(message);
            // UIを更新
            if (window.updateUI) {
                window.updateUI();
            }
            // ショップ内の所持金表示を更新
            const moneyDisplay = document.getElementById('playerMoney');
            if (moneyDisplay) {
                moneyDisplay.textContent = player.gold;
            }
        }
    }
    
    // 宿屋に泊まる
    stayAtInn() {
        alert('ぐっすり眠りました！HP・MPが全回復しました！');
        this.closeShop();
    }
    
    // ショップを閉じる
    closeShop() {
        const shopUI = document.getElementById('shopUI');
        if (shopUI) {
            shopUI.remove();
        }
        if (this.shopKeyHandler) {
            document.removeEventListener('keydown', this.shopKeyHandler);
            this.shopKeyHandler = null;
        }
        this.isShopOpen = false;
        this.currentShop = null;
        this.selectedItemIndex = 0;
        this.shopItems = [];
    }
}

// グローバルにエクスポート
window.MapSystem = MapSystem;
window.ShopSystem = ShopSystem;
window.gameShop = new ShopSystem();