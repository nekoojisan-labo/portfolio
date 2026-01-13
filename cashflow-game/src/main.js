// ===================================
// マネーアドベンチャー - メインスクリプト
// ===================================

// ゲームインスタンス
let game = null;

// 設定状態
let selectedMode = 'easy';
let humanPlayerCount = 1;
let currentPlayerIndex = 0;  // 現在キャラメイク中のプレイヤー
let playerConfigs = [];      // 各プレイヤーの設定を保存
let currentCharAvatar = '🐱';
let currentCharJob = null;
let shuffledJobCards = [];

// 使用済みアバター追跡
let usedAvatars = [];

// ゲーム状態
let hasRolledThisTurn = false;  // このターンでサイコロを振ったか

// ===================================
// 画面遷移
// ===================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ===================================
// セットアップ画面（プレイヤー人数選択）
// ===================================

function selectPlayerCount(btn) {
    document.querySelectorAll('.player-count-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    humanPlayerCount = parseInt(btn.dataset.count);

    // AI人数を更新
    const aiCount = 4 - humanPlayerCount;
    document.getElementById('ai-slots').textContent = aiCount;

    // AI表示セクションの表示/非表示
    const aiSection = document.getElementById('ai-section');
    if (aiCount > 0) {
        aiSection.style.display = 'block';
        updateAICharactersPreview();
    } else {
        aiSection.style.display = 'none';
    }
}

function selectDifficulty(btn) {
    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMode = btn.dataset.mode;

    // AIキャラクタープレビューを更新
    updateAICharactersPreview();
}

function goToCharacterCreation() {
    // プレイヤー設定をリセット
    playerConfigs = [];
    currentPlayerIndex = 0;
    usedAvatars = [];
    currentCharAvatar = '🐱';
    currentCharJob = null;

    // キャラクター作成画面を初期化
    initCharacterScreen();
    showScreen('character-screen');
}

function updateAICharactersPreview() {
    const preview = document.getElementById('ai-characters-preview');
    if (!preview) return;

    // 難易度に応じたキャラクターを取得
    const characters = typeof AI_CHARACTERS !== 'undefined' ? AI_CHARACTERS[selectedMode] : [];

    if (characters.length === 0) {
        preview.innerHTML = '';
        return;
    }

    const modeLabels = {
        'easy': 'やさしい仲間たち',
        'normal': '個性的なライバル',
        'challenge': '強力なライバル'
    };

    preview.innerHTML = `
        <div class="ai-preview-label">${modeLabels[selectedMode] || 'AIキャラクター'}</div>
        <div class="ai-preview-grid">
            ${characters.map(char => `
                <div class="ai-preview-card">
                    <div class="ai-preview-avatar">${char.avatar}</div>
                    <div class="ai-preview-name">${char.name}</div>
                    <div class="ai-preview-desc">${char.description}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===================================
// キャラクター作成画面
// ===================================

function initCharacterScreen() {
    // プレイヤー番号表示を更新
    const indicator = document.getElementById('player-indicator');
    indicator.textContent = `${currentPlayerIndex + 1}人目`;

    // 名前フィールドをクリア
    document.getElementById('char-name').value = '';

    // 進捗表示を更新
    updateCharacterProgress();

    // 使用可能なアバターを更新
    updateAvailableAvatars();

    // 最初の利用可能なアバターを選択
    const firstAvailable = document.querySelector('#avatar-selection .avatar-btn:not(.used)');
    if (firstAvailable) {
        selectCharAvatar(firstAvailable);
    }
}

function updateCharacterProgress() {
    const progress = document.getElementById('character-progress');
    let html = '<div class="progress-dots">';

    for (let i = 0; i < humanPlayerCount; i++) {
        const status = i < currentPlayerIndex ? 'done' : (i === currentPlayerIndex ? 'current' : 'pending');
        const config = playerConfigs[i];
        const avatar = config ? config.avatar : '?';
        html += `<div class="progress-dot ${status}">${status === 'done' ? avatar : (i + 1)}</div>`;
    }

    html += '</div>';
    progress.innerHTML = html;
}

function updateAvailableAvatars() {
    const avatarBtns = document.querySelectorAll('#avatar-selection .avatar-btn');
    avatarBtns.forEach(btn => {
        const avatar = btn.dataset.avatar;
        if (usedAvatars.includes(avatar)) {
            btn.classList.add('used');
            btn.disabled = true;
        } else {
            btn.classList.remove('used');
            btn.disabled = false;
        }
    });
}

function selectCharAvatar(btn) {
    if (btn.classList.contains('used')) return;

    document.querySelectorAll('#avatar-selection .avatar-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentCharAvatar = btn.dataset.avatar;
}

function backFromCharacterCreation() {
    if (currentPlayerIndex > 0) {
        // 前のプレイヤーのキャラメイクに戻る
        currentPlayerIndex--;
        const prevConfig = playerConfigs.pop();
        if (prevConfig) {
            usedAvatars = usedAvatars.filter(a => a !== prevConfig.avatar);
        }
        initCharacterScreen();
    } else {
        // セットアップ画面に戻る
        showScreen('setup-screen');
    }
}

function goToJobSelectionForPlayer() {
    const name = document.getElementById('char-name').value.trim() || `プレイヤー${currentPlayerIndex + 1}`;

    // 現在のプレイヤーの名前とアバターを一時保存
    currentCharJob = null;

    // プレイヤー表示を更新
    const indicator = document.getElementById('job-player-indicator');
    indicator.textContent = `${currentPlayerIndex + 1}人目: ${name}`;

    showScreen('job-selection-screen');
    initJobCards();
}

function backToCharacterScreen() {
    currentCharJob = null;
    showScreen('character-screen');
}

// ===================================
// 職業選択
// ===================================

function goToJobSelection() {
    showScreen('job-selection-screen');
    initJobCards();
}

function initJobCards() {
    const grid = document.getElementById('job-cards-grid');
    const resultArea = document.getElementById('job-result-area');

    // 結果エリアを非表示
    resultArea.style.display = 'none';

    // 職業カードをシャッフル
    shuffledJobCards = shuffleArray([...JOB_CARDS]);

    // カードをリセット
    selectedJob = null;

    // カードを生成（6枚表示）
    const displayCount = Math.min(6, shuffledJobCards.length);
    grid.innerHTML = '';

    for (let i = 0; i < displayCount; i++) {
        const job = shuffledJobCards[i];
        const card = document.createElement('div');
        card.className = 'job-card';
        card.dataset.jobId = job.id;
        card.dataset.index = i;

        card.innerHTML = `
            <div class="job-card-inner">
                <div class="job-card-face job-card-back">
                    <div class="card-pattern"></div>
                    <div class="card-label">タップしてね</div>
                </div>
                <div class="job-card-face job-card-front">
                    <div class="job-icon">${job.icon}</div>
                    <div class="job-name">${job.name}</div>
                    <div class="job-family">${job.familyIcon} ${job.familyLabel}</div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => selectJobCard(card, job));
        grid.appendChild(card);
    }
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

async function selectJobCard(cardElement, job) {
    // 既に選択済みなら無視
    if (currentCharJob) return;

    currentCharJob = job;

    // 全てのカードを無効化
    document.querySelectorAll('.job-card').forEach(c => {
        if (c !== cardElement) {
            c.classList.add('disabled');
        }
    });

    // 選択されたカードをフリップ
    cardElement.classList.add('flipped', 'selected');

    // フリップアニメーションを待つ
    await sleep(1000);

    // 結果を表示
    showJobResult(job);
}

function showJobResult(job) {
    const resultArea = document.getElementById('job-result-area');

    // 職業情報を設定
    document.getElementById('job-result-icon').textContent = job.icon;
    document.getElementById('job-result-name').textContent = job.name;
    document.getElementById('job-result-description').textContent = job.description;

    // ステータスを設定
    document.getElementById('job-stat-salary').textContent = `+${job.salary}`;
    document.getElementById('job-stat-expense').textContent = `-${job.livingExpense}`;
    document.getElementById('job-stat-family').textContent = job.familyLabel;
    document.getElementById('job-stat-cash').textContent = `${job.startingCash}コイン`;

    // ヒントを設定
    document.getElementById('job-result-hint').textContent = `💡 ヒント: ${job.hint}`;

    // キャッシュフローを計算
    const cashflow = job.salary - job.livingExpense;
    const cashflowEl = document.getElementById('job-cashflow');
    cashflowEl.textContent = cashflow >= 0 ? `+${cashflow}` : `${cashflow}`;
    cashflowEl.className = `cashflow-value ${cashflow >= 0 ? 'positive' : 'negative'}`;

    // 結果エリアを表示
    resultArea.style.display = 'block';

    // スクロール
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function confirmJobSelection() {
    if (!currentCharJob) {
        alert('職業カードを選んでね！');
        return;
    }

    const name = document.getElementById('char-name').value.trim() || `プレイヤー${currentPlayerIndex + 1}`;

    // 現在のプレイヤー設定を保存
    playerConfigs.push({
        name: name,
        avatar: currentCharAvatar,
        job: currentCharJob,
        isAI: false
    });

    // アバターを使用済みに追加
    usedAvatars.push(currentCharAvatar);

    // 次のプレイヤーへ
    currentPlayerIndex++;

    if (currentPlayerIndex < humanPlayerCount) {
        // まだ設定が終わっていないプレイヤーがいる
        currentCharJob = null;
        initCharacterScreen();
        showScreen('character-screen');
    } else {
        // 全プレイヤーの設定完了、ゲーム開始
        startGameWithPlayers();
    }
}

function startGameWithPlayers() {
    const aiCount = 4 - humanPlayerCount;

    // AIレベルは難易度に応じて自動設定
    const aiLevelByMode = {
        'easy': 1,
        'normal': 2,
        'challenge': 3
    };
    const aiLevel = aiLevelByMode[selectedMode] || 2;

    // CoachAIの難易度を設定
    if (typeof CoachAI !== 'undefined') {
        CoachAI.setDifficulty(selectedMode);
    }

    game = new Game();
    game.initializeMultiplayer({
        humanPlayers: playerConfigs,
        mode: selectedMode,
        aiCount: aiCount,
        aiLevel: aiLevel
    });

    showScreen('game-screen');
    initGameUI();
    startTurn();
}

// ===================================
// ゲーム開始（従来の方法 - 職業選択なし）
// ===================================

function startGame() {
    const playerName = document.getElementById('player-name').value.trim() || 'プレイヤー';
    const aiCount = parseInt(document.getElementById('ai-count').value);

    // AIレベルは難易度に応じて自動設定
    const aiLevelByMode = {
        'easy': 1,
        'normal': 2,
        'challenge': 3
    };
    const aiLevel = aiLevelByMode[selectedMode] || 2;

    game = new Game();
    game.initialize({
        playerName: playerName,
        avatar: selectedAvatar,
        mode: selectedMode,
        aiCount: aiCount,
        aiLevel: aiLevel
    });

    showScreen('game-screen');
    initGameUI();
    startTurn();
}

function loadGame() {
    game = new Game();
    if (game.load()) {
        showScreen('game-screen');
        initGameUI();
        updateAllUI();
    } else {
        alert('セーブデータがありません');
    }
}

function restartGame() {
    showScreen('setup-screen');
}

// ===================================
// ゲームUI初期化
// ===================================

function initGameUI() {
    renderGameBoard();
    renderPlayersPanel();
    updateAllUI();
}

function renderGameBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    // シンプルな周回ボードを生成
    BOARD_TILES.forEach((tile, index) => {
        const tileEl = document.createElement('div');
        tileEl.className = 'board-tile';
        tileEl.dataset.index = index;

        // タイルのアイコン
        const iconEl = document.createElement('span');
        iconEl.className = 'tile-icon';
        iconEl.textContent = tile.icon;
        tileEl.appendChild(iconEl);

        // プレイヤートークン用のコンテナ
        const tokenContainer = document.createElement('div');
        tokenContainer.className = 'tile-tokens';
        tileEl.appendChild(tokenContainer);

        tileEl.title = tile.name;
        board.appendChild(tileEl);
    });

    // プレイヤートークンを作成
    game.players.forEach((player, index) => {
        const token = document.createElement('div');
        token.className = 'player-token';
        token.id = `token-${player.id}`;
        token.innerHTML = player.avatar;
        // 初期位置のタイルに追加
        const tileIndex = player.position % BOARD_TILES.length;
        const tile = document.querySelector(`.board-tile[data-index="${tileIndex}"] .tile-tokens`);
        if (tile) {
            tile.appendChild(token);
        }
    });
}

function renderPlayersPanel() {
    const list = document.getElementById('players-status-list') || document.getElementById('players-list');
    if (!list) return;
    list.innerHTML = '';

    // 人間プレイヤーの数をカウント
    const humanCount = game.players.filter(p => !p.isAI).length;
    let humanIndex = 0;

    game.players.forEach(player => {
        const finance = game.getPlayerFinance(player);
        const card = document.createElement('div');
        card.className = 'player-status-card';
        card.id = `player-card-${player.id}`;

        // AIプレイヤーの場合は説明も表示
        const descHtml = player.isAI && player.description
            ? `<div class="player-status-desc">${player.description}</div>`
            : '';

        // 職業名
        const jobHtml = player.job
            ? `<div class="player-status-job">${player.job.icon} ${player.job.name}</div>`
            : '';

        // プレイヤーの種類を示すバッジ
        let badgeHtml;
        if (player.isAI) {
            badgeHtml = '<span class="player-badge ai">AI</span>';
        } else {
            humanIndex++;
            // 複数人の場合はプレイヤー番号、1人の場合は「あなた」
            const badgeText = humanCount > 1 ? `P${humanIndex}` : 'あなた';
            badgeHtml = `<span class="player-badge human">${badgeText}</span>`;
        }

        card.innerHTML = `
            <div class="player-status-avatar">${player.avatar}</div>
            <div class="player-status-info">
                <div class="player-status-name-row">
                    <span class="player-status-name">${player.name}</span>
                    ${badgeHtml}
                </div>
                ${descHtml}
                ${jobHtml}
                <div class="player-status-progress">
                    <div class="player-status-progress-bar">
                        <div class="player-status-progress-fill" style="width: ${finance.escapeProgress}%"></div>
                    </div>
                    <span class="player-status-progress-text">${finance.escapeProgress}%</span>
                </div>
            </div>
        `;

        list.appendChild(card);
    });
}

// ===================================
// UI更新
// ===================================

function updateAllUI() {
    updateTurnInfo();
    updateFinancePanel();
    updatePlayersPanel();
    updatePlayerPositions();
    updateActionButtons();
}

function updateTurnInfo() {
    const player = game.getCurrentPlayer();
    document.getElementById('current-turn').textContent = game.turn;
    document.getElementById('current-player-name').textContent = player.name;
    document.getElementById('phase-indicator').textContent = getPhaseText(game.phase);
}

function getPhaseText(phase) {
    const phases = {
        'income': '収入フェーズ',
        'expense': '支出フェーズ',
        'event': 'イベントフェーズ',
        'action': '行動フェーズ',
        'cooperation': '協力フェーズ',
        'check': 'チェックフェーズ'
    };
    return phases[phase] || phase;
}

function updateFinancePanel() {
    const player = game.getCurrentPlayer();
    const finance = game.getPlayerFinance(player);

    document.getElementById('player-cash').textContent = formatNumber(player.cash);
    document.getElementById('salary-income').textContent = formatCoin(player.salary, true);
    document.getElementById('passive-income').textContent = formatCoin(player.passiveIncome, true);
    document.getElementById('total-income').textContent = formatCoin(finance.totalIncome, true);

    document.getElementById('living-expense').textContent = formatCoin(-player.livingExpense);
    document.getElementById('loan-payment').textContent = formatCoin(-player.loanPayment);
    document.getElementById('total-expense').textContent = formatCoin(-finance.totalExpense);

    document.getElementById('monthly-cashflow').textContent = formatCoin(finance.monthlyCashflow, true);
    document.getElementById('monthly-cashflow').className = `value ${finance.monthlyCashflow >= 0 ? 'positive' : 'negative'}`;

    document.getElementById('escape-percent').textContent = `${finance.escapeProgress}%`;
    document.getElementById('escape-progress-bar').style.width = `${finance.escapeProgress}%`;
}

function updatePlayersPanel() {
    game.players.forEach(player => {
        const card = document.getElementById(`player-card-${player.id}`);
        if (card) {
            const finance = game.getPlayerFinance(player);

            // 現在のプレイヤーをハイライト
            card.classList.toggle('current-turn', player.id === game.getCurrentPlayer().id);
            card.classList.toggle('escaped', player.isEscaped);

            // 進捗バーを更新
            const progressFill = card.querySelector('.player-status-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${finance.escapeProgress}%`;
            }

            // 進捗テキストを更新
            const progressText = card.querySelector('.player-status-progress-text');
            if (progressText) {
                progressText.textContent = `${finance.escapeProgress}%`;
            }
        }
    });
}

