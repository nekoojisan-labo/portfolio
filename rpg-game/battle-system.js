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
        
        // エンカウント設定
        this.encounterSteps = 0;
        this.encounterThreshold = this.getRandomEncounterSteps();
        
        // 敵データベース
        this.enemyDatabase = {
            watcher: {
                name: 'ウォッチャー',
                emoji: '👁️',
                hp: 25,
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
                mp: 20,
                attack: 14,
                defense: 12,
                exp: 50,
                gold: 60,
                type: 'android',
                skills: ['laserBeam', 'barrier', 'analyze'],
                description: 'アークの精鋭機械兵。バランスが良い。'
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
    getRandomEncounterSteps() {
        return Math.floor(Math.random() * 15) + 10; // 10-25歩でエンカウント
    }
    
    // 歩数をカウント
    countStep(currentArea = 'city') {
        if (this.inBattle) return;
        
        this.encounterSteps++;
        
        // エンカウントチェック
        if (this.encounterSteps >= this.encounterThreshold) {
            this.encounterSteps = 0;
            this.encounterThreshold = this.getRandomEncounterSteps();
            this.triggerRandomEncounter(currentArea);
        }
    }
    
    // ランダムエンカウント発生
    triggerRandomEncounter(area) {
        const encounterTable = this.encounterTables[area] || this.encounterTables.city;
        const enemyId = encounterTable[Math.floor(Math.random() * encounterTable.length)];
        const enemyData = this.enemyDatabase[enemyId];
        
        if (enemyData) {
            // 戦闘開始
            this.startBattle({
                ...enemyData,
                currentHp: enemyData.hp,
                currentMp: enemyData.mp,
                id: enemyId
            });
        }
    }
    
    // 戦闘開始
    startBattle(enemy) {
        this.inBattle = true;
        this.currentEnemy = enemy;
        this.selectedCommand = 0;
        this.battleLog = [];
        this.turnCount = 1;
        this.waitingForCommand = true;
        
        // 戦闘画面表示
        this.showBattleScreen();
        this.addBattleLog(`${enemy.name}が あらわれた！`);
        
        // 最初のターンのコマンド表示
        setTimeout(() => {
            this.addBattleLog(`ターン ${this.turnCount}`);
            this.addBattleLog('コマンドを せんたくしてください');
            this.showCommands();
        }, 1000);
        
        // 戦闘BGM開始（オプション）
        // this.playBattleBGM();
    }
    
    // 戦闘画面表示
    showBattleScreen() {
        const battleScreen = document.getElementById('battleScreen');
        if (battleScreen) {
            battleScreen.classList.add('active');
            document.getElementById('gameUI').style.display = 'none';
            
            // 敵情報更新
            document.getElementById('enemySprite').textContent = this.currentEnemy.emoji;
            document.getElementById('enemyName').textContent = this.currentEnemy.name;
            
            // コマンドを初期状態で非表示に
            const commands = document.getElementById('battleCommands');
            if (commands) {
                commands.style.display = 'none';
            }
            
            this.updateBattleUI();
        }
    }
    
    // プレイヤーの攻撃
    playerAttack(player) {
        const baseDamage = player.attack || 15;
        const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const damage = Math.max(1, baseDamage + variance - (this.currentEnemy.defense / 2));
        
        this.currentEnemy.currentHp -= damage;
        this.addBattleLog(`カイトの こうげき！`);
        this.addBattleLog(`${this.currentEnemy.name}に ${Math.floor(damage)}の ダメージ！`);
        
        this.showDamageEffect(damage, true);
        this.updateBattleUI();
        
        if (this.currentEnemy.currentHp <= 0) {
            setTimeout(() => this.battleVictory(player), 1500);
        } else {
            // 敵のターンに移行
            setTimeout(() => this.enemyTurn(player), 1500);
        }
    }
    
    // 神威（カムイ）攻撃
    playerKamui(player) {
        if (player.mp < 10) {
            this.addBattleLog('MPが たりない！');
            // コマンド選択に戻る
            setTimeout(() => this.showCommands(), 1000);
            return;
        }
        
        player.mp -= 10;
        const baseDamage = 25;
        const variance = Math.floor(Math.random() * 10);
        const damage = baseDamage + variance;
        
        this.currentEnemy.currentHp -= damage;
        this.addBattleLog(`カイトは スサノオの力を よびだした！`);
        this.addBattleLog(`${this.currentEnemy.name}に ${damage}の ダメージ！`);
        
        this.showDamageEffect(damage, true, true);
        this.updateBattleUI();
        
        if (this.currentEnemy.currentHp <= 0) {
            setTimeout(() => this.battleVictory(player), 1500);
        } else {
            // 敵のターンに移行
            setTimeout(() => this.enemyTurn(player), 1500);
        }
    }
    
    // 敵のターン
    enemyTurn(player) {
        const baseDamage = this.currentEnemy.attack;
        const variance = Math.floor(Math.random() * 3);
        let damage = Math.max(1, baseDamage + variance - (player.defense || 5) / 2);
        
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
            this.waitingForCommand = false;
            setTimeout(() => this.gameOver(), 1500);
        } else {
            // 必ず次のターンのコマンド選択に戻る
            setTimeout(() => {
                this.turnCount++;
                this.addBattleLog(`ターン ${this.turnCount}`);
                this.addBattleLog('コマンドを せんたくしてください');
                this.waitingForCommand = true;
                this.showCommands();
            }, 1500);
        }
    }
    
    // 戦闘勝利
    battleVictory(player) {
        this.waitingForCommand = false;
        this.addBattleLog(`${this.currentEnemy.name}を たおした！`);
        
        // コマンドを非表示に
        const commands = document.getElementById('battleCommands');
        if (commands) {
            commands.style.display = 'none';
        }
        
        // 経験値とゴールド獲得
        const expGained = this.currentEnemy.exp;
        const goldGained = this.currentEnemy.gold;
        
        player.exp += expGained;
        player.gold = (player.gold || 0) + goldGained;
        
        this.addBattleLog(`${expGained} の けいけんちを かくとく！`);
        this.addBattleLog(`${goldGained} ゴールドを てにいれた！`);
        
        // レベルアップチェック
        if (player.exp >= player.level * 100) {
            player.level++;
            player.maxHp += 20;
            player.hp = player.maxHp;
            player.maxMp += 10;
            player.mp = player.maxMp;
            player.attack = (player.attack || 15) + 3;
            player.defense = (player.defense || 5) + 2;
            
            this.addBattleLog(`レベルアップ！`);
            this.addBattleLog(`レベル ${player.level} になった！`);
        }
        
        setTimeout(() => this.endBattle(), 3000);
    }
    
    // 防御
    playerDefend(player) {
        this.addBattleLog('カイトは みをまもっている！');
        player.defending = true;
        
        // 防御してもターンは消費、敵のターンへ
        setTimeout(() => this.enemyTurn(player), 1500);
    }
    
    // 逃走処理
    tryEscape() {
        const escapeChance = Math.random();
        
        if (escapeChance > 0.4) { // 60%の確率で逃走成功
            this.addBattleLog('うまく にげきれた！');
            this.waitingForCommand = false;
            setTimeout(() => this.endBattle(), 1000);
        } else {
            this.addBattleLog('にげられない！');
            // 逃走失敗時も敵のターンへ
            setTimeout(() => this.enemyTurn(window.player), 1500);
        }
    }
    
    // 戦闘終了
    endBattle() {
        this.inBattle = false;
        this.currentEnemy = null;
        
        const battleScreen = document.getElementById('battleScreen');
        if (battleScreen) {
            battleScreen.classList.remove('active');
            document.getElementById('gameUI').style.display = 'block';
        }
        
        // UI更新
        if (window.updateUI) {
            window.updateUI();
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
            battleMessage.textContent = this.battleLog.slice(-3).join('\n');
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
            const enemyHpRatio = Math.max(0, this.currentEnemy.currentHp / this.currentEnemy.hp);
            const enemyHpFill = document.getElementById('enemyHpFill');
            if (enemyHpFill) {
                enemyHpFill.style.width = (enemyHpRatio * 100) + '%';
            }
        }
        
        // プレイヤーステータス更新
        if (window.player) {
            document.getElementById('battlePlayerLevel').textContent = window.player.level;
            document.getElementById('battlePlayerHP').textContent = Math.max(0, window.player.hp);
            document.getElementById('battlePlayerMaxHP').textContent = window.player.maxHp;
            document.getElementById('battlePlayerMP').textContent = window.player.mp;
            document.getElementById('battlePlayerMaxMP').textContent = window.player.maxMp;
        }
    }
    
    // コマンド表示
    showCommands() {
        const commands = document.getElementById('battleCommands');
        if (commands) {
            commands.style.display = 'block';
            this.waitingForCommand = true;
            
            // コマンド選択を初期化
            this.selectedCommand = 0;
            this.setupBattleCommands();
        }
    }
    
    // バトルコマンドのセットアップ
    setupBattleCommands() {
        const commands = document.querySelectorAll('.command-item');
        commands.forEach((cmd, index) => {
            cmd.classList.remove('selected');
            if (index === this.selectedCommand) {
                cmd.classList.add('selected');
            }
        });
    }
}

// グローバルにエクスポート
window.BattleSystem = BattleSystem;