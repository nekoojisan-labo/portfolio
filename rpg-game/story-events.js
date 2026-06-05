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
        this.registerChapter2Events();

        console.log('📖 Story Event System initialized');
    }

    initializeUI() {
        // ゲーム画面下のメッセージパネルを参照（HTML側で定義済み）
        this.panelEl = document.getElementById('gameMessagePanel');
        if (!this.panelEl) {
            console.warn('[StoryEvents] gameMessagePanel not found in DOM');
            return;
        }

        this.headerEl = this.panelEl.querySelector('.game-msg-header');
        this.eventCharacterName = document.getElementById('gameMessageCharacter');
        this.eventText = document.getElementById('gameMessageBody');
        this.eventChoices = document.getElementById('gameMessageChoices');
        this.nextIndicator = document.getElementById('gameMessageNextIndicator');
        this.hintEl = document.getElementById('gameMessageHint');
        this.controlsEl = this.panelEl.querySelector('.game-msg-controls');

        // VN会話ポートレート
        this.vnPortraits = document.getElementById('vnPortraits');
        this.vnLeft = document.getElementById('vnPortraitLeft');
        this.vnRight = document.getElementById('vnPortraitRight');
        // 話者名 → ポートレートのキャラキー
        this.PORTRAIT_KEYS = { 'カイト': 'kaito', 'アカリ': 'akari', 'リク': 'riku', 'ヤミ': 'yami' };
        this.vnLeftKey = null;   // 左に立っているキャラキー
        this.vnRightKey = null;  // 右

        // 互換性のため eventOverlay/eventTextBox/continueButton 参照は残す（旧コードからの呼び出し対策）
        this.eventOverlay = this.panelEl;
        this.eventTextBox = this.panelEl;
        this.continueButton = document.createElement('button');
        this.continueButton.style.display = 'none';

        // パネルクリックで進行
        this.panelEl.addEventListener('click', (e) => {
            if (e.target && e.target.classList && e.target.classList.contains('game-msg-choice')) return;
            // オープニング中は同じパネルを使い回しているので、
            // story-event 側の handleAdvance には流さない
            if (window.openingTypewriterActive) return;
            this.handleAdvance();
        });

        // タイプライター・ページ管理用の状態
        this.typeTimer = null;
        this.typeFullText = '';
        this.typeIndex = 0;
        this.typeDone = false;
        this.currentScenePages = [];
        this.currentScenePageIndex = 0;

        // キーハンドラ（イベント中のみ有効化）
        this.keyHandler = null;
    }

    static escapeHTML(text) {
        return (text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    static paginateText(text) {
        const trimmed = (text || '').trim();
        if (!trimmed) return [''];
        const paragraphs = trimmed.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        if (paragraphs.length === 0) return [trimmed];
        const MAX_PARA = 2;
        const MAX_CHARS = 110;
        const pages = [];
        let buffer = [], chars = 0;
        const flush = () => {
            if (buffer.length) {
                pages.push(buffer.join('\n\n'));
                buffer = []; chars = 0;
            }
        };
        paragraphs.forEach(p => {
            if (buffer.length >= MAX_PARA || (chars + p.length > MAX_CHARS && buffer.length > 0)) {
                flush();
            }
            buffer.push(p);
            chars += p.length;
        });
        flush();
        return pages.length ? pages : [trimmed];
    }

    setNextIndicator(show) {
        if (this.nextIndicator) {
            this.nextIndicator.classList.toggle('hidden', !show);
        }
    }

    renderTypewriter(partial, showCursor) {
        const html = StoryEventSystem.escapeHTML(partial).replace(/\n/g, '<br>');
        const cursor = showCursor
            ? '<span class="game-msg-typewriter-cursor">▌</span>'
            : '';
        this.eventText.innerHTML = html + cursor;
        this.eventText.scrollTop = this.eventText.scrollHeight;
    }

    finishTypewriter() {
        if (this.typeTimer) {
            clearInterval(this.typeTimer);
            this.typeTimer = null;
        }
        this.typeIndex = this.typeFullText.length;
        this.renderTypewriter(this.typeFullText, false);
        this.typeDone = true;
        this.setNextIndicator(true);
    }

    startTypewriter(text) {
        if (this.typeTimer) {
            clearInterval(this.typeTimer);
            this.typeTimer = null;
        }
        this.typeFullText = text || '';
        this.typeIndex = 0;
        this.typeDone = false;
        this.renderTypewriter('', true);
        this.setNextIndicator(false);

        const INTERVAL = 45;
        this.typeTimer = setInterval(() => {
            this.typeIndex++;
            if (this.typeIndex >= this.typeFullText.length) {
                this.finishTypewriter();
                return;
            }
            this.renderTypewriter(
                this.typeFullText.substring(0, this.typeIndex),
                true
            );
        }, INTERVAL);
    }

    // クリック / キー入力での進行（タイプ中→全文表示、完了済→次ページorシーン）
    handleAdvance() {
        if (!this.currentEvent) return;
        const scene = this.currentEvent.data.scenes[this.currentEvent.sceneIndex];
        // 選択肢のあるシーンでは進行しない
        if (scene && scene.choices) return;

        if (this.typeTimer && !this.typeDone) {
            this.finishTypewriter();
            return;
        }
        // 現シーンに次ページが残っていれば次ページへ
        if (this.currentScenePageIndex + 1 < this.currentScenePages.length) {
            this.currentScenePageIndex++;
            this.startTypewriter(this.currentScenePages[this.currentScenePageIndex]);
            return;
        }
        // 次のシーンへ
        this.nextScene();
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
            location: 'subway_concourse_a',
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

    // チャプター2/3のイベント（神託・エンディング）
    registerChapter2Events() {
        // 老神主の神託（神宮で老神主に話しかけた時に index.html から発火）
        this.registerEvent('priest_oracle', {
            trigger: 'manual',
            scenes: [
                { character: '老神主', text: 'よく来た、神威の力に目覚めし者よ。わしはこの社を守りし最後の神主じゃ。' },
                { character: '老神主', text: 'アーク...あの機械仕掛けの神は、人から「心」を奪い、完全なる管理で世を凍りつかせた。' },
                { character: 'カイト', text: '感情を失った市民たち...あれはアークの仕業だったのか。' },
                { character: '老神主', text: 'アークの中枢は東京都庁にある。だが、お前一人の力では届かぬ。八百万の神々が遣わした同志を集めよ。' },
                { character: '老神主', text: 'バイオドームに眠る守りの戦士「リク」、闇市に潜む魔を操る者「ヤミ」。二人を仲間にし、都庁へ挑むのじゃ。' },
                { character: 'アカリ', text: 'リクとヤミ...その二人を探せばいいのね。' },
                { character: 'システム', text: '目標が更新された：リクとヤミを仲間にする' }
            ],
            onComplete: (storyFlags) => {
                storyFlags.metPriest = true;
                storyFlags.chapter2_started = true;
                console.log('✅ Priest oracle - Chapter 2 started');
            }
        });

        // アーク・プライム撃破エンディング（都庁最上階のボス撃破時に発火）
        this.registerEvent('arc_defeated_ending', {
            trigger: 'manual',
            scenes: [
                { character: 'アーク・プライム', text: 'バカな...完全なる秩序が...人間ごときの「不確定」に...敗れる...だと...' },
                { character: 'カイト', text: '秩序だけじゃ、人は生きられない。喜びも、痛みも、全部ひっくるめて人間なんだ。' },
                { character: 'アカリ', text: '見て、カイト...街に色が戻ってくる。みんなの表情が...' },
                { character: 'リク', text: '人々の心が、戻り始めている。俺たちは、やったんだ。' },
                { character: 'ヤミ', text: '...悪くない結末ね。八百万の神々も、満足でしょう。' },
                { character: 'システム', text: '【八百万の神託 — 完】\nアークは倒れ、東京に心が戻った。ご褒美に、裏ダンジョン「深層トンネル」が解放された。' }
            ],
            onComplete: (storyFlags) => {
                storyFlags.arcDefeated = true;
                storyFlags.chapter3_complete = true;
                storyFlags.gameCleared = true;
                console.log('✅ Arc Prime defeated - Game cleared!');
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

        // VN会話ポートレートの配役（このイベントに出る話者から左右を決める）
        this.setupPortraits(event);

        // 最初のシーンを表示
        this.showScene();
    }

    // このイベントの話者からポートレートの左右を決めて立てる
    setupPortraits(event) {
        if (!this.vnPortraits || !this.vnLeft || !this.vnRight) return;
        this.vnLeftKey = null;
        this.vnRightKey = null;
        const keysInOrder = [];
        for (const sc of (event.scenes || [])) {
            const k = this.PORTRAIT_KEYS[sc.character];
            if (k && !keysInOrder.includes(k)) keysInOrder.push(k);
        }
        if (keysInOrder.length === 0) {
            // 立ち絵が無いイベント（システム/NPCのみ）はポートレート非表示
            this.vnPortraits.classList.remove('active');
            this.vnLeft.classList.remove('shown', 'speaking');
            this.vnRight.classList.remove('shown', 'speaking');
            return;
        }
        // 主人公(kaito)は左固定、相手は右。kaitoが居なければ先頭を左に。
        if (keysInOrder.includes('kaito')) {
            this.vnLeftKey = 'kaito';
            this.vnRightKey = keysInOrder.find(k => k !== 'kaito') || null;
        } else {
            this.vnLeftKey = keysInOrder[0];
            this.vnRightKey = keysInOrder[1] || null;
        }
        this._applyPortrait(this.vnLeft, this.vnLeftKey);
        this._applyPortrait(this.vnRight, this.vnRightKey);
        this.vnPortraits.classList.add('active');
    }

    _applyPortrait(imgEl, key) {
        if (!imgEl) return;
        if (!key) { imgEl.classList.remove('shown', 'speaking'); imgEl.removeAttribute('src'); return; }
        const webp = `assets/characters/${key}_portrait.webp`;
        imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = `assets/characters/${key}_portrait.png`; };
        imgEl.src = webp;
        imgEl.classList.add('shown');
        imgEl.classList.remove('speaking');
    }

    // 現在の話者をハイライト
    updateSpeaker(characterName) {
        if (!this.vnPortraits) return;
        const key = this.PORTRAIT_KEYS[characterName] || null;
        if (this.vnLeft) this.vnLeft.classList.toggle('speaking', !!key && key === this.vnLeftKey);
        if (this.vnRight) this.vnRight.classList.toggle('speaking', !!key && key === this.vnRightKey);
    }

    hidePortraits() {
        if (!this.vnPortraits) return;
        this.vnPortraits.classList.remove('active');
        if (this.vnLeft) this.vnLeft.classList.remove('shown', 'speaking');
        if (this.vnRight) this.vnRight.classList.remove('shown', 'speaking');
        this.vnLeftKey = this.vnRightKey = null;
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

        // パネルを表示
        this.panelEl.classList.add('active');
        this.panelEl.setAttribute('aria-hidden', 'false');

        // ヘッダ（キャラ名）
        const characterName = scene.character || '';
        if (characterName) {
            this.eventCharacterName.textContent = characterName;
            this.headerEl.classList.add('active');
        } else {
            this.headerEl.classList.remove('active');
        }
        // VNポートレート: 現在の話者をハイライト
        this.updateSpeaker(characterName);

        // 選択肢をクリア
        this.eventChoices.innerHTML = '';

        if (scene.choices) {
            // 選択肢シーン: 本文をタイプ表示後、選択肢を出す
            this.eventChoices.classList.add('active');
            this.controlsEl.style.display = 'none';

            this.currentScenePages = [scene.text || ''];
            this.currentScenePageIndex = 0;
            this.startTypewriter(this.currentScenePages[0]);

            scene.choices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice.text;
                button.className = 'game-msg-choice';
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (this.typeTimer && !this.typeDone) {
                        this.finishTypewriter();
                    }
                    if (choice.action) {
                        choice.action(this.currentEvent.context);
                    }
                    this.nextScene();
                });
                this.eventChoices.appendChild(button);
            });
        } else {
            // 通常シーン: 本文を必要に応じてページ分割し、タイプ表示で順次見せる
            this.eventChoices.classList.remove('active');
            this.controlsEl.style.display = 'flex';
            this.currentScenePages = StoryEventSystem.paginateText(scene.text || '');
            this.currentScenePageIndex = 0;
            this.startTypewriter(this.currentScenePages[0]);
        }

        // キーボード進行（イベント全体で1度だけ登録）
        if (!this.keyHandler) {
            this.keyHandler = (e) => {
                if (!this.currentEvent) return;
                const sc = this.currentEvent.data.scenes[this.currentEvent.sceneIndex];
                if (!sc || sc.choices) return;
                if (e.key === 'z' || e.key === 'Z' || e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.handleAdvance();
                }
            };
            document.addEventListener('keydown', this.keyHandler);
        }
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

        // 目標バナー更新（onComplete でフラグが変化しているため）
        if (typeof window.refreshObjective === 'function') {
            try { window.refreshObjective(); } catch (e) { /* noop */ }
        }

        // VNポートレートを片付け
        this.hidePortraits();

        // パネルを隠す
        this.panelEl.classList.remove('active');
        this.panelEl.setAttribute('aria-hidden', 'true');
        this.headerEl.classList.remove('active');
        this.eventChoices.classList.remove('active');
        this.eventChoices.innerHTML = '';
        this.eventText.innerHTML = '';
        this.eventCharacterName.textContent = '';
        this.setNextIndicator(false);

        // タイプライター停止
        if (this.typeTimer) {
            clearInterval(this.typeTimer);
            this.typeTimer = null;
        }
        this.typeDone = false;
        this.currentScenePages = [];
        this.currentScenePageIndex = 0;

        // キーハンドラ解除
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }

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

    // 特定マップ入場時の location イベントをチェック（index.html の onEnterMap から呼ぶ）
    checkLocationEvents(mapId, context) {
        for (const [eventId, event] of this.events.entries()) {
            if (event.trigger === 'location' && event.location === mapId) {
                const storyFlags = context.storyFlags || window.storyFlags || {};
                if (storyFlags[`${eventId}_completed`]) continue;
                // requiredFlags は triggerEvent 側で検証される
                setTimeout(() => this.triggerEvent(eventId, context), 600);
                break; // 一度に一つだけ
            }
        }
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.StoryEventSystem = StoryEventSystem;
}