function updatePlayerPositions() {
    game.players.forEach(player => {
        const token = document.getElementById(`token-${player.id}`);
        const tileIndex = player.position % BOARD_TILES.length;
        const targetContainer = document.querySelector(`.board-tile[data-index="${tileIndex}"] .tile-tokens`);

        if (token && targetContainer) {
            // トークンを新しいタイルに移動
            targetContainer.appendChild(token);
        }
    });
}

function updateActionButtons() {
    const player = game.getCurrentPlayer();
    const isHuman = !player.isAI;

    // サイコロは人間プレイヤーかつまだ振っていない時のみ有効
    document.getElementById('btn-dice').disabled = !isHuman || hasRolledThisTurn;
    document.getElementById('btn-buy').disabled = true; // イベント時のみ有効
    document.getElementById('btn-sell').disabled = player.assets.length === 0;
    document.getElementById('btn-cooperate').disabled = !isHuman;
}

// ===================================
// ターン処理
// ===================================

async function startTurn() {
    const player = game.getCurrentPlayer();
    game.phase = 'income';
    hasRolledThisTurn = false;  // 新しいターン開始時にリセット
    updateAllUI();

    if (player.isAI) {
        await processAITurnWithAnimation();
    }
}

async function processAITurnWithAnimation() {
    const actions = game.processAITurn();
    const previousPlayer = game.players[(game.currentPlayerIndex - 1 + game.players.length) % game.players.length];

    for (const action of actions) {
        await sleep(600);

        switch (action.type) {
            case 'income':
                showNotification(`${previousPlayer.name}が収入を受け取った`);
                break;
            case 'purchase':
                if (action.data.success) {
                    showNotification(`🛒 ${previousPlayer.name}: ${action.data.message}`);
                }
                break;
            case 'skip':
                // スキップした場合の通知（省略可能）
                break;
            case 'proactive_purchase':
                if (action.data.success) {
                    showNotification(`💡 ${action.data.message}`);
                }
                break;
            case 'proactive_sell':
                if (action.data.success) {
                    showNotification(`💰 ${action.data.message}`);
                }
                break;
            case 'endTurn':
                updateAllUI();
                break;
        }
    }

    // 次のターン
    if (!game.isGameOver) {
        await sleep(500);
        startTurn();
    } else {
        showGameResult();
    }
}

