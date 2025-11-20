// ==========================================
// BGMシステム (Background Music System)
// ==========================================

class BGMSystem {
    constructor() {
        this.currentBGM = null;
        this.audio = null;
        this.volume = 0.3; // デフォルト音量（0.0 - 1.0）
        this.fadeDuration = 1000; // フェード時間（ミリ秒）
        this.isFading = false;

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

    // BGM再生
    play(trackId, fadeIn = false) {
        const track = this.bgmTracks[trackId];

        if (!track) {
            console.warn(`BGM track not found: ${trackId}`);
            return;
        }

        // 同じBGMが既に再生中の場合はスキップ
        if (this.currentBGM === trackId && this.audio && !this.audio.paused) {
            return;
        }

        // 無音の場合は停止
        if (trackId === 'silence') {
            this.stop(true);
            return;
        }

        // 音楽ファイルが存在しない場合（まだ用意されていない）
        if (!track.path) {
            console.log(`BGM "${track.name}" is not available yet. Path: ${track.path}`);
            return;
        }

        // 前のBGMを停止
        if (this.audio) {
            this.stop(fadeIn);
        }

        // 新しいBGMを準備
        setTimeout(() => {
            try {
                this.audio = new Audio(track.path);
                this.audio.loop = track.loop;
                this.audio.volume = fadeIn ? 0 : (track.volume * this.volume);

                this.audio.addEventListener('error', (e) => {
                    console.warn(`BGM file not found or cannot be loaded: ${track.path}`);
                    console.log('Please add BGM files to the assets/bgm/ directory');
                });

                this.audio.play().then(() => {
                    this.currentBGM = trackId;
                    console.log(`BGM playing: ${track.name}`);

                    // フェードイン
                    if (fadeIn) {
                        this.fadeIn(track.volume * this.volume);
                    }
                }).catch(error => {
                    console.warn('BGM playback failed:', error);
                });

            } catch (error) {
                console.warn('Failed to create audio:', error);
            }
        }, fadeIn ? this.fadeDuration : 0);
    }

    // BGM停止
    stop(fadeOut = false) {
        if (!this.audio) return;

        if (fadeOut) {
            this.fadeOut(() => {
                if (this.audio) {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    this.audio = null;
                }
                this.currentBGM = null;
            });
        } else {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
            this.currentBGM = null;
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
