// ==========================================
// 装備システム (Equipment System)
// ==========================================

class EquipmentSystem {
    constructor() {
        // 装備データベース
        this.equipmentDatabase = {
            // 武器
            wooden_sword: {
                id: 'wooden_sword',
                name: '木刀',
                emoji: '🗡️',
                type: 'weapon',
                slot: 'weapon',
                attack: 5,
                defense: 0,
                description: '初心者用の木製の刀',
                price: 100,
                sellPrice: 50,
                requiredLevel: 1
            },
            iron_sword: {
                id: 'iron_sword',
                name: '鉄の剣',
                emoji: '⚔️',
                type: 'weapon',
                slot: 'weapon',
                attack: 12,
                defense: 0,
                description: '鍛冶屋が作った頑丈な剣',
                price: 300,
                sellPrice: 150,
                requiredLevel: 3
            },
            plasma_blade: {
                id: 'plasma_blade',
                name: 'プラズマブレード',
                emoji: '⚡',
                type: 'weapon',
                slot: 'weapon',
                attack: 20,
                defense: 0,
                mp: 5,
                description: 'エネルギーで斬る未来の剣',
                price: 800,
                sellPrice: 400,
                requiredLevel: 5
            },
            kamui_katana: {
                id: 'kamui_katana',
                name: '神威の刀',
                emoji: '🔱',
                type: 'weapon',
                slot: 'weapon',
                attack: 35,
                defense: 0,
                mp: 10,
                description: '神の力が宿る伝説の刀',
                price: 2000,
                sellPrice: 1000,
                requiredLevel: 10
            },
            cyber_gun: {
                id: 'cyber_gun',
                name: 'サイバーガン',
                emoji: '🔫',
                type: 'weapon',
                slot: 'weapon',
                attack: 18,
                defense: 0,
                description: '高威力のエネルギー銃',
                price: 600,
                sellPrice: 300,
                requiredLevel: 4
            },
            
            // 防具 - 頭
            cloth_hat: {
                id: 'cloth_hat',
                name: '布の帽子',
                emoji: '🧢',
                type: 'armor',
                slot: 'head',
                attack: 0,
                defense: 2,
                description: '簡素な布製の帽子',
                price: 80,
                sellPrice: 40,
                requiredLevel: 1
            },
            iron_helmet: {
                id: 'iron_helmet',
                name: '鉄の兜',
                emoji: '⛑️',
                type: 'armor',
                slot: 'head',
                attack: 0,
                defense: 5,
                description: '頭を守る鉄製の兜',
                price: 250,
                sellPrice: 125,
                requiredLevel: 3
            },
            cyber_helmet: {
                id: 'cyber_helmet',
                name: 'サイバーヘルメット',
                emoji: '🪖',
                type: 'armor',
                slot: 'head',
                attack: 0,
                defense: 10,
                hp: 10,
                description: 'ハイテク装甲のヘルメット',
                price: 600,
                sellPrice: 300,
                requiredLevel: 6
            },
            
            // 防具 - 体
            cloth_armor: {
                id: 'cloth_armor',
                name: '布の服',
                emoji: '👕',
                type: 'armor',
                slot: 'body',
                attack: 0,
                defense: 3,
                description: '普通の布製の服',
                price: 120,
                sellPrice: 60,
                requiredLevel: 1
            },
            leather_armor: {
                id: 'leather_armor',
                name: '革の鎧',
                emoji: '🦺',
                type: 'armor',
                slot: 'body',
                attack: 0,
                defense: 8,
                description: '柔軟性のある革製の鎧',
                price: 350,
                sellPrice: 175,
                requiredLevel: 3
            },
            chain_mail: {
                id: 'chain_mail',
                name: '鎖帷子',
                emoji: '🛡️',
                type: 'armor',
                slot: 'body',
                attack: 0,
                defense: 15,
                hp: 20,
                description: '鎖で編まれた重厚な鎧',
                price: 800,
                sellPrice: 400,
                requiredLevel: 5
            },
            cyber_suit: {
                id: 'cyber_suit',
                name: 'サイバースーツ',
                emoji: '🦾',
                type: 'armor',
                slot: 'body',
                attack: 2,
                defense: 20,
                hp: 30,
                mp: 15,
                description: 'ナノテク装甲のボディスーツ',
                price: 1500,
                sellPrice: 750,
                requiredLevel: 8
            },
            
            // 防具 - 手
            cloth_gloves: {
                id: 'cloth_gloves',
                name: '布の手袋',
                emoji: '🧤',
                type: 'armor',
                slot: 'hands',
                attack: 1,
                defense: 1,
                description: '基本的な布製の手袋',
                price: 60,
                sellPrice: 30,
                requiredLevel: 1
            },
            iron_gauntlets: {
                id: 'iron_gauntlets',
                name: '鉄の篭手',
                emoji: '🥊',
                type: 'armor',
                slot: 'hands',
                attack: 3,
                defense: 4,
                description: '手を守る鉄製の篭手',
                price: 200,
                sellPrice: 100,
                requiredLevel: 3
            },
            power_gloves: {
                id: 'power_gloves',
                name: 'パワーグローブ',
                emoji: '🦾',
                type: 'armor',
                slot: 'hands',
                attack: 5,
                defense: 7,
                description: 'パワーを増幅する手袋',
                price: 500,
                sellPrice: 250,
                requiredLevel: 5
            },
            
            // アクセサリー
            health_ring: {
                id: 'health_ring',
                name: 'ヘルスリング',
                emoji: '💍',
                type: 'accessory',
                slot: 'accessory',
                attack: 0,
                defense: 0,
                hp: 30,
                description: '最大HPを増やす指輪',
                price: 400,
                sellPrice: 200,
                requiredLevel: 2
            },
            power_ring: {
                id: 'power_ring',
                name: 'パワーリング',
                emoji: '💍',
                type: 'accessory',
                slot: 'accessory',
                attack: 5,
                defense: 0,
                description: '攻撃力を上げる指輪',
                price: 400,
                sellPrice: 200,
                requiredLevel: 2
            },
            defense_ring: {
                id: 'defense_ring',
                name: 'ディフェンスリング',
                emoji: '💍',
                type: 'accessory',
                slot: 'accessory',
                attack: 0,
                defense: 5,
                description: '防御力を上げる指輪',
                price: 400,
                sellPrice: 200,
                requiredLevel: 2
            },
            mana_amulet: {
                id: 'mana_amulet',
                name: 'マナのアミュレット',
                emoji: '📿',
                type: 'accessory',
                slot: 'accessory',
                attack: 0,
                defense: 0,
                mp: 20,
                description: '最大MPを増やすお守り',
                price: 500,
                sellPrice: 250,
                requiredLevel: 3
            },
            kamui_talisman: {
                id: 'kamui_talisman',
                name: '神威のタリスマン',
                emoji: '🎴',
                type: 'accessory',
                slot: 'accessory',
                attack: 3,
                defense: 3,
                hp: 20,
                mp: 10,
                description: '神の加護を受けるお守り',
                price: 1200,
                sellPrice: 600,
                requiredLevel: 7
            }
        };
        
        // キャラクター別の装備スロット（charId -> {weapon,head,...}）
        this.equippedByCharacter = {};
        // 所持している装備（インベントリ）※全キャラ共有
        this.inventory = {};
    }