// ===================================
// アクション
// ===================================

async function rollDice() {
    const player = game.getCurrentPlayer();
    if (player.isAI) return;
    if (hasRolledThisTurn) return;  // 既に振っていたら何もしない

    hasRolledThisTurn = true;  // サイコロを振った
    const diceBtn = document.getElementById('btn-dice');
    diceBtn.disabled = true;

    // サイコロアニメーション
    const diceValue = rollDiceValue();
    showNotification(`🎲 ${diceValue} が出た！`);

    await sleep(500);

    // 収入フェーズ
    game.phase = 'income';
    const income = game.processIncomePhase();
    await animateCashChange(income.income, true);
    updateFinancePanel();

    await sleep(300);

    // 支出フェーズ
    game.phase = 'expense';
    const expense = game.processExpensePhase();
    await animateCashChange(expense.expense, false);
    updateFinancePanel();

    if (expense.isBankrupt) {
        showNotification('⚠️ お金が足りない！仲間に助けを求めよう');
    }

    await sleep(300);

    // プレイヤー移動
    player.position = (player.position + diceValue) % BOARD_TILES.length;
    updatePlayerPositions();

    await sleep(300);

    // イベントフェーズ
    game.phase = 'event';
    const tile = BOARD_TILES[player.position];

    if (['chance', 'trouble', 'learning'].includes(tile.type)) {
        const card = game.drawEventCard(tile.type);
        showEventModal(card);
        // イベントモーダルでの選択後に自動的にターン終了する
    } else {
        // イベントがないマス → 自動的にターン終了
        await sleep(500);
        autoEndTurn();
    }
}

