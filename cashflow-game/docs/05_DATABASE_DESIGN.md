# マネーアドベンチャー データベース設計書

## 1. 技術選定

### 推奨構成
```
┌─────────────────────────────────────────────────────┐
│  Firebase (推奨)                                    │
├─────────────────────────────────────────────────────┤
│  Firestore     → ゲームデータ、ユーザーデータ       │
│  Realtime DB   → リアルタイム同期（マルチプレイ）   │
│  Auth          → 認証（匿名/Google/メール）         │
│  Hosting       → Webアプリホスティング              │
└─────────────────────────────────────────────────────┘
```

### 代替構成
```
Supabase: PostgreSQL + リアルタイム
Vercel + PlanetScale: Next.js + MySQL
```

---

## 2. コレクション設計（Firestore）

### 2.1 コレクション一覧

```
firestore/
├── users/                 # ユーザー情報
├── games/                 # ゲームセッション
├── players/               # プレイヤー状態（サブコレクション）
├── trades/                # 取引履歴
├── events/                # イベント履歴
└── statistics/            # 統計データ
```

---

## 3. スキーマ定義

### 3.1 Users（ユーザー）

```typescript
interface User {
  id: string;                    // Firebase Auth UID
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // プロフィール
  profile: {
    displayName: string;         // 表示名
    avatar: string;              // アバターID
    ageGroup: 'child' | 'teen' | 'adult';  // 年齢層
  };

  // 設定
  settings: {
    preferredMode: 'easy' | 'normal' | 'challenge';
    soundEnabled: boolean;
    furiganaEnabled: boolean;    // ふりがな表示
    tutorialCompleted: boolean;
  };

  // 統計
  stats: {
    gamesPlayed: number;         // プレイ回数
    gamesCompleted: number;      // クリア回数
    totalEscapes: number;        // 脱出回数
    cooperationCount: number;    // 協力回数
    totalExperience: number;     // 累計経験値
  };

  // 実績
  achievements: string[];        // 獲得済み実績ID
}
```

### 3.2 Games（ゲームセッション）

```typescript
interface Game {
  id: string;                    // ゲームID
  roomCode: string;              // 参加用コード（8桁）
  createdAt: Timestamp;
  updatedAt: Timestamp;
  hostId: string;                // ホストユーザーID

  // ゲーム設定
  settings: {
    mode: 'easy' | 'normal' | 'challenge';
    maxTurns: number | null;     // 最大ターン数（nullは無制限）
    aiCount: number;             // AIプレイヤー数
    aiLevels: number[];          // 各AIのレベル
  };

  // ゲーム状態
  status: 'waiting' | 'playing' | 'paused' | 'completed';
  currentTurn: number;
  currentPhase: Phase;
  currentPlayerId: string;
  turnOrder: string[];           // プレイヤーIDの順序

  // 市場状態
  market: {
    condition: 'boom' | 'stable' | 'recession';
    interestRate: number;        // 金利（ふつうモード以上）
    eventModifier: number;       // イベント発生率補正
  };

  // 結果（完了時）
  result?: {
    completedAt: Timestamp;
    totalTurns: number;
    allEscaped: boolean;
    escapedPlayers: string[];
    mvpPlayerId: string;
    cooperationBonus: number;
  };
}

type Phase =
  | 'income'      // 収入フェーズ
  | 'expense'     // 支出フェーズ
  | 'event'       // イベントフェーズ
  | 'action'      // 行動フェーズ
  | 'cooperation' // 協力フェーズ
  | 'check';      // チェックフェーズ
```

### 3.3 Players（プレイヤー状態）

```typescript
// games/{gameId}/players/{playerId}
interface Player {
  id: string;
  oderId: string | null;        // null = AI
  name: string;
  avatar: string;
  isAI: boolean;
  aiLevel?: number;              // AIの場合のレベル（1-5）
  joinedAt: Timestamp;

  // 財務状態
  finance: {
    cash: number;                // 現金
    salary: number;              // 給料（労働収入）
    passiveIncome: number;       // 不労所得
    totalIncome: number;         // 合計収入
    livingExpense: number;       // 生活費
    loanPayment: number;         // ローン返済
    totalExpense: number;        // 合計支出
    monthlyCashflow: number;     // 月間キャッシュフロー
  };

  // 資産
  assets: Asset[];

  // 負債
  liabilities: Liability[];

  // ゲーム状態
  status: {
    position: number;            // ボード上の位置
    isEscaped: boolean;          // 脱出済みか
    escapedTurn: number | null;  // 脱出したターン
    consecutiveSuccess: number;  // 連続達成ターン数
    isMentor: boolean;           // メンターか
    isBankrupt: boolean;         // 破綻したか
  };

  // スキル（ふつうモード以上）
  skills: Skill[];

  // 脱出進捗
  escapeProgress: number;        // 0-100%

  // 統計
  turnStats: {
    investmentCount: number;
    successfulInvestments: number;
    cooperationCount: number;
    hintsUsed: number;
  };
}

interface Asset {
  id: string;
  type: 'realEstate' | 'stock' | 'business';
  name: string;
  purchasePrice: number;         // 購入価格
  currentValue: number;          // 現在価値
  monthlyIncome: number;         // 月間収入
  risk: 'low' | 'medium' | 'high';
  purchasedTurn: number;
  isShared: boolean;             // 共同購入か
  shareRatio?: number;           // 持ち分比率（0-1）
  sharedWith?: string[];         // 共同購入者ID
}

interface Liability {
  id: string;
  type: 'mortgage' | 'carLoan' | 'personalLoan' | 'playerLoan';
  name: string;
  originalAmount: number;        // 元の金額
  remainingAmount: number;       // 残高
  monthlyPayment: number;        // 月々の支払い
  interestRate: number;          // 金利
  remainingTerms: number;        // 残り回数
  lenderId?: string;             // 貸主ID（プレイヤーローンの場合）
}

interface Skill {
  id: string;
  name: string;
  type: 'repair' | 'sales' | 'negotiation' | 'analysis';
  level: number;
  acquiredTurn: number;
}
```

