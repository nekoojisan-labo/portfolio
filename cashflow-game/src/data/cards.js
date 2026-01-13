// ===================================
// マネーアドベンチャー - カードデータ
// ===================================

const CHANCE_CARDS = [
    // 不動産系
    {
        id: 'C01',
        type: 'chance',
        category: 'realEstate',
        name: '小さなアパート',
        icon: '🏠',
        description: '駅から徒歩10分のアパートが売りに出ているよ！',
        cost: 200,
        monthlyIncome: 15,
        hint: '何ヶ月で元が取れるかな？'
    },
    {
        id: 'C02',
        type: 'chance',
        category: 'realEstate',
        name: '古い一軒家',
        icon: '🏚️',
        description: '古いけど安い一軒家。リフォームすれば価値が上がるかも？',
        cost: 150,
        monthlyIncome: 10,
        hint: '安いには理由がある。でもチャンスかも？'
    },
    {
        id: 'C03',
        type: 'chance',
        category: 'realEstate',
        name: '駅前のお店スペース',
        icon: '🏪',
        description: '駅前の一等地にお店を出せるスペースが！',
        cost: 250,
        monthlyIncome: 20,
        hint: '立地がいいと高い。でも収入も多いね'
    },
    {
        id: 'C04',
        type: 'chance',
        category: 'realEstate',
        name: '小さなガレージ',
        icon: '🚗',
        description: '駐車場として貸せる小さなガレージ。',
        cost: 80,
        monthlyIncome: 5,
        hint: '小さく始めるのも悪くないよ'
    },
    {
        id: 'C05',
        type: 'chance',
        category: 'realEstate',
        name: '学生向けアパート',
        icon: '🎓',
        description: '大学の近くにあるアパート。学生に人気！',
        cost: 180,
        monthlyIncome: 12,
        hint: '需要は安定してるけど、空室リスクは？'
    },
    // 株式系
    {
        id: 'C06',
        type: 'chance',
        category: 'stock',
        name: '安定企業の株',
        icon: '📊',
        description: '大きな会社の株。安定してるけど、大きくは増えないかも。',
        cost: 50,
        monthlyIncome: 3,
        hint: '大きく増えないけど、減りにくいよ'
    },
    {
        id: 'C07',
        type: 'chance',
        category: 'stock',
        name: '成長企業の株',
        icon: '📈',
        description: '伸びている会社の株。上がるかも、下がるかも。',
        cost: 80,
        monthlyIncome: 6,
        hint: '増えるかも、減るかも。リスクとリターンを考えよう'
    },
    {
        id: 'C08',
        type: 'chance',
        category: 'stock',
        name: '株式ミニパック',
        icon: '📦',
        description: 'いろんな会社の株を少しずつ買えるパック。',
        cost: 30,
        monthlyIncome: 2,
        hint: '少額から始められる。まずは体験してみよう'
    },
    // ビジネス系
    {
        id: 'C09',
        type: 'chance',
        category: 'business',
        name: '自販機ビジネス',
        icon: '🥤',
        description: '自動販売機を置く権利。場所次第で収入が変わるよ。',
        cost: 120,
        monthlyIncome: 10,
        hint: '手間がかからないビジネス。場所が大事'
    },
    {
        id: 'C10',
        type: 'chance',
        category: 'business',
        name: 'ネットショップ',
        icon: '💻',
        description: 'インターネットでモノを売るお店を始められる！',
        cost: 100,
        monthlyIncome: 8,
        hint: '初期投資は低め。でも運営の手間は？'
    },
    // 特別チャンス
    {
        id: 'C11',
        type: 'chance',
        category: 'special',
        name: 'ラッキーチャンス',
        icon: '🍀',
        description: 'なんとラッキー！次の投資が20%オフ！',
        cost: 0,
        monthlyIncome: 0,
        effect: 'nextDiscount',
        effectValue: 0.2,
        hint: 'チャンスはいつ来るかわからない。準備が大事'
    },
    {
        id: 'C12',
        type: 'chance',
        category: 'special',
        name: '協力ボーナス',
        icon: '🤝',
        description: 'このターンに仲間と取引すると、両方に+20コイン！',
        cost: 0,
        monthlyIncome: 0,
        effect: 'cooperationBonus',
        effectValue: 20,
        hint: '協力は両方得する。Win-Winを探そう'
    }
];

