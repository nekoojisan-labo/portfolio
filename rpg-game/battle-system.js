// ==========================================
// 戦闘システム (Battle System)
// ==========================================

class BattleSystem {
    constructor() {
        this.inBattle = false;
        this.currentEnemy = null;
        this.selectedCommand = 0;
        this.turnOrder = [];
        this.battleLog = [];
        this.turnCount = 0;
        this.waitingForCommand = false;

        // パーティバトル設定
        this.partyCommands = []; // 各パーティメンバーのコマンドを保存
        this.currentMemberIndex = 0; // 現在コマンド選択中のメンバー
        this.allCommandsSelected = false; // 全員のコマンド選択完了フラグ

        // エンカウント設定
        this.encounterSteps = 0;
        this.encounterThreshold = this.getRandomEncounterSteps('medium');
        this.firstEncounter = true;  // 初回エンカウントフラグ

        // ボス戦設定
        this.isBossBattle = false;
        this.onBossDefeat = null;

        // 敵データベース
        this.enemyDatabase = {
            watcher: {
                name: 'ウォッチャー',
                emoji: '👁️',
                hp: 25,
                maxHp: 25,
                mp: 10,
                attack: 8,
                defense: 5,
                exp: 15,
                gold: 20,
                type: 'drone',
                skills: ['scan', 'alert'],
                description: '監視ドローン。常に周囲を警戒している。'
            },
            cerberus: {
                name: 'ケルベロス',
                emoji: '🐺',
                hp: 45,
                maxHp: 45,
                mp: 15,
                attack: 15,
                defense: 10,
                exp: 35,
                gold: 50,
                type: 'mecha',
                skills: ['bite', 'howl', 'rush'],
                description: '三つ首の機械狼。高い攻撃力を持つ。'
            },
            dustGolem: {
                name: 'ダスト・ゴーレム',
                emoji: '🗿',
                hp: 60,
                maxHp: 60,
                mp: 5,
                attack: 12,
                defense: 18,
                exp: 40,
                gold: 45,
                type: 'construct',
                skills: ['slam', 'guard'],
                description: 'スクラップから生まれた巨人。防御力が高い。'
            },
            alraune: {
                name: 'アルラウネ',
                emoji: '🌱',
                hp: 35,
                maxHp: 35,
                mp: 25,
                attack: 10,
                defense: 8,
                exp: 30,
                gold: 40,
                type: 'hybrid',
                skills: ['drain', 'entangle', 'spore'],
                description: '植物と機械の融合体。特殊攻撃を使う。'
            },
            deusMachina: {
                name: 'デウス・マキナ',
                emoji: '🤖',
                hp: 50,
                maxHp: 50,
                mp: 20,
                attack: 14,
                defense: 12,
                exp: 50,
                gold: 60,
                type: 'android',
                skills: ['laserBeam', 'barrier', 'analyze'],
                description: 'アークの精鋭機械兵。バランスが良い。'
            },
            // ボスエネミー
            corrupted_drone_boss: {
                name: '暴走監視ドローン・Ω',
                emoji: '🛸',
                hp: 150,
                maxHp: 150,
                mp: 50,
                attack: 20,
                defense: 15,
                exp: 200,
                gold: 300,
                type: 'boss',
                boss: true,
                skills: ['omega_laser', 'emp_pulse', 'repair_protocol'],
                description: 'アークの監視システムが暴走した巨大ドローン。強力なレーザー攻撃を放つ。',
                bossId: 'corrupted_drone_boss'
            },
            rogue_ai_core: {
                name: '暴走AIコア',
                emoji: '⚡',
                hp: 250,
                maxHp: 250,
                mp: 100,
                attack: 25,
                defense: 20,
                exp: 500,
                gold: 800,
                type: 'boss',
                boss: true,
                skills: ['data_storm', 'system_hack', 'firewall'],
                description: 'アークのコアシステムの一部。圧倒的な計算能力で攻撃する。',
                bossId: 'rogue_ai_core'
            }
        };
        
        // エリア別エンカウントテーブル
        this.encounterTables = {
            city: ['watcher', 'watcher', 'deusMachina', 'cerberus'],
            subway: ['dustGolem', 'cerberus', 'watcher', 'dustGolem'],
            garden: ['alraune', 'alraune', 'watcher', 'dustGolem'],
            market: ['deusMachina', 'cerberus', 'watcher', 'deusMachina'],
            shrine: ['alraune', 'dustGolem', 'cerberus', 'deusMachina']
        };
    }
    
