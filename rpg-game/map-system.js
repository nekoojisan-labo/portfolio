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
            buildings: [
                { x: 50, y: 50, width: 100, height: 80, color: '#16213e' },
                { x: 200, y: 100, width: 120, height: 60, color: '#16213e' },
                { x: 500, y: 200, width: 80, height: 100, color: '#16213e' },
                { x: 600, y: 50, width: 150, height: 90, color: '#16213e' },
                { x: 100, y: 400, width: 200, height: 100, color: '#16213e' }
            ],
            exits: [
                { x: 0, y: 200, width: 30, height: 200, to: 'subway_entrance', label: '地下鉄へ' },
                { x: 770, y: 200, width: 30, height: 200, to: 'tokyo_gov', label: '都庁へ' },
                { x: 300, y: 0, width: 200, height: 20, to: 'shrine_path', label: '神社への道' },
                { x: 450, y: 480, width: 200, height: 120, to: 'black_market', label: '闇市へ' },
                { x: 100, y: 480, width: 250, height: 120, to: 'shopping_district', label: '商業街へ' }
            ],
            npcs: [
                { x: 300, y: 200, emoji: '👤', name: '感情を失った市民', dialogue: '...。' },
                { x: 450, y: 350, emoji: '🧙‍♀️', name: 'アカリ', dialogue: 'カイト、この街の異常を感じる？AIの支配が強まっているわ。' }
            ]
        };
        
        // 地下鉄エリア
        this.maps.subway_entrance = {
            name: '新宿駅 - 地下通路',
            bgColor: '#0a0a0a',
            gridColor: '#2a2a2a',
            encounterRate: 'medium',  // 地下は少し危険
            area: 'subway',
            buildings: [
                { x: 100, y: 100, width: 600, height: 50, color: '#1a1a1a' },
                { x: 100, y: 450, width: 600, height: 50, color: '#1a1a1a' },
                { x: 200, y: 200, width: 60, height: 200, color: '#333333' },
                { x: 540, y: 200, width: 60, height: 200, color: '#333333' }
            ],
            exits: [
                { x: 770, y: 200, width: 30, height: 200, to: 'shinjuku_city', label: '地上へ' },
                { x: 0, y: 200, width: 30, height: 200, to: 'deep_tunnel', label: '深部へ' }
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
            buildings: [
                { x: 150, y: 150, width: 100, height: 100, color: '#2a4a2a', type: 'tree' },
                { x: 550, y: 150, width: 100, height: 100, color: '#2a4a2a', type: 'tree' },
                { x: 350, y: 250, width: 100, height: 150, color: '#3a5a3a', type: 'pond' },
                { x: 150, y: 400, width: 100, height: 100, color: '#2a4a2a', type: 'tree' },
                { x: 550, y: 400, width: 100, height: 100, color: '#2a4a2a', type: 'tree' }
            ],
            exits: [
                { x: 350, y: 480, width: 100, height: 120, to: 'shinjuku_city', label: '都市へ' }
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
            buildings: [
                { x: 50, y: 100, width: 80, height: 60, color: '#2a1a2a', type: 'stall' },
                { x: 150, y: 100, width: 80, height: 60, color: '#2a1a2a', type: 'stall' },
                { x: 250, y: 100, width: 80, height: 60, color: '#2a1a2a', type: 'stall' },
                { x: 470, y: 100, width: 80, height: 60, color: '#2a1a2a', type: 'stall' },
                { x: 570, y: 100, width: 80, height: 60, color: '#2a1a2a', type: 'stall' },
                { x: 670, y: 100, width: 80, height: 60, color: '#2a1a2a', type: 'stall' },
                { x: 50, y: 440, width: 80, height: 60, color: '#2a1a2a', type: 'stall' },
                { x: 150, y: 440, width: 80, height: 60, color: '#2a1a2a', type: 'stall' },
                { x: 570, y: 440, width: 80, height: 60, color: '#2a1a2a', type: 'stall' },
                { x: 670, y: 440, width: 80, height: 60, color: '#2a1a2a', type: 'stall' }
            ],
            exits: [
                { x: 350, y: 0, width: 100, height: 10, to: 'shinjuku_city', label: '地上へ' }
            ],
            npcs: [
                { x: 200, y: 300, emoji: '🧑‍💻', name: 'ヤミ', dialogue: 'ここならアークの監視も届かない。必要な物資があれば言ってくれ。' },
                { x: 600, y: 300, emoji: '👨‍🔧', name: '闇商人', dialogue: '珍しい神器があるよ...高いけどね。', shop: true }
            ]
        };
        
        // 神社エリア
        this.maps.shrine_path = {
            name: '明治神宮 - 参道',
            bgColor: '#1a1a0a',
            gridColor: '#2a2a1a',
            encounterRate: 'none',  // 神聖な場所、エンカウントなし
            area: 'shrine',
            buildings: [
                { x: 350, y: 100, width: 100, height: 150, color: '#4a3a2a', type: 'torii' },
                { x: 100, y: 200, width: 60, height: 200, color: '#3a2a1a', type: 'lantern' },
                { x: 640, y: 200, width: 60, height: 200, color: '#3a2a1a', type: 'lantern' },
                { x: 300, y: 400, width: 200, height: 100, color: '#5a4a3a', type: 'shrine' }
            ],
            exits: [
                { x: 350, y: 480, width: 100, height: 120, to: 'shinjuku_city', label: '都市へ' },
                { x: 350, y: 0, width: 100, height: 10, to: 'inner_shrine', label: '本殿へ' }
            ],
            npcs: [
                { x: 400, y: 250, emoji: '👴', name: '老神主', dialogue: '神々の力は、まだこの地に眠っている...選ばれし者よ。' }
            ],
            savePoint: { x: 400, y: 450, emoji: '⛩️', name: 'セーブポイント' }
        };
        
        // 都庁エリア
        this.maps.tokyo_gov = {
            name: '東京都庁 - エントランス',
            bgColor: '#0a0a1a',
            gridColor: '#1a1a3a',
            encounterRate: 'high',  // 敵の本拠地に近い
            area: 'city',
            buildings: [
                { x: 200, y: 100, width: 400, height: 50, color: '#2a2a4a', type: 'wall' },
                { x: 200, y: 450, width: 400, height: 50, color: '#2a2a4a', type: 'wall' },
                { x: 350, y: 200, width: 100, height: 100, color: '#3a3a5a', type: 'elevator' }
            ],
            exits: [
                { x: 0, y: 200, width: 30, height: 200, to: 'shinjuku_city', label: '外へ' },
                { x: 350, y: 200, width: 100, height: 100, to: 'ark_core', label: 'アーク中枢へ', locked: true, requirement: 'key_card' }
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
            buildings: [
                // 壁や障害物
                { x: 0, y: 0, width: 800, height: 50, color: '#1f1f1f', type: 'wall' },
                { x: 0, y: 550, width: 800, height: 50, color: '#1f1f1f', type: 'wall' },
                { x: 0, y: 0, width: 50, height: 600, color: '#1f1f1f', type: 'wall' },
                { x: 750, y: 0, width: 50, height: 600, color: '#1f1f1f', type: 'wall' },
                
                // 内部の柱や障害物
                { x: 200, y: 150, width: 40, height: 40, color: '#2f2f2f', type: 'pillar' },
                { x: 560, y: 150, width: 40, height: 40, color: '#2f2f2f', type: 'pillar' },
                { x: 200, y: 410, width: 40, height: 40, color: '#2f2f2f', type: 'pillar' },
                { x: 560, y: 410, width: 40, height: 40, color: '#2f2f2f', type: 'pillar' },
                { x: 380, y: 280, width: 40, height: 40, color: '#2f2f2f', type: 'pillar' },
                
                // 宝箱
                { x: 100, y: 500, width: 30, height: 30, color: '#8B4513', type: 'treasure' },
                { x: 670, y: 100, width: 30, height: 30, color: '#8B4513', type: 'treasure' }
            ],
            exits: [
                { x: 790, y: 275, width: 10, height: 50, to: 'subway_entrance', label: '地下鉄へ' },
                { x: 375, y: 480, width: 50, height: 120, to: 'deep_tunnel_2', label: '更なる深部へ' }
            ],
            npcs: [
                { x: 300, y: 200, emoji: '👹', name: 'シャドウエンティティ', dialogue: 'この領域は...我々のものだ。', hostile: true, level: 3 },
                { x: 500, y: 350, emoji: '🕷️', name: 'データスパイダー', dialogue: 'ジジジ...侵入者発見...', hostile: true, level: 2 },
                { x: 150, y: 400, emoji: '⚡', name: 'グリッチスピリット', dialogue: 'エラー...エラー...削除シマス...', hostile: true, level: 2 }
            ],
            treasures: [
                { x: 100, y: 500, item: 'ヒールポーション', opened: false },
                { x: 670, y: 100, item: 'エナジーコア', opened: false }
            ]
        };
        
        // 深層地下トンネル第2層
        this.maps.deep_tunnel_2 = {
            name: '深層地下トンネル - 第2層',
            bgColor: '#0a0a0f',
            gridColor: '#2f1f2f',
            encounterRate: 'extreme',
            area: 'dungeon',
            buildings: [
                { x: 0, y: 0, width: 800, height: 50, color: '#1a1a2f', type: 'wall' },
                { x: 0, y: 550, width: 800, height: 50, color: '#1a1a2f', type: 'wall' },
                { x: 0, y: 0, width: 50, height: 600, color: '#1a1a2f', type: 'wall' },
                { x: 750, y: 0, width: 50, height: 600, color: '#1a1a2f', type: 'wall' },
                
                // 複雑な迷路構造
                { x: 150, y: 100, width: 200, height: 40, color: '#2a2a3f', type: 'wall' },
                { x: 450, y: 100, width: 200, height: 40, color: '#2a2a3f', type: 'wall' },
                { x: 150, y: 460, width: 200, height: 40, color: '#2a2a3f', type: 'wall' },
                { x: 450, y: 460, width: 200, height: 40, color: '#2a2a3f', type: 'wall' },
                { x: 350, y: 200, width: 100, height: 200, color: '#2a2a3f', type: 'wall' },
                
                // ボス部屋
                { x: 300, y: 250, width: 200, height: 100, color: '#4a1a1a', type: 'boss_area' }
            ],
            exits: [
                { x: 375, y: 0, width: 50, height: 10, to: 'deep_tunnel', label: '上の階へ' },
                { x: 375, y: 480, width: 50, height: 120, to: 'ancient_chamber', label: '古代の部屋へ', locked: true, requirement: 'boss_key' }
            ],
            npcs: [
                { x: 200, y: 300, emoji: '💀', name: 'ネクロマンサー', dialogue: '死者の軍団よ、目覚めよ！', hostile: true, level: 5 },
                { x: 600, y: 300, emoji: '🐉', name: 'データドラゴン', dialogue: 'この深淵で眠りを妨げるとは...', hostile: true, level: 6, boss: true }
            ]
        };
        
        // 商業街エリア（ショップが充実）
        this.maps.shopping_district = {
            name: '渋谷商業街 - ショッピングモール',
            bgColor: '#1a1a3e',
            gridColor: '#3a3a5e',
            encounterRate: 'none',  // ショッピング街は安全
            area: 'town',
            buildings: [
                // ショップ建物
                { x: 50, y: 100, width: 120, height: 80, color: '#2a4a2a', type: 'weapon_shop' },
                { x: 200, y: 100, width: 120, height: 80, color: '#4a2a2a', type: 'armor_shop' },
                { x: 350, y: 100, width: 120, height: 80, color: '#2a2a4a', type: 'item_shop' },
                { x: 500, y: 100, width: 120, height: 80, color: '#4a4a2a', type: 'magic_shop' },
                
                { x: 50, y: 420, width: 120, height: 80, color: '#3a3a4a', type: 'inn' },
                { x: 200, y: 420, width: 120, height: 80, color: '#4a3a3a', type: 'bank' },
                { x: 500, y: 420, width: 120, height: 80, color: '#3a4a3a', type: 'guild' },
                
                // 中央広場
                { x: 300, y: 250, width: 200, height: 150, color: '#1e3e5e', type: 'plaza' }
            ],
            exits: [
                { x: 0, y: 275, width: 10, height: 50, to: 'shinjuku_city', label: '新宿へ' },
                { x: 790, y: 275, width: 10, height: 50, to: 'residential_area', label: '住宅街へ' }
            ],
            npcs: [
                { x: 110, y: 160, emoji: '🗡️', name: '武器商人リョウ', dialogue: 'いらっしゃい！最新の神器武器を取り揃えてるよ！', shop: true, shopType: 'weapons' },
                { x: 260, y: 160, emoji: '🛡️', name: '防具商人サクラ', dialogue: 'お疲れさま！丈夫な防具なら任せて！', shop: true, shopType: 'armor' },
                { x: 410, y: 160, emoji: '🧪', name: 'アイテム商人ユウキ', dialogue: 'ポーション、回復アイテム何でもあります！', shop: true, shopType: 'items' },
                { x: 560, y: 160, emoji: '🔮', name: '魔法商人ミコト', dialogue: '古の魔法アイテムを求めるなら...', shop: true, shopType: 'magic' },
                
                { x: 110, y: 480, emoji: '🏠', name: '宿屋の主人', dialogue: 'お疲れ様！ゆっくり休んでいってくださいな。', shop: true, shopType: 'inn' },
                { x: 260, y: 480, emoji: '💰', name: '銀行員', dialogue: 'お金の預入・引出しをどうぞ。', shop: true, shopType: 'bank' },
                { x: 560, y: 480, emoji: '⚔️', name: 'ギルドマスター', dialogue: 'クエストの受注・報告はこちらで。', shop: true, shopType: 'guild' },
                
                { x: 400, y: 325, emoji: '👥', name: '街の住民', dialogue: 'この街は平和でいいところよ。でも最近、地下で変な音が...' }
            ]
        };
        
        // 住宅街エリア
        this.maps.residential_area = {
            name: '住宅街 - 平和な街並み',
            bgColor: '#1e2e1e',
            gridColor: '#2e4e2e',
            encounterRate: 'none',
            area: 'town',
            buildings: [
                { x: 100, y: 100, width: 100, height: 80, color: '#3e4e3e', type: 'house' },
                { x: 250, y: 100, width: 100, height: 80, color: '#4e3e3e', type: 'house' },
                { x: 500, y: 100, width: 100, height: 80, color: '#3e3e4e', type: 'house' },
                { x: 100, y: 300, width: 100, height: 80, color: '#4e4e3e', type: 'house' },
                { x: 500, y: 300, width: 100, height: 80, color: '#3e5e3e', type: 'house' },
                { x: 250, y: 450, width: 100, height: 80, color: '#5e3e3e', type: 'house' },
                { x: 400, y: 450, width: 100, height: 80, color: '#3e3e5e', type: 'house' }
            ],
            exits: [
                { x: 0, y: 275, width: 10, height: 50, to: 'shopping_district', label: '商業街へ' }
            ],
            npcs: [
                { x: 150, y: 150, emoji: '👨‍👩‍👧‍👦', name: '家族', dialogue: '平和な毎日に感謝しています。' },
                { x: 300, y: 200, emoji: '🐱', name: 'ミケ', dialogue: 'にゃーん（人懐っこい猫のようだ）' },
                { x: 550, y: 350, emoji: '👵', name: 'おばあさん', dialogue: '昔はもっと賑やかな街だったのよ...'},
                { x: 450, y: 500, emoji: '📮', name: '郵便ポスト', dialogue: '手紙を出しますか？（まだ実装されていません）' }
            ],
            savePoint: { x: 325, y: 250, emoji: '💤', name: '公園のベンチ' }
        };
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
            ctx.fillStyle = building.color;
            ctx.fillRect(building.x, building.y, building.width, building.height);
            
            // タイプに応じた装飾
            if (building.type === 'tree') {
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
            }
        });
        
        // 出口マーカー（より目立つようにする）
        map.exits.forEach(exit => {
            // 出口エリアのハイライト
            ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
            
            // 境界線
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(exit.x, exit.y, exit.width, exit.height);
            
            // ラベル表示（より大きく）
            ctx.font = '12px Courier New';
            ctx.fillStyle = '#00ffff';
            ctx.textAlign = 'center';
            ctx.fillText(exit.label, exit.x + exit.width/2, exit.y - 8);
            
            // 矢印表示
            ctx.font = '16px Arial';
            if (exit.y === 0) ctx.fillText('↑', exit.x + exit.width/2, exit.y + 20);
            else if (exit.y >= 590) ctx.fillText('↓', exit.x + exit.width/2, exit.y - 10);
            else if (exit.x === 0) ctx.fillText('←', exit.x + 20, exit.y + exit.height/2);
            else if (exit.x >= 790) ctx.fillText('→', exit.x - 10, exit.y + exit.height/2);
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
    drawNPCs(ctx) {
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
            
            // ショップマーク表示
            if (npc.shop) {
                ctx.font = '12px Arial';
                ctx.fillStyle = '#ffff00';
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
        this.shopData = {
            weapons: [
                { id: 'iron_sword', name: 'アイアンソード', price: 100, attack: 15, description: '鉄製の剣。攻撃力+15' },
                { id: 'mithril_blade', name: 'ミスリルブレード', price: 350, attack: 28, description: 'ミスリル製の刃。攻撃力+28' },
                { id: 'thunder_sword', name: '雷神の剣', price: 800, attack: 45, description: '雷の力を宿した神剣。攻撃力+45' },
                { id: 'data_katana', name: 'データカタナ', price: 1500, attack: 70, description: 'デジタル世界の最強剣。攻撃力+70' },
                { id: 'basic_sword', name: 'ベーシックソード', price: 50, attack: 8, description: '基本的な剣' },
                { id: 'cyber_blade', name: 'サイバーブレード', price: 200, attack: 15, description: '電子強化された刃' }
            ],
            armor: [
                { id: 'leather_armor', name: 'レザーアーマー', price: 80, defense: 10, description: '革製の軽装鎧。防御力+10' },
                { id: 'chain_mail', name: 'チェインメイル', price: 250, defense: 20, description: '鎖帷子。防御力+20' },
                { id: 'plate_armor', name: 'プレートアーマー', price: 600, defense: 35, description: '板金鎧。防御力+35' },
                { id: 'kamui_armor', name: '神威の鎧', price: 1200, defense: 55, description: '神の加護を受けた鎧。防御力+55' },
                { id: 'basic_armor', name: 'ベーシックアーマー', price: 60, defense: 3, description: '基本的な防具' },
                { id: 'cyber_suit', name: 'サイバースーツ', price: 300, defense: 8, description: 'ハイテク防護服' }
            ],
            items: [
                { id: 'potion', name: 'ヒールポーション', price: 50, effect: 'heal', value: 50, count: 1, description: 'HP50回復' },
                { id: 'hi_potion', name: 'ハイポーション', price: 120, effect: 'heal', value: 150, count: 1, description: 'HP150回復' },
                { id: 'ether', name: 'エナジードリンク', price: 80, effect: 'mp_heal', value: 30, count: 1, description: 'MP30回復' },
                { id: 'hi_ether', name: 'ハイエーテル', price: 150, effect: 'mp_heal', value: 80, count: 1, description: 'MP80回復' },
                { id: 'elixir', name: 'エリクサー', price: 300, effect: 'full_heal', value: 999, count: 1, description: 'HP・MP全回復' },
                { id: 'smoke_ball', name: '煙玉', price: 30, effect: 'escape', value: 1, count: 1, description: '戦闘から確実に逃走' }
            ],
            magic: [
                { id: 'fire_crystal', name: 'ファイアクリスタル', price: 200, type: 'spell', spell: 'fire', description: 'ファイア呪文を覚える' },
                { id: 'heal_crystal', name: 'ヒールクリスタル', price: 150, type: 'spell', spell: 'heal', description: 'ヒール呪文を覚える' },
                { id: 'thunder_charm', name: '雷撃の護符', price: 400, attack: 5, defense: 2, description: '雷属性攻撃付与。攻撃+5、防御+2' },
                { id: 'mp_ring', name: '魔力増幅リング', price: 600, mp: 20, description: '最大MP+20' },
                { id: 'power_glove', name: 'パワーグローブ', price: 300, attack: 8, description: '攻撃力を高める手袋。攻撃+8' },
                { id: 'shield_ring', name: 'シールドリング', price: 350, defense: 12, description: '防御力を高める指輪。防御+12' }
            ]
        };
        
        this.currentShop = null;
        this.isShopOpen = false;
    }
    
    // ショップを開く
    openShop(shopType, shopkeeper) {
        this.currentShop = shopType;
        this.isShopOpen = true;
        this.showShopUI(shopType, shopkeeper);
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
                <p>所持金: <span id="playerMoney">${window.player ? window.player.gold : 1000}</span> ギル</p>
            </div>
            <div id="shopItems"></div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.gameShop.closeShop()" 
                        style="padding: 10px 20px; background: #444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    店を出る
                </button>
            </div>
        `;
        
        const itemsContainer = shopUI.querySelector('#shopItems');
        items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                margin: 5px 0;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
                cursor: pointer;
            `;
            
            itemDiv.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <small style="color: #aaa;">${item.description}</small>
                </div>
                <div style="text-align: right;">
                    <div>${item.price} ギル</div>
                    <button onclick="window.gameShop.buyItem('${shopType}', ${index})"
                            style="padding: 5px 10px; background: #0f3460; color: white; border: none; border-radius: 3px; cursor: pointer; margin-top: 5px;">
                        購入
                    </button>
                </div>
            `;
            
            itemsContainer.appendChild(itemDiv);
        });
        
        document.body.appendChild(shopUI);
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
        const item = this.shopData[shopType][itemIndex];
        
        if (!window.player) {
            alert('プレイヤーデータが見つかりません！');
            return;
        }
        
        // 所持金チェック
        if (window.player.gold < item.price) {
            alert('お金が足りません！');
            return;
        }
        
        // 購入処理
        window.player.gold -= item.price;
        
        // インベントリーに追加
        switch(shopType) {
            case 'weapons':
                // 既に持っている武器かチェック
                const existingWeapon = window.player.inventory.weapons.find(w => w.id === item.id);
                if (!existingWeapon) {
                    window.player.inventory.weapons.push({...item});
                } else {
                    alert('その武器は既に持っています！');
                    window.player.gold += item.price; // 返金
                    return;
                }
                break;
                
            case 'armor':
                // 既に持っている防具かチェック
                const existingArmor = window.player.inventory.armor.find(a => a.id === item.id);
                if (!existingArmor) {
                    window.player.inventory.armor.push({...item});
                } else {
                    alert('その防具は既に持っています！');
                    window.player.gold += item.price; // 返金
                    return;
                }
                break;
                
            case 'items':
                // アイテムの場合は数量を追加
                const existingItem = window.player.inventory.items.find(i => i.id === item.id);
                if (existingItem) {
                    existingItem.count += (item.count || 1);
                } else {
                    window.player.inventory.items.push({
                        ...item,
                        count: item.count || 1
                    });
                }
                break;
                
            case 'magic':
                // マジックアイテム（アクセサリー含む）の処理
                const magicItem = {...item};
                
                // アクセサリータイプの場合はアクセサリーインベントリーに追加
                if (item.attack !== undefined || item.defense !== undefined || item.mp !== undefined) {
                    const existingAccessory = window.player.inventory.accessories.find(a => a.id === item.id);
                    if (!existingAccessory) {
                        window.player.inventory.accessories.push(magicItem);
                    } else {
                        alert('そのアクセサリーは既に持っています！');
                        window.player.gold += item.price; // 返金
                        return;
                    }
                } else {
                    // 魔法アイテムの場合はアイテムインベントリーに追加
                    const existingMagic = window.player.inventory.items.find(i => i.id === item.id);
                    if (existingMagic) {
                        existingMagic.count += 1;
                    } else {
                        window.player.inventory.items.push({
                            ...magicItem,
                            count: 1
                        });
                    }
                }
                break;
                
            default:
                alert('このショップタイプはまだ実装されていません！');
                window.player.gold += item.price; // 返金
                return;
        }
        
        // UI更新
        if (window.updateUI) {
            window.updateUI();
        }
        
        alert(`${item.name}を購入しました！`);
        this.closeShop();
    }
    
    // 宿屋に泊まる
    stayAtInn() {
        if (!window.player) {
            alert('プレイヤーデータが見つかりません！');
            return;
        }
        
        const innPrice = 50;
        if (window.player.gold < innPrice) {
            alert('お金が足りません！宿代は50ゴールドです。');
            return;
        }
        
        // 宿代を支払い、HP・MPを全回復
        window.player.gold -= innPrice;
        window.player.hp = window.player.maxHp;
        window.player.mp = window.player.maxMp;
        
        // UI更新
        if (window.updateUI) {
            window.updateUI();
        }
        
        alert('ぐっすり眠りました！HP・MPが全回復しました！');
        this.closeShop();
    }
    
    // ショップを閉じる
    closeShop() {
        const shopUI = document.getElementById('shopUI');
        if (shopUI) {
            shopUI.remove();
        }
        this.isShopOpen = false;
        this.currentShop = null;
    }
}

// グローバルにエクスポート
window.MapSystem = MapSystem;
window.ShopSystem = ShopSystem;
window.gameShop = new ShopSystem();