// 自動ターン終了（アクション後に呼ばれる）
async function autoEndTurn() {
    const result = game.endTurn();

    // 脱出チェック
    const prevPlayer = game.players[(game.currentPlayerIndex - 1 + game.players.length) % game.players.length];
    if (prevPlayer.isEscaped && prevPlayer.escapedTurn === game.turn) {
        showNotification(`🎉 ${prevPlayer.name}がラットレースを脱出！`);
        await sleep(1500);
    }

    // セーブ
    game.save();

    if (result.isGameOver) {
        showGameResult();
    } else {
        startTurn();
    }
}

async function animateCashChange(amount, isIncome) {
    const cashEl = document.getElementById('player-cash');
    cashEl.classList.add('coin-pop');
    await sleep(500);
    cashEl.classList.remove('coin-pop');
}

function endTurn() {
    const result = game.endTurn();

    // 脱出チェック
    const prevPlayer = game.players[(game.currentPlayerIndex - 1 + game.players.length) % game.players.length];
    if (prevPlayer.isEscaped && prevPlayer.escapedTurn === game.turn) {
        showNotification(`🎉 ${prevPlayer.name}がラットレースを脱出！`);
    }

    // セーブ
    game.save();

    if (result.isGameOver) {
        showGameResult();
    } else {
        startTurn();
    }
}