    // キャラID（パーティ別装備のキー）
    _charId(character) {
        return (character && (character.characterId || character.name)) || 'player';
    }

    // 指定キャラの装備スロット（無ければ生成）
    getEquipped(character) {
        const id = this._charId(character);
        if (!this.equippedByCharacter[id]) {
            this.equippedByCharacter[id] = { weapon: null, head: null, body: null, hands: null, accessory: null };
        }
        return this.equippedByCharacter[id];
    }
    
    // 装備を追加
    addEquipment(equipmentId, quantity = 1) {
        const equipment = this.equipmentDatabase[equipmentId];
        if (!equipment) {
            console.error('Unknown equipment:', equipmentId);
            return false;
        }
        
        console.log(`Adding equipment: ${equipmentId} x${quantity}`);
        console.log('Current inventory before add:', this.inventory);
        
        if (!this.inventory[equipmentId]) {
            this.inventory[equipmentId] = {
                ...equipment,
                quantity: 0
            };
        }
        
        this.inventory[equipmentId].quantity += quantity;
        console.log(`Added ${quantity}x ${equipment.name}`);
        console.log('Current inventory after add:', this.inventory);
        console.log('Total equipment count:', Object.keys(this.inventory).length);
        return true;
    }
    
    // 装備する
    equipItem(equipmentId, player) {
        const equipment = this.equipmentDatabase[equipmentId];
        if (!equipment) {
            console.error('Equipment not found:', equipmentId);
            return { success: false, message: '装備が見つからない' };
        }

        // インベントリにあるかチェック
        if (!this.inventory[equipmentId] || this.inventory[equipmentId].quantity <= 0) {
            console.error('Equipment not in inventory:', equipmentId, this.inventory);
            return { success: false, message: 'この装備を持っていない' };
        }
        
        const slot = equipment.slot;
        const equipped = this.getEquipped(player);
        const oldEquipmentId = equipped[slot];
        
        console.log(`Equipping ${equipment.name} to slot ${slot}`);
        
        // 古い装備を外してインベントリに戻す
        if (oldEquipmentId) {
            console.log(`Unequipping old equipment from slot ${slot}:`, oldEquipmentId);
            const oldEquipment = this.equipmentDatabase[oldEquipmentId];
            if (oldEquipment) {
                this.addEquipment(oldEquipmentId, 1);
            }
        }
        
        // 新しい装備を装備
        equipped[slot] = equipmentId;
        
        // インベントリから削除
        this.inventory[equipmentId].quantity--;
        if (this.inventory[equipmentId].quantity <= 0) {
            delete this.inventory[equipmentId];
        }
        
        // ステータスを再計算
        this.recalculatePlayerStats(player);
        
        return { 
            success: true, 
            message: `${equipment.name}を装備した！`,
            equipment: equipment
        };
    }
    
