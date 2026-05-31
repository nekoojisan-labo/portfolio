// ==========================================
// 魔法システム (Magic System)
// ==========================================

class MagicSystem {
    constructor() {
        // 魔法データベース
        this.magicDatabase = {
            // 攻撃魔法
            fire_bolt: {
                id: 'fire_bolt',
                name: 'ファイアボルト',
                emoji: '🔥',
                type: 'offensive',
                mpCost: 8,
                power: 20,
                description: '火炎の矢を放つ',
                price: 500,
                requiredLevel: 2,
                allowedRoles: ['all-rounder', 'mage', 'tank']
            },
            ice_lance: {
                id: 'ice_lance',
                name: 'アイスランス',
                emoji: '❄️',
                type: 'offensive',
                mpCost: 10,
                power: 25,
                description: '氷の槍で敵を貫く',
                price: 700,
                requiredLevel: 4,
                allowedRoles: ['all-rounder', 'mage', 'tank']
            },
            thunder_strike: {
                id: 'thunder_strike',
                name: 'サンダーストライク',
                emoji: '⚡',
                type: 'offensive',
                mpCost: 12,
                power: 30,
                description: '雷を落として攻撃',
                price: 900,
                requiredLevel: 6,
                allowedRoles: ['all-rounder', 'mage', 'tank']
            },
            explosion: {
                id: 'explosion',
                name: 'エクスプロージョン',
                emoji: '💥',
                type: 'offensive',
                mpCost: 20,
                power: 50,
                description: '大爆発を起こす',
                price: 1500,
                requiredLevel: 10,
                allowedRoles: ['all-rounder', 'mage', 'tank']
            },

            // 回復魔法
            heal: {
                id: 'heal',
                name: 'ヒール',
                emoji: '💚',
                type: 'healing',
                mpCost: 7,
                power: 30,
                description: 'HPを回復する',
                price: 400,
                requiredLevel: 1,
                allowedRoles: ['all-rounder', 'healer']
            },
            mega_heal: {
                id: 'mega_heal',
                name: 'メガヒール',
                emoji: '💚',
                type: 'healing',
                mpCost: 15,
                power: 80,
                description: 'HPを大幅に回復',
                price: 800,
                requiredLevel: 5,
                allowedRoles: ['all-rounder', 'healer']
            },

            // 補助魔法
            protect: {
                id: 'protect',
                name: 'プロテクト',
                emoji: '🛡️',
                type: 'support',
                mpCost: 10,
                duration: 3,
                effect: 'defense_up',
                power: 1.5,
                description: '防御力を上げる（3ターン）',
                price: 600,
                requiredLevel: 3,
                allowedRoles: ['all-rounder', 'healer', 'mage']
            },
            haste: {
                id: 'haste',
                name: 'ヘイスト',
                emoji: '💨',
                type: 'support',
                mpCost: 12,
                duration: 3,
                effect: 'speed_up',
                description: '素早さを上げる（3ターン）',
                price: 700,
                requiredLevel: 4,
                allowedRoles: ['all-rounder', 'healer', 'mage']
            },

            // 神威魔法
            kamui_storm: {
                id: 'kamui_storm',
                name: '神威・嵐',
                emoji: '🌪️',
                type: 'kamui',
                mpCost: 25,
                power: 60,
                description: '神の嵐を呼び起こす',
                price: 2000,
                requiredLevel: 8,
                allowedRoles: ['all-rounder']
            },
            kamui_blessing: {
                id: 'kamui_blessing',
                name: '神威・祝福',
                emoji: '✨',
                type: 'kamui',
                mpCost: 20,
                duration: 5,
                effect: 'all_up',
                power: 1.3,
                description: '全能力を上昇させる（5ターン）',
                price: 2500,
                requiredLevel: 12,
                allowedRoles: ['all-rounder']
            }
        };

        // キャラクターごとの習得魔法（characterId -> {magicId: magicData}）
        this.learnedMagicByCharacter = {};
    }
    
    // キャラクターIDを取得
    getCharacterId(character = window.player) {
        if (!character) return 'player';
        return character.characterId || character.name || 'player';
    }

    // 魔法を習得
    learnMagic(magicId, character) {
        console.log('[DEBUG] learnMagic called with:', { magicId, character });

        if (!character) {
            console.error('[ERROR] learnMagic called without character parameter!');
            console.trace();
            return false;
        }

        const magic = this.magicDatabase[magicId];
        if (!magic) {
            console.error('Unknown magic:', magicId);
            return false;
        }

        // 役割チェック
        const characterRole = character.role || 'all-rounder';
        if (!magic.allowedRoles.includes(characterRole)) {
            console.error(`${character.name}の役割（${characterRole}）では${magic.name}を習得できません`);
            return false;
        }

        const charId = this.getCharacterId(character);
        if (!this.learnedMagicByCharacter[charId]) {
            this.learnedMagicByCharacter[charId] = {};
        }

        console.log(`${character.name} learning magic: ${magicId}`);
        this.learnedMagicByCharacter[charId][magicId] = { ...magic };
        console.log('Learned magic:', this.learnedMagicByCharacter[charId]);
        return true;
    }
    