### 3.4 Trades（取引履歴）

```typescript
// games/{gameId}/trades/{tradeId}
interface Trade {
  id: string;
  createdAt: Timestamp;
  executedAt: Timestamp | null;
  turn: number;

  // 取引タイプ
  type: 'loan' | 'jointPurchase' | 'gift' | 'skillTrade';

  // 参加者
  initiatorId: string;           // 提案者
  participants: string[];        // 参加者全員

  // 取引内容
  details: LoanDetails | JointPurchaseDetails | GiftDetails | SkillTradeDetails;

  // 状態
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

  // 承認状況
  approvals: {
    [playerId: string]: boolean;
  };
}

interface LoanDetails {
  lenderId: string;
  borrowerId: string;
  amount: number;
  interestRate: number;
  monthlyPayment: number;
  totalPayments: number;
  remainingPayments: number;
}

interface JointPurchaseDetails {
  assetId: string;
  assetName: string;
  totalCost: number;
  contributions: {
    [playerId: string]: {
      amount: number;
      ratio: number;
    };
  };
  monthlyIncome: number;
}

interface GiftDetails {
  giverId: string;
  receiverId: string;
  amount: number;
  giftNumber: number;            // 何回目のギフトか
}

interface SkillTradeDetails {
  providerId: string;
  clientId: string;
  skillType: string;
  fee: number;
  isSuccessBasedFee: boolean;
}
```

### 3.5 Events（イベント履歴）

```typescript
// games/{gameId}/events/{eventId}
interface GameEvent {
  id: string;
  timestamp: Timestamp;
  turn: number;
  playerId: string;

  // イベントタイプ
  type: 'cardDraw' | 'purchase' | 'sale' | 'loan' | 'payment'
      | 'trade' | 'escape' | 'bankruptcy' | 'rescue' | 'hint';

  // イベント詳細
  details: {
    cardId?: string;             // カードID
    assetId?: string;            // 資産ID
    amount?: number;             // 金額
    description: string;         // 説明文
  };

  // 結果
  result: {
    success: boolean;
    cashChange: number;
    incomeChange: number;
    expenseChange: number;
    message: string;
  };
}
```

### 3.6 Statistics（統計データ）

```typescript
// statistics/{userId}
interface UserStatistics {
  userId: string;
  updatedAt: Timestamp;

  // ゲーム統計
  games: {
    total: number;
    completed: number;
    abandoned: number;
    averageTurnsToEscape: number;
    fastestEscape: number;
  };

  // 財務統計
  finance: {
    totalEarned: number;
    totalSpent: number;
    totalInvested: number;
    bestPassiveIncome: number;
    averageCashflow: number;
  };

  // 協力統計
  cooperation: {
    totalTrades: number;
    loansGiven: number;
    loansReceived: number;
    jointPurchases: number;
    giftsGiven: number;
    giftsReceived: number;
  };

  // 学習統計
  learning: {
    hintsUsed: number;
    termsLearned: string[];
    skillsAcquired: string[];
  };
}
```

---

## 4. インデックス設計

