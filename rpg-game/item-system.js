// ==========================================
// アイテムシステム (Item System)
// ==========================================

class ItemSystem {
    constructor() {
        // アイテムデータベース
        this.itemDatabase = {
            // 回復アイテム
            heal_potion: {
                id: 'heal_potion',
                name: 'ヒールポーション',
                emoji: '🧪',
                type: 'consumable',
                category: 'recovery',
                description: 'HPを50回復する',
                effect: { hp: 50 },
                price: 50,
                sellPrice: 25
            },
            mega_heal_potion: {
                id: 'mega_heal_potion',
                name: 'メガヒールポーション',
                emoji: '🧪',
                type: 'consumable',
                category: 'recovery',
                description: 'HPを150回復する',
                effect: { hp: 150 },
                price: 150,
                sellPrice: 75
            },
            full_heal_potion: {
                id: 'full_heal_potion',
                name: 'フルヒールポーション',
                emoji: '💊',
                type: 'consumable',
                category: 'recovery',
                description: 'HPを完全回復する',
                effect: { hp: 'full' },
                price: 300,
                sellPrice: 150
            },
            energy_core: {
                id: 'energy_core',
                name: 'エナジーコア',
                emoji: '⚡',
                type: 'consumable',
                category: 'recovery',
                description: 'MPを30回復する',
                effect: { mp: 30 },
                price: 80,
                sellPrice: 40
            },
            mega_energy_core: {
                id: 'mega_energy_core',
                name: 'メガエナジーコア',
                emoji: '⚡',
                type: 'consumable',
                category: 'recovery',
                description: 'MPを80回復する',
                effect: { mp: 80 },
                price: 200,
                sellPrice: 100
            },
            elixir: {
                id: 'elixir',
                name: 'エリクサー',
                emoji: '✨',
                type: 'consumable',
                category: 'recovery',
                description: 'HP・MPを完全回復する',
                effect: { hp: 'full', mp: 'full' },
                price: 500,
                sellPrice: 250
            },
            
            // バフアイテム
            attack_boost: {
                id: 'attack_boost',
                name: '攻撃ブースト',
                emoji: '💪',
                type: 'consumable',
                category: 'buff',
                description: '戦闘中、攻撃力が1.5倍になる（3ターン）',
                effect: { attackBoost: 1.5, duration: 3 },
                price: 120,
                sellPrice: 60
            },
            defense_boost: {
                id: 'defense_boost',
                name: '防御ブースト',
                emoji: '🛡️',
                type: 'consumable',
                category: 'buff',
                description: '戦闘中、防御力が2倍になる（3ターン）',
                effect: { defenseBoost: 2, duration: 3 },
                price: 120,
                sellPrice: 60
            },
            speed_boost: {
                id: 'speed_boost',
                name: 'スピードブースト',
                emoji: '💨',
                type: 'consumable',
                category: 'buff',
                description: '戦闘中、必ず先制攻撃できる（1回）',
                effect: { speedBoost: true, duration: 1 },
                price: 100,
                sellPrice: 50
            },
            
            // 特殊アイテム
            escape_rope: {
                id: 'escape_rope',
                name: 'エスケープロープ',
                emoji: '🪢',
                type: 'consumable',
                category: 'utility',
                description: 'ダンジョンから即座に脱出する',
                effect: { escape: true },
                price: 200,
                sellPrice: 100
            },
            revival_stone: {
                id: 'revival_stone',
                name: '復活の石',
                emoji: '💎',
                type: 'consumable',
                category: 'special',
                description: '戦闘不能から自動復活（HP50%で復活）',
                effect: { revive: 0.5 },
                price: 1000,
                sellPrice: 500
            },
            
            // キーアイテム
            boss_key: {
                id: 'boss_key',
                name: 'ボス部屋の鍵',
                emoji: '🗝️',
                type: 'key',
                category: 'key',
                description: '特殊なエリアへの扉を開ける',
                effect: {},
                price: 0,
                sellPrice: 0
            },
            shrine_talisman: {
                id: 'shrine_talisman',
                name: '神社のお守り',
                emoji: '🎴',
                type: 'key',
                category: 'key',
                description: '神社の神聖な力が宿る',
                effect: {},
                price: 0,
                sellPrice: 0
            }
        };
        
        // プレイヤーのインベントリ
        this.inventory = {};
    }
    
    // アイテムを追加
    addItem(itemId, quantity = 1) {
        const item = this.itemDatabase[itemId];
        if (!item) {
            console.error('Unknown item:', itemId);
            return false;
        }
        
        if (!this.inventory[itemId]) {
            this.inventory[itemId] = {
                ...item,
                quantity: 0
            };
        }
        
        this.inventory[itemId].quantity += quantity;
        console.log(`Added ${quantity}x ${item.name}`);
        return true;
    }
    
    // アイテムを削除
    removeItem(itemId, quantity = 1) {
        if (!this.inventory[itemId] || this.inventory[itemId].quantity < quantity) {
            return false;
        }
        
        this.inventory[itemId].quantity -= quantity;
        
        // 数量が0になったら削除
        if (this.inventory[itemId].quantity <= 0) {
            delete this.inventory[itemId];
        }
        
        return true;
    }
    
