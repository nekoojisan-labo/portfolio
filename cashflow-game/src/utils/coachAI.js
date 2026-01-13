// ===================================
// マネーアドベンチャー - コーチAI
// 難易度別ヒント＆学習システム
// ===================================

/**
 * コーチAI - 難易度に応じたヒントと学習内容を生成
 */
const CoachAI = {
    // 現在の難易度
    difficulty: 'easy',

    /**
     * 難易度を設定
     */
    setDifficulty(mode) {
        this.difficulty = mode;
    },

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
        const detectedSituation = situation || this.detectSituation(playerState);
        const difficulty = this.difficulty;

        // 難易度別のヒント取得
        switch (detectedSituation) {
            case 'lowCash':
                return this.getLowCashHints(playerState, difficulty);
            case 'investmentChance':
                return this.getInvestmentHints(playerState, gameState, difficulty);
            case 'tradeProposal':
                return this.getTradeHints(playerState, difficulty);
            case 'nearEscape':
                return this.getNearEscapeHints(playerState, difficulty);
            case 'nearBankruptcy':
                return this.getBankruptcyHints(playerState, difficulty);
            case 'cooperation':
                return this.getCooperationHints(playerState, gameState, difficulty);
            default:
                return this.getGeneralHints(playerState, difficulty);
        }
    },

    /**
     * 状況の自動判定
     */
    detectSituation(playerState) {
        const { cash, livingExpense, passiveIncome, escapeProgress } = playerState;

        if (cash < livingExpense * 0.5) return 'nearBankruptcy';
        if (cash < livingExpense * 2) return 'lowCash';
        if (escapeProgress > 80) return 'nearEscape';
        if (playerState.currentEvent && playerState.currentEvent.type === 'chance') {
            return 'investmentChance';
        }
        return 'general';
    },

    // ===================================
    // 難易度別ヒント - 現金が少ない時
    // ===================================
    getLowCashHints(playerState, difficulty) {
        const monthsOfSavings = Math.floor(playerState.cash / playerState.livingExpense);

        if (difficulty === 'easy') {
            return {
                status: `おかねが${monthsOfSavings}ヶ月ぶんしかないよ💦`,
                points: [
                    'いらないものはある？ うれるかも！',
                    'ともだちにたすけてもらおう',
                    'つぎのおきゅうりょうまでがまんしよう'
                ],
                question: 'なにをかうのをがまんできるかな？',
                tip: '💡 おかねがすくないときは、むりにかわないでだいじょうぶ！'
            };
        } else if (difficulty === 'normal') {
            return {
                status: `現在の手持ち資金は生活費の${monthsOfSavings}ヶ月分です`,
                points: [
                    '【緊急予備資金】最低3ヶ月分の生活費は確保したい',
                    '【支出の見直し】固定費で削れるものはある？',
                    '【収入アップ】副収入の機会を探そう',
                    '【協力】他のプレイヤーからの融資も選択肢'
                ],
                question: 'もし急な出費（修理費など）が発生したら、どう対応する？',
                tip: '📊 緊急予備資金がないと、チャンスが来ても投資できない'
            };
        } else { // challenge
            return {
                status: `流動性危機：現金/支出比率 ${monthsOfSavings}ヶ月`,
                points: [
                    '【流動性リスク】現金比率が低すぎる。緊急時の対応力が低下',
                    '【機会損失】良い投資機会が来ても参加できない状態',
                    '【レバレッジ検討】他プレイヤーからの借入で投資機会を確保？',
                    '【資産売却】低パフォーマンス資産の売却で現金化を検討'
                ],
                question: '現金保有コストと機会損失、どちらを重視すべき局面か？',
                tip: '⚠️ 流動性管理は投資の基本。現金は「選択肢を買う」ためのコスト'
            };
        }
    },

    // ===================================
    // 難易度別ヒント - 投資チャンス
    // ===================================
    getInvestmentHints(playerState, gameState, difficulty) {
        const event = playerState.currentEvent || {};
        const cost = event.cost || 0;
        const income = event.monthlyIncome || 0;
        const paybackMonths = income > 0 ? Math.ceil(cost / income) : Infinity;
        const cashRatio = cost > 0 ? Math.round((cost / playerState.cash) * 100) : 0;
        const roi = cost > 0 ? ((income * 12 / cost) * 100).toFixed(1) : 0;

        if (difficulty === 'easy') {
            return {
                status: 'おかねをふやすチャンスだよ！🌟',
                points: [
                    `これをかうと、まいつき${income}コインもらえるよ`,
                    `${paybackMonths}かげつでもとがとれるね`,
                    `いまのおかねの${cashRatio}%をつかうよ`
                ],
                question: 'かってみる？ それとも、もうすこしまつ？',
                tip: '💡 ぜんぶつかっちゃうと、つぎのチャンスでこまるかも'
            };
        } else if (difficulty === 'normal') {
            return {
                status: '投資判断のチャンスです！',
                points: [
                    `【利回り】年間${roi}%のリターン`,
                    `【回収期間】投資額回収まで約${paybackMonths}ヶ月`,
                    `【資金比率】手持ち資金の${cashRatio}%を使用`,
                    `【キャッシュフロー改善】月+${income}コイン`
                ],
                question: '緊急予備資金を残して投資できる？リスク許容度は？',
                tip: '📈 ROI（投資収益率）が高いほど効率的だが、リスクも考慮しよう'
            };
        } else { // challenge
            const leverageRatio = (cost / playerState.cash).toFixed(2);
            const breakEvenAnalysis = `損益分岐点: ${paybackMonths}ヶ月`;

            return {
                status: '投資機会の分析',
                points: [
                    `【ROI】${roi}%/年 | 業界平均との比較が必要`,
                    `【レバレッジ比率】${leverageRatio}x | 適正範囲内か確認`,
                    `【${breakEvenAnalysis}】| 想定より長期化リスクは？`,
                    `【分散効果】ポートフォリオ内での相関性は？`,
                    `【出口戦略】売却時の流動性・想定売却価格は？`
                ],
                question: 'リスク調整後リターンは魅力的か？最悪シナリオでの損失許容は？',
                tip: '🎯 投資判断の3要素: 期待リターン、リスク（標準偏差）、流動性'
            };
        }
    },

    // ===================================
    // 難易度別ヒント - 協力取引
    // ===================================
    getTradeHints(playerState, difficulty) {
        if (difficulty === 'easy') {
            return {
                status: 'ともだちからおねがいがきたよ！',
                points: [
                    'じぶんにいいことある？',
                    'あいてにいいことある？',
                    'ふたりともうれしい？'
                ],
                question: 'いっしょにやったほうがいいかな？',
                tip: '🤝 こまったときはおたがいさま！'
            };
        } else if (difficulty === 'normal') {
            return {
                status: '協力取引の提案があります',
                points: [
                    '【Win-Win】双方にメリットがある取引か確認',
                    '【リスク分担】リスクと利益の配分は公平？',
                    '【信頼関係】この取引で関係性はどう変わる？',
                    '【代替案】単独で行う場合との比較'
                ],
                question: '長期的に見て、この協力関係は価値があるか？',
                tip: '💼 ビジネスでは「信頼」も重要な資産'
            };
        } else { // challenge
            return {
                status: '共同事業/ファイナンス提案',
                points: [
                    '【シナジー効果】単独実行より付加価値は生まれるか',
                    '【ガバナンス】意思決定プロセスと責任分担の明確化',
                    '【契約条件】利益配分・損失負担・Exit条件',
                    '【機会コスト】この資金を他に使う選択肢との比較',
                    '【カウンターパーティリスク】相手の信用リスク評価'
                ],
                question: 'この取引のNPV（正味現在価値）はプラスか？隠れたコストは？',
                tip: '📋 ジョイントベンチャーは明確な契約と Exit戦略が重要'
            };
        }
    },

    // ===================================
    // 難易度別ヒント - 脱出間近
    // ===================================
    getNearEscapeHints(playerState, difficulty) {
        const surplus = playerState.passiveIncome - playerState.livingExpense;

        if (difficulty === 'easy') {
            return {
                status: 'もうすこしでゴールだよ！がんばれ！🎉',
                points: [
                    'あとちょっとでふろうしょとくがせいかつひをこえるよ',
                    'まだのともだちもたすけてあげよう',
                    'さいごまであきらめないで！'
                ],
                question: 'みんなでゴールできたらうれしいね！',
                tip: '🌟 じぶんだけじゃなく、みんなでだっしゅつしよう！'
            };
        } else if (difficulty === 'normal') {
            return {
                status: `脱出まであと少し！余剰: ${surplus >= 0 ? '+' : ''}${surplus}/月`,
                points: [
                    '【安定性】この収入は継続的か、一時的か',
                    '【バッファ】予期せぬ支出への備えは十分か',
                    '【仲間の支援】まだ脱出していないプレイヤーを助けられる',
                    '【最終確認】脱出後の計画は立てているか'
                ],
                question: '「経済的自由」とは何か、自分なりの定義を考えてみよう',
                tip: '🎯 真の経済的自由は、数字だけでなく心の余裕も大切'
            };
        } else { // challenge
            return {
                status: `FIRE達成間近 | 余剰キャッシュフロー: ${surplus}/月`,
                points: [
                    '【サステナビリティ】収入源の持続可能性評価',
                    '【インフレ耐性】実質購買力の維持可能性',
                    '【ブラックスワン対策】予期せぬ大規模損失への備え',
                    '【税務最適化】脱出後の税制面での考慮',
                    '【レガシー】他プレイヤー支援による全体最適化'
                ],
                question: '4%ルールを適用した場合、必要な資産総額は？現状との乖離は？',
                tip: '📊 FIRE = Financial Independence, Retire Early（経済的自立・早期リタイア）'
            };
        }
    },

    // ===================================
    // 難易度別ヒント - 破綻寸前
    // ===================================
    getBankruptcyHints(playerState, difficulty) {
        if (difficulty === 'easy') {
            return {
                status: 'ピンチだけど、だいじょうぶ！💪',
                points: [
                    'うれるものはある？',
                    'ともだちにたすけてもらおう！',
                    'しっぱいしてもまたやりなおせるよ'
                ],
                question: 'なにをいちばんまもりたい？',
                tip: '🌈 しっぱいはせいこうのもと！ここからまなぼう'
            };
        } else if (difficulty === 'normal') {
            return {
                status: '⚠️ 資金ショートの危険があります',
                points: [
                    '【緊急売却】すぐに現金化できる資産はある？',
                    '【支出削減】今すぐ止められる支出は？',
                    '【緊急融資】他プレイヤーからの借入を検討',
                    '【リストラクチャリング】負債の返済条件を見直せる？'
                ],
                question: '破綻を避けるために、何を犠牲にできる？',
                tip: '📉 企業でも「再建」の道はある。諦めずに戦略を立てよう'
            };
        } else { // challenge
            return {
                status: '🚨 流動性危機 - 緊急対応が必要',
                points: [
                    '【トリアージ】最優先で守るべき資産と切り捨てる資産の選別',
                    '【デットリストラクチャリング】債務再編の交渉余地',
                    '【ファイアセール回避】投げ売りによる損失最小化戦略',
                    '【DIPファイナンス】破綻手前での緊急資金調達',
                    '【教訓の抽出】なぜこの状況に陥ったか？再発防止策は？'
                ],
                question: '事業再生の観点から、最も価値を毀損しない撤退戦略は？',
                tip: '⚖️ 損切りの決断は早いほど傷は浅い。沈没コストに囚われるな'
            };
        }
    },

    // ===================================
    // 難易度別ヒント - 協力フェーズ
    // ===================================
    getCooperationHints(playerState, gameState, difficulty) {
        const otherPlayers = gameState?.players?.filter(p => p.id !== playerState.id) || [];
        const needyPlayers = otherPlayers.filter(p => p.cash < p.livingExpense * 2);

        if (difficulty === 'easy') {
            const points = [
                'いっしょにおおきなものをかえるかも！',
                'こまっているともだちをたすけよう'
            ];
            if (needyPlayers.length > 0) {
                points.push(`${needyPlayers[0].name}がこまっているみたい`);
            }

            return {
                status: 'きょうりょくのチャンス！🤝',
                points,
                question: 'だれかといっしょにやったらうまくいくかな？',
                tip: '👫 ひとりよりふたり、ふたりよりみんな！'
            };
        } else if (difficulty === 'normal') {
            const points = [
                '【共同投資】一人では買えない高額資産を共同購入',
                '【資金融通】余裕のあるプレイヤー同士で助け合い',
                '【情報共有】市場動向や投資機会の共有'
            ];
            if (needyPlayers.length > 0) {
                points.push(`⚠️ ${needyPlayers[0].name}が資金難の状態`);
            }

            return {
                status: '協力取引を検討しましょう',
                points,
                question: '全員が脱出するための最適な協力方法は？',
                tip: '🎯 ゲーム理論: 協力は全体最適を実現できる'
            };
        } else { // challenge
            const points = [
                '【シンジケーション】大型案件の共同投資によるリスク分散',
                '【プライベートレンディング】市場金利との比較で適正条件を設定',
                '【M&A機会】他プレイヤーの資産取得による規模拡大',
                '【アライアンス戦略】競争と協調のバランス'
            ];
            if (needyPlayers.length > 0) {
                points.push(`📊 ${needyPlayers[0].name}: ディストレスト資産の取得機会？`);
            }

            return {
                status: '戦略的パートナーシップの検討',
                points,
                question: 'この協力は「ゼロサムゲーム」か「ポジティブサムゲーム」か？',
                tip: '🏛️ 高度な金融では「協調」と「競争」が同時に存在する'
            };
        }
    },

    // ===================================
    // 難易度別ヒント - 一般
    // ===================================
    getGeneralHints(playerState, difficulty) {
        const cashflow = (playerState.totalIncome || 0) - (playerState.totalExpense || 0);
        const isPositive = cashflow > 0;

        if (difficulty === 'easy') {
            return {
                status: isPositive
                    ? 'まいつきおかねがふえてるよ！いいかんじ！😊'
                    : 'まいつきおかねがへってる…きをつけて！',
                points: [
                    'つぎはなにをかったらいいかな？',
                    'むだづかいはない？',
                    'ともだちとなかよくあそぼう！'
                ],
                question: '1ねんごにどうなっていたい？',
                tip: '🐢 あせらなくていいよ。すこしずつすすもう！'
            };
        } else if (difficulty === 'normal') {
            return {
                status: isPositive
                    ? `月間キャッシュフロー: +${cashflow} - 順調に資産形成中`
                    : `月間キャッシュフロー: ${cashflow} - 支出の見直しが必要`,
                points: [
                    '【資産配分】収入源の分散化を検討しよう',
                    '【支出管理】必要経費と無駄な支出を区別',
                    '【目標設定】脱出までの具体的なロードマップを描く',
                    '【学習投資】新しいスキルや知識への投資も重要'
                ],
                question: '5年後の財務状況をイメージできる？',
                tip: '📈 複利の力: 時間を味方につけよう'
            };
        } else { // challenge
            const roi = playerState.passiveIncome > 0 ?
                ((playerState.passiveIncome * 12 / (playerState.cash + playerState.passiveIncome * 12)) * 100).toFixed(1) : 0;

            return {
                status: `ポートフォリオ分析 | CF: ${cashflow}/月 | 推定ROI: ${roi}%`,
                points: [
                    '【アセットアロケーション】リスク資産と安全資産のバランス',
                    '【リバランス】定期的なポートフォリオ調整の検討',
                    '【税効率】投資収益の税務最適化',
                    '【レバレッジ活用】適切な借入による収益率向上',
                    '【出口戦略】各資産の売却タイミングと方法'
                ],
                question: 'シャープレシオ（リスク調整後リターン）を最大化する配分は？',
                tip: '🎓 「マーケットに勝つ」より「自分の目標を達成する」投資を'
            };
        }
    },

    // ===================================
    // 用語辞典データ（難易度別説明付き）
    // ===================================
    glossary: {
        '資産': {
            reading: 'しさん',
            easy: 'おかねをうんでくれるもの。たまごをうむニワトリみたい！',
            normal: 'お金を生んでくれるもの。アパートや株など、持っているだけでお金が入ってくる',
            challenge: '将来のキャッシュフローを生み出す経済的資源。B/S上では借方に計上され、収益獲得能力を持つ'
        },
        '負債': {
            reading: 'ふさい',
            easy: 'おかねがでていくもの。かりたおかねとか',
            normal: 'お金が出ていくもの。ローンや借金など、毎月返済が必要なもの',
            challenge: '将来の経済的資源の流出を伴う現在の義務。レバレッジとしての戦略的活用も可能'
        },
        '不労所得': {
            reading: 'ふろうしょとく',
            easy: 'はたらかなくてももらえるおかね！',
            normal: '働かなくても入るお金。家賃収入や配当金など',
            challenge: '労働の直接的対価でない所得。資本所得とも。パッシブインカムストリームの構築が経済的自由の鍵'
        },
        'キャッシュフロー': {
            reading: 'きゃっしゅふろー',
            easy: 'おかねのながれ。はいるおかねとでるおかね',
            normal: 'お金の流れ。収入-支出がプラスなら増え、マイナスなら減る',
            challenge: '一定期間における現金の流入と流出。FCF（フリーキャッシュフロー）が企業価値評価の基礎'
        },
        '投資': {
            reading: 'とうし',
            easy: 'あとでふえてかえってくるとおもって、おかねをつかうこと',
            normal: '将来のリターンを期待してお金を使うこと。リスクとリターンのバランスが重要',
            challenge: '将来の価値増大を期待した資本の配分。リスク・リターン特性、流動性、投資期間を考慮した意思決定'
        },
        'ROI': {
            reading: 'あーるおーあい',
            easy: 'つかったおかねにたいして、どれだけもうかるか',
            normal: '投資収益率。投資したお金に対するリターンの割合（%）',
            challenge: 'Return on Investment。(利益÷投資額)×100。ただし、時間価値を考慮したIRRやNPVの方が精緻な評価が可能'
        },
        'リスク': {
            reading: 'りすく',
            easy: 'うまくいかないかもしれないこと',
            normal: '予想と違う結果になる可能性。高リスク=高リターンの可能性も高リスク=大損の可能性も',
            challenge: 'リターンの不確実性・変動性。標準偏差で計測。システマティックリスクと非システマティックリスクに分類'
        },
        '分散投資': {
            reading: 'ぶんさんとうし',
            easy: 'たまごを1つのカゴにぜんぶいれないこと',
            normal: '一つに集中せず、複数に分けて投資すること。リスクを減らせる',
            challenge: 'ポートフォリオ理論に基づくリスク管理手法。非相関資産の組み合わせで非システマティックリスクを低減'
        },
        'ラットレース': {
            reading: 'らっとれーす',
            easy: 'ネズミがぐるぐるはしるみたいに、はたらいてもはたらいてもおわらないこと',
            normal: '働いて→お金をもらって→使って→また働いて…を繰り返す生活',
            challenge: '労働所得に依存し、資産形成が進まない状態。パッシブインカムが支出を上回ることで脱出可能'
        },
        'レバレッジ': {
            reading: 'ればれっじ',
            easy: 'てこのげんり。すこしのちからでおおきなものをうごかす',
            normal: '借りたお金を使って投資すること。成功すれば大きく増えるが、失敗すると大きく減る',
            challenge: '他人資本を活用した投資効率の増幅。ROE=ROA+(ROA-負債利子率)×D/E比率。両刃の剣'
        },
        'FIRE': {
            reading: 'ふぁいあ',
            easy: 'はやくおかねにこまらないようになること',
            normal: '経済的自立と早期リタイア。不労所得だけで生活できる状態を目指すこと',
            challenge: 'Financial Independence, Retire Early。年間支出の25倍の資産（4%ルール）で達成とされる'
        },
        '複利': {
            reading: 'ふくり',
            easy: 'ふえたおかねにも、またおかねがつくこと',
            normal: '利息にも利息がつくこと。時間が経つほど効果が大きくなる',
            challenge: '利息が元本に組み込まれ、次期の計算基礎となる。長期投資で指数関数的成長をもたらす'
        }
    },

    /**
     * 用語の解説を取得（難易度対応）
     */
    getGlossaryItem(term) {
        const item = this.glossary[term];
        if (!item) return null;

        return {
            reading: item.reading,
            description: item[this.difficulty] || item.normal
        };
    },

    /**
     * 全用語リストを取得
     */
    getAllGlossaryTerms() {
        return Object.keys(this.glossary);
    },

    // ===================================
    // 学習コンテンツ（難易度別）
    // ===================================
    getLearningContent(topic, difficulty) {
        const contents = {
            'investment_basics': {
                easy: {
                    title: 'とうしってなに？',
                    content: 'おかねをつかって、もっとおかねをふやすこと。たとえば、おみせをひらいたり、いえをかしたりするよ！',
                    example: '100コインでレモネードスタンドをつくったら、まいにち10コインもらえるようになった！'
                },
                normal: {
                    title: '投資の基本',
                    content: '投資とは、将来より多くのお金になることを期待して、今お金を使うこと。株、不動産、ビジネスなど様々な方法がある。',
                    example: '株式投資: 会社の一部を買うことで、会社が成長すれば株価が上がり、配当ももらえる'
                },
                challenge: {
                    title: '投資理論の基礎',
                    content: '現代ポートフォリオ理論(MPT)では、リスクとリターンのトレードオフを数学的に分析。効率的フロンティア上のポートフォリオが最適とされる。',
                    example: 'シャープレシオ = (ポートフォリオリターン - 無リスク金利) / 標準偏差'
                }
            },
            'risk_management': {
                easy: {
                    title: 'リスクってなに？',
                    content: 'うまくいかないかもしれないこと。でも、リスクがあるからこそ、うまくいったときにおおきなごほうびがあるんだ！',
                    example: 'あめのひにレモネードをうっても、だれもかってくれないかも…'
                },
                normal: {
                    title: 'リスク管理の考え方',
                    content: 'リスクは「悪いこと」ではなく「不確実性」。分散投資、緊急資金の確保、保険などでリスクを管理できる。',
                    example: '卵を一つのカゴに盛らない = 全額を一つの投資に入れない'
                },
                challenge: {
                    title: 'リスクマネジメント',
                    content: 'VaR(Value at Risk)、期待ショートフォール、ストレステストなどでリスクを定量化。ヘッジ戦略やデリバティブによるリスク移転も重要な手法。',
                    example: '95%VaR = 100万円 → 95%の確率で損失は100万円以内'
                }
            }
        };

        return contents[topic]?.[difficulty || this.difficulty] || null;
    }
};

// グローバルに公開
window.CoachAI = CoachAI;