    // 装備を外す
    unequipItem(slot, player, returnToInventory = true) {
        const equipped = this.getEquipped(player);
        const equipmentId = equipped[slot];
        if (!equipmentId) {
            return { success: false, message: '何も装備していない' };
        }

        const equipment = this.equipmentDatabase[equipmentId];

        console.log(`Unequipping ${equipment.name} from slot ${slot}`);

        // 装備を外す
        equipped[slot] = null;
        
        // インベントリに戻す
        if (returnToInventory) {
            this.addEquipment(equipmentId, 1);
        }
        
        // ステータスを再計算
        this.recalculatePlayerStats(player);
        
        return { 
            success: true, 
            message: `${equipment.name}を外した`,
            equipment: equipment
        };
    }
    
    // 装備のステータスを適用/解除
    applyEquipmentStats(equipment, player, apply = true) {
        const multiplier = apply ? 1 : -1;
        
        console.log(`Applying equipment stats: ${equipment.name}, apply=${apply}`);
        console.log('Equipment bonuses:', {
            attack: equipment.attack,
            defense: equipment.defense,
            hp: equipment.hp,
            mp: equipment.mp
        });
        console.log('Player stats before:', {
            attack: player.attack,
            defense: player.defense,
            maxHp: player.maxHp,
            maxMp: player.maxMp
        });
        
        if (equipment.attack) {
            player.attack = (player.attack || 0) + (equipment.attack * multiplier);
        }
        if (equipment.defense) {
            player.defense = (player.defense || 0) + (equipment.defense * multiplier);
        }
        if (equipment.hp) {
            player.maxHp = (player.maxHp || 100) + (equipment.hp * multiplier);
            if (apply) {
                player.hp = Math.min(player.hp, player.maxHp);
            }
        }
        if (equipment.mp) {
            player.maxMp = (player.maxMp || 50) + (equipment.mp * multiplier);
            if (apply) {
                player.mp = Math.min(player.mp, player.maxMp);
            }
        }
        
        console.log('Player stats after:', {
            attack: player.attack,
            defense: player.defense,
            maxHp: player.maxHp,
            maxMp: player.maxMp
        });
    }
    
    // 装備中のアイテムを取得（キャラ別）
    getEquippedItems(character) {
        const slots = this.getEquipped(character);
        const equipped = {};
        for (const slot in slots) {
            const equipmentId = slots[slot];
            equipped[slot] = equipmentId ? this.equipmentDatabase[equipmentId] : null;
        }
        return equipped;
    }
    
    // 装備インベントリを取得
    getEquipmentInventory() {
        console.log('getEquipmentInventory called');
        console.log('Raw inventory:', this.inventory);
        const inventoryArray = Object.values(this.inventory);
        console.log('Inventory array length:', inventoryArray.length);
        console.log('Inventory array:', inventoryArray);
        
        const sorted = inventoryArray.sort((a, b) => {
            // スロット順にソート
            const slotOrder = ['weapon', 'head', 'body', 'hands', 'accessory'];
            return slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot);
        });
        
