// ===================================
// マネーアドベンチャー - ヘルパー関数
// ===================================

/**
 * 配列からランダムに要素を取得
 */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * 指定範囲の乱数を生成
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * サイコロを振る（1-6）
 */
function rollDiceValue() {
    return getRandomInt(1, 6);
}

/**
 * 数値をカンマ区切りでフォーマット
 */
function formatNumber(num) {
    return num.toLocaleString('ja-JP');
}

/**
 * コインの表示フォーマット
 */
function formatCoin(num, showSign = false) {
    const sign = showSign && num > 0 ? '+' : '';
    return `${sign}${formatNumber(num)}`;
}

/**
 * パーセンテージの計算
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.min(100, Math.round((value / total) * 100));
}

/**
 * 脱出進捗の計算
 */
function calculateEscapeProgress(passiveIncome, livingExpense) {
    if (livingExpense === 0) return 100;
    return calculatePercentage(passiveIncome, livingExpense);
}

/**
 * ローカルストレージへの保存
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Save failed:', e);
        return false;
    }
}

/**
 * ローカルストレージからの読み込み
 */
function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Load failed:', e);
        return null;
    }
}

/**
 * ローカルストレージから削除
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('Remove failed:', e);
        return false;
    }
}

/**
 * ルームコードの生成
 */
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * UUIDの生成
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 待機（ミリ秒）
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * アニメーションクラスの追加と削除
 */
async function animateElement(element, animationClass, duration = 500) {
    element.classList.add(animationClass);
    await sleep(duration);
    element.classList.remove(animationClass);
}

/**
 * 要素のフェードイン
 */
function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';

    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.min(progress / duration, 1);
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

/**
 * 要素のフェードアウト
 */
function fadeOut(element, duration = 300) {
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = 1 - Math.min(progress / duration, 1);
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    requestAnimationFrame(animate);
}

/**
 * プレイヤー状態の重み付けに基づくカード選択
 */
function selectWeightedCard(cards, playerState) {
    // 基本の重みを設定
    const weightedCards = cards.map(card => {
        let weight = 1.0;

        // 現金が少ない場合
        if (playerState.cash < playerState.livingExpense * 2) {
            if (card.cost && card.cost <= playerState.cash * 0.5) {
                weight *= 1.5; // 買える範囲のカードを優先
            }
            if (card.cost && card.cost > playerState.cash) {
                weight *= 0.3; // 買えないカードは減らす
            }
        }

        // 投資経験が少ない場合
        if (playerState.assets && playerState.assets.length < 2) {
            if (card.category === 'realEstate' || card.category === 'stock') {
                if (card.cost && card.cost <= 100) {
                    weight *= 1.5; // 小さな投資チャンスを増やす
                }
            }
        }

        // 脱出間近の場合
        if (playerState.escapeProgress > 70) {
            if (card.type === 'trouble') {
                weight *= 1.3; // 最後の試練
            }
        }

        return { card, weight };
    });

    // 重み付き抽選
    const totalWeight = weightedCards.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weightedCards) {
        random -= item.weight;
        if (random <= 0) {
            return item.card;
        }
    }

    return weightedCards[weightedCards.length - 1].card;
}

/**
 * AI の意思決定（改良版）
 * 性格や状況に応じてより現実的な判断を行う
 */
function makeAIDecision(aiPlayer, situation, options) {
    const { personality, riskTolerance, cooperationRate } = aiPlayer;

    switch (situation) {
        case 'purchase':
            return makeAIPurchaseDecision(aiPlayer, options);

        case 'cooperation':
            // 協力判断（性格による補正）
            let coopChance = cooperationRate;
            if (personality === 'aggressive') coopChance *= 0.8;
            if (personality === 'conservative') coopChance *= 1.1;
            return Math.random() < coopChance;

        case 'loan':
            // 貸し借り判断
            if (options.type === 'lend') {
                // 貸す場合：生活費2ヶ月分以上の余裕があれば
                const hasExcess = aiPlayer.cash > aiPlayer.livingExpense * 2;
                const personalityFactor = personality === 'conservative' ? 0.6 :
                                         personality === 'balanced' ? 0.8 : 0.9;
                return hasExcess && Math.random() < personalityFactor;
            } else {
                // 借りる場合：ピンチの時
                return aiPlayer.cash < aiPlayer.livingExpense * 1.5;
            }

        case 'sell':
            return makeAISellDecision(aiPlayer, options);

        default:
            return Math.random() < riskTolerance;
    }
}

/**
 * AI の購入判断（詳細版）
 */