const TROUBLE_CARDS = [
    // 生活トラブル
    {
        id: 'T01',
        type: 'trouble',
        category: 'life',
        name: '冷蔵庫がこわれた！',
        icon: '🧊',
        description: '冷蔵庫が動かなくなった！買い替えないと…',
        cost: 30,
        hint: '急な出費は誰にでも起きる。備えが大事'
    },
    {
        id: 'T02',
        type: 'trouble',
        category: 'life',
        name: '風邪をひいて病院へ',
        icon: '🏥',
        description: '風邪をひいちゃった。病院に行かないと。',
        cost: 15,
        hint: '健康も大事な資産だよ'
    },
    {
        id: 'T03',
        type: 'trouble',
        category: 'life',
        name: 'スマホの画面割れ',
        icon: '📱',
        description: 'スマホを落として画面がバキバキに…',
        cost: 20,
        hint: '修理と買い替え、どっちが得？'
    },
    {
        id: 'T04',
        type: 'trouble',
        category: 'life',
        name: '自転車がパンク',
        icon: '🚲',
        description: '自転車のタイヤがパンク。修理に出さないと。',
        cost: 10,
        hint: '小さな出費も積み重なると大きい'
    },
    {
        id: 'T05',
        type: 'trouble',
        category: 'life',
        name: 'エアコンが故障',
        icon: '❄️',
        description: '暑い日にエアコンが動かない！',
        cost: 40,
        hint: '我慢できる？できない？優先順位を考えよう'
    },
    // 社会的トラブル
    {
        id: 'T06',
        type: 'trouble',
        category: 'social',
        name: '友達の誕生日プレゼント',
        icon: '🎁',
        description: '大切な友達の誕生日。プレゼントを買わないと！',
        cost: 10,
        hint: 'お金と人間関係、どちらも大切'
    },
    {
        id: 'T07',
        type: 'trouble',
        category: 'social',
        name: '結婚式のご祝儀',
        icon: '💒',
        description: '友達の結婚式！お祝いを包もう。',
        cost: 30,
        hint: '人生の節目をお祝いしよう'
    },
    {
        id: 'T08',
        type: 'trouble',
        category: 'social',
        name: '部活の合宿費',
        icon: '⛺',
        description: '部活の合宿がある！参加費が必要だ。',
        cost: 20,
        hint: '経験を買うのも投資の一種'
    },
    // 資産トラブル
    {
        id: 'T09',
        type: 'trouble',
        category: 'asset',
        name: '物件の修理が必要',
        icon: '🔧',
        description: '持っている物件の修理が必要に。今月の家賃収入なし。',
        cost: 0,
        effect: 'skipIncome',
        hint: '資産を持つと維持費もかかる'
    },
    {
        id: 'T10',
        type: 'trouble',
        category: 'asset',
        name: '空室が発生',
        icon: '🚪',
        description: '借りている人が引っ越しちゃった。今月の家賃収入半分。',
        cost: 0,
        effect: 'halfIncome',
        hint: '空室リスクは避けられない。複数持つと安心'
    },
    {
        id: 'T11',
        type: 'trouble',
        category: 'asset',
        name: '株価下落',
        icon: '📉',
        description: '市場が下がって、株の価値が20%ダウン！',
        cost: 0,
        effect: 'stockDown',
        effectValue: 0.2,
        hint: '投資には波がある。慌てないで'
    },
    // 特別トラブル
    {
        id: 'T12',
        type: 'trouble',
        category: 'special',
        name: '大きな出費',
        icon: '💸',
        description: '予想外の大きな出費！50コイン必要。仲間に助けを求められるよ。',
        cost: 50,
        canAskHelp: true,
        hint: '困ったときは助けを求めていい'
    }
];