        console.log('Sorted inventory:', sorted);
        return sorted;
    }
    
    // 装備を持っているかチェック
    hasEquipment(equipmentId) {
        return (this.inventory[equipmentId]?.quantity || 0) > 0;
    }
    
    // 装備の購入
    buyEquipment(equipmentId, player) {
        const equipment = this.equipmentDatabase[equipmentId];
        if (!equipment) {
            return { success: false, message: 'その装備は存在しない' };
        }
        
        if (player.gold < equipment.price) {
            return { success: false, message: 'ゴールドが足りない！' };
        }
        
        player.gold -= equipment.price;
        this.addEquipment(equipmentId, 1);
        
        return { 
            success: true, 
            message: `${equipment.name}を購入した！\n${equipment.price}ゴールドを支払った。`
        };
    }
    
    // 装備の売却
    sellEquipment(equipmentId, player) {
        const equipment = this.equipmentDatabase[equipmentId];
        if (!equipment) {
            return { success: false, message: 'その装備は存在しない' };
        }
        
        if (!this.hasEquipment(equipmentId)) {
            return { success: false, message: '装備を持っていない！' };
        }
        
        this.inventory[equipmentId].quantity--;
        if (this.inventory[equipmentId].quantity <= 0) {
            delete this.inventory[equipmentId];
        }
        
        player.gold += equipment.sellPrice;
        
        return { 
            success: true, 
            message: `${equipment.name}を売却した！\n${equipment.sellPrice}ゴールドを手に入れた。`
        };
    }
    
    // 総ステータスを計算（キャラ別）
    getTotalStats(character) {
        const stats = {
            attack: 0,
            defense: 0,
            hp: 0,
            mp: 0
        };

        const slots = this.getEquipped(character);
        for (const slot in slots) {
            const equipmentId = slots[slot];
            if (equipmentId) {
                const equipment = this.equipmentDatabase[equipmentId];
                stats.attack += equipment.attack || 0;
                stats.defense += equipment.defense || 0;
                stats.hp += equipment.hp || 0;
                stats.mp += equipment.mp || 0;
            }
        }
        
        return stats;
    }
    
    // プレイヤーのステータスを再計算
    recalculatePlayerStats(player) {
        // 基本ステータスを保存（初回のみ）
        if (player.baseAttack === undefined) {
            player.baseAttack = player.attack || 10;
        }
        if (player.baseDefense === undefined) {
            player.baseDefense = player.defense || 5;
        }
        if (player.baseMaxHp === undefined) {
            player.baseMaxHp = 100;
        }
        if (player.baseMaxMp === undefined) {
            player.baseMaxMp = 50;
        }

        // 装備ボーナスを計算（このキャラの装備）
        const equipStats = this.getTotalStats(player);

        // 現在のHPとMPの割合を保存（maxHp/maxMp=0時のNaN伝播を防止）
        const hpRatio = player.maxHp ? player.hp / player.maxHp : 1;
        const mpRatio = player.maxMp ? player.mp / player.maxMp : 1;

        // ステータスを再計算
        player.attack = player.baseAttack + equipStats.attack;
        player.defense = player.baseDefense + equipStats.defense;
        player.maxHp = player.baseMaxHp + equipStats.hp;
        player.maxMp = player.baseMaxMp + equipStats.mp;

        // HPとMPを調整（割合を維持）
        player.hp = Math.min(Math.floor(player.maxHp * hpRatio), player.maxHp);
        player.mp = Math.min(Math.floor(player.maxMp * mpRatio), player.maxMp);

        console.log('Stats recalculated:', {
            base: { attack: player.baseAttack, defense: player.baseDefense },
            equipment: equipStats,
            total: { attack: player.attack, defense: player.defense, maxHp: player.maxHp, maxMp: player.maxMp }
        });
    }

    // === セーブ用: キャラ別装備スロット(id)と在庫(id→数量) ===
    toJSON() {
        const inv = {};
        for (const id in this.inventory) inv[id] = this.inventory[id].quantity;
        const eq = {};
        for (const cid in this.equippedByCharacter) eq[cid] = { ...this.equippedByCharacter[cid] };
        return { equippedByCharacter: eq, inventory: inv };
    }
    // === ロード用: DB参照で再構築。装備は在庫を消費せず直接セット ===
    fromJSON(data, player) {
        this.equippedByCharacter = {};
        this.inventory = {};
        if (data) {
            if (data.inventory) {
                for (const id in data.inventory) {
                    if (this.equipmentDatabase[id] && data.inventory[id] > 0) this.addEquipment(id, data.inventory[id]);
                }
            }
            if (data.equippedByCharacter) {
                for (const cid in data.equippedByCharacter) {
                    const src = data.equippedByCharacter[cid];
                    const dst = { weapon: null, head: null, body: null, hands: null, accessory: null };
                    for (const slot in dst) { const id = src[slot]; if (id && this.equipmentDatabase[id]) dst[slot] = id; }
                    this.equippedByCharacter[cid] = dst;
                }
            } else if (data.equipped && player) {
                // 旧形式（単一装備）→ player の装備として割り当て
                const dst = this.getEquipped(player);
                for (const slot in dst) { const id = data.equipped[slot]; if (id && this.equipmentDatabase[id]) dst[slot] = id; }
            }
        }
        if (player) this.recalculatePlayerStats(player);
    }

    // ロード後、パーティ全員のステータスを装備込みで再計算
    recalcAll(members) {
        (members || []).forEach(m => { if (m) this.recalculatePlayerStats(m); });
    }
}

// グローバルにエクスポート
window.EquipmentSystem = EquipmentSystem;