    // ランダムエンカウント歩数を決定
    getRandomEncounterSteps(encounterRate = 'medium') {
        // エンカウント率に応じて歩数を調整
        const rateSettings = {
            very_high: { min: 8, max: 15 },   // 8-15歩（都庁など危険エリア）
            high: { min: 15, max: 25 },       // 15-25歩（地下鉄など）
            medium: { min: 25, max: 40 },     // 25-40歩（通常エリア）
            low: { min: 40, max: 60 },        // 40-60歩（植物園、神社など）
            none: { min: 9999, max: 9999 }    // エンカウントなし
        };
        
        const settings = rateSettings[encounterRate] || rateSettings.medium;
        return Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
    }
    
    // 歩数をカウント
    countStep(currentArea = 'city', encounterRate = 'medium') {
        if (this.inBattle) return;
        
        // エンカウント率がnoneの場合は何もしない
        if (encounterRate === 'none') {
            this.encounterSteps = 0;  // 歩数をリセット
            return;
        }
        
        this.encounterSteps++;
        
        // 初回エンカウントは少し遅らせる
        const threshold = this.firstEncounter ? 
            this.encounterThreshold + 20 : 
            this.encounterThreshold;
        
        // エンカウントチェック
        if (this.encounterSteps >= threshold) {
            this.firstEncounter = false;
            this.encounterSteps = 0;
            this.encounterThreshold = this.getRandomEncounterSteps(encounterRate);
            
            // エンカウント発生率をさらに調整（確率で発生）
            const encounterChance = {
                very_high: 0.9,  // 90%の確率で発生
                high: 0.75,       // 75%の確率で発生
                medium: 0.6,      // 60%の確率で発生
                low: 0.4          // 40%の確率で発生
            };
            
            const chance = encounterChance[encounterRate] || 0.6;
            if (Math.random() < chance) {
                this.triggerRandomEncounter(currentArea);
            } else {
                // エンカウントしなかった場合は次の閾値を少し短く
                this.encounterThreshold = Math.floor(this.encounterThreshold * 0.7);
            }
        }
    }
    
    // ランダムエンカウント発生
    triggerRandomEncounter(area) {
        const encounterTable = this.encounterTables[area] || this.encounterTables.city;
        const enemyId = encounterTable[Math.floor(Math.random() * encounterTable.length)];
        const enemyData = this.enemyDatabase[enemyId];
        
        if (enemyData) {
            // 敵のステータスをコピーして戦闘開始
            const enemy = {
                ...enemyData,
                currentHp: enemyData.hp,
                currentMp: enemyData.mp || 0,
                maxHp: enemyData.maxHp || enemyData.hp,
                id: enemyId
            };
            
            console.log('エンカウント:', enemy.name, 'HP:', enemy.currentHp, '/', enemy.maxHp, 'EXP:', enemy.exp, 'GOLD:', enemy.gold);
            console.log('次回エンカウントまで:', this.encounterThreshold, '歩');
            this.startBattle(enemy);
        }
    }
    
    // 戦闘開始
    startBattle(enemy, isBossBattle = false, onBossDefeat = null) {
        this.inBattle = true;
        this.isBossBattle = isBossBattle || enemy.boss || false;
        this.onBossDefeat = onBossDefeat;
        this.currentEnemy = { ...enemy }; // 敵データをコピー
        // currentHpを確実に初期化
        if (!this.currentEnemy.currentHp) {
            this.currentEnemy.currentHp = this.currentEnemy.hp;
        }
        if (!this.currentEnemy.currentMp) {
            this.currentEnemy.currentMp = this.currentEnemy.mp;
        }
        
        this.selectedCommand = 0;
        this.battleLog = [];
        this.turnCount = 1;
        this.waitingForCommand = false; // 初期状態では待機しない
        
        // 戦闘画面表示
        this.showBattleScreen();
        this.addBattleLog(`${enemy.name}が あらわれた！`);
        
        // 最初のターンのコマンド表示
        setTimeout(() => {
            this.startPlayerTurn();
        }, 1000);

        // 戦闘BGM開始（新しいBGMシステムを使用）
        if (window.bgmSystem) {
            window.bgmSystem.startBattleBGM(enemy.boss || false);
        }
    }

