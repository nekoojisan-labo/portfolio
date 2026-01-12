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

// AI プレイヤー設定
const AI_PLAYERS = [
    {
        level: 1,
        name: 'まなぶくん',
        avatar: '🐻',
        personality: 'conservative', // 堅実型
        riskTolerance: 0.3,
        cooperationRate: 0.8
    },
    {
        level: 2,
        name: 'ひかりちゃん',
        avatar: '🦊',
        personality: 'balanced', // バランス型
        riskTolerance: 0.5,
        cooperationRate: 0.7
    },
    {
        level: 3,
        name: 'たくみくん',
        avatar: '🐼',
        personality: 'aggressive', // 積極型
        riskTolerance: 0.7,
        cooperationRate: 0.6
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