const LEARNING_CARDS = [
    // 知識アップ
    {
        id: 'L01',
        type: 'learning',
        category: 'knowledge',
        name: 'お金の本を読んだ！',
        icon: '📚',
        description: 'お金について学んだ！次の投資の成功率+10%',
        effect: 'investBonus',
        effectValue: 0.1,
        hint: '学ぶことは最高の投資'
    },
    {
        id: 'L02',
        type: 'learning',
        category: 'knowledge',
        name: '先輩に相談した！',
        icon: '👨‍🏫',
        description: '経験者にアドバイスをもらった。ヒントが詳しくなる！',
        effect: 'betterHint',
        hint: '経験者に聞くのは恥ずかしくない'
    },
    {
        id: 'L03',
        type: 'learning',
        category: 'knowledge',
        name: '家計簿をつけ始めた！',
        icon: '📝',
        description: 'お金の流れが見えるように！支出が5コイン減る。',
        effect: 'reduceExpense',
        effectValue: 5,
        hint: '見える化すると無駄が減る'
    },
    {
        id: 'L04',
        type: 'learning',
        category: 'knowledge',
        name: '節約術を学んだ！',
        icon: '💡',
        description: '次のトラブルカードの支払いが30%オフ！',
        effect: 'troubleDiscount',
        effectValue: 0.3,
        hint: '工夫次第で出費は減らせる'
    },
    {
        id: 'L05',
        type: 'learning',
        category: 'knowledge',
        name: '交渉術を学んだ！',
        icon: '🗣️',
        description: '次の購入が10%オフ！',
        effect: 'purchaseDiscount',
        effectValue: 0.1,
        hint: '交渉力はどこでも使える'
    },
    // 経験アップ
    {
        id: 'L06',
        type: 'learning',
        category: 'experience',
        name: '失敗から学んだ！',
        icon: '💪',
        description: '前のターンの損失が経験に！経験値+20',
        effect: 'experienceGain',
        effectValue: 20,
        hint: '失敗は成功のもと'
    },
    {
        id: 'L07',
        type: 'learning',
        category: 'experience',
        name: '小さな成功体験！',
        icon: '⭐',
        description: 'うまくいった！次のターンの行動+1回',
        effect: 'extraAction',
        hint: '成功体験が自信になる'
    },
    {
        id: 'L08',
        type: 'learning',
        category: 'experience',
        name: '仲間との協力成功！',
        icon: '🎉',
        description: '協力した全員に+10コイン！',
        effect: 'cooperationReward',
        effectValue: 10,
        hint: '協力は全員を豊かにする'
    },
    // スキル獲得
    {
        id: 'L09',
        type: 'learning',
        category: 'skill',
        name: '修理スキル習得！',
        icon: '🔨',
        description: '物件の修理費が半額になる！（永続）',
        effect: 'skill',
        skillType: 'repair',
        hint: '自分でできると節約になる'
    },
    {
        id: 'L10',
        type: 'learning',
        category: 'skill',
        name: '分析スキル習得！',
        icon: '🔍',
        description: '投資の成功率が見えるようになる！（永続）',
        effect: 'skill',
        skillType: 'analysis',
        hint: '数字を読む力は武器になる'
    },
    // 特別学び
    {
        id: 'L11',
        type: 'learning',
        category: 'special',
        name: 'メンターとの出会い',
        icon: '🌟',
        description: '1回だけ、最適な選択肢を教えてもらえる！',
        effect: 'mentorAdvice',
        hint: '良い師との出会いは人生を変える'
    },
    {
        id: 'L12',
        type: 'learning',
        category: 'special',
        name: '大きな気づき！',
        icon: '💎',
        description: '考え方が変わった！脱出進捗+10%',
        effect: 'escapeBoost',
        effectValue: 10,
        hint: '考え方が変わると行動が変わる'
    }
];

