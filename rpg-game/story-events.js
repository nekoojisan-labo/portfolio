// デウス・コード 八百万の神託 - ストーリーイベントシステム

class StoryEventSystem {
    constructor() {
        this.events = new Map();
        this.eventQueue = [];
        this.isEventPlaying = false;
        this.currentEvent = null;

        // イベントUI要素
        this.eventOverlay = null;
        this.eventTextBox = null;
        this.eventCharacterName = null;
        this.eventText = null;
        this.eventChoices = null;

        this.initializeUI();
        this.registerChapter1Events();

        console.log('📖 Story Event System initialized');
    }

    initializeUI() {
        // イベント用オーバーレイを作成
        this.eventOverlay = document.createElement('div');
        this.eventOverlay.id = 'eventOverlay';
        this.eventOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            flex-direction: column;
        `;

        // イベントテキストボックス
        this.eventTextBox = document.createElement('div');
        this.eventTextBox.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #00ffff;
            border-radius: 10px;
            padding: 30px;
            max-width: 700px;
            width: 90%;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
            font-family: 'Arial', sans-serif;
        `;

        // キャラクター名表示
        this.eventCharacterName = document.createElement('div');
        this.eventCharacterName.style.cssText = `
            color: #00ffff;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        `;

        // イベントテキスト
        this.eventText = document.createElement('div');
        this.eventText.style.cssText = `
            color: #ffffff;
            font-size: 18px;
            line-height: 1.8;
            margin-bottom: 20px;
            min-height: 100px;
        `;

        // 選択肢コンテナ
        this.eventChoices = document.createElement('div');
        this.eventChoices.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        // 続行ボタン
        this.continueButton = document.createElement('button');
        this.continueButton.textContent = '次へ →';
        this.continueButton.style.cssText = `
            background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
            border: none;
            border-radius: 5px;
            padding: 12px 30px;
            color: #000000;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            align-self: flex-end;
            transition: all 0.3s;
        `;
        this.continueButton.onmouseover = () => {
            this.continueButton.style.transform = 'scale(1.05)';
            this.continueButton.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
        };
        this.continueButton.onmouseout = () => {
            this.continueButton.style.transform = 'scale(1)';
            this.continueButton.style.boxShadow = 'none';
        };

        this.eventTextBox.appendChild(this.eventCharacterName);
        this.eventTextBox.appendChild(this.eventText);
        this.eventTextBox.appendChild(this.eventChoices);
        this.eventTextBox.appendChild(this.continueButton);
        this.eventOverlay.appendChild(this.eventTextBox);
        document.body.appendChild(this.eventOverlay);
    }

    // イベントを登録
    registerEvent(eventId, eventData) {
        this.events.set(eventId, eventData);
    }