    // ボス戦を開始するヘルパーメソッド
    startBossBattle(bossId, onDefeat = null) {
        const bossData = this.enemyDatabase[bossId];
        if (!bossData) {
            console.error(`Boss ${bossId} not found in enemy database`);
            return false;
        }

        const boss = {
            ...bossData,
            currentHp: bossData.hp,
            currentMp: bossData.mp || 0,
            maxHp: bossData.maxHp || bossData.hp,
            id: bossId
        };

        this.startBattle(boss, true, onDefeat);
        console.log(`🔥 Boss battle started: ${boss.name}`);
        return true;
    }

    // プレイヤーターン開始
    startPlayerTurn() {
        // パーティメンバーを取得
        const partyMembers = this.getPartyMembers();

        // パーティコマンドを初期化
        this.partyCommands = partyMembers.map(() => null);
        this.currentMemberIndex = 0;
        this.allCommandsSelected = false;

        this.addBattleLog(`ターン ${this.turnCount}`);

        // 最初のメンバーのコマンド選択開始
        this.showNextMemberCommand();
    }

    // パーティメンバーを取得
    getPartyMembers() {
        const members = [window.player];
        if (window.partySystem) {
            members.push(...window.partySystem.getMembers());
        }
        return members;
    }

    // 次のメンバーのコマンド選択を表示
    showNextMemberCommand() {
        const partyMembers = this.getPartyMembers();

        if (this.currentMemberIndex >= partyMembers.length) {
            // 全員のコマンド選択完了
            this.allCommandsSelected = true;
            this.executeTurn();
            return;
        }

        const currentMember = partyMembers[this.currentMemberIndex];
        this.addBattleLog(`${currentMember.name || 'カイト'}の こうどう`);

        this.waitingForCommand = true;
        this.selectedCommand = 0;
        this.showCommands();
        this.updateCurrentMemberDisplay();
    }

    // 現在選択中のメンバーをUIに表示
    updateCurrentMemberDisplay() {
        const partyMembers = this.getPartyMembers();
        const statusContainer = document.getElementById('battlePartyStatus');
        if (!statusContainer) return;

        // 全てのステータスボックスのハイライトを更新
        const statusBoxes = statusContainer.children;
        for (let i = 0; i < statusBoxes.length; i++) {
            if (i === this.currentMemberIndex && this.waitingForCommand) {
                statusBoxes[i].style.border = '3px solid #ffff00';
                statusBoxes[i].style.boxShadow = '0 0 20px rgba(255, 255, 0, 0.8)';
            } else {
                statusBoxes[i].style.border = '2px solid #00ffff';
                statusBoxes[i].style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
            }
        }
    }

    // ターン実行（全員のコマンドを速度順に実行）
    executeTurn() {
        console.log('Executing turn with commands:', this.partyCommands);

        // 全てのハイライトをクリア
        const statusContainer = document.getElementById('battlePartyStatus');
        if (statusContainer) {
            const statusBoxes = statusContainer.children;
            for (let i = 0; i < statusBoxes.length; i++) {
                statusBoxes[i].style.border = '2px solid #00ffff';
                statusBoxes[i].style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
            }
        }

        // パーティメンバーの行動を速度順にソート
        const actions = this.partyCommands
            .map((cmd, index) => ({
                ...cmd,
                speed: cmd.member.speed || 5,
                index
            }))
            .sort((a, b) => b.speed - a.speed); // 速度が高い順

        // 行動を順番に実行
        this.executeActionsSequentially(actions, 0);
    }

    // 行動を順番に実行
    executeActionsSequentially(actions, actionIndex) {
        if (actionIndex >= actions.length) {
            // 全員の行動が終わったら敵のターンへ
            setTimeout(() => this.enemyTurn(window.player), 1000);
            return;
        }

        const action = actions[actionIndex];
        const member = action.member;
        const command = action.command;

        console.log(`Executing action for ${member.name}: ${command}`);

        // コマンドを実行
        switch (command) {
            case 'attack':
                this.memberAttack(member, () => {
                    // 次の行動へ
                    this.executeActionsSequentially(actions, actionIndex + 1);
                });
                break;
            case 'kamui':
                this.memberKamui(member, () => {
                    this.executeActionsSequentially(actions, actionIndex + 1);
                });
                break;
            case 'defend':
                this.memberDefend(member, () => {
                    this.executeActionsSequentially(actions, actionIndex + 1);
                });
                break;
            default:
                // 不明なコマンドの場合は次へ
                this.executeActionsSequentially(actions, actionIndex + 1);
                break;
        }
    }

