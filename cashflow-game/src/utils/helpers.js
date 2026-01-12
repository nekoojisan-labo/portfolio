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
 * AI の意思決定
 */
function makeAIDecision(aiPlayer, situation, options) {
    const { personality, riskTolerance, cooperationRate } = aiPlayer;

    switch (situation) {
        case 'purchase':
            // 購入判断
            const affordability = aiPlayer.cash / options.cost;
            const roi = options.monthlyIncome / options.cost;

            if (personality === 'conservative') {
                // 堅実型：現金の30%以下で、利回り6%以上なら購入
                return affordability > 3 && roi > 0.06;
            } else if (personality === 'balanced') {
                // バランス型：現金の50%以下で、利回り5%以上なら購入
                return affordability > 2 && roi > 0.05;
            } else {
                // 積極型：現金があれば購入
                return affordability > 1.2 && roi > 0.04;
            }

        case 'cooperation':
            // 協力判断
            return Math.random() < cooperationRate;

        case 'loan':
            // 貸し借り判断
            if (options.type === 'lend') {
                // 貸す場合：余裕があれば
                return aiPlayer.cash > aiPlayer.livingExpense * 3;
            } else {
                // 借りる場合：必要な場合のみ
                return aiPlayer.cash < aiPlayer.livingExpense;
            }

        default:
            return Math.random() < riskTolerance;
    }
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