    // チャプター1のイベントを登録
    registerChapter1Events() {
        // イベント1: アカリとの出会い（ゲーム開始直後）
        this.registerEvent('chapter1_start', {
            trigger: 'auto',
            requiredFlags: {},
            scenes: [
                {
                    character: 'カイト',
                    text: 'ここが新宿商店街...アカリはどこだ？'
                },
                {
                    character: 'アカリ',
                    text: 'カイト！こっちよ！'
                },
                {
                    character: 'アカリ',
                    text: '大変なの...地下鉄の奥で、アークの機械兵が暴走してるって噂があるの。'
                },
                {
                    character: 'カイト',
                    text: '機械兵が？でも、アークはすべてを完璧に管理しているはずじゃ...'
                },
                {
                    character: 'アカリ',
                    text: '私もよく分からないけど...カイト、あなたの手のその紋様...もしかして？'
                },
                {
                    character: 'カイト',
                    text: '神威の力...か。俺にも何が起きているのか分からない。'
                },
                {
                    character: 'アカリ',
                    text: '一人で行くのは危険よ。私も一緒に行く！昔から私たち、ずっと一緒だったでしょ？'
                },
                {
                    character: 'システム',
                    text: 'アカリが仲間に加わった！'
                }
            ],
            onComplete: (storyFlags, player, partySystem) => {
                storyFlags.metAkari = true;
                storyFlags.chapter1_started = true;
                // アカリをパーティに追加
                if (partySystem && window.CHARACTER_DATA) {
                    const akari = { ...window.CHARACTER_DATA.akari };
                    partySystem.addMember(akari);

                    // アカリの初期習得スキル
                    if (window.magicSystem) {
                        window.magicSystem.learnMagic('heal', akari);
                        window.magicSystem.learnMagic('mega_heal', akari);
                        console.log('✅ アカリが初期スキルを習得: heal, mega_heal');
                    }
                }
                console.log('✅ Chapter 1 started - Akari joined the party');
            }
        });

        // イベント2: 地下鉄入口での警告
        this.registerEvent('subway_entrance_warning', {
            trigger: 'location',
            location: 'subway_entrance',
            requiredFlags: { chapter1_started: true },
            oneTime: true,
            scenes: [
                {
                    character: 'アカリ',
                    text: 'この先が地下鉄よ...本当に行くの？'
                },
                {
                    character: 'カイト',
                    text: 'ああ。この力の意味を知るためにも、真実を確かめないと。'
                },
                {
                    character: 'アカリ',
                    text: 'わかった。私がサポートするから！気をつけて進みましょう。'
                }
            ],
            onComplete: (storyFlags) => {
                storyFlags.subway_warning_seen = true;
                console.log('✅ Subway entrance warning shown');
            }
        });

        // イベント3: 初めての神威発動
        this.registerEvent('first_kamui_awakening', {
            trigger: 'battle_start',
            requiredFlags: { chapter1_started: true },
            oneTime: true,
            scenes: [
                {
                    character: 'カイト',
                    text: '（この力...体の奥底から湧き上がってくる）'
                },
                {
                    character: 'アカリ',
                    text: 'カイト、あなたの体が光ってる！'
                },
                {
                    character: 'カイト',
                    text: 'これが...神威の力！'
                },
                {
                    character: 'システム',
                    text: '神威スキル「炎神の息吹」を習得した！'
                }
            ],
            onComplete: (storyFlags, player, partySystem, magicSystem) => {
                storyFlags.kamui_awakened = true;
                // 炎神の息吹を習得（既存のfire_boltスキル）
                if (magicSystem) {
                    magicSystem.learnMagic('fire_bolt');
                }
                console.log('✅ First Kamui awakening - Fire skill learned');
            }
        });

        // イベント4: 神社への道
        this.registerEvent('shrine_path_opens', {
            trigger: 'boss_defeat',
            bossId: 'corrupted_drone_boss',
            scenes: [
                {
                    character: 'アカリ',
                    text: 'やった！カイト、すごい力ね...'
                },
                {
                    character: 'カイト',
                    text: 'この力...まだ完全にはコントロールできない。'
                },
                {
                    character: '？？？',
                    text: '神威の力に目覚めし者よ...'
                },
                {
                    character: 'アカリ',
                    text: '誰！？'
                },
                {
                    character: '謎の声',
                    text: '明治神宮の社にて、汝を待つ者あり。八百万の神々の意志を知りたくば、参れ。'
                },
                {
                    character: 'カイト',
                    text: '神々の意志...？'
                },
                {
                    character: 'システム',
                    text: '新エリア「明治神宮」への道が開かれた！'
                }
            ],
            onComplete: (storyFlags, player, partySystem, mapSystem) => {
                storyFlags.shrine_unlocked = true;
                storyFlags.chapter1_complete = true;
                // 神社マップへのアクセスを解放
                console.log('✅ Shrine path opened - Chapter 1 complete');
            }
        });
    }

    // イベントをトリガー
    triggerEvent(eventId, context = {}) {
        const event = this.events.get(eventId);
        if (!event) {
            console.warn(`Event not found: ${eventId}`);
            return false;
        }

        // フラグチェック
        if (event.requiredFlags) {
            const storyFlags = context.storyFlags || window.storyFlags || {};
            for (const [flag, value] of Object.entries(event.requiredFlags)) {
                if (storyFlags[flag] !== value) {
                    console.log(`Event ${eventId} skipped - flag ${flag} not met`);
                    return false;
                }
            }
        }

        // 一度だけのイベントチェック
        if (event.oneTime) {
            const storyFlags = context.storyFlags || window.storyFlags || {};
            const completedFlag = `${eventId}_completed`;
            if (storyFlags[completedFlag]) {
                console.log(`Event ${eventId} already completed`);
                return false;
            }
        }

        // イベント実行
        this.playEvent(eventId, event, context);
        return true;
    }

