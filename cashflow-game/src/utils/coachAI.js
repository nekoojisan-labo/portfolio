// ===================================
// マネーアドベンチャー - コーチAI
// ===================================

/**
 * コーチAI - 状況に応じたヒントを生成
 */
const CoachAI = {
    /**
     * メインのヒント生成関数
     */
    generateHint(playerState, situation, gameState) {
        const hints = this.getHintsBySituation(playerState, situation, gameState);
        return hints;
    },

    /**
     * 状況別ヒントの取得
     */
    getHintsBySituation(playerState, situation, gameState) {
        // 状況を自動判定
        const detectedSituation = situation || this.detectSituation(playerState);

        switch (detectedSituation) {
            case 'lowCash':
                return this.getLowCashHints(playerState);
            case 'investmentChance':
                return this.getInvestmentHints(playerState, gameState);
            case 'tradeProposal':
                return this.getTradeHints(playerState);
            case 'nearEscape':
                return this.getNearEscapeHints(playerState);
            case 'nearBankruptcy':
                return this.getBankruptcyHints(playerState);
            case 'cooperation':
                return this.getCooperationHints(playerState, gameState);
            default:
                return this.getGeneralHints(playerState);
        }
    },

    /**
     * 状況の自動判定
     */
    detectSituation(playerState) {
        const {
            cash,
            livingExpense,
            passiveIncome,
            escapeProgress
        } = playerState;

        // 破綻寸前
        if (cash < livingExpense * 0.5) {
            return 'nearBankruptcy';
        }

        // 現金が少ない
        if (cash < livingExpense * 2) {
            return 'lowCash';
        }

        // 脱出間近
        if (escapeProgress > 80) {
            return 'nearEscape';
        }

        // 投資チャンスが来ている（イベントカード表示中）
        if (playerState.currentEvent && playerState.currentEvent.type === 'chance') {
            return 'investmentChance';
        }

        return 'general';
    },

    /**
     * 現金が少ない時のヒント
     */
    getLowCashHints(playerState) {
        const monthsOfSavings = Math.floor(playerState.cash / playerState.livingExpense);

        return {
            status: `持っているお金が、生活費の${monthsOfSavings}ヶ月分しかないよ`,
            points: [
                '毎月出ていくお金の中で、減らせるものはある？',
                '持っているもので、売れるものはある？',
                '仲間に助けてもらうことはできる？'
            ],
            question: 'もし来月、急な出費があったら、どうする？',
            warning: 'お金がゼロになると、選べることが減っちゃうよ'
        };
    },

    /**
     * 投資チャンスの時のヒント
     */
    getInvestmentHints(playerState, gameState) {
        const event = playerState.currentEvent || {};
        const cost = event.cost || 0;
        const income = event.monthlyIncome || 0;
        const paybackMonths = income > 0 ? Math.ceil(cost / income) : '∞';
        const cashRatio = cost > 0 ? Math.round((cost / playerState.cash) * 100) : 0;

        return {
            status: 'お金を増やすチャンスが来たね！',
            points: [
                `これを買ったら、毎月${income}コイン入ってくるよ`,
                `元が取れるまで約${paybackMonths}ヶ月かかるね`,
                `持っているお金の${cashRatio}%を使うことになるよ`
            ],
            question: '全部つぎ込む？それとも、少し残しておく？',
            warning: '魅力的なチャンスほど、最悪のケースも考えよう'
        };
    },

    /**
     * 協力取引の時のヒント
     */
    getTradeHints(playerState) {
        return {
            status: '仲間から取引のお願いが来ているよ',
            points: [
                'この取引で、自分にはどんないいことがある？',
                '相手にはどんないいことがある？',
                '両方にとっていい取引になってる？'
            ],
            question: '断ったら、代わりにどんなことができる？',
            warning: '協力は大事だけど、自分が困る取引は断ってもいいよ'
        };
    },

    /**
     * 脱出間近の時のヒント
     */
    getNearEscapeHints(playerState) {
        const surplus = playerState.passiveIncome - playerState.livingExpense;

        return {
            status: '脱出まであと少し！ゴールが見えてきたね',
            points: [
                '今の収入は、これからも続きそう？',
                '急な出費があっても大丈夫？',
                'まだ脱出してない仲間を助けられる？'
            ],
            question: '今の状態は、安定してる？それとも綱渡り？',
            warning: '最後まで油断しないで。仲間の脱出も助けよう'
        };
    },

    /**
     * 破綻寸前の時のヒント
     */
    getBankruptcyHints(playerState) {
        return {
            status: 'ピンチだけど、まだ方法はあるよ！',
            points: [
                '今すぐ売れるものはある？',
                '仲間に助けを求められる？',
                '支出を減らす方法はある？'
            ],
            question: '一番大事なものは何？それを守るには？',
            warning: '失敗しても大丈夫。ここから学べることがたくさんあるよ'
        };
    },

    /**
     * 協力フェーズのヒント
     */
    getCooperationHints(playerState, gameState) {
        const otherPlayers = gameState?.players?.filter(p => p.id !== playerState.id) || [];
        const needyPlayers = otherPlayers.filter(p => p.cash < p.livingExpense * 2);

        const points = [
            '誰かと一緒に買えるものはある？',
            '困っている仲間はいる？'
        ];

        if (needyPlayers.length > 0) {
            points.push(`${needyPlayers[0].name}がお金に困っているみたいだよ`);
        } else {
            points.push('協力すると、全員が早く脱出できるよ');
        }

        return {
            status: '仲間と協力するチャンスだよ',
            points,
            question: '一人でやるより、協力した方がいい場面かな？',
            warning: '協力は強制じゃない。自分の状況も大事にしよう'
        };
    },

    /**
     * 一般的なヒント
     */
    getGeneralHints(playerState) {
        const cashflow = playerState.totalIncome - playerState.totalExpense;
        const isPositive = cashflow > 0;

        return {
            status: isPositive
                ? '毎月プラスだから、少しずつ増えているね！'
                : '毎月マイナスだから、注意が必要だよ',
            points: [
                '次に何を買ったら、不労所得が増えるかな？',
                '今の支出の中で、減らせるものはある？',
                'リスクを分散するために、いろんな種類の資産を持とう'
            ],
            question: '1年後、どんな状態になっていたい？',
            warning: '焦らなくていい。一歩ずつ進もう'
        };
    },

    /**
     * 用語辞典データ
     */
    glossary: {
        '資産': {
            reading: 'しさん',
            simple: 'お金を生んでくれるもの',
            detail: 'アパートや株など、持っているだけでお金が入ってくるもの。「お金を生む卵を産むニワトリ」みたいなもの。'
        },
        '負債': {
            reading: 'ふさい',
            simple: 'お金が出ていくもの',
            detail: 'ローンや借金など、毎月お金を払わないといけないもの。'
        },
        '不労所得': {
            reading: 'ふろうしょとく',
            simple: '働かなくても入るお金',
            detail: '家賃収入や配当金など、自分が働かなくても入ってくるお金のこと。'
        },
        'キャッシュフロー': {
            reading: 'きゃっしゅふろー',
            simple: 'お金の流れ',
            detail: '入ってくるお金と出ていくお金の流れのこと。プラスなら増えて、マイナスなら減っていく。'
        },
        '投資': {
            reading: 'とうし',
            simple: 'お金を増やすためにお金を使うこと',
            detail: '将来もっと大きなお金になって返ってくることを期待して、お金を使うこと。'
        },
        'リスク': {
            reading: 'りすく',
            simple: 'うまくいかないかもしれない度合い',
            detail: '投資などで、思ったより減ってしまう可能性のこと。高いリスクは高いリターンの可能性もある。'
        },
        'リターン': {
            reading: 'りたーん',
            simple: '戻ってくるもの・利益',
            detail: '投資したお金が増えて戻ってくること。または、その増えた分のこと。'
        },
        '利回り': {
            reading: 'りまわり',
            simple: '投資したお金に対する収入の割合',
            detail: '100円投資して、1年で7円もらえたら利回り7%。数字が大きいほどお得に見えるけど、リスクも考えよう。'
        },
        'ラットレース': {
            reading: 'らっとれーす',
            simple: '働かないとお金がもらえないループ',
            detail: 'ネズミが輪っかの中を走り続けるように、働いて→お金をもらって→使って→また働いて…を繰り返す状態。'
        },
        '分散投資': {
            reading: 'ぶんさんとうし',
            simple: '卵を一つのカゴに盛らないこと',
            detail: '一つのものに全部つぎ込まないで、いろんなものに少しずつ投資すること。一つがダメになっても全部失わない。'
        }
    },

    /**
     * 用語の解説を取得
     */
    getGlossaryItem(term) {
        return this.glossary[term] || null;
    },

    /**
     * 全用語リストを取得
     */
    getAllGlossaryTerms() {
        return Object.keys(this.glossary);
    }
};

// グローバルに公開
window.CoachAI = CoachAI;