// ボードのマス定義
const BOARD_TILES = [
    { type: 'start', icon: '🏁', name: 'スタート' },
    { type: 'chance', icon: '💰', name: 'チャンス' },
    { type: 'dice', icon: '🎲', name: 'サイコロ' },
    { type: 'trouble', icon: '💸', name: 'トラブル' },
    { type: 'cooperate', icon: '🤝', name: '協力' },
    { type: 'chance', icon: '💰', name: 'チャンス' },
    { type: 'learning', icon: '📚', name: '学び' },
    { type: 'dice', icon: '🎲', name: 'サイコロ' },
    { type: 'chance', icon: '💰', name: 'チャンス' },
    { type: 'trouble', icon: '💸', name: 'トラブル' },
    { type: 'learning', icon: '📚', name: '学び' },
    { type: 'chance', icon: '💰', name: 'チャンス' },
    { type: 'cooperate', icon: '🤝', name: '協力' },
    { type: 'dice', icon: '🎲', name: 'サイコロ' },
    { type: 'trouble', icon: '💸', name: 'トラブル' },
    { type: 'chance', icon: '💰', name: 'チャンス' },
    { type: 'learning', icon: '📚', name: '学び' },
    { type: 'dice', icon: '🎲', name: 'サイコロ' },
    { type: 'chance', icon: '💰', name: 'チャンス' },
    { type: 'cooperate', icon: '🤝', name: '協力' },
];

// AI プレイヤー設定（難易度別キャラクター）
const AI_CHARACTERS = {
    // かんたんモード - やさしい動物キャラクター
    easy: [
        {
            name: 'のんびりウサギ',
            avatar: '🐰',
            personality: 'conservative',
            riskTolerance: 0.2,
            cooperationRate: 0.9,
            description: 'ゆっくり確実に進むよ'
        },
        {
            name: 'ほのぼのクマ',
            avatar: '🐻',
            personality: 'conservative',
            riskTolerance: 0.25,
            cooperationRate: 0.85,
            description: 'みんなと仲良くしたいな'
        },
        {
            name: 'にこにこネコ',
            avatar: '🐱',
            personality: 'balanced',
            riskTolerance: 0.3,
            cooperationRate: 0.8,
            description: 'のんびり楽しくいこうよ'
        },
        {
            name: 'わくわくイヌ',
            avatar: '🐶',
            personality: 'balanced',
            riskTolerance: 0.35,
            cooperationRate: 0.75,
            description: '一緒に遊ぼうよ！'
        }
    ],
    // ふつうモード - 個性的なキャラクター
    normal: [
        {
            name: 'かしこフクロウ',
            avatar: '🦉',
            personality: 'conservative',
            riskTolerance: 0.35,
            cooperationRate: 0.75,
            description: 'よく考えてから決めるよ'
        },
        {
            name: 'げんきキツネ',
            avatar: '🦊',
            personality: 'balanced',
            riskTolerance: 0.5,
            cooperationRate: 0.7,
            description: 'バランスが大事だよね'
        },
        {
            name: 'ペンギンくん',
            avatar: '🐧',
            personality: 'balanced',
            riskTolerance: 0.55,
            cooperationRate: 0.65,
            description: '新しいことに挑戦！'
        },
        {
            name: 'コアラさん',
            avatar: '🐨',
            personality: 'aggressive',
            riskTolerance: 0.6,
            cooperationRate: 0.6,
            description: 'チャンスを逃さないよ'
        }
    ],
    // チャレンジモード - 強いライバルキャラクター
    challenge: [
        {
            name: 'クールパンダ',
            avatar: '🐼',
            personality: 'balanced',
            riskTolerance: 0.5,
            cooperationRate: 0.55,
            description: '冷静に判断するよ'
        },
        {
            name: 'ライオン王',
            avatar: '🦁',
            personality: 'aggressive',
            riskTolerance: 0.7,
            cooperationRate: 0.5,
            description: '勝負だ！負けないぞ'
        },
        {
            name: 'はやぶさ',
            avatar: '🦅',
            personality: 'aggressive',
            riskTolerance: 0.75,
            cooperationRate: 0.45,
            description: 'スピードが命だよ'
        },
        {
            name: 'ドラゴン',
            avatar: '🐲',
            personality: 'aggressive',
            riskTolerance: 0.8,
            cooperationRate: 0.4,
            description: '最高の投資を見つける'
        }
    ]
};