    // メンバーの攻撃
    memberAttack(member, callback) {
        const baseDamage = member.attack || 10;
        const variance = Math.floor(Math.random() * 5) - 2;
        const damage = Math.max(1, baseDamage + variance - Math.floor(this.currentEnemy.defense / 2));

        this.currentEnemy.currentHp = Math.max(0, this.currentEnemy.currentHp - damage);
        this.addBattleLog(`${member.name}の こうげき！`);
        this.addBattleLog(`${this.currentEnemy.name}に ${Math.floor(damage)}の ダメージ！`);

        this.showDamageEffect(damage, true);
        this.updateBattleUI();

        // 敵が倒れたかチェック
        if (this.currentEnemy.currentHp <= 0) {
            this.currentEnemy.currentHp = 0;
            this.updateBattleUI();
            setTimeout(() => this.battleVictory(window.player), 1500);
        } else {
            setTimeout(callback, 1500);
        }
    }

    // メンバーのカムイ
    memberKamui(member, callback) {
        const mpCost = 20;
        if ((member.mp || 0) < mpCost) {
            this.addBattleLog(`${member.name}の MPが たりない！`);
            setTimeout(callback, 1000);
            return;
        }

        member.mp = (member.mp || 0) - mpCost;

        const baseDamage = (member.magic || member.attack || 10) * 2;
        const variance = Math.floor(Math.random() * 10) - 5;
        const damage = Math.max(1, baseDamage + variance);

        this.currentEnemy.currentHp = Math.max(0, this.currentEnemy.currentHp - damage);
        this.addBattleLog(`${member.name}は 神威の力を よびだした！`);
        this.addBattleLog(`${this.currentEnemy.name}に ${damage}の ダメージ！`);

        this.showDamageEffect(damage, true, true);
        this.updateBattleUI();

        if (this.currentEnemy.currentHp <= 0) {
            this.currentEnemy.currentHp = 0;
            this.updateBattleUI();
            setTimeout(() => this.battleVictory(window.player), 1500);
        } else {
            setTimeout(callback, 1500);
        }
    }

    // メンバーの防御
    memberDefend(member, callback) {
        this.addBattleLog(`${member.name}は みをまもっている！`);
        member.defending = true;
        setTimeout(callback, 1500);
    }

    // 戦闘画面表示
    showBattleScreen() {
        const battleScreen = document.getElementById('battleScreen');
        if (battleScreen) {
            battleScreen.classList.add('active');
            document.getElementById('gameUI').style.display = 'none';
            
            // 敵スプライトをリセット
            const enemySprite = document.getElementById('enemySprite');
            if (enemySprite) {
                enemySprite.style.opacity = '1';
                enemySprite.style.filter = 'none';
                enemySprite.textContent = this.currentEnemy.emoji;
            }
            
            // 敵情報更新
            document.getElementById('enemyName').textContent = this.currentEnemy.name;
            
            // コマンドを初期状態で非表示に
            const commands = document.getElementById('battleCommands');
            if (commands) {
                commands.style.display = 'none';
            }
            
            // バトルメッセージをクリア
            const battleMessage = document.getElementById('battleMessage');
            if (battleMessage) {
                battleMessage.textContent = '';
            }
            
            this.updateBattleUI();
        }
    }
    
    // プレイヤーの攻撃
    playerAttack(player) {
        console.log('playerAttack called, waiting:', this.waitingForCommand);
        
        const baseDamage = player.attack || 15;
        const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const damage = Math.max(1, baseDamage + variance - Math.floor(this.currentEnemy.defense / 2));
        
        this.currentEnemy.currentHp = Math.max(0, this.currentEnemy.currentHp - damage);
        this.addBattleLog(`カイトの こうげき！`);
        this.addBattleLog(`${this.currentEnemy.name}に ${Math.floor(damage)}の ダメージ！`);
        
        this.showDamageEffect(damage, true);
        this.updateBattleUI();
        
        // 敵が倒れたかチェック
        if (this.currentEnemy.currentHp <= 0) {
            this.currentEnemy.currentHp = 0;
            this.updateBattleUI();
            setTimeout(() => this.battleVictory(player), 1500);
        } else {
            // 敵のターンに移行
            setTimeout(() => this.enemyTurn(player), 1500);
        }
    }
    