// ===================================
// イベントモーダル
// ===================================

function showEventModal(card) {
    const modal = document.getElementById('event-modal');
    const typeEl = document.getElementById('event-type');

    // タイプに応じた表示
    if (card.type === 'chance') {
        typeEl.textContent = '💰 チャンスカード';
        typeEl.className = 'event-type';
    } else if (card.type === 'trouble') {
        typeEl.textContent = '💸 トラブルカード';
        typeEl.className = 'event-type trouble';
    } else {
        typeEl.textContent = '📚 学びカード';
        typeEl.className = 'event-type learning';
    }

    document.getElementById('event-icon').textContent = card.icon;
    document.getElementById('event-name').textContent = card.name;
    document.getElementById('event-description').textContent = card.description;

    // 詳細表示
    const detailsEl = document.getElementById('event-details');
    if (card.cost > 0 || card.monthlyIncome > 0) {
        detailsEl.style.display = 'block';
        document.getElementById('event-cost').textContent = `${card.cost} コイン`;
        document.getElementById('event-income').textContent = card.monthlyIncome > 0 ? `+${card.monthlyIncome} コイン` : '-';
    } else {
        detailsEl.style.display = 'none';
    }

    document.getElementById('event-hint').textContent = `💡「${card.hint}」`;

    // ボタン
    const actionsEl = document.getElementById('event-actions');
    if (card.type === 'chance' && card.cost > 0) {
        actionsEl.innerHTML = `
            <button class="btn btn-primary" onclick="acceptEvent()">🛒 買う</button>
            <button class="btn btn-secondary" onclick="rejectEvent()">❌ やめる</button>
        `;
    } else if (card.type === 'trouble') {
        actionsEl.innerHTML = `
            <button class="btn btn-primary" onclick="acceptEvent()">😢 支払う</button>
        `;
    } else {
        actionsEl.innerHTML = `
            <button class="btn btn-primary" onclick="acceptEvent()">✨ 受け取る</button>
        `;
    }

    modal.classList.add('active');
}

async function acceptEvent() {
    const result = game.processEvent(true);

    if (result) {
        if (result.success) {
            showNotification(result.message);
        } else {
            showNotification(`❌ ${result.message}`);
        }
    }

    closeModal('event-modal');
    updateFinancePanel();
    updatePlayersPanel();

    // イベント処理後に自動的にターン終了
    await sleep(800);
    autoEndTurn();
}

async function rejectEvent() {
    game.processEvent(false);
    closeModal('event-modal');

    // イベントをスキップ後に自動的にターン終了
    await sleep(500);
    autoEndTurn();
}

// ===================================
// ヒントモーダル
// ===================================

function showHint() {
    const player = game.getCurrentPlayer();
    const finance = game.getPlayerFinance(player);

    const playerState = {
        id: player.id,
        cash: player.cash,
        livingExpense: player.livingExpense,
        passiveIncome: player.passiveIncome,
        totalIncome: finance.totalIncome,
        totalExpense: finance.totalExpense,
        escapeProgress: finance.escapeProgress,
        currentEvent: game.currentEvent
    };

    const hints = CoachAI.generateHint(playerState, null, { players: game.players });

    document.getElementById('hint-status').textContent = hints.status;

    const pointsEl = document.getElementById('hint-points');
    pointsEl.innerHTML = hints.points.map(p => `<li>${p}</li>`).join('');

    document.getElementById('hint-question').textContent = `「${hints.question}」`;

    // tipがあれば表示
    const tipEl = document.getElementById('hint-tip');
    if (tipEl && hints.tip) {
        tipEl.textContent = hints.tip;
        tipEl.style.display = 'block';
    } else if (tipEl) {
        tipEl.style.display = 'none';
    }

    document.getElementById('hint-modal').classList.add('active');

    player.hintsUsed++;
}

// ===================================
// 協力モーダル
// ===================================

function showCooperateModal() {
    document.getElementById('cooperate-modal').classList.add('active');
}

function showLoanModal() {
    closeModal('cooperate-modal');
    showNotification('貸し借り機能は次のバージョンで実装予定！');
}

// ===================================
// 売却機能
// ===================================

function showSellModal() {
    const player = game.getCurrentPlayer();
    const assets = player.assets || [];

    const listEl = document.getElementById('sell-assets-list');
    const emptyEl = document.getElementById('sell-empty');

    listEl.innerHTML = '';

    if (assets.length === 0) {
        listEl.style.display = 'none';
        emptyEl.style.display = 'block';
    } else {
        listEl.style.display = 'block';
        emptyEl.style.display = 'none';

        assets.forEach((asset, index) => {
            // 売却価格は購入価格の80%〜120%（市場変動）
            const purchasePrice = asset.purchasePrice || asset.cost || 50;
            const marketFactor = 0.8 + Math.random() * 0.4;
            const sellPrice = Math.floor(purchasePrice * marketFactor);
            const profit = sellPrice - purchasePrice;
            const profitClass = profit >= 0 ? 'positive' : 'negative';

            const item = document.createElement('div');
            item.className = 'sell-asset-item';
            item.innerHTML = `
                <div class="sell-asset-icon">${asset.icon || '📦'}</div>
                <div class="sell-asset-info">
                    <div class="sell-asset-name">${asset.name}</div>
                    <div class="sell-asset-details">月収: +${asset.monthlyIncome}コイン</div>
                </div>
                <div class="sell-asset-price">
                    <div class="sell-asset-value">${sellPrice}コイン</div>
                    <div class="sell-asset-original ${profitClass}">${profit >= 0 ? '+' : ''}${profit}コイン</div>
                </div>
                <button class="sell-btn" onclick="confirmSellAsset(${index}, ${sellPrice})">売る</button>
            `;
            listEl.appendChild(item);
        });
    }

    document.getElementById('sell-modal').classList.add('active');
}

