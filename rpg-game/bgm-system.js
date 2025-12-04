// ==========================================
// BGMシステム (Background Music System)
// ==========================================

class BGMSystem {
    constructor() {
        this.currentBGM = null;      // 現在再生中のBGM ID
        this.currentScene = null;    // 現在のシーン（'field', 'battle', 'opening'）
        this.fieldBGM = null;        // フィールドBGM（バトル後に復帰用）
        this.audio = null;
        this.volume = 0.3;           // デフォルト音量（0.0 - 1.0）
        this.fadeDuration = 1000;    // フェード時間（ミリ秒）
        this.isFading = false;
        this.isTransitioning = false; // BGM切り替え中フラグ
        this.isUnlocked = false;     // ブラウザの自動再生ロック解除フラグ
        this.pendingBGM = null;      // 切り替え待ちのBGM

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

        console.log('BGM System initialized');
    }

    // BGM再生（内部用）
    _playInternal(trackId, fadeIn = false) {
        const track = this.bgmTracks[trackId];

        if (!track) {
            console.warn(`[BGM] Track not found: ${trackId}`);
            this.isTransitioning = false;
            return;
        }

        // 音楽ファイルが存在しない場合
        if (!track.path) {
            console.log(`[BGM] "${track.name}" is not available yet.`);
            this.isTransitioning = false;
            return;
        }

        // 既存のaudioが存在する場合は完全に停止して破棄
        if (this.audio) {
            console.log(`[BGM] Stopping previous audio before loading new track`);
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio.src = '';
            this.audio = null;
        }

        try {
            console.log(`[BGM] Loading: ${track.path}`);
            this.audio = new Audio(track.path);
            this.audio.loop = true;
            this.audio.volume = fadeIn ? 0 : (track.volume * this.volume);
            this.audio.preload = 'auto';

            this.audio.addEventListener('error', (e) => {
                console.error(`[BGM ERROR] Cannot load: ${track.path}`);
                this.isTransitioning = false;
            });

            const playPromise = this.audio.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.currentBGM = trackId;
                    this.isUnlocked = true;
                    this.isTransitioning = false;
                    console.log(`[BGM] ✓ Playing: ${track.name} (scene: ${this.currentScene})`);

                    if (fadeIn) {
                        this.fadeIn(track.volume * this.volume);
                    }
                }).catch(error => {
                    console.warn(`[BGM] Auto-play blocked: ${error.message}`);
                    this.waitForUserInteraction(trackId, fadeIn);
                });
            }
        } catch (error) {
            console.error('[BGM] Failed to create audio:', error);
            this.isTransitioning = false;
        }
    }

    // BGM再生（外部からの呼び出し用）
    play(trackId, fadeIn = false) {
        // 同じBGMが既に再生中の場合はスキップ
        if (this.currentBGM === trackId && this.audio && !this.audio.paused) {
            console.log(`[BGM] Already playing: ${trackId}`);
            return;
        }

        // 無音の場合は停止
        if (trackId === 'silence') {
            this.stop(true);
            return;
        }

        // 切り替え中の場合は待機リストに追加
        if (this.isTransitioning) {
            console.log(`[BGM] Transition in progress, queuing: ${trackId}`);
            this.pendingBGM = { trackId, fadeIn };
            return;
        }

        // 前のBGMが再生中の場合は確実に停止してから新しいBGMを再生
        if (this.audio && this.currentBGM && this.currentBGM !== trackId) {
            console.log(`[BGM] Stopping previous BGM (${this.currentBGM}) before playing ${trackId}`);
            this.isTransitioning = true;

            // フェードアウトしてから新しいBGMを再生
            this.fadeOut(() => {
                if (this.audio) {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    this.audio.src = '';
                    this.audio = null;
                }
                this.currentBGM = null;

                // 少し待ってから新しいBGMを開始
                setTimeout(() => {
                    this._playInternal(trackId, fadeIn);
                }, 100);
            });
        } else {
            this._playInternal(trackId, fadeIn);
        }
    }

    // フィールドBGM切り替え（マップ移動時）
    changeFieldBGM(trackId) {
        console.log(`[BGM] === Field BGM Change: ${this.currentBGM} -> ${trackId} ===`);

        // 同じBGMなら何もしない
        if (this.currentBGM === trackId && this.audio && !this.audio.paused) {
            console.log(`[BGM] Same field BGM, continuing: ${trackId}`);
            return;
        }

        // 切り替え中なら待機
        if (this.isTransitioning) {
            console.log(`[BGM] Transition in progress, queuing field: ${trackId}`);
            this.pendingBGM = { trackId, fadeIn: true, scene: 'field' };
            return;
        }

        this.isTransitioning = true;
        this.currentScene = 'field';
        this.fieldBGM = trackId;

        // 前のBGMがあればフェードアウト
        if (this.audio && this.currentBGM) {
            this.fadeOut(() => {
                if (this.audio) {
                    this.audio.pause();
                    this.audio = null;
                }
                this.currentBGM = null;
                // 少し待ってから新しいBGMを開始
                setTimeout(() => {
                    this._playInternal(trackId, true);
                }, 100);
            });
        } else {
            this._playInternal(trackId, true);
        }
    }

    // バトルBGM開始
    startBattleBGM(isBoss = false) {
        const trackId = isBoss ? 'boss_battle' : 'battle';
        console.log(`[BGM] === Battle Start: ${trackId} ===`);

        // 切り替え中なら待機
        if (this.isTransitioning) {
            console.log(`[BGM] Transition in progress, queuing battle: ${trackId}`);
            this.pendingBGM = { trackId, fadeIn: true, scene: 'battle' };
            return;
        }

        // 現在のフィールドBGMを保存
        if (this.currentScene === 'field') {
            this.fieldBGM = this.currentBGM;
        }

        this.isTransitioning = true;
        this.currentScene = 'battle';

        // フィールドBGMを停止してからバトルBGMを開始
        if (this.audio && this.currentBGM) {
            this.fadeOut(() => {
                if (this.audio) {
                    this.audio.pause();
                    this.audio = null;
                }
                this.currentBGM = null;
                setTimeout(() => {
                    this._playInternal(trackId, true);
                }, 100);
            });
        } else {
            this._playInternal(trackId, true);
        }
    }

    // バトル終了後、フィールドBGMに復帰
    endBattleBGM() {
        console.log(`[BGM] === Battle End, returning to field: ${this.fieldBGM} ===`);

        // 切り替え中なら待機
        if (this.isTransitioning) {
            console.log(`[BGM] Transition in progress, queuing field return`);
            this.pendingBGM = { trackId: this.fieldBGM, fadeIn: true, scene: 'field' };
            return;
        }

        if (!this.fieldBGM) {
            console.log(`[BGM] No field BGM to return to`);
            this.stop(true);
            return;
        }

        this.isTransitioning = true;
        this.currentScene = 'field';

        // バトルBGMを停止してからフィールドBGMを開始
        if (this.audio && this.currentBGM) {
            this.fadeOut(() => {
                if (this.audio) {
                    this.audio.pause();
                    this.audio = null;
                }
                this.currentBGM = null;
                setTimeout(() => {
                    this._playInternal(this.fieldBGM, true);
                }, 100);
            });
        } else {
            this._playInternal(this.fieldBGM, true);
        }
    }

    // BGM停止
    stop(fadeOut = false) {
        if (!this.audio) {
            console.log('[BGM] No audio to stop');
            return;
        }

        console.log(`[BGM] Stopping current BGM: ${this.currentBGM} (fadeOut: ${fadeOut})`);

        if (fadeOut) {
            this.fadeOut(() => {
                if (this.audio) {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    this.audio = null;
                }
                console.log('[BGM] Fade out completed, audio stopped');
                this.currentBGM = null;
            });
        } else {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
            this.currentBGM = null;
            console.log('[BGM] Audio stopped immediately');
        }
    }

    // BGM一時停止
    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }

    // BGM再開
    resume() {
        if (this.audio) {
            this.audio.play().catch(error => {
                console.warn('Failed to resume BGM:', error);
            });
        }
    }

    // フェードイン
    fadeIn(targetVolume) {
        if (!this.audio || this.isFading) return;

        this.isFading = true;
        const startVolume = 0;
        const startTime = Date.now();

        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.fadeDuration, 1);

            if (this.audio) {
                this.audio.volume = startVolume + (targetVolume - startVolume) * progress;
            }

            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                this.isFading = false;
            }
        };

        fade();
    }

    // フェードアウト
    fadeOut(callback) {
        if (!this.audio || this.isFading) {
            if (callback) callback();
            return;
        }

        this.isFading = true;
        const startVolume = this.audio.volume;
        const startTime = Date.now();

        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.fadeDuration, 1);

            if (this.audio) {
                this.audio.volume = startVolume * (1 - progress);
            }

            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                this.isFading = false;
                if (callback) callback();
            }
        };

        fade();
    }

    // マスター音量設定
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));

        if (this.audio && this.currentBGM) {
            const track = this.bgmTracks[this.currentBGM];
            if (track) {
                this.audio.volume = track.volume * this.volume;
            }
        }
    }

    // ユーザー操作を待ってBGMを再生（ブラウザの自動再生ポリシー対応）
    waitForUserInteraction(trackId, fadeIn = false) {
        const unlockAudio = () => {
            if (!this.isUnlocked) {
                console.log('[BGM] User interaction detected, unlocking audio...');
                this.isUnlocked = true;

                // 再度再生を試みる
                if (this.audio) {
                    this.audio.play().then(() => {
                        console.log('[BGM] Audio unlocked and playing');
                        if (fadeIn) {
                            const track = this.bgmTracks[trackId];
                            if (track) {
                                this.fadeIn(track.volume * this.volume);
                            }
                        }
                    }).catch(e => {
                        console.warn('[BGM] Still cannot play:', e);
                    });
                }

                // リスナーを削除
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('keydown', unlockAudio);
                document.removeEventListener('touchstart', unlockAudio);
            }
        };

        // ユーザー操作イベントを待つ
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('keydown', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
    }

    // 現在のBGM情報を取得
    getCurrentBGM() {
        if (!this.currentBGM) return null;

        return {
            id: this.currentBGM,
            ...this.bgmTracks[this.currentBGM]
        };
    }

    // BGMリスト取得
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