    // 神威（カムイ）攻撃
    playerKamui(player) {
        console.log('playerKamui called, MP:', player.mp);
        
        if (player.mp < 10) {
            this.addBattleLog('MPが たりない！');
            // コマンド選択に戻る
            setTimeout(() => {
                this.waitingForCommand = true;
                this.showCommands();
            }, 1000);
            return;
        }
        
        player.mp -= 10;
        const baseDamage = 25;
        const variance = Math.floor(Math.random() * 10);
        const damage = baseDamage + variance;
        
        this.currentEnemy.currentHp = Math.max(0, this.currentEnemy.currentHp - damage);
        this.addBattleLog(`カイトは スサノオの力を よびだした！`);
        this.addBattleLog(`${this.currentEnemy.name}に ${damage}の ダメージ！`);
        
        this.showDamageEffect(damage, true, true);
        this.updateBattleUI();
        
        // 敵が倒れたかチェック
        if (this.currentEnemy.currentHp <= 0) {
            this.currentEnemy.currentHp = 0;
            this.updateBattleUI();
            setTimeout(() => this.battleVictory(player), 1500);
        } else {
            // 敵のターンに移行
            setTimeout(() => this.enemyTurn(player), 1500);
        }
    }
    
    // 敵のターン
    enemyTurn(player) {
        console.log('enemyTurn called');
        
        const baseDamage = this.currentEnemy.attack;
        const variance = Math.floor(Math.random() * 3);
        let damage = Math.max(1, baseDamage + variance - Math.floor((player.defense || 5) / 2));
        
        // 防御中はダメージ半減
        if (player.defending) {
            damage = Math.floor(damage / 2);
            this.addBattleLog(`${this.currentEnemy.name}の こうげき！`);
            this.addBattleLog(`カイトは ぼうぎょしている！`);
            player.defending = false; // 防御状態をリセット
        } else {
            this.addBattleLog(`${this.currentEnemy.name}の こうげき！`);
        }
        
        player.hp = Math.max(0, player.hp - damage);
        this.addBattleLog(`カイトに ${Math.floor(damage)}の ダメージ！`);
        
        this.showDamageEffect(damage, false);
        this.updateBattleUI();
        
        if (player.hp <= 0) {
            player.hp = 0;
            this.updateBattleUI();
            setTimeout(() => this.gameOver(), 1500);
        } else {
            // 次のターンのコマンド選択に戻る
            setTimeout(() => {
                this.turnCount++;
                this.startPlayerTurn();
            }, 1500);
        }
    }
    
    // 戦闘勝利
    battleVictory(player) {
        this.waitingForCommand = false;
        
        // コマンドを非表示に
        const commands = document.getElementById('battleCommands');
        if (commands) {
            commands.style.display = 'none';
        }
        
        // 勝利メッセージ
        this.addBattleLog(`${this.currentEnemy.name}を たおした！`);
        
        // 経験値とゴールド獲得
        const expGained = this.currentEnemy.exp || 10;
        const goldGained = this.currentEnemy.gold || 5;
        
        // リザルト表示
        setTimeout(() => {
            this.addBattleLog(`せんとうに しょうり！`);
            
            // 経験値付与
            player.exp = (player.exp || 0) + expGained;
            this.addBattleLog(`${expGained} の けいけんちを かくとく！`);
            
            // ゴールド付与
            player.gold = (player.gold || 0) + goldGained;
            this.addBattleLog(`${goldGained} ゴールドを てにいれた！`);
            
            // レベルアップチェック
            const expNeeded = player.level * 100;
            if (player.exp >= expNeeded) {
                setTimeout(() => {
                    player.level++;
                    
                    // 基本ステータスを上昇
                    player.baseMaxHp = (player.baseMaxHp || 100) + 20;
                    player.baseMaxMp = (player.baseMaxMp || 50) + 10;
                    player.baseAttack = (player.baseAttack || 10) + 3;
                    player.baseDefense = (player.baseDefense || 5) + 2;
                    
                    // 装備込みのステータスを再計算
                    if (window.equipmentSystem) {
                        window.equipmentSystem.recalculatePlayerStats(player);
                    } else {
                        player.maxHp = player.baseMaxHp;
                        player.maxMp = player.baseMaxMp;
                        player.attack = player.baseAttack;
                        player.defense = player.baseDefense;
                    }
                    
                    // HP/MPを全回復
                    player.hp = player.maxHp;
                    player.mp = player.maxMp;
                    
                    this.addBattleLog(`レベルアップ！`);
                    this.addBattleLog(`レベル ${player.level} になった！`);
                    this.addBattleLog(`さいだいHPが ${player.maxHp} になった！`);
                    this.addBattleLog(`さいだいMPが ${player.maxMp} になった！`);
                    
                    // UIを更新
                    if (window.updateUI) {
                        window.updateUI();
                    }
                    
                    // 戦闘終了
                    setTimeout(() => this.endBattle(true), 2000);
                }, 1000);
            } else {
                // レベルアップしない場合は戦闘終了
                setTimeout(() => this.endBattle(true), 2000);
            }
        }, 1000);
    }
    
