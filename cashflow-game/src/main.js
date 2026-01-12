// ===================================
// マネーアドベンチャー - メインスクリプト
// ===================================

// ゲームインスタンス
let game = null;

// 設定状態
let selectedAvatar = '🐱';
let selectedMode = 'easy';
let selectedJob = null;
let shuffledJobCards = [];

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
// セットアップ画面
// ===================================

function selectAvatar(btn) {
    document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedAvatar = btn.dataset.avatar;
}

function selectDifficulty(btn) {
    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMode = btn.dataset.mode;
}

// ===================================
// 職業選択
// ===================================

function goToJobSelection() {
    showScreen('job-selection-screen');
    initJobCards();
}

function backToSetup() {
    selectedJob = null;
    showScreen('setup-screen');
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
    if (selectedJob) return;

    selectedJob = job;

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
    if (!selectedJob) {
        alert('職業カードを選んでね！');
        return;
    }

    // ゲームを開始
    startGameWithJob();
}

function startGameWithJob() {
    const playerName = document.getElementById('player-name').value.trim() || 'プレイヤー';
    const aiCount = parseInt(document.getElementById('ai-count').value);
    const aiLevel = parseInt(document.getElementById('ai-level').value);

    game = new Game();
    game.initialize({
        playerName: playerName,
        avatar: selectedAvatar,
        mode: selectedMode,
        aiCount: aiCount,
        aiLevel: aiLevel,
        job: selectedJob // 選択した職業を渡す
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
    const aiLevel = parseInt(document.getElementById('ai-level').value);

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
        tileEl.innerHTML = tile.icon;
        tileEl.title = tile.name;
        board.appendChild(tileEl);
    });

    // プレイヤートークンを配置
    game.players.forEach((player, index) => {
        const token = document.createElement('div');
        token.className = 'player-token';
        token.id = `token-${player.id}`;
        token.innerHTML = player.avatar;
        token.style.transform = `translate(${index * 5}px, ${index * 5}px)`;
        board.appendChild(token);
    });

    updatePlayerPositions();
}

function renderPlayersPanel() {
    const list = document.getElementById('players-list');
    list.innerHTML = '';

    game.players.forEach(player => {
        const finance = game.getPlayerFinance(player);
        const card = document.createElement('div');
        card.className = 'player-card';
        card.id = `player-card-${player.id}`;

        card.innerHTML = `
            <div class="player-avatar">${player.avatar}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-progress">
                <div class="player-progress-fill" style="width: ${finance.escapeProgress}%"></div>
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
            const progressFill = card.querySelector('.player-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${finance.escapeProgress}%`;
            }
        }
    });
}

function updatePlayerPositions() {
    game.players.forEach(player => {
        const token = document.getElementById(`token-${player.id}`);
        const tileIndex = player.position % BOARD_TILES.length;
        const tile = document.querySelector(`.board-tile[data-index="${tileIndex}"]`);

        if (token && tile) {
            const tileRect = tile.getBoundingClientRect();
            const boardRect = document.getElementById('game-board').getBoundingClientRect();

            token.style.left = `${tile.offsetLeft + 10}px`;
            token.style.top = `${tile.offsetTop + 10}px`;
        }
    });
}

function updateActionButtons() {
    const player = game.getCurrentPlayer();
    const isHuman = !player.isAI;

    document.getElementById('btn-dice').disabled = !isHuman;
    document.getElementById('btn-buy').disabled = true; // イベント時のみ有効
    document.getElementById('btn-sell').disabled = player.assets.length === 0;
    document.getElementById('btn-cooperate').disabled = !isHuman;
    document.getElementById('btn-end-turn').disabled = !isHuman;
}

// ===================================
// ターン処理
// ===================================

async function startTurn() {
    const player = game.getCurrentPlayer();
    game.phase = 'income';
    updateAllUI();

    if (player.isAI) {
        await processAITurnWithAnimation();
    }
}

async function processAITurnWithAnimation() {
    const actions = game.processAITurn();

    for (const action of actions) {
        await sleep(800);

        switch (action.type) {
            case 'income':
                showNotification(`${game.players[game.currentPlayerIndex === 0 ? game.players.length - 1 : game.currentPlayerIndex - 1].name}が収入を受け取った`);
                break;
            case 'purchase':
                if (action.data.success) {
                    showNotification(action.data.message);
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
    } else {
        // 協力マスなど
        game.phase = 'action';
        updateActionButtons();
        updateTurnInfo();
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

function acceptEvent() {
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

    game.phase = 'action';
    updateActionButtons();
    updateTurnInfo();
}

function rejectEvent() {
    game.processEvent(false);
    closeModal('event-modal');

    game.phase = 'action';
    updateActionButtons();
    updateTurnInfo();
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

function showJointPurchaseModal() {
    closeModal('cooperate-modal');
    showNotification('共同購入機能は次のバージョンで実装予定！');
}

function showSellModal() {
    showNotification('売却機能は次のバージョンで実装予定！');
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

    // モーダル外クリックで閉じる
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});