// 後方互換性のために残す（レベル別のデフォルト）
const AI_PLAYERS = [
    AI_CHARACTERS.easy[0],
    AI_CHARACTERS.normal[1],
    AI_CHARACTERS.challenge[1]
];

// 職業カードデータ
const JOB_CARDS = [
    {
        id: 'J01',
        name: 'パン屋さん',
        icon: '🍞',
        description: '毎朝早起きして、おいしいパンを焼くよ！',
        salary: 80,
        livingExpense: 50,
        family: 'single',
        familyIcon: '👤',
        familyLabel: 'ひとりぐらし',
        startingCash: 200,
        color: '#FFA726',
        hint: '給料は少なめだけど、生活費も少ないから貯金しやすいよ'
    },
    {
        id: 'J02',
        name: '学校の先生',
        icon: '👨‍🏫',
        description: '子どもたちに勉強を教えるお仕事だよ',
        salary: 120,
        livingExpense: 70,
        family: 'married',
        familyIcon: '👫',
        familyLabel: '夫婦ふたり',
        startingCash: 300,
        color: '#42A5F5',
        hint: '安定したお給料がもらえるね'
    },
    {
        id: 'J03',
        name: 'お医者さん',
        icon: '👨‍⚕️',
        description: '病気の人を助ける、とても大切なお仕事',
        salary: 200,
        livingExpense: 120,
        family: 'withKids',
        familyIcon: '👨‍👩‍👧',
        familyLabel: '子どもがいる家族',
        startingCash: 400,
        color: '#66BB6A',
        hint: 'お給料は高いけど、生活費も高いね'
    },
    {
        id: 'J04',
        name: 'ゲームクリエイター',
        icon: '🎮',
        description: 'みんなが楽しめるゲームを作るよ',
        salary: 100,
        livingExpense: 60,
        family: 'single',
        familyIcon: '👤',
        familyLabel: 'ひとりぐらし',
        startingCash: 250,
        color: '#AB47BC',
        hint: '好きなことを仕事にできるって素敵だね'
    },
    {
        id: 'J05',
        name: 'お花屋さん',
        icon: '💐',
        description: 'きれいなお花を売るお店を持っているよ',
        salary: 90,
        livingExpense: 55,
        family: 'single',
        familyIcon: '👤',
        familyLabel: 'ひとりぐらし',
        startingCash: 220,
        color: '#EC407A',
        hint: '自分のお店を持つって夢があるね'
    },
    {
        id: 'J06',
        name: '会社員',
        icon: '💼',
        description: '会社でいろんな仕事をしているよ',
        salary: 130,
        livingExpense: 80,
        family: 'married',
        familyIcon: '👫',
        familyLabel: '夫婦ふたり',
        startingCash: 350,
        color: '#5C6BC0',
        hint: '安定して働けるのがいいところだね'
    },
    {
        id: 'J07',
        name: 'ユーチューバー',
        icon: '📱',
        description: '動画を作って、みんなに見てもらうよ',
        salary: 70,
        livingExpense: 45,
        family: 'single',
        familyIcon: '👤',
        familyLabel: 'ひとりぐらし',
        startingCash: 150,
        color: '#EF5350',
        hint: '最初は大変だけど、人気が出ると収入が増えるかも'
    },
    {
        id: 'J08',
        name: '消防士',
        icon: '🚒',
        description: '火事から人を助ける、かっこいいお仕事',
        salary: 110,
        livingExpense: 65,
        family: 'withKids',
        familyIcon: '👨‍👩‍👦',
        familyLabel: '子どもがいる家族',
        startingCash: 280,
        color: '#FF7043',
        hint: '人を助けるやりがいのある仕事だね'
    },
    {
        id: 'J09',
        name: 'パイロット',
        icon: '✈️',
        description: '飛行機を操縦して、人を運ぶよ',
        salary: 180,
        livingExpense: 100,
        family: 'married',
        familyIcon: '👫',
        familyLabel: '夫婦ふたり',
        startingCash: 450,
        color: '#26C6DA',
        hint: 'お給料は高いけど、責任も大きいよ'
    },
    {
        id: 'J10',
        name: 'ケーキ屋さん',
        icon: '🎂',
        description: 'おいしいケーキを作って売るよ',
        salary: 85,
        livingExpense: 52,
        family: 'single',
        familyIcon: '👤',
        familyLabel: 'ひとりぐらし',
        startingCash: 210,
        color: '#FFCA28',
        hint: '自分で作ったものを売るのは楽しいね'
    },
    {
        id: 'J11',
        name: '農家さん',
        icon: '🌾',
        description: '野菜やお米を育てるお仕事',
        salary: 75,
        livingExpense: 40,
        family: 'withKids',
        familyIcon: '👨‍👩‍👧‍👦',
        familyLabel: '大家族',
        startingCash: 180,
        color: '#8D6E63',
        hint: '生活費が安いのがポイントだよ'
    },
    {
        id: 'J12',
        name: '弁護士',
        icon: '⚖️',
        description: '法律の専門家として人を助けるよ',
        salary: 190,
        livingExpense: 110,
        family: 'withKids',
        familyIcon: '👨‍👩‍👧',
        familyLabel: '子どもがいる家族',
        startingCash: 420,
        color: '#78909C',
        hint: '勉強が大変だけど、やりがいがあるね'
    }
];