### 4.1 Firestore インデックス

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "games",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "roomCode", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "players",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "oderId", "order": "ASCENDING" },
        { "fieldPath": "status.isEscaped", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "trades",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 5. セキュリティルール

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ユーザーデータ
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // ゲームデータ
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null
        && (isHost(gameId) || isPlayer(gameId));
      allow delete: if isHost(gameId);

      // プレイヤーデータ
      match /players/{playerId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null
          && (isHost(gameId) || request.auth.uid == playerId);
      }

      // 取引データ
      match /trades/{tradeId} {
        allow read: if isPlayer(gameId);
        allow create: if isPlayer(gameId);
        allow update: if isPlayer(gameId)
          && isParticipant(tradeId);
      }

      // イベントデータ
      match /events/{eventId} {
        allow read: if isPlayer(gameId);
        allow create: if isPlayer(gameId);
      }
    }

    // 統計データ
    match /statistics/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // ヘルパー関数
    function isHost(gameId) {
      return get(/databases/$(database)/documents/games/$(gameId)).data.hostId == request.auth.uid;
    }

    function isPlayer(gameId) {
      return exists(/databases/$(database)/documents/games/$(gameId)/players/$(request.auth.uid));
    }

    function isParticipant(tradeId) {
      let trade = get(/databases/$(database)/documents/games/$(gameId)/trades/$(tradeId)).data;
      return request.auth.uid in trade.participants;
    }
  }
}
```

---

## 6. リアルタイム同期設計

### 6.1 Realtime Database 構造

```javascript
// マルチプレイ用のリアルタイムデータ
{
  "rooms": {
    "{roomCode}": {
      "gameId": "xxx",
      "status": "playing",
      "currentTurn": 5,
      "currentPhase": "action",
      "currentPlayerId": "player1",
      "lastUpdate": 1234567890,
      "players": {
        "player1": {
          "name": "たろう",
          "avatar": "cat",
          "isOnline": true,
          "lastSeen": 1234567890,
          "escapeProgress": 45
        },
        // ...
      },
      "pendingTrade": {
        "id": "trade1",
        "type": "loan",
        "initiatorId": "player1",
        "status": "pending"
      },
      "chat": {
        "message1": {
          "senderId": "player1",
          "text": "一緒に買わない？",
          "timestamp": 1234567890
        }
      }
    }
  },
  "presence": {
    "{oderId}": {
      "online": true,
      "lastSeen": 1234567890,
      "currentRoom": "MONEY1234"
    }
  }
}
```

### 6.2 同期イベント

```typescript
// リアルタイム同期するイベント
type RealtimeEvent =
  | { type: 'PLAYER_JOINED'; playerId: string }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'TURN_CHANGED'; playerId: string; turn: number }
  | { type: 'PHASE_CHANGED'; phase: Phase }
  | { type: 'TRADE_PROPOSED'; trade: Trade }
  | { type: 'TRADE_RESPONDED'; tradeId: string; playerId: string; approved: boolean }
  | { type: 'PLAYER_ESCAPED'; playerId: string }
  | { type: 'GAME_COMPLETED'; result: GameResult }
  | { type: 'CHAT_MESSAGE'; message: ChatMessage };
```

---

## 7. データマイグレーション

### 7.1 バージョン管理

```typescript
interface SchemaVersion {
  version: string;
  migratedAt: Timestamp;
  changes: string[];
}

// 例: v1.0.0 → v1.1.0
const migration_1_1_0 = {
  version: '1.1.0',
  up: async (db: Firestore) => {
    // ふつうモード追加に伴う変更
    const games = await db.collection('games').get();
    for (const game of games.docs) {
      await game.ref.update({
        'settings.mode': game.data().settings.mode || 'easy',
        'market.interestRate': 0
      });
    }
  },
  down: async (db: Firestore) => {
    // ロールバック処理
  }
};
```

---

## 8. バックアップ戦略

```
┌─────────────────────────────────────────────────────┐
│  バックアップスケジュール                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  毎日: 増分バックアップ（Cloud Functions）          │
│  毎週: 完全バックアップ（Firestore Export）         │
│  毎月: アーカイブ（Cloud Storage Coldline）         │
│                                                     │
│  保持期間:                                          │
│  - 日次: 7日間                                      │
│  - 週次: 4週間                                      │
│  - 月次: 12ヶ月                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 9. パフォーマンス考慮

### 9.1 クエリ最適化

```typescript
// 悪い例: 全件取得
const allGames = await db.collection('games').get();

// 良い例: 必要なデータのみ取得
const activeGames = await db.collection('games')
  .where('status', '==', 'playing')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
```

### 9.2 キャッシュ戦略

```typescript
// クライアント側キャッシュ設定
firebase.firestore().settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// オフライン対応
firebase.firestore().enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // 複数タブで開いている
    } else if (err.code === 'unimplemented') {
      // ブラウザ非対応
    }
  });
```

---

## 10. 初期データ

### 10.1 マスターデータ

```typescript
// カードマスター
const cardMaster = {
  chanceCards: [...],   // 03_EVENT_CARDS.md 参照
  troubleCards: [...],
  learningCards: [...]
};

// 職業マスター（将来拡張用）
const jobMaster = [
  { id: 'teacher', name: '先生', salary: 100, expense: 60 },
  { id: 'engineer', name: 'エンジニア', salary: 120, expense: 70 },
  { id: 'doctor', name: 'お医者さん', salary: 150, expense: 90 },
  // ...
];

// アバターマスター
const avatarMaster = [
  { id: 'cat', name: 'ねこ', emoji: '🐱' },
  { id: 'dog', name: 'いぬ', emoji: '🐶' },
  { id: 'rabbit', name: 'うさぎ', emoji: '🐰' },
  { id: 'bear', name: 'くま', emoji: '🐻' },
  // ...
];
```