function confirmSellAsset(assetIndex, sellPrice) {
    const player = game.getCurrentPlayer();
    const asset = player.assets[assetIndex];

    if (!asset) return;

    const confirmMsg = `「${asset.name}」を${sellPrice}コインで売りますか？\n（毎月の収入 -${asset.monthlyIncome}コイン）`;

    if (confirm(confirmMsg)) {
        // 売却処理
        player.cash += sellPrice;
        player.passiveIncome -= asset.monthlyIncome;
        player.assets.splice(assetIndex, 1);

        showNotification(`💰 ${asset.name}を${sellPrice}コインで売却！`);
        updateFinancePanel();
        updatePlayersPanel();
        closeModal('sell-modal');

        // 売却後にモーダルを更新（複数売る場合用）
        if (player.assets.length > 0) {
            setTimeout(() => showSellModal(), 300);
        }
    }
}

// ===================================
// 共同購入機能
// ===================================

// 共同購入の状態管理
let jointPurchaseState = {
    type: null,           // 'realEstate', 'business', 'stock'
    selectedPartners: [], // 選択されたパートナーのID
    item: null,           // 購入する投資アイテム
    partnerResponses: {}  // AIの応答 { playerId: 'approved' | 'rejected' }
};

// 共同購入用の投資アイテム
const JOINT_PURCHASE_ITEMS = {
    realEstate: [
        { id: 'JR1', name: '駅前マンション', icon: '🏢', cost: 400, monthlyIncome: 35, minPartners: 2 },
        { id: 'JR2', name: 'オフィスビル', icon: '🏙️', cost: 600, monthlyIncome: 50, minPartners: 2 },
        { id: 'JR3', name: 'ショッピングモール', icon: '🏬', cost: 1000, monthlyIncome: 80, minPartners: 3 }
    ],
    business: [
        { id: 'JB1', name: 'カフェチェーン', icon: '☕', cost: 300, monthlyIncome: 25, minPartners: 2 },
        { id: 'JB2', name: 'フィットネスジム', icon: '🏋️', cost: 400, monthlyIncome: 35, minPartners: 2 },
        { id: 'JB3', name: 'レストランチェーン', icon: '🍽️', cost: 600, monthlyIncome: 50, minPartners: 3 }
    ],
    stock: [
        { id: 'JS1', name: '成長株ファンド', icon: '📈', cost: 200, monthlyIncome: 15, minPartners: 2 },
        { id: 'JS2', name: '配当株ポートフォリオ', icon: '💹', cost: 300, monthlyIncome: 20, minPartners: 2 },
        { id: 'JS3', name: 'ヘッジファンド', icon: '🎯', cost: 500, monthlyIncome: 40, minPartners: 3 }
    ]
};

function showJointPurchaseModal() {
    closeModal('cooperate-modal');

    // 状態リセット
    jointPurchaseState = {
        type: null,
        selectedPartners: [],
        item: null,
        partnerResponses: {}
    };

    // ステップ1を表示
    document.getElementById('joint-step-1').style.display = 'block';
    document.getElementById('joint-step-2').style.display = 'none';
    document.getElementById('joint-step-3').style.display = 'none';

    document.getElementById('joint-purchase-modal').classList.add('active');
}

function selectJointType(type) {
    jointPurchaseState.type = type;

    // 利用可能なアイテムから1つ選ぶ
    const items = JOINT_PURCHASE_ITEMS[type];
    jointPurchaseState.item = items[Math.floor(Math.random() * items.length)];

    // パートナー選択画面を生成
    renderJointPartners();

    // ステップ2へ
    document.getElementById('joint-step-1').style.display = 'none';
    document.getElementById('joint-step-2').style.display = 'block';
}

function renderJointPartners() {
    const currentPlayer = game.getCurrentPlayer();
    const otherPlayers = game.players.filter(p => p.id !== currentPlayer.id);

    const partnersEl = document.getElementById('joint-partners');
    partnersEl.innerHTML = '';

    // アイテム情報を表示
    const item = jointPurchaseState.item;
    const itemInfo = document.createElement('div');
    itemInfo.className = 'joint-item-info';
    itemInfo.innerHTML = `
        <div style="text-align: center; margin-bottom: 16px; padding: 12px; background: var(--surface); border-radius: 8px;">
            <span style="font-size: 2rem;">${item.icon}</span>
            <div style="font-weight: 600;">${item.name}</div>
            <div style="color: var(--text-secondary);">費用: ${item.cost}コイン / 月収: +${item.monthlyIncome}コイン</div>
            <div style="font-size: 0.8rem; color: var(--primary);">最低${item.minPartners}人で購入可能</div>
        </div>
    `;
    partnersEl.appendChild(itemInfo);

    otherPlayers.forEach(player => {
        const isSelected = jointPurchaseState.selectedPartners.includes(player.id);
        const partner = document.createElement('div');
        partner.className = `joint-partner-item ${isSelected ? 'selected' : ''}`;
        partner.onclick = () => togglePartner(player.id);

        const statusText = player.isAI ? 'AI' : 'プレイヤー';
        const cashInfo = `所持: ${player.cash}コイン`;

        partner.innerHTML = `
            <div class="joint-partner-avatar">${player.avatar}</div>
            <div class="joint-partner-info">
                <div class="joint-partner-name">${player.name}</div>
                <div class="joint-partner-status">${statusText} / ${cashInfo}</div>
            </div>
            <div class="joint-partner-checkbox">${isSelected ? '✓' : ''}</div>
        `;
        partnersEl.appendChild(partner);
    });

    // 確認ボタン
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary btn-block';
    confirmBtn.style.marginTop = '12px';
    confirmBtn.textContent = '選択したメンバーで進む';
    confirmBtn.onclick = proceedToJointConfirm;
    partnersEl.appendChild(confirmBtn);
}

