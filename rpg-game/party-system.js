// デウス・コード 八百万の神託 - パーティシステム

class PartySystem {
    constructor() {
        this.members = [];
        this.maxSize = 4; // 最大パーティサイズ

        console.log('👥 Party System initialized');
    }

    // パーティメンバーを追加
    addMember(character) {
        if (this.members.length >= this.maxSize) {
            console.warn('Party is full');
            return false;
        }

        if (this.members.find(m => m.id === character.id)) {
            console.warn(`${character.name} is already in the party`);
            return false;
        }

        this.members.push(character);
        console.log(`✅ ${character.name} joined the party!`);
        return true;
    }

    // パーティメンバーを削除
    removeMember(characterId) {
        const index = this.members.findIndex(m => m.id === characterId);
        if (index === -1) {
            console.warn(`Character ${characterId} not found in party`);
            return false;
        }

        const removed = this.members.splice(index, 1)[0];
        console.log(`${removed.name} left the party`);
        return true;
    }

    // パーティメンバーを取得
    getMembers() {
        return [...this.members];
    }

    // パーティサイズを取得
    getSize() {
        return this.members.length;
    }

    // 特定のメンバーを取得
    getMember(characterId) {
        return this.members.find(m => m.id === characterId);
    }

    // === セーブ用: メンバーは純データなのでディープコピー ===
    toJSON() {
        return this.members.map(m => JSON.parse(JSON.stringify(m)));
    }
    // === ロード用: members を置換 ===
    fromJSON(data) {
        this.members = Array.isArray(data) ? data.map(m => ({ ...m })) : [];
    }
}

// キャラクターデータ定義
const CHARACTER_DATA = {
    akari: {
        id: 'akari',
        characterId: 'akari',
        name: 'アカリ',
        level: 1,
        exp: 0,
        hp: 80,
        maxHp: 80,
        baseMaxHp: 80,
        mp: 60,
        maxMp: 60,
        baseMaxMp: 60,
        attack: 8,
        baseAttack: 8,
        defense: 4,
        baseDefense: 4,
        magic: 12,
        baseMagic: 12,
        speed: 10,
        baseSpeed: 10,
        skills: ['heal', 'light_arrow'],
        description: 'カイトの幼馴染。回復魔法が得意な心優しい少女。',
        sprite: '👧',
        role: 'healer'
    },
    riku: {
        id: 'riku',
        characterId: 'riku',
        name: 'リク',
        level: 1,
        exp: 0,
        hp: 120,
        maxHp: 120,
        baseMaxHp: 120,
        mp: 30,
        maxMp: 30,
        baseMaxMp: 30,
        attack: 15,
        baseAttack: 15,
        defense: 10,
        baseDefense: 10,
        magic: 5,
        baseMagic: 5,
        speed: 6,
        baseSpeed: 6,
        skills: ['shield_bash', 'taunt'],
        description: '元警備隊員の青年。物理攻撃と防御に優れる。',
        sprite: '🛡️',
        role: 'tank'
    },
    yami: {
        id: 'yami',
        characterId: 'yami',
        name: 'ヤミ',
        level: 1,
        exp: 0,
        hp: 70,
        maxHp: 70,
        baseMaxHp: 70,
        mp: 80,
        maxMp: 80,
        baseMaxMp: 80,
        attack: 6,
        baseAttack: 6,
        defense: 3,
        baseDefense: 3,
        magic: 18,
        baseMagic: 18,
        speed: 12,
        baseSpeed: 12,
        skills: ['dark_pulse', 'curse'],
        description: '謎に包まれた闇魔法使い。高い魔法攻撃力を持つ。',
        sprite: '🌙',
        role: 'mage'
    }
};

// キャラクター成長データ定義
const CHARACTER_GROWTH = {
    kaito: {
        expCurve: 'normal',
        statGrowth: {
            hp: { min: 18, max: 23 },
            mp: { min: 8, max: 13 },
            attack: { min: 2, max: 5 },
            defense: { min: 1, max: 4 },
            magic: { min: 2, max: 5 },
            speed: { min: 1, max: 3 }
        },
        skillLearning: {
            3: ['ice_lance'],
            5: ['protect'],
            8: ['kamui_storm'],
            12: ['kamui_blessing']
        }
    },
    akari: {
        expCurve: 'normal',
        statGrowth: {
            hp: { min: 12, max: 18 },
            mp: { min: 12, max: 18 },
            attack: { min: 1, max: 3 },
            defense: { min: 1, max: 3 },
            magic: { min: 3, max: 6 },
            speed: { min: 2, max: 4 }
        },
        skillLearning: {
            4: ['mega_heal'],
            6: ['protect'],
            8: ['haste']
        }
    },
    riku: {
        expCurve: 'normal',
        statGrowth: {
            hp: { min: 22, max: 28 },
            mp: { min: 4, max: 8 },
            attack: { min: 3, max: 6 },
            defense: { min: 3, max: 6 },
            magic: { min: 0, max: 2 },
            speed: { min: 0, max: 2 }
        },
        skillLearning: {
            5: ['fire_bolt'],
            7: ['protect']
        }
    },
    yami: {
        expCurve: 'normal',
        statGrowth: {
            hp: { min: 10, max: 16 },
            mp: { min: 14, max: 20 },
            attack: { min: 0, max: 2 },
            defense: { min: 0, max: 2 },
            magic: { min: 4, max: 7 },
            speed: { min: 2, max: 5 }
        },
        skillLearning: {
            3: ['ice_lance'],
            5: ['thunder_strike'],
            8: ['explosion'],
            10: ['haste']
        }
    }
};

// 経験値テーブル計算関数
function calculateExpNeeded(level, expCurve = 'normal') {
    const curves = {
        fast: (lvl) => Math.floor(lvl * lvl * 35 + lvl * 20),
        normal: (lvl) => Math.floor(lvl * lvl * 50 + lvl * 25),
        slow: (lvl) => Math.floor(lvl * lvl * 70 + lvl * 30)
    };

    return curves[expCurve](level);
}

// ステータス成長値をランダム計算
function calculateStatGrowth(characterId, stat) {
    const growth = CHARACTER_GROWTH[characterId];
    if (!growth || !growth.statGrowth[stat]) {
        return 0;
    }

    const { min, max } = growth.statGrowth[stat];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.PartySystem = PartySystem;
    window.CHARACTER_DATA = CHARACTER_DATA;
    window.CHARACTER_GROWTH = CHARACTER_GROWTH;
    window.calculateExpNeeded = calculateExpNeeded;
    window.calculateStatGrowth = calculateStatGrowth;
}
