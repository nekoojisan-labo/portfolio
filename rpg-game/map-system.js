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
                { x: 0, y: 250, width: 10, height: 100, to: 'subway_entrance', label: '地下鉄へ' },
                { x: 790, y: 250, width: 10, height: 100, to: 'tokyo_gov', label: '都庁へ' },
                { x: 350, y: 0, width: 100, height: 10, to: 'shrine_path', label: '神社への道' },
                { x: 350, y: 590, width: 100, height: 10, to: 'black_market', label: '闇市へ' }
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
                { x: 790, y: 250, width: 10, height: 100, to: 'shinjuku_city', label: '地上へ' },
                { x: 0, y: 250, width: 10, height: 100, to: 'deep_tunnel', label: '深部へ' }
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
                { x: 350, y: 590, width: 100, height: 10, to: 'shinjuku_city', label: '都市へ' }
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
                { x: 350, y: 590, width: 100, height: 10, to: 'shinjuku_city', label: '都市へ' },
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
                { x: 0, y: 250, width: 10, height: 100, to: 'shinjuku_city', label: '外へ' },
                { x: 350, y: 200, width: 100, height: 100, to: 'ark_core', label: 'アーク中枢へ', locked: true, requirement: 'key_card' }
            ],
            npcs: [
                { x: 300, y: 300, emoji: '🤖', name: 'セキュリティドローン', dialogue: '警告：不正アクセスを検知。', hostile: true },
                { x: 500, y: 300, emoji: '🤖', name: 'セキュリティドローン', dialogue: '警告：不正アクセスを検知。', hostile: true }
            ]
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
            }
        });
        
        // 出口マーカー
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        map.exits.forEach(exit => {
            ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
            
            // ラベル表示
            ctx.font = '10px Courier New';
            ctx.fillStyle = '#00ffff';
            ctx.textAlign = 'center';
            ctx.fillText(exit.label, exit.x + exit.width/2, exit.y - 5);
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
            ctx.fillStyle = npc.hostile ? '#ff4444' : '#ffffff';
            ctx.fillText(npc.name, npc.x, npc.y + 20);
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
}

// グローバルにエクスポート
window.MapSystem = MapSystem;