    // イベントを再生
    playEvent(eventId, event, context) {
        this.isEventPlaying = true;
        this.currentEvent = { id: eventId, data: event, context, sceneIndex: 0 };

        // ゲームを一時停止
        if (window.gameLoopRunning) {
            window.pauseGame = true;
        }

        // 最初のシーンを表示
        this.showScene();
    }

    // シーンを表示
    showScene() {
        if (!this.currentEvent) return;

        const { data, sceneIndex } = this.currentEvent;
        const scene = data.scenes[sceneIndex];

        if (!scene) {
            // イベント終了
            this.endEvent();
            return;
        }

        // UIを表示
        this.eventOverlay.style.display = 'flex';
        this.eventCharacterName.textContent = scene.character;
        this.eventText.innerHTML = scene.text.replace(/\n/g, '<br>');

        // 選択肢をクリア
        this.eventChoices.innerHTML = '';

        // 選択肢がある場合
        if (scene.choices) {
            this.continueButton.style.display = 'none';
            scene.choices.forEach((choice, index) => {
                const button = document.createElement('button');
                button.textContent = choice.text;
                button.style.cssText = `
                    background: linear-gradient(135deg, #0080ff 0%, #0040ff 100%);
                    border: 2px solid #00ffff;
                    border-radius: 5px;
                    padding: 12px 20px;
                    color: #ffffff;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                `;
                button.onmouseover = () => {
                    button.style.transform = 'translateX(10px)';
                    button.style.borderColor = '#ffff00';
                };
                button.onmouseout = () => {
                    button.style.transform = 'translateX(0)';
                    button.style.borderColor = '#00ffff';
                };
                button.onclick = () => {
                    if (choice.action) {
                        choice.action(this.currentEvent.context);
                    }
                    this.nextScene();
                };
                this.eventChoices.appendChild(button);
            });
        } else {
            // 通常の続行ボタン
            this.continueButton.style.display = 'block';
            this.continueButton.onclick = () => this.nextScene();
        }

        // キーボードイベント（Zキー、Spaceキー、Enterキーで次へ）
        const keyHandler = (e) => {
            if (e.key === 'z' || e.key === 'Z' || e.key === ' ' || e.key === 'Enter') {
                if (!scene.choices) {
                    e.preventDefault();
                    this.nextScene();
                    document.removeEventListener('keydown', keyHandler);
                }
            }
        };
        document.addEventListener('keydown', keyHandler);
    }

    // 次のシーンへ
    nextScene() {
        if (!this.currentEvent) return;

        this.currentEvent.sceneIndex++;
        this.showScene();
    }

    // イベント終了
    endEvent() {
        if (!this.currentEvent) return;

        const { id, data, context } = this.currentEvent;

        // 完了処理を実行
        if (data.onComplete) {
            data.onComplete(
                context.storyFlags || window.storyFlags,
                context.player || window.player,
                context.partySystem || window.partySystem,
                context.magicSystem || window.magicSystem,
                context.mapSystem || window.mapSystem
            );
        }

        // 一度だけのイベントフラグを設定
        if (data.oneTime) {
            const storyFlags = context.storyFlags || window.storyFlags;
            if (storyFlags) {
                storyFlags[`${id}_completed`] = true;
            }
        }

        // UIを隠す
        this.eventOverlay.style.display = 'none';

        // ゲーム再開
        if (window.pauseGame !== undefined) {
            window.pauseGame = false;
        }

        this.isEventPlaying = false;
        this.currentEvent = null;

        console.log(`✅ Event completed: ${id}`);
    }

    // ゲーム開始時の自動イベントをチェック
    checkAutoEvents(context) {
        for (const [eventId, event] of this.events.entries()) {
            if (event.trigger === 'auto') {
                // まだ再生されていないイベントのみ
                const storyFlags = context.storyFlags || window.storyFlags || {};
                if (!storyFlags[`${eventId}_completed`]) {
                    setTimeout(() => {
                        this.triggerEvent(eventId, context);
                    }, 1000); // 1秒後に再生
                    break; // 一度に一つだけ
                }
            }
        }
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.StoryEventSystem = StoryEventSystem;
}