// 初期設定
const INITIAL_SETTINGS = {
    easy: {
        startingCash: 300,
        salary: 100,
        livingExpense: 60,
        escapeCondition: (player) => player.passiveIncome >= player.livingExpense
    },
    normal: {
        startingCash: 500,
        salary: 150,
        livingExpense: 90,
        escapeCondition: (player) => player.passiveIncome >= player.livingExpense * 1.2
    },
    challenge: {
        startingCash: 800,
        salary: 200,
        livingExpense: 120,
        escapeCondition: (player) => player.passiveIncome >= player.livingExpense + (player.livingExpense * 3)
    }
};

// ===================================
// 難易度別追加カード
// ===================================

// 中級者向けチャンスカード（normal以上で出現）
const ADVANCED_CHANCE_CARDS = [
    {
        id: 'AC01',
        type: 'chance',
        category: 'realEstate',
        name: 'マンション一室（ローン付）',
        icon: '🏢',
        description: '頭金100コイン、ローンで残りを払える。毎月の返済あり。',
        cost: 100,
        loanAmount: 200,
        loanPayment: 15,
        monthlyIncome: 25,
        difficulty: ['normal', 'challenge'],
        hint: 'レバレッジ: 少ない資金で大きな投資。でも返済は確実に来る'
    },
    {
        id: 'AC02',
        type: 'chance',
        category: 'stock',
        name: 'インデックスファンド',
        icon: '📊',
        description: '市場全体に投資。リスク分散されているが、市場全体の影響を受ける。',
        cost: 100,
        monthlyIncome: 5,
        volatility: 'low',
        difficulty: ['normal', 'challenge'],
        hint: '分散投資の基本。個別株より安定だが、大きく勝ちにくい'
    },
    {
        id: 'AC03',
        type: 'chance',
        category: 'business',
        name: 'フランチャイズ加盟',
        icon: '🏪',
        description: '有名チェーンの店を開ける。初期費用高いが、ブランド力あり。',
        cost: 300,
        monthlyIncome: 30,
        difficulty: ['normal', 'challenge'],
        hint: 'ブランド力を借りる代わりに、ロイヤリティを払う'
    },
    {
        id: 'AC04',
        type: 'chance',
        category: 'bond',
        name: '社債購入',
        icon: '📜',
        description: '会社にお金を貸す。利息は低めだが、安定している。',
        cost: 150,
        monthlyIncome: 8,
        riskLevel: 'low',
        difficulty: ['normal', 'challenge'],
        hint: '株より安全だが、リターンも控えめ。ポートフォリオの安定剤'
    },
    {
        id: 'AC05',
        type: 'chance',
        category: 'realEstate',
        name: 'REIT（不動産投資信託）',
        icon: '🏛️',
        description: '少額から不動産投資。分散されているが、市場の影響も受ける。',
        cost: 50,
        monthlyIncome: 3,
        difficulty: ['normal', 'challenge'],
        hint: '不動産に投資したいけど大金がない時の選択肢'
    }
];

