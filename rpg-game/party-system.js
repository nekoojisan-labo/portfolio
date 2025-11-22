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

    // メンバーに初期装備を装備させる
    equipInitialEquipment(member) {
        if (!member.initialEquipment || !window.equipmentSystem) {
            console.log(`No initial equipment for ${member.name}`);
            return;
        }

        console.log(`Equipping initial equipment for ${member.name}:`, member.initialEquipment);

        member.initialEquipment.forEach(equipmentId => {
            const equipment = window.equipmentSystem.equipmentDatabase[equipmentId];
            if (!equipment) {
                console.warn(`Equipment ${equipmentId} not found`);
                return;
            }

            // 装備スロットに装備
            member.equipment[equipment.slot] = equipmentId;

            // ステータスを再計算
            this.recalculateMemberStats(member);

            console.log(`✅ Equipped ${equipment.name} to ${member.name}`);
        });
    }

    // メンバーのステータスを再計算
    recalculateMemberStats(member) {
        // 基本ステータスから開始
        member.maxHp = member.baseMaxHp || 100;
        member.maxMp = member.baseMaxMp || 50;
        member.attack = member.baseAttack || 10;
        member.defense = member.baseDefense || 5;
        member.magic = member.baseMagic || 10;

        // 装備ボーナスを加算
        if (member.equipment && window.equipmentSystem) {
            Object.values(member.equipment).forEach(equipmentId => {
                if (!equipmentId) return;

                const equipment = window.equipmentSystem.equipmentDatabase[equipmentId];
                if (!equipment) return;

                member.maxHp += equipment.hp || 0;
                member.maxMp += equipment.mp || 0;
                member.attack += equipment.attack || 0;
                member.defense += equipment.defense || 0;
                member.magic += equipment.magic || 0;
            });
        }

        // 現在HPMPが最大値を超えないように調整
        member.hp = Math.min(member.hp || member.maxHp, member.maxHp);
        member.mp = Math.min(member.mp || member.maxMp, member.maxMp);

        console.log(`${member.name} stats recalculated:`, {
            HP: member.maxHp,
            MP: member.maxMp,
            ATK: member.attack,
            DEF: member.defense,
            MAG: member.magic
        });
    }
}

// キャラクターデータ定義
const CHARACTER_DATA = {
    akari: {
        id: 'akari',
        name: 'アカリ',
        level: 1,
        exp: 0,

        // 基本ステータス
        baseMaxHp: 80,
        baseMaxMp: 60,
        baseAttack: 5,
        baseDefense: 3,
        baseMagic: 12,

        // 現在ステータス（装備込み）
        hp: 80,
        maxHp: 80,
        mp: 60,
        maxMp: 60,
        attack: 5,
        defense: 3,
        magic: 12,
        speed: 10,

        // 装備スロット
        equipment: {
            weapon: null,
            head: null,
            body: null,
            hands: null,
            accessory: null
        },

        // 初期装備
        initialEquipment: ['healing_staff', 'healer_robe'],

        skills: ['heal', 'light_arrow'],
        description: 'カイトの幼馴染。回復魔法が得意な心優しい少女。',
        sprite: '👧',
        role: 'healer'
    },
    riku: {
        id: 'riku',
        name: 'リク',
        level: 1,
        exp: 0,

        // 基本ステータス
        baseMaxHp: 120,
        baseMaxMp: 30,
        baseAttack: 12,
        baseDefense: 8,
        baseMagic: 5,

        // 現在ステータス（装備込み）
        hp: 120,
        maxHp: 120,
        mp: 30,
        maxMp: 30,
        attack: 12,
        defense: 8,
        magic: 5,
        speed: 6,

        // 装備スロット
        equipment: {
            weapon: null,
            head: null,
            body: null,
            hands: null,
            accessory: null
        },

        // 初期装備
        initialEquipment: ['guardian_shield', 'plate_armor'],

        skills: ['shield_bash', 'taunt'],
        description: '元警備隊員の青年。物理攻撃と防御に優れる。',
        sprite: '🛡️',
        role: 'tank'
    },
    yami: {
        id: 'yami',
        name: 'ヤミ',
        level: 1,
        exp: 0,

        // 基本ステータス
        baseMaxHp: 70,
        baseMaxMp: 80,
        baseAttack: 4,
        baseDefense: 2,
        baseMagic: 18,

        // 現在ステータス（装備込み）
        hp: 70,
        maxHp: 70,
        mp: 80,
        maxMp: 80,
        attack: 4,
        defense: 2,
        magic: 18,
        speed: 12,

        // 装備スロット
        equipment: {
            weapon: null,
            head: null,
            body: null,
            hands: null,
            accessory: null
        },

        // 初期装備
        initialEquipment: ['dark_grimoire', 'shadow_robe'],

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
