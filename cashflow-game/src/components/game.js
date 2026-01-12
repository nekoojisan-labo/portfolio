// ===================================
// マネーアドベンチャー - ゲームロジック
// ===================================

/**
 * ゲーム管理クラス
 */
class Game {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.turn = 1;
        this.phase = 'income';
        this.mode = 'easy';
        this.isGameOver = false;
        this.cooperationCount = 0;
        this.currentEvent = null;
        this.effects = []; // 一時的な効果
    }

    /**
     * ゲームの初期化
     */
    initialize(settings) {
        this.mode = settings.mode || 'easy';
        this.players = [];

        // 人間プレイヤーを追加
        const initialSettings = INITIAL_SETTINGS[this.mode];

        // 職業が選択されている場合、職業のパラメータを使用
        let humanPlayerSettings = { ...initialSettings };
        let humanPlayerJob = null;

        if (settings.job) {
            humanPlayerJob = settings.job;
            humanPlayerSettings = {
                startingCash: settings.job.startingCash,
                salary: settings.job.salary,
                livingExpense: settings.job.livingExpense,
                escapeCondition: initialSettings.escapeCondition
            };
        }

        this.players.push(this.createPlayer({
            id: 'player_human',
            name: settings.playerName,
            avatar: settings.avatar,
            isAI: false,
            job: humanPlayerJob,
            ...humanPlayerSettings
        }));

        // AIプレイヤーを追加
        const aiCount = settings.aiCount || 3;
        const aiLevel = settings.aiLevel || 2;

        // AIにもランダムな職業を割り当て
        const availableJobs = typeof JOB_CARDS !== 'undefined' ? [...JOB_CARDS] : [];
        const shuffledJobs = this.shuffleArray(availableJobs);

        for (let i = 0; i < aiCount; i++) {
            const aiConfig = AI_PLAYERS[Math.min(aiLevel - 1, AI_PLAYERS.length - 1)];

            // AIにもランダムに職業を割り当て
            let aiPlayerSettings = { ...initialSettings };
            let aiJob = null;

            if (shuffledJobs.length > i) {
                aiJob = shuffledJobs[i];
                aiPlayerSettings = {
                    startingCash: aiJob.startingCash,
                    salary: aiJob.salary,
                    livingExpense: aiJob.livingExpense,
                    escapeCondition: initialSettings.escapeCondition
                };
            }

            this.players.push(this.createPlayer({
                id: `player_ai_${i}`,
                name: aiConfig.name,
                avatar: aiConfig.avatar,
                isAI: true,
                aiLevel: aiLevel,
                personality: aiConfig.personality,
                riskTolerance: aiConfig.riskTolerance,
                cooperationRate: aiConfig.cooperationRate,
                job: aiJob,
                ...aiPlayerSettings
            }));
        }

        this.currentPlayerIndex = 0;
        this.turn = 1;
        this.phase = 'income';
        this.isGameOver = false;

        return this;
    }

    /**
     * 配列のシャッフル
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    /**
     * プレイヤーオブジェクトの作成
     */
    createPlayer(config) {
        return {
            id: config.id,
            name: config.name,
            avatar: config.avatar,
            isAI: config.isAI || false,
            aiLevel: config.aiLevel || 0,
            personality: config.personality || 'balanced',
            riskTolerance: config.riskTolerance || 0.5,
            cooperationRate: config.cooperationRate || 0.7,

            // 職業情報
            job: config.job || null,

            // 財務状態
            cash: config.startingCash,
            salary: config.salary,
            passiveIncome: 0,
            livingExpense: config.livingExpense,
            loanPayment: 0,

            // 資産・負債
            assets: [],
            liabilities: [],

            // スキル
            skills: [],

            // 状態
            position: 0,
            isEscaped: false,
            escapedTurn: null,
            isBankrupt: false,

            // 統計
            investmentCount: 0,
            cooperationCount: 0,
            hintsUsed: 0
        };
    }

    /**
     * 現在のプレイヤーを取得
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * 計算済みの財務情報を取得
     */
    getPlayerFinance(player) {
        const totalIncome = player.salary + player.passiveIncome;
        const totalExpense = player.livingExpense + player.loanPayment;
        const monthlyCashflow = totalIncome - totalExpense;
        const escapeProgress = calculateEscapeProgress(player.passiveIncome, player.livingExpense);

        return {
            totalIncome,
            totalExpense,
            monthlyCashflow,
            escapeProgress
        };
    }

    /**
     * 収入フェーズの処理
     */
    processIncomePhase() {
        const player = this.getCurrentPlayer();
        const finance = this.getPlayerFinance(player);

        // 収入を加算
        player.cash += finance.totalIncome;

        return {
            income: finance.totalIncome,
            salary: player.salary,
            passiveIncome: player.passiveIncome
        };
    }

    /**
     * 支出フェーズの処理
     */
    processExpensePhase() {
        const player = this.getCurrentPlayer();
        const finance = this.getPlayerFinance(player);

        // 支出を減算
        player.cash -= finance.totalExpense;

        // 破綻チェック
        if (player.cash < 0) {
            return {
                expense: finance.totalExpense,
                isBankrupt: true,
                deficit: Math.abs(player.cash)
            };
        }

        return {
            expense: finance.totalExpense,
            isBankrupt: false
        };
    }

    /**
     * イベントカードを引く
     */
    drawEventCard(tileType) {
        const player = this.getCurrentPlayer();
        let cards;

        switch (tileType) {
            case 'chance':
                cards = CHANCE_CARDS;
                break;
            case 'trouble':
                cards = TROUBLE_CARDS;
                break;
            case 'learning':
                cards = LEARNING_CARDS;
                break;
            default:
                cards = [...CHANCE_CARDS, ...TROUBLE_CARDS, ...LEARNING_CARDS];
        }

        // 重み付け選択
        const playerState = {
            cash: player.cash,
            livingExpense: player.livingExpense,
            assets: player.assets,
            escapeProgress: this.getPlayerFinance(player).escapeProgress
        };

        this.currentEvent = selectWeightedCard(cards, playerState);
        return this.currentEvent;
    }

    /**
     * イベントの処理（購入など）
     */
    processEvent(accept) {
        const player = this.getCurrentPlayer();
        const event = this.currentEvent;

        if (!event) return null;

        let result = {
            accepted: accept,
            event: event,
            cashChange: 0,
            incomeChange: 0,
            expenseChange: 0
        };

        if (accept) {
            switch (event.type) {
                case 'chance':
                    result = this.processChanceCard(player, event);
                    break;
                case 'trouble':
                    result = this.processTroubleCard(player, event);
                    break;
                case 'learning':
                    result = this.processLearningCard(player, event);
                    break;
            }
        }

        this.currentEvent = null;
        return result;
    }

    /**
     * チャンスカードの処理
     */
    processChanceCard(player, card) {
        // 割引効果があるかチェック
        let cost = card.cost;
        const discountEffect = this.effects.find(e => e.type === 'purchaseDiscount' && e.playerId === player.id);
        if (discountEffect) {
            cost = Math.floor(cost * (1 - discountEffect.value));
            this.effects = this.effects.filter(e => e !== discountEffect);
        }

        // お金が足りるかチェック
        if (player.cash < cost) {
            return {
                success: false,
                message: 'お金が足りない！',
                cashChange: 0
            };
        }

        // 購入処理
        player.cash -= cost;

        if (card.monthlyIncome > 0) {
            player.passiveIncome += card.monthlyIncome;
            player.assets.push({
                id: generateUUID(),
                cardId: card.id,
                name: card.name,
                purchasePrice: cost,
                monthlyIncome: card.monthlyIncome,
                purchasedTurn: this.turn
            });
            player.investmentCount++;
        }

        // 特殊効果
        if (card.effect) {
            this.applyEffect(player, card);
        }

        return {
            success: true,
            message: `${card.name}を購入！毎月+${card.monthlyIncome}コイン`,
            cashChange: -cost,
            incomeChange: card.monthlyIncome
        };
    }

    /**
     * トラブルカードの処理
     */
    processTroubleCard(player, card) {
        // 割引効果があるかチェック
        let cost = card.cost;
        const discountEffect = this.effects.find(e => e.type === 'troubleDiscount' && e.playerId === player.id);
        if (discountEffect) {
            cost = Math.floor(cost * (1 - discountEffect.value));
            this.effects = this.effects.filter(e => e !== discountEffect);
        }

        player.cash -= cost;

        // 特殊効果の処理
        if (card.effect === 'skipIncome' && player.assets.length > 0) {
            // 一時的に不労所得を減らす効果を適用
            const asset = player.assets[0];
            this.effects.push({
                type: 'skipIncome',
                playerId: player.id,
                value: asset.monthlyIncome,
                duration: 1
            });
        }

        return {
            success: true,
            message: `${card.name}で${cost}コイン支払い`,
            cashChange: -cost,
            incomeChange: 0
        };
    }

    /**
     * 学びカードの処理
     */
    processLearningCard(player, card) {
        let result = {
            success: true,
            message: card.name,
            cashChange: 0,
            incomeChange: 0
        };

        switch (card.effect) {
            case 'reduceExpense':
                player.livingExpense -= card.effectValue;
                result.message = `支出が${card.effectValue}コイン減った！`;
                result.expenseChange = -card.effectValue;
                break;

            case 'purchaseDiscount':
                this.effects.push({
                    type: 'purchaseDiscount',
                    playerId: player.id,
                    value: card.effectValue,
                    duration: 1
                });
                result.message = '次の購入が10%オフ！';
                break;

            case 'troubleDiscount':
                this.effects.push({
                    type: 'troubleDiscount',
                    playerId: player.id,
                    value: card.effectValue,
                    duration: 1
                });
                result.message = '次のトラブルが30%オフ！';
                break;

            case 'skill':
                if (!player.skills.includes(card.skillType)) {
                    player.skills.push(card.skillType);
                    result.message = `${card.name}スキルを習得！`;
                }
                break;

            case 'escapeBoost':
                // 脱出進捗を直接増加（不労所得を増やす）
                const boost = Math.floor(player.livingExpense * (card.effectValue / 100));
                player.passiveIncome += boost;
                result.message = `大きな気づき！不労所得+${boost}コイン`;
                result.incomeChange = boost;
                break;

            case 'cooperationReward':
                // 全員にボーナス
                this.players.forEach(p => {
                    p.cash += card.effectValue;
                });
                result.message = `協力ボーナス！全員に+${card.effectValue}コイン`;
                break;
        }

        return result;
    }

    /**
     * 効果の適用
     */
    applyEffect(player, card) {
        if (card.effect === 'nextDiscount') {
            this.effects.push({
                type: 'purchaseDiscount',
                playerId: player.id,
                value: card.effectValue,
                duration: 1
            });
        } else if (card.effect === 'cooperationBonus') {
            this.effects.push({
                type: 'cooperationBonus',
                playerId: player.id,
                value: card.effectValue,
                duration: 1
            });
        }
    }

    /**
     * 貸付取引の処理
     */
    processLoan(lenderId, borrowerId, amount, terms) {
        const lender = this.players.find(p => p.id === lenderId);
        const borrower = this.players.find(p => p.id === borrowerId);

        if (!lender || !borrower) return { success: false, message: 'プレイヤーが見つかりません' };
        if (lender.cash < amount) return { success: false, message: '貸すお金が足りません' };

        // 貸し借りの処理
        lender.cash -= amount;
        borrower.cash += amount;

        // ローンを追加
        const monthlyPayment = Math.ceil(amount / terms);
        borrower.liabilities.push({
            id: generateUUID(),
            type: 'playerLoan',
            lenderId: lenderId,
            originalAmount: amount,
            remainingAmount: amount,
            monthlyPayment: monthlyPayment,
            remainingTerms: terms
        });

        borrower.loanPayment += monthlyPayment;

        // 協力カウント
        this.cooperationCount++;
        lender.cooperationCount++;
        borrower.cooperationCount++;

        // 協力ボーナスの確認
        const bonusEffect = this.effects.find(e => e.type === 'cooperationBonus');
        if (bonusEffect) {
            lender.cash += bonusEffect.value;
            borrower.cash += bonusEffect.value;
            this.effects = this.effects.filter(e => e !== bonusEffect);
        }

        return {
            success: true,
            message: `${lender.name}が${borrower.name}に${amount}コイン貸した！`
        };
    }

    /**
     * 共同購入の処理
     */
    processJointPurchase(participantIds, card, contributions) {
        const participants = participantIds.map(id => this.players.find(p => p.id === id)).filter(p => p);

        // 全員のお金が足りるかチェック
        for (const participant of participants) {
            const contribution = contributions[participant.id] || 0;
            if (participant.cash < contribution) {
                return {
                    success: false,
                    message: `${participant.name}のお金が足りません`
                };
            }
        }

        // 購入処理
        const totalContribution = Object.values(contributions).reduce((sum, v) => sum + v, 0);
        if (totalContribution < card.cost) {
            return { success: false, message: '合計金額が足りません' };
        }

        for (const participant of participants) {
            const contribution = contributions[participant.id] || 0;
            const ratio = contribution / card.cost;
            const monthlyShare = Math.floor(card.monthlyIncome * ratio);

            participant.cash -= contribution;
            participant.passiveIncome += monthlyShare;

            participant.assets.push({
                id: generateUUID(),
                cardId: card.id,
                name: card.name + '（共同）',
                purchasePrice: contribution,
                monthlyIncome: monthlyShare,
                purchasedTurn: this.turn,
                isShared: true,
                shareRatio: ratio,
                sharedWith: participantIds.filter(id => id !== participant.id)
            });

            participant.investmentCount++;
            participant.cooperationCount++;
        }

        this.cooperationCount++;

        return {
            success: true,
            message: `${card.name}を共同購入！`
        };
    }

    /**
     * 脱出条件のチェック
     */
    checkEscapeCondition(player) {
        const settings = INITIAL_SETTINGS[this.mode];
        return settings.escapeCondition(player);
    }

    /**
     * ターン終了処理
     */
    endTurn() {
        const player = this.getCurrentPlayer();

        // 脱出チェック
        if (!player.isEscaped && this.checkEscapeCondition(player)) {
            player.isEscaped = true;
            player.escapedTurn = this.turn;
        }

        // 一時効果の期間減少
        this.effects = this.effects.filter(effect => {
            if (effect.playerId === player.id && effect.duration > 0) {
                effect.duration--;
                return effect.duration > 0;
            }
            return true;
        });

        // ローン返済処理
        for (const loan of player.liabilities) {
            if (loan.type === 'playerLoan' && loan.remainingTerms > 0) {
                const lender = this.players.find(p => p.id === loan.lenderId);
                if (lender) {
                    lender.cash += loan.monthlyPayment;
                }
                loan.remainingAmount -= loan.monthlyPayment;
                loan.remainingTerms--;

                if (loan.remainingTerms === 0) {
                    player.loanPayment -= loan.monthlyPayment;
                }
            }
        }

        // 完済したローンを削除
        player.liabilities = player.liabilities.filter(l => l.remainingTerms > 0);

        // 次のプレイヤーへ
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        // 全員終わったらターン加算
        if (this.currentPlayerIndex === 0) {
            this.turn++;
        }

        // ゲーム終了チェック
        if (this.players.every(p => p.isEscaped)) {
            this.isGameOver = true;
        }

        return {
            nextPlayer: this.getCurrentPlayer(),
            turn: this.turn,
            isGameOver: this.isGameOver
        };
    }

    /**
     * AIの行動を決定
     */
    processAITurn() {
        const player = this.getCurrentPlayer();
        if (!player.isAI) return null;

        const actions = [];

        // 収入フェーズ
        const income = this.processIncomePhase();
        actions.push({ type: 'income', data: income });

        // 支出フェーズ
        const expense = this.processExpensePhase();
        actions.push({ type: 'expense', data: expense });

        // イベントカード
        const tileType = BOARD_TILES[player.position % BOARD_TILES.length].type;
        if (['chance', 'trouble', 'learning'].includes(tileType)) {
            const card = this.drawEventCard(tileType);
            actions.push({ type: 'draw', data: card });

            // AI判断
            if (card.type === 'chance' && card.cost > 0) {
                const shouldBuy = makeAIDecision(player, 'purchase', {
                    cost: card.cost,
                    monthlyIncome: card.monthlyIncome
                });

                if (shouldBuy && player.cash >= card.cost) {
                    const result = this.processEvent(true);
                    actions.push({ type: 'purchase', data: result });
                } else {
                    this.processEvent(false);
                    actions.push({ type: 'skip', data: { card } });
                }
            } else if (card.type === 'trouble') {
                const result = this.processEvent(true);
                actions.push({ type: 'trouble', data: result });
            } else if (card.type === 'learning') {
                const result = this.processEvent(true);
                actions.push({ type: 'learning', data: result });
            }
        }

        // ターン終了
        const turnResult = this.endTurn();
        actions.push({ type: 'endTurn', data: turnResult });

        return actions;
    }

    /**
     * ゲーム結果の取得
     */
    getGameResult() {
        // MVPを決定（協力回数が最も多い人）
        const mvp = this.players.reduce((max, p) =>
            p.cooperationCount > max.cooperationCount ? p : max
        , this.players[0]);

        return {
            turns: this.turn,
            cooperationCount: this.cooperationCount,
            bankruptcyCount: this.players.filter(p => p.isBankrupt).length,
            mvp: mvp,
            players: this.players.map(p => ({
                name: p.name,
                avatar: p.avatar,
                escapedTurn: p.escapedTurn,
                cooperationCount: p.cooperationCount,
                finalCash: p.cash,
                finalPassiveIncome: p.passiveIncome
            })),
            learnings: [
                '小さく始めて、だんだん大きくする',
                '困ったときは仲間に頼ってもいい',
                '失敗しても、やり直せる'
            ]
        };
    }

    /**
     * ゲーム状態の保存
     */
    save() {
        const saveData = {
            version: '1.0.0',
            savedAt: new Date().toISOString(),
            mode: this.mode,
            turn: this.turn,
            phase: this.phase,
            currentPlayerIndex: this.currentPlayerIndex,
            players: this.players,
            effects: this.effects,
            cooperationCount: this.cooperationCount
        };

        return saveToStorage('moneyAdventure_save', saveData);
    }

    /**
     * ゲーム状態の読み込み
     */
    load() {
        const saveData = loadFromStorage('moneyAdventure_save');
        if (!saveData) return false;

        this.mode = saveData.mode;
        this.turn = saveData.turn;
        this.phase = saveData.phase;
        this.currentPlayerIndex = saveData.currentPlayerIndex;
        this.players = saveData.players;
        this.effects = saveData.effects || [];
        this.cooperationCount = saveData.cooperationCount || 0;

        return true;
    }
}

// グローバルに公開
window.Game = Game;