// 上級者向けチャンスカード（challengeのみで出現）
const EXPERT_CHANCE_CARDS = [
    {
        id: 'EC01',
        type: 'chance',
        category: 'realEstate',
        name: '商業ビル投資',
        icon: '🏙️',
        description: '頭金200で購入可能。高利回りだが空室リスクも高い。',
        cost: 200,
        loanAmount: 600,
        loanPayment: 40,
        monthlyIncome: 60,
        vacancyRisk: 0.15,
        difficulty: ['challenge'],
        hint: 'キャップレート分析: (純営業収入÷物件価格)で利回りを計算'
    },
    {
        id: 'EC02',
        type: 'chance',
        category: 'stock',
        name: 'IPO株（新規上場）',
        icon: '🚀',
        description: '上場直後の株。大きく上がるか、下がるかわからない。',
        cost: 100,
        monthlyIncome: 0,
        potentialGain: 200,
        potentialLoss: 50,
        difficulty: ['challenge'],
        hint: 'ハイリスク・ハイリターン。宝くじ的要素あり'
    },
    {
        id: 'EC03',
        type: 'chance',
        category: 'business',
        name: 'スタートアップ出資',
        icon: '💡',
        description: '新しい会社への出資。成功すれば10倍、失敗すれば0。',
        cost: 150,
        monthlyIncome: 0,
        successChance: 0.2,
        successMultiplier: 10,
        difficulty: ['challenge'],
        hint: 'ベンチャーキャピタルの考え方: 10件中1件の大成功で全体を回収'
    },
    {
        id: 'EC04',
        type: 'chance',
        category: 'derivative',
        name: 'オプション取引',
        icon: '📈',
        description: '将来の価格で売買する権利。レバレッジが効くが、リスクも高い。',
        cost: 30,
        potentialGain: 150,
        potentialLoss: 30,
        difficulty: ['challenge'],
        hint: 'デリバティブは諸刃の剣。ヘッジにも投機にも使える'
    },
    {
        id: 'EC05',
        type: 'chance',
        category: 'realEstate',
        name: '海外不動産投資',
        icon: '🌍',
        description: '海外の物件。為替リスクあるが、分散効果も。',
        cost: 250,
        monthlyIncome: 20,
        currencyRisk: true,
        difficulty: ['challenge'],
        hint: '為替変動で利益も損失も増幅される。グローバル分散の一環'
    }
];

// 難易度別トラブルカード
const ADVANCED_TROUBLE_CARDS = [
    {
        id: 'AT01',
        type: 'trouble',
        category: 'market',
        name: '金利上昇',
        icon: '📊',
        description: '金利が上がった！ローン返済が10%増加。',
        effect: 'interestRateUp',
        effectValue: 0.1,
        difficulty: ['normal', 'challenge'],
        hint: '変動金利のリスク。固定金利なら影響なし'
    },
    {
        id: 'AT02',
        type: 'trouble',
        category: 'market',
        name: 'インフレ発生',
        icon: '💹',
        description: '物価が上がった！生活費が15%増加。',
        effect: 'inflation',
        effectValue: 0.15,
        difficulty: ['normal', 'challenge'],
        hint: 'インフレは現金の敵、資産の味方'
    },
    {
        id: 'AT03',
        type: 'trouble',
        category: 'tax',
        name: '税務調査',
        icon: '🏛️',
        description: '税金の計算ミスが発覚。追加で50コイン支払い。',
        cost: 50,
        difficulty: ['challenge'],
        hint: '節税と脱税は違う。正しい知識が必要'
    },
    {
        id: 'AT04',
        type: 'trouble',
        category: 'market',
        name: '市場暴落',
        icon: '📉',
        description: '株式市場が大暴落！株式資産が30%減少。',
        effect: 'marketCrash',
        effectValue: 0.3,
        difficulty: ['challenge'],
        hint: '暴落時は買い時？それとも逃げ時？メンタルが試される'
    },
    {
        id: 'AT05',
        type: 'trouble',
        category: 'legal',
        name: '訴訟リスク',
        icon: '⚖️',
        description: 'ビジネスで訴えられた。弁護士費用80コイン。',
        cost: 80,
        difficulty: ['challenge'],
        hint: 'ビジネスリスクの一つ。保険や法人化で対策可能'
    }
];