    // 魔法を使用
    useMagic(magicId, character, target, inBattle = false) {
        const charId = this.getCharacterId(character);
        const learnedMagic = this.learnedMagicByCharacter[charId] || {};
        const magic = learnedMagic[magicId];

        console.log('[DEBUG] useMagic:', {
            magicId,
            charId,
            characterName: character.name,
            learnedMagicKeys: Object.keys(learnedMagic),
            allCharacterIds: Object.keys(this.learnedMagicByCharacter),
            magicFound: !!magic
        });

        if (!magic) {
            return { success: false, message: 'この魔法は習得していない！' };
        }

        // MPチェック
        if (character.mp < magic.mpCost) {
            return { success: false, message: 'MPが足りない！' };
        }

        // MP消費
        character.mp -= magic.mpCost;

        let message = '';
        let damage = 0;

        // 魔法タイプ別処理
        switch (magic.type) {
            case 'offensive':
                // 攻撃魔法
                if (!target || !inBattle) {
                    return { success: false, message: '戦闘中にしか使えない！' };
                }
                damage = Math.floor(magic.power * (1 + Math.random() * 0.2));
                target.currentHp = Math.max(0, target.currentHp - damage);
                message = `${magic.name}！\n${target.name}に ${damage} のダメージ！`;
                break;

            case 'healing':
                // 回復魔法（対象が明示されていれば対象を、なければ自分を回復）
                const healTarget = (target && target !== character && typeof target.maxHp === 'number') ? target : character;
                const healAmount = Math.min(magic.power, healTarget.maxHp - healTarget.hp);
                healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + magic.power);
                message = `${magic.name}！\n${healTarget.name || character.name}の HPが ${healAmount} 回復した！`;
                break;

            case 'support':
                // 補助魔法
                if (!inBattle) {
                    return { success: false, message: '戦闘中にしか使えない！' };
                }

                if (magic.effect === 'defense_up') {
                    character.magicDefenseBoost = magic.power;
                    character.magicDefenseBoostDuration = magic.duration;
                    message = `${magic.name}！\n防御力が上がった！`;
                } else if (magic.effect === 'speed_up') {
                    character.magicSpeedBoost = true;
                    character.magicSpeedBoostDuration = magic.duration;
                    message = `${magic.name}！\n素早さが上がった！`;
                } else if (magic.effect === 'all_up') {
                    character.magicAllBoost = magic.power;
                    character.magicAllBoostDuration = magic.duration;
                    message = `${magic.name}！\n全能力が上がった！`;
                }
                break;

            case 'kamui':
                // 神威魔法
                if (!target || !inBattle) {
                    return { success: false, message: '戦闘中にしか使えない！' };
                }
                damage = Math.floor(magic.power * (1.2 + Math.random() * 0.3));
                target.currentHp = Math.max(0, target.currentHp - damage);
                message = `${magic.name}！\n神の力が襲いかかる！\n${target.name}に ${damage} のダメージ！`;
                break;
        }

        // UIを更新
        if (window.updateUI) {
            window.updateUI();
        }

        return {
            success: true,
            message: message,
            damage: damage,
            magic: magic
        };
    }
    
    // 習得済み魔法リストを取得
    getLearnedMagic(character) {
        const charId = this.getCharacterId(character);
        const learnedMagic = this.learnedMagicByCharacter[charId] || {};
        return Object.values(learnedMagic).sort((a, b) => {
            const typeOrder = ['offensive', 'healing', 'support', 'kamui'];
            return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
        });
    }

    // 習得済み神威魔法リストを取得
    getLearnedKamuiMagic(character) {
        const charId = this.getCharacterId(character);
        const learnedMagic = this.learnedMagicByCharacter[charId] || {};
        return Object.values(learnedMagic).filter(magic => magic.type === 'kamui');
    }

    // 魔法を習得しているかチェック
    hasLearned(magicId, character = window.player) {
        const charId = this.getCharacterId(character);
        const learnedMagic = this.learnedMagicByCharacter[charId] || {};
        return !!learnedMagic[magicId];
    }
    
    // 魔法の購入
    buyMagic(magicId, character) {
        const magic = this.magicDatabase[magicId];
        if (!magic) {
            return { success: false, message: 'その魔法は存在しない' };
        }

        // 役割チェック
        const characterRole = character.role || 'all-rounder';
        if (!magic.allowedRoles.includes(characterRole)) {
            return {
                success: false,
                message: `${character.name}の役割では習得できない魔法です`
            };
        }

        // 既に習得済みかチェック
        if (this.hasLearned(magicId, character)) {
            return { success: false, message: 'すでに習得している魔法です' };
        }

        // レベル要件チェック
        if (magic.requiredLevel > character.level) {
            return {
                success: false,
                message: `レベル${magic.requiredLevel}以上で習得可能`
            };
        }

        // 所持金チェック
        if (character.gold < magic.price) {
            return { success: false, message: 'ゴールドが足りない！' };
        }

        character.gold -= magic.price;
        this.learnMagic(magicId, character);

        return {
            success: true,
            message: `${magic.name}を習得した！\n${magic.price}ゴールドを支払った。`
        };
    }
}

// グローバルにエクスポート
window.MagicSystem = MagicSystem;
