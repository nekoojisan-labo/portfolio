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
}

// キャラクターデータ定義
const CHARACTER_DATA = {
    akari: {
        id: 'akari',
        name: 'アカリ',
        level: 1,
        exp: 0,  // 経験値を追加
        hp: 80,
        maxHp: 80,
        mp: 60,
        maxMp: 60,
        attack: 8,
        defense: 4,
        magic: 12,
        speed: 10,
        skills: ['heal', 'light_arrow'],
        description: 'カイトの幼馴染。回復魔法が得意な心優しい少女。',
        sprite: '👧',
        role: 'healer'
    },
    riku: {
        id: 'riku',
        name: 'リク',
        level: 1,
        exp: 0,  // 経験値を追加
        hp: 120,
        maxHp: 120,
        mp: 30,
        maxMp: 30,
        attack: 15,
        defense: 10,
        magic: 5,
        speed: 6,
        skills: ['shield_bash', 'taunt'],
        description: '元警備隊員の青年。物理攻撃と防御に優れる。',
        sprite: '🛡️',
        role: 'tank'
    },
    yami: {
        id: 'yami',
        name: 'ヤミ',
        level: 1,
        exp: 0,  // 経験値を追加
        hp: 70,
        maxHp: 70,
        mp: 80,
        maxMp: 80,
        attack: 6,
        defense: 3,
        magic: 18,
        speed: 12,
        skills: ['dark_pulse', 'curse'],
        description: '謎に包まれた闇魔法使い。高い魔法攻撃力を持つ。',
        sprite: '🌙',
        role: 'mage'
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.PartySystem = PartySystem;
    window.CHARACTER_DATA = CHARACTER_DATA;
}