    // 防御
    playerDefend(player) {
        console.log('playerDefend called');
        
        this.addBattleLog('カイトは みをまもっている！');
        player.defending = true;
        
        // 防御してもターンは消費、敵のターンへ
        setTimeout(() => this.enemyTurn(player), 1500);
    }
    
    // 逃走処理
    tryEscape() {
        console.log('tryEscape called');

        // ボス戦では逃げられない
        if (this.isBossBattle) {
            this.addBattleLog('ボスせんから にげることは できない！');
            setTimeout(() => this.enemyTurn(window.player), 1500);
            return;
        }

        const escapeChance = Math.random();

        if (escapeChance > 0.4) { // 60%の確率で逃走成功
            this.addBattleLog('うまく にげきれた！');
            setTimeout(() => this.endBattle(false), 1000);
        } else {
            this.addBattleLog('にげられない！');
            // 逃走失敗時も敵のターンへ
            setTimeout(() => this.enemyTurn(window.player), 1500);
        }
    }
    
    // 戦闘終了
    endBattle(victory = false) {
        const wasBossBattle = this.isBossBattle;
        const bossId = this.currentEnemy ? this.currentEnemy.bossId : null;
        const bossDefeatCallback = this.onBossDefeat;

        this.inBattle = false;
        this.currentEnemy = null;
        this.turnCount = 0;
        this.waitingForCommand = false;
        this.battleLog = [];
        this.isBossBattle = false;
        this.onBossDefeat = null;

        // 戦闘後は少し安全期間を設ける
        this.encounterSteps = 0;
        this.encounterThreshold = Math.floor(this.getRandomEncounterSteps('medium') * 1.5);

        const battleScreen = document.getElementById('battleScreen');
        if (battleScreen) {
            battleScreen.classList.remove('active');
            document.getElementById('gameUI').style.display = 'block';
        }

        // フィールドBGMに戻す（新しいBGMシステムを使用）
        if (window.bgmSystem) {
            window.bgmSystem.endBattleBGM();
        }

        // ボス戦勝利時のコールバック実行
        if (wasBossBattle && victory && bossDefeatCallback) {
            setTimeout(() => {
                bossDefeatCallback(bossId);
            }, 500);
        }

        // ボス戦勝利イベントをトリガー
        if (wasBossBattle && victory && window.storyEventSystem && bossId) {
            setTimeout(() => {
                window.storyEventSystem.triggerEvent('shrine_path_opens', {
                    storyFlags: window.storyFlags,
                    player: window.player,
                    mapSystem: window.mapSystem
                });
            }, 1000);
        }
        
        // UI更新
        if (window.updateUI) {
            window.updateUI();
        }
        
        // マップメッセージをクリア
        const messageBox = document.getElementById('messageBox');
        if (messageBox) {
            messageBox.textContent = 'せんとうが おわった';
            setTimeout(() => {
                messageBox.textContent = '';
            }, 2000);
        }
    }
    
    // ゲームオーバー
    gameOver() {
        this.addBattleLog('カイトは たおれた...');
        setTimeout(() => {
            if (confirm('ゲームオーバー。タイトルに戻りますか？')) {
                location.reload();
            }
        }, 2000);
    }
    
    // バトルログ追加
    addBattleLog(message) {
        this.battleLog.push(message);
        const battleMessage = document.getElementById('battleMessage');
        if (battleMessage) {
            // 最新の3行を表示
            const recentLogs = this.battleLog.slice(-4);
            battleMessage.textContent = recentLogs.join('\n');
            
            // スクロールを最下部に
            battleMessage.scrollTop = battleMessage.scrollHeight;
        }
    }
    