function togglePartner(playerId) {
    const index = jointPurchaseState.selectedPartners.indexOf(playerId);
    if (index === -1) {
        jointPurchaseState.selectedPartners.push(playerId);
    } else {
        jointPurchaseState.selectedPartners.splice(index, 1);
    }
    renderJointPartners();
}

function backToJointStep1() {
    document.getElementById('joint-step-1').style.display = 'block';
    document.getElementById('joint-step-2').style.display = 'none';
}

function backToJointStep2() {
    document.getElementById('joint-step-2').style.display = 'block';
    document.getElementById('joint-step-3').style.display = 'none';
}

async function proceedToJointConfirm() {
    const item = jointPurchaseState.item;
    const totalParticipants = jointPurchaseState.selectedPartners.length + 1; // +1 for current player

    if (totalParticipants < item.minPartners) {
        showNotification(`最低${item.minPartners}人必要です！`);
        return;
    }

    // AIの判断を取得
    jointPurchaseState.partnerResponses = {};

    for (const partnerId of jointPurchaseState.selectedPartners) {
        const partner = game.players.find(p => p.id === partnerId);

        if (partner.isAI) {
            // AI判断
            const perPersonCost = Math.ceil(item.cost / totalParticipants);
            const perPersonIncome = Math.floor(item.monthlyIncome / totalParticipants);

            const approved = makeAIJointDecision(partner, {
                cost: perPersonCost,
                monthlyIncome: perPersonIncome,
                totalCost: item.cost,
                participants: totalParticipants
            });

            jointPurchaseState.partnerResponses[partnerId] = approved ? 'approved' : 'rejected';
        } else {
            // 人間プレイヤーは自動承認（実際のマルチプレイでは確認が必要）
            jointPurchaseState.partnerResponses[partnerId] = 'approved';
        }
    }

    // 確認画面を表示
    renderJointSummary();

    document.getElementById('joint-step-2').style.display = 'none';
    document.getElementById('joint-step-3').style.display = 'block';
}

function renderJointSummary() {
    const item = jointPurchaseState.item;
    const currentPlayer = game.getCurrentPlayer();

    // 承認したパートナーだけで計算
    const approvedPartners = jointPurchaseState.selectedPartners.filter(
        id => jointPurchaseState.partnerResponses[id] === 'approved'
    );
    const totalParticipants = approvedPartners.length + 1;

    const perPersonCost = Math.ceil(item.cost / totalParticipants);
    const perPersonIncome = Math.floor(item.monthlyIncome / totalParticipants);

    const summaryEl = document.getElementById('joint-summary');

    // パートナーの承認状況を表示
    let partnerStatusHtml = '';
    jointPurchaseState.selectedPartners.forEach(partnerId => {
        const partner = game.players.find(p => p.id === partnerId);
        const status = jointPurchaseState.partnerResponses[partnerId];
        const statusClass = status === 'approved' ? 'approved' : 'rejected';
        const statusText = status === 'approved' ? '✓ 参加' : '✗ 不参加';
        partnerStatusHtml += `
            <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                <span>${partner.avatar}</span>
                <span>${partner.name}</span>
                <span class="joint-partner-status ${statusClass}">${statusText}</span>
            </div>
        `;
    });

    const canPurchase = totalParticipants >= item.minPartners && currentPlayer.cash >= perPersonCost;

    summaryEl.innerHTML = `
        <div style="text-align: center; margin-bottom: 12px;">
            <span style="font-size: 2.5rem;">${item.icon}</span>
            <h4 style="margin: 8px 0;">${item.name}</h4>
        </div>

        <div style="margin-bottom: 12px;">
            <strong>参加メンバー:</strong>
            <div style="padding: 8px 0;">
                <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
                    <span>${currentPlayer.avatar}</span>
                    <span>${currentPlayer.name}</span>
                    <span class="joint-partner-status approved">✓ あなた</span>
                </div>
                ${partnerStatusHtml}
            </div>
        </div>

        <div class="joint-summary-row">
            <span class="joint-summary-label">総額</span>
            <span class="joint-summary-value">${item.cost}コイン</span>
        </div>
        <div class="joint-summary-row">
            <span class="joint-summary-label">参加人数</span>
            <span class="joint-summary-value">${totalParticipants}人</span>
        </div>
        <div class="joint-summary-row">
            <span class="joint-summary-label">あなたの負担額</span>
            <span class="joint-summary-value">${perPersonCost}コイン</span>
        </div>
        <div class="joint-summary-row">
            <span class="joint-summary-label">あなたの月収</span>
            <span class="joint-summary-value positive">+${perPersonIncome}コイン</span>
        </div>

        ${!canPurchase ? `
            <div style="color: var(--danger); text-align: center; margin-top: 12px; padding: 8px; background: rgba(231, 76, 60, 0.1); border-radius: 4px;">
                ${totalParticipants < item.minPartners ? '参加者が足りません' : 'お金が足りません'}
            </div>
        ` : ''}
    `;

    // 購入ボタンの有効/無効
    const confirmBtn = document.querySelector('#joint-step-3 .btn-primary');
    if (confirmBtn) {
        confirmBtn.disabled = !canPurchase;
    }
}