// 難易度別学習カード
const ADVANCED_LEARNING_CARDS = [
    {
        id: 'AL01',
        type: 'learning',
        category: 'finance',
        name: '複利の力を理解！',
        icon: '📈',
        description: '複利計算をマスター。投資判断がより正確に。',
        effect: 'compoundKnowledge',
        difficulty: ['normal', 'challenge'],
        hint: '72の法則: 72÷利率=資金が2倍になる年数'
    },
    {
        id: 'AL02',
        type: 'learning',
        category: 'finance',
        name: 'リスク分散を学ぶ',
        icon: '🎯',
        description: 'ポートフォリオ理論を習得。リスク管理+10%',
        effect: 'riskManagement',
        effectValue: 0.1,
        difficulty: ['normal', 'challenge'],
        hint: '相関の低い資産を組み合わせてリスクを下げる'
    },
    {
        id: 'AL03',
        type: 'learning',
        category: 'finance',
        name: 'レバレッジ戦略',
        icon: '⚡',
        description: '借入を使った投資戦略を習得。ローン金利-2%',
        effect: 'leverageSkill',
        effectValue: 0.02,
        difficulty: ['challenge'],
        hint: 'OPM(Other People\'s Money)を活用するが、両刃の剣'
    },
    {
        id: 'AL04',
        type: 'learning',
        category: 'tax',
        name: '税制優遇を発見！',
        icon: '🏛️',
        description: '合法的な節税方法を学ぶ。支出-10コイン/月',
        effect: 'taxOptimization',
        effectValue: 10,
        difficulty: ['challenge'],
        hint: '所得控除、税額控除、損益通算などを活用'
    },
    {
        id: 'AL05',
        type: 'learning',
        category: 'mindset',
        name: '投資家マインドセット',
        icon: '🧠',
        description: '長期視点を獲得。短期的な変動に動じなくなる。',
        effect: 'investorMindset',
        difficulty: ['normal', 'challenge'],
        hint: '感情に左右されず、データと論理で判断する'
    }
];

/**
 * 難易度に応じたカードデッキを取得
 */
function getCardsByDifficulty(cardType, difficulty) {
    let baseCards = [];
    let advancedCards = [];

    switch (cardType) {
        case 'chance':
            baseCards = [...CHANCE_CARDS];
            if (difficulty === 'normal' || difficulty === 'challenge') {
                advancedCards = ADVANCED_CHANCE_CARDS.filter(c =>
                    c.difficulty.includes(difficulty)
                );
            }
            if (difficulty === 'challenge') {
                advancedCards = advancedCards.concat(
                    EXPERT_CHANCE_CARDS.filter(c => c.difficulty.includes(difficulty))
                );
            }
            break;
        case 'trouble':
            baseCards = [...TROUBLE_CARDS];
            if (difficulty === 'normal' || difficulty === 'challenge') {
                advancedCards = ADVANCED_TROUBLE_CARDS.filter(c =>
                    c.difficulty.includes(difficulty)
                );
            }
            break;
        case 'learning':
            baseCards = [...LEARNING_CARDS];
            if (difficulty === 'normal' || difficulty === 'challenge') {
                advancedCards = ADVANCED_LEARNING_CARDS.filter(c =>
                    c.difficulty.includes(difficulty)
                );
            }
            break;
    }

    return [...baseCards, ...advancedCards];
}

/**
 * 難易度に応じたAIキャラクターを取得
 */
function getAICharactersForMode(mode) {
    return AI_CHARACTERS[mode] || AI_CHARACTERS.normal;
}

// グローバルに公開
window.getCardsByDifficulty = getCardsByDifficulty;
window.getAICharactersForMode = getAICharactersForMode;