    // ダメージエフェクト表示
    showDamageEffect(damage, isEnemy, isCritical = false) {
        const damageEl = document.createElement('div');
        damageEl.className = 'damage-number' + (isCritical ? ' critical' : '');
        damageEl.textContent = Math.floor(damage);
        
        if (isEnemy) {
            damageEl.style.left = '50%';
            damageEl.style.top = '30%';
        } else {
            damageEl.style.right = '200px';
            damageEl.style.bottom = '200px';
        }
        
        const battleScreen = document.getElementById('battleScreen');
        if (battleScreen) {
            battleScreen.appendChild(damageEl);
            setTimeout(() => damageEl.remove(), 1000);
        }
    }
    
    // UI更新
    updateBattleUI() {
        // 敵HP更新
        if (this.currentEnemy) {
            const enemyHpRatio = Math.max(0, this.currentEnemy.currentHp / this.currentEnemy.maxHp);
            const enemyHpFill = document.getElementById('enemyHpFill');
            if (enemyHpFill) {
                enemyHpFill.style.width = (enemyHpRatio * 100) + '%';
            }

            // 敵が倒れたら表示を更新
            if (this.currentEnemy.currentHp <= 0) {
                const enemySprite = document.getElementById('enemySprite');
                if (enemySprite) {
                    enemySprite.style.opacity = '0.3';
                    enemySprite.style.filter = 'grayscale(100%)';
                }
            }
        }

        // パーティメンバー全員のステータス更新
        this.updatePartyStatus();
    }

    // パーティメンバーのステータス表示を更新
    updatePartyStatus() {
        const statusContainer = document.getElementById('battlePartyStatus');
        if (!statusContainer) return;

        // プレイヤー + パーティメンバー
        const allMembers = [window.player];
        if (window.partySystem) {
            allMembers.push(...window.partySystem.getMembers());
        }

        // ステータスボックスを生成
        statusContainer.innerHTML = '';
        allMembers.forEach((member, index) => {
            const hpRatio = Math.max(0, Math.min(1, (member.hp || member.maxHp) / (member.maxHp || 100)));
            const mpRatio = Math.max(0, Math.min(1, (member.mp || member.maxMp) / (member.maxMp || 50)));

            const statusBox = document.createElement('div');
            statusBox.style.cssText = `
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #00ffff;
                border-radius: 5px;
                padding: 8px;
                min-width: 220px;
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
            `;

            // HP色を設定
            let hpColor = '#44ff44';
            if (hpRatio <= 0.25) hpColor = '#ff4444';
            else if (hpRatio <= 0.5) hpColor = '#ffff44';

            statusBox.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; color: #00ffff;">
                    <span>${member.name || 'カイト'}</span>
                    <span>Lv.${member.level || 1}</span>
                </div>
                <div style="margin-bottom: 3px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                        <span style="color: #aaa;">HP</span>
                        <span style="color: #fff;">${Math.max(0, member.hp || member.maxHp)}/${member.maxHp || 100}</span>
                    </div>
                    <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="
                            width: ${hpRatio * 100}%;
                            height: 100%;
                            background: linear-gradient(90deg, ${hpColor}, ${hpColor}dd);
                            transition: width 0.3s;
                        "></div>
                    </div>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                        <span style="color: #aaa;">MP</span>
                        <span style="color: #fff;">${member.mp || member.maxMp}/${member.maxMp || 50}</span>
                    </div>
                    <div style="background: #333; height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="
                            width: ${mpRatio * 100}%;
                            height: 100%;
                            background: linear-gradient(90deg, #4444ff, #4444ffdd);
                            transition: width 0.3s;
                        "></div>
                    </div>
                </div>
            `;

            statusContainer.appendChild(statusBox);
        });
    }
    
    // コマンド表示
    showCommands() {
        const commands = document.getElementById('battleCommands');
        if (commands) {
            commands.style.display = 'block';
            this.waitingForCommand = true;
            
            // コマンド選択を初期化
            this.selectedCommand = 0;
            
            // グローバルのsetupBattleCommands関数を呼び出す
            if (window.setupBattleCommands) {
                window.setupBattleCommands();
            }
        }
    }
}

// グローバルにエクスポート
window.BattleSystem = BattleSystem;