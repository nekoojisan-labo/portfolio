// ==========================================
// BGMシステム (Background Music System)
// ==========================================
// 世代トークン(_gen)方式:
//   - すべての再生要求を _requestTrack() に一本化して直列化する
//   - 新しい Audio を生成する前に、必ず現在の Audio を即時停止する
//   - play() / フェードの requestAnimationFrame など全ての非同期コールバックは
//     自分が発行された時点の世代(myGen)を握り、最新世代と一致しない場合は no-op
//   これにより「古い要求が生成した Audio が鳴り続けて新しい曲と混ざる」競合を排除する。

class BGMSystem {
    constructor() {
        this.currentBGM = null;      // 現在再生中のBGM ID
        this.currentScene = null;    // 現在のシーン（'field', 'battle', 'opening'）
        this.fieldBGM = null;        // フィールドBGM（バトル後に復帰用）
        this.audio = null;           // 現在の唯一の Audio 要素
        this.volume = 0.3;           // マスター音量（0.0 - 1.0）
        this.fadeDuration = 1000;    // フェード時間（ミリ秒）

        // 直列化用トークン
        this._gen = 0;               // 再生要求の世代カウンタ（要求ごとに ++）
        this._fadeGen = 0;           // フェードの世代カウンタ（フェード割り込み用）

        // 状態フラグ（ログ・参照用。正しさの担保には使わない）
        this.isFading = false;
        this.isUnlocked = false;     // ブラウザの自動再生ロック解除フラグ

        // BGM定義（実際の音楽ファイルパスはここで設定）
        this.bgmTracks = {
            // ストーリー・システム楽曲
            opening: {
                name: 'オープニング',
                path: 'assets/bgm/opening.mp3',
                loop: true,
                volume: 0.4
            },
            battle: {
                name: '戦闘',
                path: 'assets/bgm/battle.mp3',
                loop: true,
                volume: 0.5
            },
            boss_battle: {
                name: 'ボス戦',
                path: 'assets/bgm/boss_battle.mp3',
                loop: true,
                volume: 0.6
            },

            // フィールド楽曲
            shinjuku_city: {
                name: '新宿中央区画',
                path: 'assets/bgm/shinjuku_city.mp3',
                loop: true,
                volume: 0.3,
                description: '暗く無機質なサイバーパンク都市'
            },
            subway: {
                name: '地下鉄',
                path: 'assets/bgm/subway.mp3',
                loop: true,
                volume: 0.3,
                description: '不気味で緊張感のある地下空間'
            },
            shrine: {
                name: '神社参道',
                path: 'assets/bgm/shrine.mp3',
                loop: true,
                volume: 0.3,
                description: '神聖で静寂な和の空間'
            },
            tokyo_gov: {
                name: '都庁',
                path: 'assets/bgm/tokyo_gov.mp3',
                loop: true,
                volume: 0.4,
                description: '緊迫感のある敵の本拠地'
            },
            dungeon: {
                name: '深層地下トンネル',
                path: 'assets/bgm/dungeon.mp3',
                loop: true,
                volume: 0.3,
                description: 'ダークで危険なダンジョン'
            },
            deep_dungeon: {
                name: '深層地下トンネル第2層',
                path: 'assets/bgm/deep_dungeon.mp3',
                loop: true,
                volume: 0.4,
                description: 'より深い恐怖と絶望'
            },
            shopping: {
                name: '商業街',
                path: 'assets/bgm/shopping.mp3',
                loop: true,
                volume: 0.3,
                description: '明るく賑やかな安全地帯'
            },
            residential: {
                name: '住宅街',
                path: 'assets/bgm/residential.mp3',
                loop: true,
                volume: 0.3,
                description: '穏やかで平和な日常'
            },
            black_market: {
                name: '闇市',
                path: 'assets/bgm/black_market.mp3',
                loop: true,
                volume: 0.3,
                description: '怪しげなアンダーグラウンド'
            },
            biodome: {
                name: 'バイオドーム植物園',
                path: 'assets/bgm/biodome.mp3',
                loop: true,
                volume: 0.3,
                description: '幻想的で癒しの空間'
            },
            silence: {
                name: '無音',
                path: null,
                loop: false,
                volume: 0
            }
        };

        console.log('BGM System initialized (gen-token serialized)');
    }