function makeAIPurchaseDecision(aiPlayer, options) {
    const { personality, riskTolerance, cash, livingExpense, passiveIncome } = aiPlayer;
    const { cost, monthlyIncome } = options;

    // 基本チェック：買えないなら買わない
    if (cash < cost) return false;

    // 購入後に残る現金
    const remainingCash = cash - cost;
    // 月利回り（年率換算で考える）
    const monthlyROI = monthlyIncome / cost;
    const annualROI = monthlyROI * 12;
    // 回収期間（月数）
    const paybackPeriod = cost / monthlyIncome;
    // 脱出進捗への貢献度
    const escapeContribution = monthlyIncome / livingExpense;

    // 基本購入確率を計算
    let purchaseChance = 0;

    // 性格別の基本判断ロジック
    if (personality === 'conservative') {
        // 堅実型：安全マージンを確保しつつ投資
        // 生活費1.5ヶ月分以上残せるなら検討
        if (remainingCash >= livingExpense * 1.5) {
            purchaseChance = 0.5;
            // 良い利回りならボーナス
            if (annualROI >= 0.08) purchaseChance += 0.2;
            if (annualROI >= 0.10) purchaseChance += 0.15;
            // 回収期間が短いならボーナス
            if (paybackPeriod <= 24) purchaseChance += 0.1;
        } else if (remainingCash >= livingExpense) {
            // 最低限のマージンがあれば低確率で購入
            purchaseChance = 0.2;
            if (annualROI >= 0.12) purchaseChance += 0.2;
        }
    } else if (personality === 'balanced') {
        // バランス型：適度なリスクを取る
        // 生活費1ヶ月分以上残せるなら検討
        if (remainingCash >= livingExpense) {
            purchaseChance = 0.6;
            if (annualROI >= 0.06) purchaseChance += 0.15;
            if (annualROI >= 0.08) purchaseChance += 0.1;
            if (paybackPeriod <= 20) purchaseChance += 0.1;
        } else if (remainingCash >= livingExpense * 0.5) {
            purchaseChance = 0.35;
            if (annualROI >= 0.10) purchaseChance += 0.2;
        }
    } else {
        // 積極型：アグレッシブに投資
        // 最低限の現金があれば積極的に購入
        if (remainingCash >= livingExpense * 0.5) {
            purchaseChance = 0.75;
            if (annualROI >= 0.05) purchaseChance += 0.1;
        } else if (remainingCash >= 0) {
            // ギリギリでも良い案件なら買う
            purchaseChance = 0.4;
            if (annualROI >= 0.08) purchaseChance += 0.3;
        }
    }

    // 脱出進捗への貢献度が高いならボーナス
    if (escapeContribution >= 0.1) purchaseChance += 0.15;
    if (escapeContribution >= 0.2) purchaseChance += 0.1;

    // 現金が潤沢なら購入意欲上昇
    if (cash > livingExpense * 4) purchaseChance += 0.15;
    if (cash > livingExpense * 6) purchaseChance += 0.1;

    // 不労所得がまだ少ない場合は投資意欲上昇
    if (passiveIncome < livingExpense * 0.3) purchaseChance += 0.1;

    // リスク許容度による最終調整
    purchaseChance *= (0.7 + riskTolerance * 0.6);

    // 上限は95%
    purchaseChance = Math.min(purchaseChance, 0.95);

    const decision = Math.random() < purchaseChance;

    debugLog(`AI購入判断: ${aiPlayer.name} (${personality})`, {
        cost, monthlyIncome, cash, remainingCash,
        annualROI: (annualROI * 100).toFixed(1) + '%',
        purchaseChance: (purchaseChance * 100).toFixed(1) + '%',
        decision
    });

    return decision;
}

/**
 * AI の売却判断
 */
function makeAISellDecision(aiPlayer, options) {
    const { personality, riskTolerance, cash, livingExpense } = aiPlayer;
    const { asset, marketPrice } = options;

    // 利益が出るなら売却を検討
    const profit = marketPrice - asset.purchasePrice;
    const profitRatio = profit / asset.purchasePrice;

    let sellChance = 0;

    // 現金がピンチなら売却意欲上昇
    if (cash < livingExpense) {
        sellChance = 0.7;
    } else if (cash < livingExpense * 2) {
        sellChance = 0.3;
    }

    // 利益が出ているなら売却を検討
    if (profitRatio > 0.3) {
        // 30%以上の利益
        if (personality === 'conservative') sellChance += 0.4;
        if (personality === 'balanced') sellChance += 0.25;
        if (personality === 'aggressive') sellChance += 0.15;
    } else if (profitRatio > 0.1) {
        // 10%以上の利益
        if (personality === 'conservative') sellChance += 0.2;
        if (personality === 'balanced') sellChance += 0.1;
    }

    // 損失が出る場合は基本的に売らない
    if (profitRatio < -0.1) {
        sellChance *= 0.3;
    }

    return Math.random() < sellChance;
}

/**
 * 利回りの計算
 */
function calculateROI(cost, monthlyIncome) {
    if (cost === 0) return 0;
    return (monthlyIncome * 12 / cost) * 100;
}

/**
 * 回収期間の計算（月数）
 */
function calculatePaybackPeriod(cost, monthlyIncome) {
    if (monthlyIncome === 0) return Infinity;
    return Math.ceil(cost / monthlyIncome);
}

/**
 * デバッグログ
 */
function debugLog(...args) {
    if (window.DEBUG_MODE) {
        console.log('[DEBUG]', ...args);
    }
}

// デバッグモードの設定
window.DEBUG_MODE = false;