function confirmJointPurchase() {
    const item = jointPurchaseState.item;
    const currentPlayer = game.getCurrentPlayer();

    // 承認したパートナーのみ
    const approvedPartners = jointPurchaseState.selectedPartners.filter(
        id => jointPurchaseState.partnerResponses[id] === 'approved'
    );
    const totalParticipants = approvedPartners.length + 1;

    if (totalParticipants < item.minPartners) {
        showNotification('参加者が足りません！');
        return;
    }

    const perPersonCost = Math.ceil(item.cost / totalParticipants);
    const perPersonIncome = Math.floor(item.monthlyIncome / totalParticipants);

    if (currentPlayer.cash < perPersonCost) {
        showNotification('お金が足りません！');
        return;
    }

    // 各参加者から費用を徴収し、資産を追加
    // 現在のプレイヤー
    currentPlayer.cash -= perPersonCost;
    currentPlayer.passiveIncome += perPersonIncome;
    currentPlayer.assets.push({
        id: item.id + '_shared',
        name: item.name + '(共同)',
        icon: item.icon,
        cost: perPersonCost,
        monthlyIncome: perPersonIncome,
        isShared: true,
        sharePartners: approvedPartners
    });

    // パートナー
    approvedPartners.forEach(partnerId => {
        const partner = game.players.find(p => p.id === partnerId);
        partner.cash -= perPersonCost;
        partner.passiveIncome += perPersonIncome;
        partner.assets.push({
            id: item.id + '_shared',
            name: item.name + '(共同)',
            icon: item.icon,
            cost: perPersonCost,
            monthlyIncome: perPersonIncome,
            isShared: true
        });
    });

    // 協力カウントを増加
    game.cooperationCount++;
    currentPlayer.cooperationCount = (currentPlayer.cooperationCount || 0) + 1;

    showNotification(`🎉 ${item.name}を共同購入！月収+${perPersonIncome}コイン`);
    updateFinancePanel();
    updatePlayersPanel();
    closeModal('joint-purchase-modal');
}

// AI共同購入判断
function makeAIJointDecision(aiPlayer, options) {
    const { personality, riskTolerance, cooperationRate } = aiPlayer;
    const { cost, monthlyIncome, totalCost, participants } = options;

    // 現金の余裕
    const affordability = aiPlayer.cash / cost;

    // ROI計算
    const roi = monthlyIncome > 0 ? monthlyIncome / cost : 0;

    // 基本的な協力確率
    let approvalChance = cooperationRate;

    // お金が十分にあるか
    if (affordability < 1.5) {
        approvalChance *= 0.3; // お金が足りないと協力しにくい
    } else if (affordability > 3) {
        approvalChance *= 1.2; // 余裕があると協力しやすい
    }

    // ROIが良いか
    if (roi > 0.08) {
        approvalChance *= 1.3; // 高利回りなら参加しやすい
    } else if (roi < 0.05) {
        approvalChance *= 0.7; // 低利回りなら参加しにくい
    }

    // 性格による補正
    if (personality === 'conservative') {
        approvalChance *= 0.8;
    } else if (personality === 'aggressive') {
        approvalChance *= 1.2;
    }

    // 最終判断
    return Math.random() < Math.min(approvalChance, 0.95);
}

function showBuyModal() {
    showNotification('購入はイベントカードから行えます');
}

function showGlossary() {
    const terms = CoachAI.getAllGlossaryTerms();
    let content = '📖 用語辞典\n\n';

    terms.forEach(term => {
        const item = CoachAI.getGlossaryItem(term);
        content += `【${term}】（${item.reading}）\n${item.simple}\n\n`;
    });

    alert(content);
}

// ===================================
// モーダル共通
// ===================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showMenu() {
    const choice = confirm('ゲームを保存して終了しますか？');
    if (choice) {
        game.save();
        showScreen('title-screen');
    }
}

// ===================================
// 通知
// ===================================

function showNotification(message) {
    // シンプルなコンソール出力（将来的にトースト通知に）
    console.log('[通知]', message);

    // 一時的なアラート表示
    const notificationArea = document.createElement('div');
    notificationArea.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    notificationArea.textContent = message;
    document.body.appendChild(notificationArea);

    setTimeout(() => {
        notificationArea.remove();
    }, 2000);
}

// ===================================
// ゲーム結果
// ===================================

function showGameResult() {
    const result = game.getGameResult();

    document.getElementById('result-turns').textContent = `${result.turns}ターン`;
    document.getElementById('result-cooperation').textContent = `${result.cooperationCount}回`;
    document.getElementById('result-bankruptcy').textContent = result.bankruptcyCount === 0 ? '0人 🏆' : `${result.bankruptcyCount}人`;

    document.getElementById('mvp-avatar').textContent = result.mvp.avatar;
    document.getElementById('mvp-name').textContent = result.mvp.name;

    const learningsEl = document.getElementById('result-learnings-list');
    learningsEl.innerHTML = result.learnings.map(l => `<li>${l}</li>`).join('');

    showScreen('result-screen');
}

// ===================================
// 初期化
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 マネーアドベンチャー 起動！');

    // 初期AIキャラクタープレビュー表示
    updateAICharactersPreview();

    // モーダル外クリックで閉じる
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});