    // ==========================================
    // 内部: 現在の Audio を即時停止して破棄
    // ==========================================
    _stopAudioImmediate() {
        if (this.audio) {
            try { this.audio.pause(); } catch (e) {}
            try { this.audio.currentTime = 0; } catch (e) {}
            try { this.audio.src = ''; } catch (e) {}
            this.audio = null;
        }
    }

    // ==========================================
    // 内部: 進行中のフェードを中断
    // ==========================================
    _stopFade() {
        this._fadeGen++;     // 走っている step() を次フレームで失効させる
        this.isFading = false;
    }

    // ==========================================
    // すべての再生要求の唯一の入口（直列化の心臓部）
    // ==========================================
    _requestTrack(trackId, options = {}) {
        const scene = (options.scene !== undefined) ? options.scene : this.currentScene;
        const fadeIn = !!options.fadeIn;
        const track = this.bgmTracks[trackId];

        if (!track) {
            console.warn(`[BGM] Track not found: ${trackId}`);
            return;
        }

        // 同じ曲が既に正常再生中ならシーンだけ更新してスキップ
        if (this.currentBGM === trackId && this.audio && !this.audio.paused) {
            if (scene) this.currentScene = scene;
            console.log(`[BGM] Already playing: ${trackId}`);
            return;
        }

        // 新しい世代を発行。これ以前の世代が生成した非同期処理はすべて失効する。
        const myGen = ++this._gen;
        if (scene) this.currentScene = scene;

        // 旧フェード・旧 Audio を「新 Audio 生成前に」確実に止める（混線の根本対策）
        this._stopFade();
        this._stopAudioImmediate();
        this.currentBGM = null;

        // 無音 / ファイル未設定なら停止状態で確定
        if (trackId === 'silence' || !track.path) {
            console.log(`[BGM] "${track.name}" -> silent / not available`);
            return;
        }

        this._startTrack(trackId, track, fadeIn, myGen);
    }

