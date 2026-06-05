// ==========================================
// 戦闘システム (Battle System)
// ==========================================

// ------------------------------------------------------------------
// BattlePanel: #gameMessagePanel をバトル用に駆動するヘルパ
//   - Mode A (commands): コマンドリストを #gameMessageBody に描画
//   - Mode B (log)     : 直近のバトルログ複数行を #gameMessageBody に描画
//   両モード共通で、パネルは battle 中つねに .active を維持する。
// ------------------------------------------------------------------
const BattlePanel = (() => {
    function getEls() {
        const panel = document.getElementById('gameMessagePanel');
        if (!panel) return null;
        return {
            panel,
            header: panel.querySelector('.game-msg-header'),
            character: document.getElementById('gameMessageCharacter'),
            body: document.getElementById('gameMessageBody'),
            choices: document.getElementById('gameMessageChoices'),
            controls: panel.querySelector('.game-msg-controls'),
            indicator: document.getElementById('gameMessageNextIndicator'),
            hint: document.getElementById('gameMessageHint')
        };
    }

    function activate(headerLabel) {
        const els = getEls();
        if (!els) return;
        els.panel.classList.add('active');
        els.panel.classList.add('battle-mode');
        els.panel.setAttribute('aria-hidden', 'false');
        els.panel.dataset.battleMode = '1';
        if (els.header) els.header.classList.add('active');
        if (els.character) {
            els.character.textContent = headerLabel || '戦闘';
            els.character.classList.add('battle-mode-label');
        }
        if (els.choices) {
            els.choices.classList.remove('active');
            els.choices.innerHTML = '';
        }
    }

    function setHeader(label) {
        const els = getEls();
        if (!els || !els.character) return;
        els.character.textContent = label || '戦闘';
    }

    // Mode A: コマンドリストを描画
    function renderCommands(items, opts) {
        const els = getEls();
        if (!els || !els.body) return;
        opts = opts || {};
        if (opts.headerLabel) setHeader(opts.headerLabel);

        els.panel.classList.add('active', 'battle-mode');
        els.panel.classList.remove('battle-log-mode');
        els.body.classList.add('battle-cmd-mode');
        els.body.innerHTML = '';

        if (opts.title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'battle-cmd-title';
            titleEl.textContent = opts.title;
            els.body.appendChild(titleEl);
        }

        const selectedIndex = typeof opts.selectedIndex === 'number' ? opts.selectedIndex : 0;
        items.forEach((it, index) => {
            const div = document.createElement('div');
            div.className = 'command-item' + (index === selectedIndex ? ' selected' : '');
            if (it.command) div.dataset.command = it.command;
            if (it.html != null) {
                div.innerHTML = it.html;
            } else {
                div.textContent = it.label || '';
            }
            if (it.color) div.style.color = it.color;
            if (typeof it.onClick === 'function') {
                div.onclick = it.onClick;
            }
            els.body.appendChild(div);
        });
    }

    function setSelectedIndex(index) {
        const els = getEls();
        if (!els || !els.body) return;
        const items = els.body.querySelectorAll('.command-item');
        items.forEach((el, i) => {
            if (i === index) el.classList.add('selected');
            else el.classList.remove('selected');
        });
    }

    // Mode B: バトルログを描画（直近 maxLines 行）
    function renderLog(lines, opts) {
        const els = getEls();
        if (!els || !els.body) return;
        opts = opts || {};

        els.panel.classList.add('active', 'battle-mode');
        els.panel.classList.add('battle-log-mode');
        els.body.classList.remove('battle-cmd-mode');
        // 直近2行のみ表示（今・誰が・何をしたかを明確にし、行動が雑然と流れないように）
        const max = opts.maxLines || 2;
        const recent = (lines || []).slice(-max);
        const safe = recent.map(l => String(l == null ? '' : l)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;'));
        els.body.innerHTML = safe.join('<br>');
        els.body.scrollTop = els.body.scrollHeight;
    }

    function deactivate() {
        const els = getEls();
        if (!els) return;
        els.panel.classList.remove('active', 'battle-mode', 'battle-log-mode');
        els.panel.setAttribute('aria-hidden', 'true');
        delete els.panel.dataset.battleMode;
        if (els.header) els.header.classList.remove('active');
        if (els.character) {
            els.character.textContent = '';
            els.character.classList.remove('battle-mode-label');
        }
        if (els.body) {
            els.body.classList.remove('battle-cmd-mode');
            els.body.innerHTML = '';
        }
    }

    function isBattleMode() {
        const panel = document.getElementById('gameMessagePanel');
        return !!(panel && panel.classList.contains('battle-mode'));
    }

    return { activate, setHeader, renderCommands, setSelectedIndex, renderLog, deactivate, isBattleMode };
})();
window.BattlePanel = BattlePanel;

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

        // 神威スキル選択フェーズ管理（コマンド選択時にスキルを事前確定する）
        this.kamuiPlanning = false;
        this.kamuiPlanningMember = null;
        this.kamuiSkillExecuting = false; // 二重実行防止
        this.executingTurn = false;       // ターン実行中フラグ（重複起動防止）

        // コマンドメニューの表示モード: 'command' | 'skill' | 'target'
        this.commandPhase = 'command';
        this.availableSkills = [];
        this.availableTargets = [];
        this.pendingMagic = null;

        // エンカウント設定
        this.encounterSteps = 0;
        this.encounterThreshold = this.getRandomEncounterSteps('medium');
        this.firstEncounter = true;  // 初回エンカウントフラグ
        this.enemyImageMap = {
            watcher: 'assets/enemies/watcher.png',
            drone: 'assets/enemies/watcher.png',
            android: 'assets/enemies/deus_machina.png',
            mecha: 'assets/enemies/cerberus.png',
            construct: 'assets/enemies/dust_golem.png',
            hybrid: 'assets/enemies/alraune.png',
            boss: 'assets/enemies/ark_prime.png',
            corrupted_drone_boss: 'assets/enemies/watcher.png',
            rogue_ai_core: 'assets/enemies/abyss_ruler.png'
        };

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
                description: '監視ドローン。常に周囲を警戒している。',
                dropTable: [
                    { id: 'heal_potion', rate: 0.3 },
                    { id: 'energy_core', rate: 0.15 }
                ],
                aiPattern: {
                    lowHpThreshold: 0.3,
                    lowHpAction: 'defend',
                    normalAction: 'attack',
                    skillChance: 0.2
                }
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
                description: '三つ首の機械狼。高い攻撃力を持つ。',
                dropTable: [
                    { id: 'heal_potion', rate: 0.25 },
                    { id: 'mega_heal_potion', rate: 0.1 },
                    { id: 'iron_sword', rate: 0.05 }
                ],
                aiPattern: {
                    lowHpThreshold: 0.25,
                    lowHpAction: 'attack',
                    normalAction: 'attack',
                    skillChance: 0.4
                }
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
                description: 'スクラップから生まれた巨人。防御力が高い。',
                dropTable: [
                    { id: 'heal_potion', rate: 0.2 },
                    { id: 'iron_helmet', rate: 0.08 },
                    { id: 'leather_armor', rate: 0.06 }
                ],
                aiPattern: {
                    lowHpThreshold: 0.4,
                    lowHpAction: 'defend',
                    normalAction: 'attack',
                    skillChance: 0.25
                }
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
                description: '植物と機械の融合体。特殊攻撃を使う。',
                dropTable: [
                    { id: 'mega_heal_potion', rate: 0.2 },
                    { id: 'energy_core', rate: 0.25 },
                    { id: 'full_heal_potion', rate: 0.05 }
                ],
                aiPattern: {
                    lowHpThreshold: 0.3,
                    lowHpAction: 'skill',
                    normalAction: 'attack',
                    skillChance: 0.35
                }
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
                description: 'アークの精鋭機械兵。バランスが良い。',
                dropTable: [
                    { id: 'mega_heal_potion', rate: 0.25 },
                    { id: 'mega_energy_core', rate: 0.15 },
                    { id: 'plasma_blade', rate: 0.03 }
                ],
                aiPattern: {
                    lowHpThreshold: 0.3,
                    lowHpAction: 'skill',
                    normalAction: 'attack',
                    skillChance: 0.3
                }
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
                bossId: 'corrupted_drone_boss',
                dropTable: [
                    { id: 'full_heal_potion', rate: 0.8 },
                    { id: 'elixir', rate: 0.5 },
                    { id: 'plasma_blade', rate: 0.3 }
                ],
                aiPattern: {
                    lowHpThreshold: 0.25,
                    lowHpAction: 'skill',
                    normalAction: 'attack',
                    skillChance: 0.6
                }
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
                bossId: 'rogue_ai_core',
                dropTable: [
                    { id: 'elixir', rate: 1.0 },
                    { id: 'kamui_katana', rate: 0.5 },
                    { id: 'cyber_armor', rate: 0.4 }
                ],
                aiPattern: {
                    lowHpThreshold: 0.2,
                    lowHpAction: 'skill',
                    normalAction: 'skill',
                    skillChance: 0.8
                }
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
    // 注: countStep は1フレーム単位でカウントされるため、実距離としては
    //     1 タイル ≈ 10〜12 フレームの感覚で値を設定する
    getRandomEncounterSteps(encounterRate = 'medium') {
        const rateSettings = {
            very_high: { min: 90,  max: 140 },  // 危険エリア（都庁など）
            high:      { min: 160, max: 240 },  // 地下鉄など
            medium:    { min: 260, max: 400 },  // 通常エリア
            low:       { min: 500, max: 750 },  // 植物園・神社など
            none:      { min: 9999, max: 9999 }
        };

        const settings = rateSettings[encounterRate] || rateSettings.medium;
        return Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
    }

    // 歩数をカウント
    countStep(currentArea = 'city', encounterRate = 'medium') {
        if (this.inBattle) return;

        if (encounterRate === 'none') {
            this.encounterSteps = 0;
            return;
        }

        this.encounterSteps++;

        // 初回エンカウントは大幅に遅らせる（ゲーム開始直後の即戦闘を防ぐ）
        const threshold = this.firstEncounter
            ? this.encounterThreshold + 120
            : this.encounterThreshold;

        if (this.encounterSteps >= threshold) {
            this.firstEncounter = false;
            this.encounterSteps = 0;
            this.encounterThreshold = this.getRandomEncounterSteps(encounterRate);

            // 閾値超え後にもう一段の発生確率（低めに設定）
            const encounterChance = {
                very_high: 0.7,
                high:      0.55,
                medium:    0.4,
                low:       0.25
            };

            const chance = encounterChance[encounterRate] || 0.4;
            if (Math.random() < chance) {
                this.triggerRandomEncounter(currentArea);
            } else {
                // 不発時はわずかに早める程度（旧来の0.7から0.92へ）
                this.encounterThreshold = Math.floor(this.encounterThreshold * 0.92);
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

        // ステータス異常を初期化
        this.currentEnemy.statusAilments = {};

        this.selectedCommand = 0;
        this.battleLog = [];
        this.turnCount = 1;
        this.waitingForCommand = false; // 初期状態では待機しない

        // 戦闘画面表示
        this.showBattleScreen();
        this.addBattleLog(`${enemy.name}が あらわれた！`);

        // パーティメンバーのステータス異常をクリア
        const allMembers = this.getPartyMembers();
        allMembers.forEach(member => {
            if (!member.statusAilments) {
                member.statusAilments = {};
            }
        });

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
        // 多重起動の検出
        if (this.executingTurn) {
            console.warn('[Battle] startPlayerTurn called while executingTurn=true; resetting flag');
            this.executingTurn = false;
        }
        // 計画フェーズの残骸を掃除
        this.kamuiPlanning = false;
        this.kamuiPlanningMember = null;
        this.kamuiSkillExecuting = false;
        this.kamuiSkillMenuActive = false;
        const kamuiMenu = document.getElementById('kamuiSkillMenu');
        if (kamuiMenu) kamuiMenu.style.display = 'none';

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

        // ステータス異常チェック
        const ailmentResult = this.checkStatusAilmentBeforeAction(currentMember);

        if (ailmentResult.skipAction) {
            // 行動不能の場合、自動的に次のメンバーへ
            this.partyCommands[this.currentMemberIndex] = {
                member: currentMember,
                command: 'skip'
            };
            this.currentMemberIndex++;
            this.showNextMemberCommand();
            return;
        }

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
        if (this.executingTurn) {
            console.warn('[Battle] executeTurn already in progress, ignoring duplicate call');
            return;
        }
        this.executingTurn = true;
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
            this.executingTurn = false;
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
                    this.executeActionsSequentially(actions, actionIndex + 1);
                });
                break;
            case 'kamui':
                // magicId / targetIndex は計画フェーズで確定済み
                this.memberKamui(member, () => {
                    this.executeActionsSequentially(actions, actionIndex + 1);
                }, action.magicId, action.targetIndex);
                break;
            case 'defend':
                this.memberDefend(member, () => {
                    this.executeActionsSequentially(actions, actionIndex + 1);
                });
                break;
            case 'skip':
                // 行動不能などスキップ
                setTimeout(() => {
                    this.executeActionsSequentially(actions, actionIndex + 1);
                }, 600);
                break;
            default:
                this.executeActionsSequentially(actions, actionIndex + 1);
                break;
        }
    }

    // メンバーの攻撃
    memberAttack(member, callback) {
        const baseDamage = member.attack || 10;
        const variance = Math.floor(Math.random() * 5) - 2;
        let damage = Math.max(1, baseDamage + variance - Math.floor(this.currentEnemy.defense / 2));

        // クリティカル判定
        const criticalResult = this.checkCritical(member, this.currentEnemy);
        const isCritical = criticalResult.isCritical;

        if (isCritical) {
            damage = Math.floor(damage * criticalResult.multiplier);
            this.addBattleLog(`${member.name}の こうげき！`);
            this.addBattleLog(`かいしんの いちげき！`);
        } else {
            this.addBattleLog(`${member.name}の こうげき！`);
        }

        this.currentEnemy.currentHp = Math.max(0, this.currentEnemy.currentHp - damage);
        this.addBattleLog(`${this.currentEnemy.name}に ${Math.floor(damage)}の ダメージ！`);

        this.showDamageEffect(damage, true, isCritical);
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

    // クリティカル判定
    checkCritical(attacker, target) {
        let critRate = 0.05; // 基本クリティカル率 5%

        // 速度による補正
        const attackerSpeed = attacker.speed || attacker.baseSpeed || 5;
        const targetSpeed = target.speed || 5;

        if (attackerSpeed >= targetSpeed * 2) {
            critRate += 0.10; // 速度が2倍以上なら +10%
        } else if (attackerSpeed >= targetSpeed * 1.5) {
            critRate += 0.05; // 速度が1.5倍以上なら +5%
        }

        const isCritical = Math.random() < critRate;
        const multiplier = isCritical ? 1.5 + Math.random() * 0.5 : 1.0; // 1.5x ~ 2.0x

        return { isCritical, multiplier, critRate };
    }

    // ステータス異常を付与
    applyStatusAilment(target, ailmentType, duration = 3) {
        if (!target.statusAilments) {
            target.statusAilments = {};
        }

        target.statusAilments[ailmentType] = duration;

        const ailmentNames = {
            poison: 'どく',
            paralysis: 'まひ',
            confusion: 'こんらん',
            sleep: 'ねむり',
            curse: 'のろい'
        };

        this.addBattleLog(`${target.name}は ${ailmentNames[ailmentType]}になった！`);
    }

    // 行動前のステータス異常チェック
    checkStatusAilmentBeforeAction(character) {
        if (!character.statusAilments) {
            return { skipAction: false };
        }

        // 睡眠チェック
        if (character.statusAilments.sleep > 0) {
            this.addBattleLog(`${character.name}は ねむっている...`);
            return { skipAction: true };
        }

        // 麻痺チェック（50%確率で行動不能）
        if (character.statusAilments.paralysis > 0) {
            if (Math.random() < 0.5) {
                this.addBattleLog(`${character.name}は しびれて うごけない！`);
                return { skipAction: true };
            }
        }

        // 混乱チェック（後で攻撃時に処理）
        return { skipAction: false };
    }

    // ターン終了時のステータス異常処理
    processStatusAilmentsEndTurn(character) {
        if (!character.statusAilments) return;

        // 毒ダメージ
        if (character.statusAilments.poison > 0) {
            const poisonDamage = Math.floor(character.maxHp * 0.1);
            character.hp = Math.max(0, character.hp - poisonDamage);
            this.addBattleLog(`${character.name}は どくの ダメージを うけた！`);
            this.addBattleLog(`${character.name}に ${poisonDamage}の ダメージ！`);
        }

        // ステータス異常の持続ターンを減らす
        Object.keys(character.statusAilments).forEach(ailment => {
            character.statusAilments[ailment]--;
            if (character.statusAilments[ailment] <= 0) {
                delete character.statusAilments[ailment];

                const ailmentNames = {
                    poison: 'どく',
                    paralysis: 'まひ',
                    confusion: 'こんらん',
                    sleep: 'ねむり',
                    curse: 'のろい'
                };

                this.addBattleLog(`${character.name}の ${ailmentNames[ailment]}が なおった！`);
            }
        });

        this.updateBattleUI();
    }

    // メンバーのカムイ
    memberKamui(member, callback, magicId = null, targetIndex = 'enemy') {
        // 魔法IDが指定されていない場合は、習得済みカムイスキル一覧を表示
        if (!magicId) {
            this.showKamuiSkillSelection(member, callback);
            return;
        }

        // 対象を解決
        let target = null;
        if (targetIndex === 'enemy') {
            target = this.currentEnemy;
        } else if (targetIndex === 'self') {
            target = member;
        } else if (typeof targetIndex === 'number') {
            const partyMembers = this.getPartyMembers();
            target = partyMembers[targetIndex] || member;
        } else {
            target = this.currentEnemy;
        }

        console.log('[DEBUG] memberKamui called with:', {
            magicId,
            memberName: member.name,
            memberMp: member.mp,
            targetIndex,
            targetName: target ? target.name : 'none',
            inBattle: true
        });

        // 魔法システムから使用
        const result = window.magicSystem.useMagic(magicId, member, target, true);

        console.log('[DEBUG] useMagic result:', result);

        if (!result.success) {
            this.addBattleLog(result.message);
            setTimeout(callback, 1000);
            return;
        }

        this.addBattleLog(`${member.name}は ${result.magic.name}を よびだした！`);
        this.addBattleLog(result.message);

        // ダメージ系スキルの時のみ敵にエフェクト表示
        if (result.damage && result.damage > 0) {
            this.showDamageEffect(result.damage, true, true);
        }
        this.updateBattleUI();

        // 敵を倒したかは攻撃系スキル時のみチェック
        if (this.currentEnemy && this.currentEnemy.currentHp <= 0 && result.damage > 0) {
            this.currentEnemy.currentHp = 0;
            this.updateBattleUI();
            setTimeout(() => this.battleVictory(window.player), 1500);
        } else {
            setTimeout(callback, 1500);
        }
    }

    // ===== カムイスキル「計画フェーズ」=====
    // 「特技」コマンドを選んだ瞬間に battle-commands のリストを
    // スキル選択 → 対象選択 と段階的に切り替える。各段階の表示は
    // 通常コマンドと同じ command-item 形式で統一。
    beginKamuiPlanning() {
        if (this.kamuiPlanning) return;
        const partyMembers = this.getPartyMembers();
        const member = partyMembers[this.currentMemberIndex];
        if (!member) return;

        if (!window.magicSystem) {
            this.addBattleLog('魔法システムが初期化されていません');
            return;
        }
        const skills = window.magicSystem.getLearnedMagic(member);
        if (!skills || skills.length === 0) {
            this.addBattleLog(`${member.name || 'カイト'}は スキルを 習得していない！`);
            return;
        }

        this.kamuiPlanning = true;
        this.kamuiPlanningMember = member;
        this.availableSkills = skills;
        this.commandPhase = 'skill';
        this.selectedCommand = 0;
        this.waitingForCommand = true;

        this.renderSkillPhase();
    }

    // スキルリストをメッセージパネルに描画
    renderSkillPhase() {
        const items = this.availableSkills.map((skill, index) => {
            const mpText = skill.mpCost ? ` <span style="color:#88aaff; font-size:11px;">(MP:${skill.mpCost})</span>` : '';
            return {
                html: `${skill.emoji || ''} ${skill.name}${mpText}`,
                onClick: () => {
                    this.selectedCommand = index;
                    this.refreshCurrentPhaseSelection();
                    this.confirmSkillSelection();
                }
            };
        });

        // キャンセル項目
        items.push({
            html: '↩ もどる',
            color: '#ff8888',
            onClick: () => this.cancelKamuiPlanning()
        });

        const memberName = (this.kamuiPlanningMember && this.kamuiPlanningMember.name) || 'カイト';
        BattlePanel.renderCommands(items, {
            headerLabel: `${memberName} のじゅつ`,
            title: '⚡ 神威スキル',
            selectedIndex: this.selectedCommand
        });
    }

    // スキル決定 → ターゲットが必要なら 'target' フェーズに、不要ならコマンド確定
    confirmSkillSelection() {
        if (!this.kamuiPlanning) return;
        const skill = this.availableSkills[this.selectedCommand];
        if (!skill) return;

        // MP 不足なら何もしない（赤い警告のみ）
        const member = this.kamuiPlanningMember;
        if (member && member.mp < skill.mpCost) {
            this.addBattleLog('MPが たりない！');
            return;
        }

        this.pendingMagic = skill;

        // 対象選択が必要な種別か判定
        if (skill.type === 'healing') {
            // 味方を選ぶ
            this.availableTargets = this.getPartyMembers().map((m, i) => ({ member: m, index: i, scope: 'ally' }));
            this.commandPhase = 'target';
            this.selectedCommand = 0;
            this.renderTargetPhase('ally');
        } else if (skill.type === 'support') {
            // 自分のみ（自動確定）
            this.commitKamuiCommand(skill.id, 'self');
        } else {
            // offensive / kamui: 敵が単体のみなので自動的に enemy
            this.commitKamuiCommand(skill.id, 'enemy');
        }
    }

    renderTargetPhase(scope) {
        const items = this.availableTargets.map((entry, index) => {
            const tgt = entry.member;
            const hp = (tgt.hp != null && tgt.maxHp != null)
                ? `<span style="color:#88ff88; font-size:11px;">HP:${tgt.hp}/${tgt.maxHp}</span>`
                : '';
            return {
                html: `${tgt.name || 'カイト'} ${hp}`,
                onClick: () => {
                    this.selectedCommand = index;
                    this.refreshCurrentPhaseSelection();
                    this.commitKamuiCommand(this.pendingMagic.id, entry.index);
                }
            };
        });

        // キャンセル項目
        items.push({
            html: '↩ もどる',
            color: '#ff8888',
            onClick: () => {
                this.commandPhase = 'skill';
                this.selectedCommand = 0;
                this.renderSkillPhase();
            }
        });

        const title = scope === 'ally' ? '🎯 対象を選ぶ（味方）' : '🎯 対象を選ぶ';
        BattlePanel.renderCommands(items, {
            headerLabel: 'たいしょう',
            title,
            selectedIndex: this.selectedCommand
        });
    }

    commitKamuiCommand(magicId, targetIndex) {
        if (!this.kamuiPlanning) return;
        const member = this.kamuiPlanningMember;

        this.partyCommands[this.currentMemberIndex] = {
            member: member,
            command: 'kamui',
            magicId: magicId,
            targetIndex: targetIndex
        };

        // 計画フェーズを終了
        this.kamuiPlanning = false;
        this.kamuiPlanningMember = null;
        this.pendingMagic = null;
        this.availableSkills = [];
        this.availableTargets = [];
        this.commandPhase = 'command';
        this.waitingForCommand = false;

        const commands = document.getElementById('battleCommands');
        if (commands) commands.style.display = 'none';

        // パネルをログモードに戻して直近のメッセージを表示できるようにする
        const body = document.getElementById('gameMessageBody');
        if (body) body.classList.remove('battle-cmd-mode');

        this.currentMemberIndex++;
        setTimeout(() => this.showNextMemberCommand(), 200);
    }

    confirmKamuiPlanning(magicId) {
        // 旧API互換: ターゲットなしの単純確定
        this.commitKamuiCommand(magicId, 'enemy');
    }

    cancelKamuiPlanning() {
        if (!this.kamuiPlanning) return;

        this.kamuiPlanning = false;
        this.kamuiPlanningMember = null;
        this.pendingMagic = null;
        this.availableSkills = [];
        this.availableTargets = [];
        this.commandPhase = 'command';
        this.selectedCommand = 0;

        this.waitingForCommand = true;
        this.showCommands();
        this.updateCurrentMemberDisplay();
    }

    // 現在のフェーズの選択ハイライトを更新（パネル内のコマンドリスト）
    refreshCurrentPhaseSelection() {
        BattlePanel.setSelectedIndex(this.selectedCommand);
        // 旧コマンド領域にも互換のため反映（DOM 残骸の整合性維持用）
        const items = document.querySelectorAll('#battleCommands .command-item');
        items.forEach((item, i) => {
            if (i === this.selectedCommand) item.classList.add('selected');
            else item.classList.remove('selected');
        });
    }

    // カムイスキル選択UIを表示
    showKamuiSkillSelection(member, callback) {
        if (!window.magicSystem) {
            this.addBattleLog('魔法システムが初期化されていません');
            setTimeout(callback, 1000);
            return;
        }

        const kamuiSkills = window.magicSystem.getLearnedMagic(member);

        if (kamuiSkills.length === 0) {
            this.addBattleLog(`${member.name}は スキルを 習得していない！`);
            setTimeout(callback, 1000);
            return;
        }

        // スキル選択UIを表示
        this.currentKamuiCallback = callback;
        this.currentKamuiMember = member;
        this.selectedKamuiSkill = 0;
        this.showKamuiSkillMenu(kamuiSkills);
    }

    // カムイスキルメニューを表示
    showKamuiSkillMenu(skills) {
        const menu = document.getElementById('kamuiSkillMenu');
        if (!menu) {
            console.error('カムイスキルメニューが見つかりません');
            return;
        }

        const skillList = menu.querySelector('.kamui-skill-list');
        if (!skillList) {
            console.error('カムイスキルリストが見つかりません');
            return;
        }

        // スキルリストを作成
        skillList.innerHTML = '';
        skills.forEach((skill, index) => {
            const skillItem = document.createElement('div');
            skillItem.className = 'kamui-skill-item' + (index === this.selectedKamuiSkill ? ' selected' : '');
            skillItem.dataset.index = index;
            skillItem.dataset.magicId = skill.id;

            skillItem.innerHTML = `
                <div class="skill-icon">${skill.emoji}</div>
                <div class="skill-details">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-mp">MP: ${skill.mpCost}</div>
                </div>
                <div class="skill-description">${skill.description}</div>
            `;

            // クリックイベント
            skillItem.onclick = () => {
                this.selectedKamuiSkill = index;
                this.updateKamuiSkillSelection();
                this.executeKamuiSkill(skill.id);
            };

            skillList.appendChild(skillItem);
        });

        menu.style.display = 'block';

        // キーボード操作を有効化
        this.kamuiSkillMenuActive = true;
    }

    // カムイスキル選択を更新
    updateKamuiSkillSelection() {
        const skillItems = document.querySelectorAll('.kamui-skill-item');
        skillItems.forEach((item, index) => {
            if (index === this.selectedKamuiSkill) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // カムイスキルを実行（決定キー / クリックから呼ばれる）
    executeKamuiSkill(magicId) {
        if (this.kamuiSkillExecuting) return; // 連打による多重実行を防止
        this.kamuiSkillExecuting = true;
        try {
            // 計画フェーズなら確定処理（コマンド保存→次メンバー）
            if (this.kamuiPlanning) {
                this.confirmKamuiPlanning(magicId);
                return;
            }

            // ターン実行中の途中起動（旧フロー互換）
            const menu = document.getElementById('kamuiSkillMenu');
            if (menu) menu.style.display = 'none';
            this.kamuiSkillMenuActive = false;
            this.memberKamui(this.currentKamuiMember, this.currentKamuiCallback, magicId);
        } finally {
            // 同フレーム連打を防止しつつ、次の入力は受け付けたい
            setTimeout(() => { this.kamuiSkillExecuting = false; }, 150);
        }
    }

    // カムイスキルメニューを閉じる（戻るキー / X から呼ばれる）
    closeKamuiSkillMenu() {
        // 計画フェーズ中ならコマンド選択へ戻る（スキップしない）
        if (this.kamuiPlanning) {
            this.cancelKamuiPlanning();
            return;
        }

        // 旧フロー（ターン実行中の途中起動）。callbackがあれば次のアクションへ
        const menu = document.getElementById('kamuiSkillMenu');
        if (menu) menu.style.display = 'none';
        this.kamuiSkillMenuActive = false;

        if (this.currentKamuiCallback) {
            const cb = this.currentKamuiCallback;
            this.currentKamuiCallback = null;
            cb();
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
                const imagePath = this.getEnemyImagePath(this.currentEnemy);
                if (imagePath) {
                    enemySprite.innerHTML = `<img src="${imagePath}" alt="${this.currentEnemy.name}" decoding="async" onerror="if (!this.dataset.fallbackTried && this.src.includes('.webp')) { this.dataset.fallbackTried = '1'; this.src = this.src.replace('.webp', '.png'); } else { this.style.display = 'none'; }" style="width: 180px; max-height: 140px; object-fit: contain; filter: drop-shadow(0 0 14px rgba(255, 80, 80, 0.55));">`;
                } else {
                    enemySprite.textContent = this.currentEnemy.emoji;
                }
            }

            // 敵情報更新
            document.getElementById('enemyName').textContent = this.currentEnemy.name;

            // 旧コマンド領域は使わないが互換のため非表示維持
            const commands = document.getElementById('battleCommands');
            if (commands) {
                commands.style.display = 'none';
            }

            // 旧バトルメッセージもクリア
            const battleMessage = document.getElementById('battleMessage');
            if (battleMessage) {
                battleMessage.textContent = '';
            }

            // メッセージパネルをバトルモードで起動（最初はログモード）
            BattlePanel.activate('戦闘');
            BattlePanel.renderLog([`${this.currentEnemy.name} が あらわれた！`]);

            this.updateBattleUI();
        }
    }

    getEnemyImagePath(enemy) {
        if (!enemy) return null;
        const path = (
            enemy.image ||
            (enemy.bossId && this.enemyImageMap[enemy.bossId]) ||
            (enemy.type && this.enemyImageMap[enemy.type]) ||
            (enemy.name && enemy.name.includes('ドローン') ? 'assets/enemies/watcher.png' : null) ||
            (enemy.name && enemy.name.includes('デウス') ? 'assets/enemies/deus_machina.png' : null) ||
            (enemy.name && enemy.name.includes('アーク') ? 'assets/enemies/ark_prime.png' : null)
        );
        if (typeof path === 'string' && path.startsWith('assets/enemies/') && path.endsWith('.png')) {
            return path.replace(/\.png$/, '.webp');
        }
        if (path) return path;
        return null;
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

        // 敵のAI行動決定
        const action = this.determineEnemyAction();

        switch (action) {
            case 'attack':
                this.enemyAttack(player);
                break;
            case 'defend':
                this.enemyDefend(player);
                break;
            case 'skill':
                this.enemySkillAttack(player);
                break;
            default:
                this.enemyAttack(player);
        }
    }

    // 敵の行動を決定
    determineEnemyAction() {
        if (!this.currentEnemy || !this.currentEnemy.aiPattern) {
            return 'attack';
        }

        const hpRatio = this.currentEnemy.currentHp / this.currentEnemy.maxHp;
        const aiPattern = this.currentEnemy.aiPattern;

        // HP閾値以下の場合、低HP時の行動
        if (hpRatio <= aiPattern.lowHpThreshold) {
            return aiPattern.lowHpAction;
        }

        // スキル使用判定
        if (aiPattern.skillChance && Math.random() < aiPattern.skillChance) {
            return 'skill';
        }

        return aiPattern.normalAction || 'attack';
    }

    // 敵の通常攻撃
    enemyAttack(player) {
        const baseDamage = this.currentEnemy.attack;
        const variance = Math.floor(Math.random() * 3);
        let damage = Math.max(1, baseDamage + variance - Math.floor((player.defense || 5) / 2));

        // パーティメンバーからランダムにターゲットを選択
        const allMembers = this.getPartyMembers();
        const target = allMembers[Math.floor(Math.random() * allMembers.length)];

        // 防御中はダメージ半減
        if (target.defending) {
            damage = Math.floor(damage / 2);
            this.addBattleLog(`${this.currentEnemy.name}の こうげき！`);
            this.addBattleLog(`${target.name}は ぼうぎょしている！`);
            target.defending = false;
        } else {
            this.addBattleLog(`${this.currentEnemy.name}の こうげき！`);
        }

        target.hp = Math.max(0, target.hp - damage);
        this.addBattleLog(`${target.name}に ${Math.floor(damage)}の ダメージ！`);

        this.showDamageEffect(damage, false);
        this.updateBattleUI();

        // パーティ全滅チェック
        if (this.checkPartyWipeout()) {
            setTimeout(() => this.gameOver(), 1500);
        } else {
            // パーティメンバーのステータス異常処理
            setTimeout(() => {
                this.processAllMembersStatusAilments(() => {
                    this.turnCount++;
                    this.startPlayerTurn();
                });
            }, 1500);
        }
    }

    // 敵の防御
    enemyDefend(player) {
        this.addBattleLog(`${this.currentEnemy.name}は みをまもっている！`);
        this.currentEnemy.defending = true;

        // 次のターンへ
        setTimeout(() => {
            this.turnCount++;
            this.startPlayerTurn();
        }, 1500);
    }

    // 敵のスキル攻撃
    enemySkillAttack(player) {
        const skillDamage = Math.floor(this.currentEnemy.attack * 1.5);
        const variance = Math.floor(Math.random() * 5);
        let damage = Math.max(1, skillDamage + variance - Math.floor((player.defense || 5) / 3));

        // パーティメンバーからランダムにターゲットを選択
        const allMembers = this.getPartyMembers();
        const target = allMembers[Math.floor(Math.random() * allMembers.length)];

        this.addBattleLog(`${this.currentEnemy.name}の とくしゅこうげき！`);
        // 防御中は特殊攻撃も半減（通常攻撃と同じ扱い。従来は特殊に防御が効かなかった）
        if (target.defending) {
            damage = Math.floor(damage / 2);
            this.addBattleLog(`${target.name}は ぼうぎょしている！`);
            target.defending = false;
        }

        target.hp = Math.max(0, target.hp - damage);
        this.addBattleLog(`${target.name}に ${Math.floor(damage)}の ダメージ！`);

        this.showDamageEffect(damage, false, true);

        // ステータス異常付与判定（30%確率）
        if (Math.random() < 0.3) {
            const ailments = ['poison', 'paralysis', 'sleep'];
            const randomAilment = ailments[Math.floor(Math.random() * ailments.length)];
            this.applyStatusAilment(target, randomAilment, 3);
        }

        this.updateBattleUI();

        // パーティ全滅チェック
        if (this.checkPartyWipeout()) {
            setTimeout(() => this.gameOver(), 1500);
        } else {
            // パーティメンバーのステータス異常処理
            setTimeout(() => {
                this.processAllMembersStatusAilments(() => {
                    this.turnCount++;
                    this.startPlayerTurn();
                });
            }, 1500);
        }
    }

    // 全メンバーのステータス異常処理
    processAllMembersStatusAilments(callback) {
        const allMembers = this.getPartyMembers();
        let index = 0;

        const processNext = () => {
            if (index >= allMembers.length) {
                callback();
                return;
            }

            this.processStatusAilmentsEndTurn(allMembers[index]);
            index++;

            if (index < allMembers.length) {
                setTimeout(processNext, 500);
            } else {
                callback();
            }
        };

        processNext();
    }

    // パーティ全滅チェック
    checkPartyWipeout() {
        const allMembers = this.getPartyMembers();
        return allMembers.every(member => member.hp <= 0);
    }
    
    // 戦闘勝利
    battleVictory(player) {
        this.waitingForCommand = false;

        // コマンドを非表示に（旧UI互換）
        const commands = document.getElementById('battleCommands');
        if (commands) {
            commands.style.display = 'none';
        }
        // パネルをログモードに切り替え
        const body = document.getElementById('gameMessageBody');
        if (body) body.classList.remove('battle-cmd-mode');

        // 勝利メッセージ
        this.addBattleLog(`${this.currentEnemy.name}を たおした！`);

        // 経験値とゴールド獲得
        const expGained = this.currentEnemy.exp || 10;
        const goldGained = this.currentEnemy.gold || 5;

        // リザルト表示
        setTimeout(() => {
            this.addBattleLog(`せんとうに しょうり！`);
            this.addBattleLog(`${expGained} の けいけんちを かくとく！`);

            // ゴールド付与（プレイヤーのみ）
            player.gold = (player.gold || 0) + goldGained;
            this.addBattleLog(`${goldGained} ゴールドを てにいれた！`);

            // 全パーティメンバーに経験値を配分
            const allMembers = [player];
            if (window.partySystem) {
                allMembers.push(...window.partySystem.getMembers());
            }

            // 各メンバーに経験値付与
            allMembers.forEach(member => {
                member.exp = (member.exp || 0) + expGained;
            });

            // ドロップアイテム判定
            const droppedItems = this.processItemDrops();
            if (droppedItems.length > 0) {
                droppedItems.forEach(item => {
                    this.addBattleLog(`${item.name}を てにいれた！`);
                });
            }

            // レベルアップ処理を順番に実行
            this.processLevelUps(allMembers, 0);
        }, 1000);
    }

    // ドロップアイテム処理
    processItemDrops() {
        const droppedItems = [];

        if (!this.currentEnemy || !this.currentEnemy.dropTable) {
            return droppedItems;
        }

        this.currentEnemy.dropTable.forEach(dropEntry => {
            const roll = Math.random();
            if (roll < dropEntry.rate) {
                // アイテムかチェック
                if (window.itemSystem && window.itemSystem.itemDatabase[dropEntry.id]) {
                    const success = window.itemSystem.addItem(dropEntry.id, 1);
                    if (success) {
                        const itemData = window.itemSystem.itemDatabase[dropEntry.id];
                        droppedItems.push(itemData);
                    }
                }
                // 装備品かチェック
                else if (window.equipmentSystem && window.equipmentSystem.equipmentDatabase[dropEntry.id]) {
                    // 装備品は equipmentSystem.inventory へ入れる（装備メニューはこちらを読む。
                    // 旧 player.equipmentInventory 配列はメニュー未参照で永久に使えなかったバグを修正）
                    const equipData = window.equipmentSystem.equipmentDatabase[dropEntry.id];
                    window.equipmentSystem.addEquipment(dropEntry.id, 1);

                    droppedItems.push({
                        name: equipData.name,
                        emoji: equipData.emoji
                    });

                    console.log(`装備品ドロップ: ${equipData.name}`);
                }
            }
        });

        return droppedItems;
    }

    // レベルアップ処理を順番に実行
    processLevelUps(members, index) {
        if (index >= members.length) {
            // 全員のレベルアップ処理完了
            setTimeout(() => this.endBattle(true), 1500);
            return;
        }

        const member = members[index];
        const characterId = member.characterId || 'kaito';
        const expCurve = window.CHARACTER_GROWTH?.[characterId]?.expCurve || 'normal';
        const expNeeded = window.calculateExpNeeded ? window.calculateExpNeeded(member.level, expCurve) : member.level * 100;

        if (member.exp >= expNeeded) {
            setTimeout(() => {
                this.levelUpCharacter(member);
                // 次のメンバーのレベルアップチェック
                this.processLevelUps(members, index);
            }, 1000);
        } else {
            // 次のメンバーへ
            this.processLevelUps(members, index + 1);
        }
    }

    // キャラクターのレベルアップ処理
    levelUpCharacter(character) {
        const characterId = character.characterId || 'kaito';
        const oldLevel = character.level;
        // このレベルに必要だったexpを消費（消費しないとprocessLevelUpsが同レベルで無限/多段暴発する）
        const expCurve = window.CHARACTER_GROWTH?.[characterId]?.expCurve || 'normal';
        const needed = window.calculateExpNeeded ? window.calculateExpNeeded(character.level, expCurve) : character.level * 100;
        character.exp = Math.max(0, (character.exp || 0) - needed);
        character.level++;

        // ステータス成長（ランダム幅付き）
        const hpGain = window.calculateStatGrowth ? window.calculateStatGrowth(characterId, 'hp') : 20;
        const mpGain = window.calculateStatGrowth ? window.calculateStatGrowth(characterId, 'mp') : 10;
        const attackGain = window.calculateStatGrowth ? window.calculateStatGrowth(characterId, 'attack') : 3;
        const defenseGain = window.calculateStatGrowth ? window.calculateStatGrowth(characterId, 'defense') : 2;
        const magicGain = window.calculateStatGrowth ? window.calculateStatGrowth(characterId, 'magic') : 2;
        const speedGain = window.calculateStatGrowth ? window.calculateStatGrowth(characterId, 'speed') : 1;

        // 基本ステータスを上昇
        character.baseMaxHp = (character.baseMaxHp || character.maxHp) + hpGain;
        character.baseMaxMp = (character.baseMaxMp || character.maxMp) + mpGain;
        character.baseAttack = (character.baseAttack || character.attack) + attackGain;
        character.baseDefense = (character.baseDefense || character.defense) + defenseGain;
        character.baseMagic = (character.baseMagic || character.magic || 0) + magicGain;
        character.baseSpeed = (character.baseSpeed || character.speed || 5) + speedGain;

        // 装備込みのステータスを再計算（プレイヤーのみ）
        if (character === window.player && window.equipmentSystem) {
            window.equipmentSystem.recalculatePlayerStats(character);
        } else {
            character.maxHp = character.baseMaxHp;
            character.maxMp = character.baseMaxMp;
            character.attack = character.baseAttack;
            character.defense = character.baseDefense;
            character.magic = character.baseMagic;
            character.speed = character.baseSpeed;
        }

        // HP/MPを全回復
        character.hp = character.maxHp;
        character.mp = character.maxMp;

        // レベルアップメッセージ
        this.addBattleLog(`${character.name}が レベルアップ！`);
        this.addBattleLog(`レベル ${character.level} になった！`);
        this.addBattleLog(`HP+${hpGain} MP+${mpGain} 攻撃+${attackGain} 防御+${defenseGain}`);

        // 新規スキル習得チェック
        this.checkSkillLearning(character, oldLevel);

        // UIを更新
        if (window.updateUI) {
            window.updateUI();
        }
    }

    // スキル習得チェック
    checkSkillLearning(character, oldLevel) {
        const characterId = character.characterId || 'kaito';
        const skillLearning = window.CHARACTER_GROWTH?.[characterId]?.skillLearning;

        if (!skillLearning || !window.magicSystem) return;

        const newLevel = character.level;

        // レベル範囲内のスキルを習得
        for (let level = oldLevel + 1; level <= newLevel; level++) {
            const skills = skillLearning[level];
            if (skills && Array.isArray(skills)) {
                skills.forEach(skillId => {
                    const learned = window.magicSystem.learnMagic(skillId, character);
                    if (learned) {
                        const magic = window.magicSystem.magicDatabase[skillId];
                        if (magic) {
                            this.addBattleLog(`${character.name}は ${magic.name}を おぼえた！`);
                        }
                    }
                });
            }
        }
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

        // 戦闘UIに残存しているフラグ・要素を強制クリア（フィールド復帰時の入力封じ防止）
        this.kamuiSkillMenuActive = false;
        this.kamuiPlanning = false;
        this.kamuiPlanningMember = null;
        this.kamuiSkillExecuting = false;
        this.executingTurn = false;
        this.allCommandsSelected = false;
        this.partyCommands = [];
        this.currentMemberIndex = 0;
        this.currentKamuiCallback = null;
        this.currentKamuiMember = null;

        const kamuiMenu = document.getElementById('kamuiSkillMenu');
        if (kamuiMenu) kamuiMenu.style.display = 'none';

        // index.html 側の入力状態（押しっぱなしキー / メッセージ表示中フラグ等）をリセット
        if (typeof window.resetBattleUIState === 'function') {
            window.resetBattleUIState();
        }

        // 戦闘後は少し安全期間を設ける
        this.encounterSteps = 0;
        this.encounterThreshold = Math.floor(this.getRandomEncounterSteps('medium') * 1.5);

        const battleScreen = document.getElementById('battleScreen');
        if (battleScreen) {
            battleScreen.classList.remove('active');
            document.getElementById('gameUI').style.display = 'block';
        }

        // メッセージパネルをバトルモードから解除
        BattlePanel.deactivate();

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
        // 戦闘UI状態を解除
        this.kamuiSkillMenuActive = false;
        this.kamuiPlanning = false;
        this.kamuiSkillExecuting = false;
        this.executingTurn = false;
        const kamuiMenu = document.getElementById('kamuiSkillMenu');
        if (kamuiMenu) kamuiMenu.style.display = 'none';

        setTimeout(() => {
            if (typeof window.showGameModal === 'function') {
                window.showGameModal({
                    title: 'GAME OVER',
                    body: 'パーティは 全滅した…\nタイトルに戻りますか？',
                    options: [
                        { label: 'タイトルへ', value: 'title' },
                        { label: '閉じる', value: 'close' }
                    ],
                    defaultIndex: 0,
                    onSelect: (value) => {
                        if (value === 'title') {
                            location.reload();
                        }
                    }
                });
            } else if (confirm('ゲームオーバー。タイトルに戻りますか？')) {
                location.reload();
            }
        }, 2000);
    }
    
    // バトルログ追加
    addBattleLog(message) {
        this.battleLog.push(message);

        // 旧バトルメッセージ枠（DOM互換）にも反映
        const battleMessage = document.getElementById('battleMessage');
        if (battleMessage) {
            const recentLogs = this.battleLog.slice(-4);
            battleMessage.textContent = recentLogs.join('\n');
            battleMessage.scrollTop = battleMessage.scrollHeight;
        }

        // バトル中はメッセージパネルにも描画する。
        if (this.inBattle) {
            const body = document.getElementById('gameMessageBody');
            const isCommandMode = body && body.classList.contains('battle-cmd-mode');
            if (!isCommandMode) {
                // ログモード: 直近の数行をパネルに表示
                BattlePanel.renderLog(this.battleLog);
            } else {
                // コマンド入力中はリストを潰さず、ヘッダ右側に最新ログを点滅表示
                this._flashCommandHeaderMessage(message);
            }
        }
    }

    // コマンド入力中に小さく警告ログを表示する
    _flashCommandHeaderMessage(message) {
        const headerLabel = document.getElementById('gameMessageCharacter');
        if (!headerLabel) return;
        // 直近の本来のラベルを保持
        if (headerLabel.dataset.battleOriginalLabel == null) {
            headerLabel.dataset.battleOriginalLabel = headerLabel.textContent || '';
        }
        // 表示
        headerLabel.dataset.battleFlashing = '1';
        headerLabel.textContent = `${headerLabel.dataset.battleOriginalLabel} — ${message}`;
        // 既存のタイマを破棄して上書き
        if (this._flashTimer) clearTimeout(this._flashTimer);
        this._flashTimer = setTimeout(() => {
            const orig = headerLabel.dataset.battleOriginalLabel || '';
            headerLabel.textContent = orig;
            delete headerLabel.dataset.battleFlashing;
            delete headerLabel.dataset.battleOriginalLabel;
            this._flashTimer = null;
        }, 1800);
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
            // キャンバス右上に配置するためコンパクト化
            statusBox.style.cssText = `
                background: rgba(0, 0, 0, 0.78);
                border: 2px solid #00ffff;
                border-radius: 5px;
                padding: 5px 8px;
                min-width: 0;
                width: 190px;
                box-shadow: 0 0 12px rgba(0, 255, 255, 0.25);
                font-size: 12px;
            `;

            // HP色を設定
            let hpColor = '#44ff44';
            if (hpRatio <= 0.25) hpColor = '#ff4444';
            else if (hpRatio <= 0.5) hpColor = '#ffff44';

            statusBox.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px; color: #00ffff;">
                    <span>${member.name || 'カイト'}</span>
                    <span>Lv.${member.level || 1}</span>
                </div>
                <div style="margin-bottom: 2px;">
                    <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 1px;">
                        <span style="color: #aaa;">HP</span>
                        <span style="color: #fff;">${Math.max(0, member.hp || member.maxHp)}/${member.maxHp || 100}</span>
                    </div>
                    <div style="background: #333; height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="
                            width: ${hpRatio * 100}%;
                            height: 100%;
                            background: linear-gradient(90deg, ${hpColor}, ${hpColor}dd);
                            transition: width 0.3s;
                        "></div>
                    </div>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 1px;">
                        <span style="color: #aaa;">MP</span>
                        <span style="color: #fff;">${member.mp || member.maxMp}/${member.maxMp || 50}</span>
                    </div>
                    <div style="background: #333; height: 4px; border-radius: 2px; overflow: hidden;">
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
    
    // コマンド表示（標準のメインコマンドリストをパネルに描画）
    showCommands() {
        // フェーズを通常のコマンドモードに戻す
        this.commandPhase = 'command';
        this.waitingForCommand = true;
        this.selectedCommand = 0;

        // 現在行動中のメンバー名をヘッダに表示
        const partyMembers = this.getPartyMembers();
        const currentMember = partyMembers[this.currentMemberIndex] || partyMembers[0];
        const headerLabel = currentMember ? `${currentMember.name || 'カイト'} のコマンド` : 'コマンド';

        const standard = [
            { command: 'attack', label: 'こうげき' },
            { command: 'kamui',  label: 'カムイ' },
            { command: 'defend', label: 'ぼうぎょ' },
            { command: 'item',   label: 'どうぐ' },
            { command: 'escape', label: 'にげる' }
        ];

        BattlePanel.renderCommands(standard, {
            headerLabel,
            selectedIndex: 0
        });

        // index.html 側で onclick / 選択ハイライトを設定（互換）
        if (window.setupBattleCommands) {
            window.setupBattleCommands();
        }
    }
}

// グローバルにエクスポート
window.BattleSystem = BattleSystem;