    // アイテムの使用
    useItem(itemId, player, inBattle = false) {
        const inventoryItem = this.inventory[itemId];
        if (!inventoryItem || inventoryItem.quantity <= 0) {
            return { success: false, message: 'アイテムを持っていない！' };
        }
        
        const item = this.itemDatabase[itemId];
        
        // バトル専用アイテムのチェック
        if (item.category === 'buff' && !inBattle) {
            return { success: false, message: '戦闘中にしか使えない！' };
        }
        
        // アイテムの効果を適用
        let message = '';
        let effectApplied = false;
        
        if (item.effect.hp) {
            if (item.effect.hp === 'full') {
                const healed = player.maxHp - player.hp;
                player.hp = player.maxHp;
                message += `HPが完全回復した！\n`;
                effectApplied = true;
            } else {
                const healed = Math.min(item.effect.hp, player.maxHp - player.hp);
                player.hp = Math.min(player.maxHp, player.hp + item.effect.hp);
                message += `HPが${healed}回復した！\n`;
                effectApplied = true;
            }
        }
        
        if (item.effect.mp) {
            if (item.effect.mp === 'full') {
                const recovered = player.maxMp - player.mp;
                player.mp = player.maxMp;
                message += `MPが完全回復した！`;
                effectApplied = true;
            } else {
                const recovered = Math.min(item.effect.mp, player.maxMp - player.mp);
                player.mp = Math.min(player.maxMp, player.mp + item.effect.mp);
                message += `MPが${recovered}回復した！`;
                effectApplied = true;
            }
        }
        
        if (item.effect.escape) {
            message = 'ダンジョンから脱出した！';
            effectApplied = true;
            // TODO: マップ遷移処理
        }
        
        // バフ効果（戦闘中のみ）
        if (inBattle) {
            if (item.effect.attackBoost) {
                player.attackBoostMultiplier = item.effect.attackBoost;
                player.attackBoostDuration = item.effect.duration;
                message += `攻撃力が上昇した！`;
                effectApplied = true;
            }
            
            if (item.effect.defenseBoost) {
                player.defenseBoostMultiplier = item.effect.defenseBoost;
                player.defenseBoostDuration = item.effect.duration;
                message += `防御力が上昇した！`;
                effectApplied = true;
            }
            
            if (item.effect.speedBoost) {
                player.speedBoost = true;
                player.speedBoostDuration = item.effect.duration;
                message += `素早さが上昇した！`;
                effectApplied = true;
            }
        }
        
        if (effectApplied) {
            // アイテムを消費（キーアイテム以外）
            if (item.type === 'consumable') {
                this.removeItem(itemId, 1);
            }
            
            // UIを更新
            if (window.updateUI) {
                window.updateUI();
            }
            
            return { 
                success: true, 
                message: message || `${item.name}を使った！`,
                item: item
            };
        } else {
            return { success: false, message: 'このアイテムは今は使えない' };
        }
    }
    
    // インベントリの取得
    getInventory() {
        return Object.values(this.inventory).sort((a, b) => {
            // カテゴリー順にソート
            const categoryOrder = ['recovery', 'buff', 'utility', 'special', 'key'];
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
        });
    }
    
    // アイテムの所持数を取得
    getItemCount(itemId) {
        return this.inventory[itemId]?.quantity || 0;
    }
    
    // アイテムを持っているかチェック
    hasItem(itemId) {
        return this.getItemCount(itemId) > 0;
    }
    
    // ショップでアイテムを購入
    buyItem(itemId, quantity = 1, player) {
        const item = this.itemDatabase[itemId];
        if (!item) return { success: false, message: 'そのアイテムは存在しない' };
        
        const totalCost = item.price * quantity;
        
        if (player.gold < totalCost) {
            return { success: false, message: 'ゴールドが足りない！' };
        }
        
        player.gold -= totalCost;
        this.addItem(itemId, quantity);
        
        return { 
            success: true, 
            message: `${item.name} x${quantity}を購入した！\n${totalCost}ゴールドを支払った。`
        };
    }
    
    // ショップでアイテムを売却
    sellItem(itemId, quantity = 1, player) {
        const item = this.itemDatabase[itemId];
        if (!item) return { success: false, message: 'そのアイテムは存在しない' };
        
        if (!this.hasItem(itemId) || this.getItemCount(itemId) < quantity) {
            return { success: false, message: 'アイテムを持っていない！' };
        }
        
        // キーアイテムは売却不可
        if (item.type === 'key') {
            return { success: false, message: 'このアイテムは売却できない' };
        }
        
        const totalValue = item.sellPrice * quantity;
        
        this.removeItem(itemId, quantity);
        player.gold += totalValue;
        
        return { 
            success: true, 
            message: `${item.name} x${quantity}を売却した！\n${totalValue}ゴールドを手に入れた。`
        };
    }

    // === セーブ用: id→数量のみ ===
    toJSON() {
        const out = {};
        for (const id in this.inventory) out[id] = this.inventory[id].quantity;
        return out;
    }
    // === ロード用: DBから再構築 ===
    fromJSON(data) {
        this.inventory = {};
        if (!data) return;
        for (const id in data) {
            if (this.itemDatabase[id] && data[id] > 0) this.addItem(id, data[id]);
        }
    }
}

// グローバルにエクスポート
window.ItemSystem = ItemSystem;