    // ==========================================
    // 内部: 指定世代で新しい Audio を起動
    // ==========================================
    _startTrack(trackId, track, fadeIn, myGen) {
        let el;
        try {
            el = new Audio(track.path);
        } catch (error) {
            console.error('[BGM] Failed to create audio:', error);
            return;
        }

        el.loop = true;
        el.preload = 'auto';
        el.volume = fadeIn ? 0 : (track.volume * this.volume);

        el.addEventListener('error', () => {
            if (myGen !== this._gen || this.audio !== el) return; // 失効した要求
            console.error(`[BGM ERROR] Cannot load: ${track.path}`);
        });

        // この時点で this.audio は新要素に確定（旧要素は停止済み）
        this.audio = el;
        console.log(`[BGM] Loading: ${track.path} (gen ${myGen}, scene ${this.currentScene})`);

        const playPromise = el.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (myGen !== this._gen || this.audio !== el) return; // 失効
                this.currentBGM = trackId;
                this.isUnlocked = true;
                console.log(`[BGM] ✓ Playing: ${track.name}`);
                if (fadeIn) {
                    this._fade(el, track.volume * this.volume, myGen);
                }
            }).catch((error) => {
                if (myGen !== this._gen || this.audio !== el) return; // 失効
                console.warn(`[BGM] Auto-play blocked: ${error.message}`);
                this.waitForUserInteraction(trackId, fadeIn, el, myGen);
            });
        } else {
            // 古いブラウザ（Promiseを返さない）
            this.currentBGM = trackId;
            this.isUnlocked = true;
        }
    }

    // ==========================================
    // 内部: 世代付きフェード（要素単位）
    // ==========================================
    _fade(el, targetVolume, myGen, onDone) {
        const fadeId = ++this._fadeGen;
        this.isFading = true;
        const startVolume = el.volume;
        const startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());

        const step = () => {
            // 新しい要求 / 新しいフェード / 要素差し替えのいずれかが起きたら中断
            if (fadeId !== this._fadeGen || myGen !== this._gen || this.audio !== el) {
                return;
            }
            const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            const progress = Math.min((now - startTime) / this.fadeDuration, 1);
            el.volume = Math.max(0, Math.min(1, startVolume + (targetVolume - startVolume) * progress));

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                this.isFading = false;
                if (onDone) onDone();
            }
        };

        requestAnimationFrame(step);
    }

    // ==========================================
    // 公開API: 汎用再生
    // ==========================================
    play(trackId, fadeIn = false) {
        this._requestTrack(trackId, { fadeIn });
    }

    // ==========================================
    // 公開API: フィールドBGM切り替え（マップ移動時）
    // ==========================================
    changeFieldBGM(trackId) {
        console.log(`[BGM] === Field BGM Change: ${this.currentBGM} -> ${trackId} ===`);
        this.fieldBGM = trackId;
        this._requestTrack(trackId, { scene: 'field', fadeIn: true });
    }

    // ==========================================
    // 公開API: バトルBGM開始
    // ==========================================
    startBattleBGM(isBoss = false) {
        const trackId = isBoss ? 'boss_battle' : 'battle';
        console.log(`[BGM] === Battle Start: ${trackId} ===`);

        // 現在のフィールドBGMを保存（_requestTrack が currentBGM を消す前に取得）
        if (this.currentScene === 'field' && this.currentBGM) {
            this.fieldBGM = this.currentBGM;
        }

        this._requestTrack(trackId, { scene: 'battle', fadeIn: true });
    }

    // ==========================================
    // 公開API: バトル終了後、フィールドBGMに復帰
    // ==========================================
    endBattleBGM() {
        console.log(`[BGM] === Battle End, returning to field: ${this.fieldBGM} ===`);

        if (!this.fieldBGM) {
            console.log(`[BGM] No field BGM to return to`);
            this.stop(true);
            return;
        }

        this._requestTrack(this.fieldBGM, { scene: 'field', fadeIn: true });
    }

    // ==========================================
    // 公開API: BGM停止
    // ==========================================
    stop(fadeOut = false) {
        const myGen = ++this._gen;   // 進行中の要求をすべて失効させる

        if (!this.audio) {
            this.currentBGM = null;
            return;
        }

        console.log(`[BGM] Stopping current BGM: ${this.currentBGM} (fadeOut: ${fadeOut})`);

        if (fadeOut) {
            const el = this.audio;
            this._fade(el, 0, myGen, () => {
                if (myGen !== this._gen || this.audio !== el) return;
                this._stopAudioImmediate();
                this.currentBGM = null;
                console.log('[BGM] Fade out completed, audio stopped');
            });
        } else {
            this._stopFade();
            this._stopAudioImmediate();
            this.currentBGM = null;
            console.log('[BGM] Audio stopped immediately');
        }
    }

    // ==========================================
    // 公開API: 一時停止 / 再開
    // ==========================================
    pause() {
        if (this.audio) {
            try { this.audio.pause(); } catch (e) {}
        }
    }

    resume() {
        if (this.audio) {
            this.audio.play().catch((error) => {
                console.warn('Failed to resume BGM:', error);
            });
        }
    }

    // ==========================================
    // 公開API: マスター音量設定
    // ==========================================
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));

        // フェード中でなければ即反映（フェード中は _fade が音量を管理）
        if (this.audio && this.currentBGM && !this.isFading) {
            const track = this.bgmTracks[this.currentBGM];
            if (track) {
                this.audio.volume = track.volume * this.volume;
            }
        }
    }

    // ==========================================
    // ユーザー操作を待ってBGMを再生（自動再生ポリシー対応・世代付き）
    // ==========================================
    waitForUserInteraction(trackId, fadeIn, el, myGen) {
        const cleanup = () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
            document.removeEventListener('touchstart', unlock);
        };

        const unlock = () => {
            // 既に新しい要求に切り替わっていたら何もしない
            if (myGen !== this._gen || this.audio !== el) {
                cleanup();
                return;
            }
            console.log('[BGM] User interaction detected, unlocking audio...');
            this.isUnlocked = true;

            el.play().then(() => {
                if (myGen !== this._gen || this.audio !== el) return;
                this.currentBGM = trackId;
                console.log('[BGM] Audio unlocked and playing');
                if (fadeIn) {
                    const track = this.bgmTracks[trackId];
                    if (track) this._fade(el, track.volume * this.volume, myGen);
                }
            }).catch((e) => {
                console.warn('[BGM] Still cannot play:', e);
            });

            cleanup();
        };

        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
    }

    // ==========================================
    // 現在のBGM情報を取得
    // ==========================================
    getCurrentBGM() {
        if (!this.currentBGM) return null;
        return {
            id: this.currentBGM,
            ...this.bgmTracks[this.currentBGM]
        };
    }

    // ==========================================
    // BGMリスト取得
    // ==========================================
    getTrackList() {
        return Object.entries(this.bgmTracks).map(([id, track]) => ({
            id,
            name: track.name,
            description: track.description || ''
        }));
    }
}

// グローバルにエクスポート
window.BGMSystem = BGMSystem;
