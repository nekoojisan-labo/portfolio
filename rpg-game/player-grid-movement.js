// ==========================================
// プレイヤー・グリッド移動システム
// ドラクエ風の1マスずつ移動
// ==========================================

class PlayerGridMovement {
    constructor(gridMapSystem) {
        this.gridMapSystem = gridMapSystem;

        // プレイヤーのグリッド座標
        this.gridX = 25;
        this.gridY = 20;

        // 描画用のピクセル座標（アニメーション用）
        this.pixelX = 0;
        this.pixelY = 0;

        // 移動アニメーション
        this.isMoving = false;
        this.moveStartX = 0;
        this.moveStartY = 0;
        this.moveTargetX = 0;
        this.moveTargetY = 0;
        this.moveProgress = 0;
        this.moveSpeed = 0.15;  // 移動速度（0.0〜1.0、大きいほど速い）

        // 向き
        this.facing = 'down';  // up, down, left, right

        // キー入力管理（連続入力防止）
        this.lastKeyPress = {};
        this.keyRepeatDelay = 150;  // ミリ秒

        // 歩数カウント
        this.stepCount = 0;

        // エンカウントカウンター
        this.encounterCounter = 0;
        this.encounterThreshold = 10;  // 10歩ごとにエンカウント判定

        // 初期化
        this.updatePixelPosition();

        console.log('[PlayerGridMovement] Initialized at grid:', this.gridX, this.gridY);
    }

    // ==========================================
    // ピクセル座標更新（グリッド座標から計算）
    // ==========================================
    updatePixelPosition() {
        const tileSize = this.gridMapSystem.tileSize;
        const cameraX = this.gridMapSystem.cameraX;
        const cameraY = this.gridMapSystem.cameraY;

        // 画面上でのピクセル座標（カメラオフセット考慮）
        this.pixelX = (this.gridX - cameraX) * tileSize + tileSize / 2;
        this.pixelY = (this.gridY - cameraY) * tileSize + tileSize / 2;
    }

    // ==========================================
    // 移動試行（キー入力から呼ばれる）
    // ==========================================
    tryMove(direction) {
        // 移動中は受け付けない
        if (this.isMoving) {
            return false;
        }

        // キーリピート防止
        const now = Date.now();
        if (this.lastKeyPress[direction] &&
            now - this.lastKeyPress[direction] < this.keyRepeatDelay) {
            return false;
        }
        this.lastKeyPress[direction] = now;

        // 移動先のグリッド座標を計算
        let targetX = this.gridX;
        let targetY = this.gridY;

        switch (direction) {
            case 'up':
                targetY -= 1;
                this.facing = 'up';
                break;
            case 'down':
                targetY += 1;
                this.facing = 'down';
                break;
            case 'left':
                targetX -= 1;
                this.facing = 'left';
                break;
            case 'right':
                targetX += 1;
                this.facing = 'right';
                break;
        }

        // 移動先が通行可能かチェック
        if (!this.gridMapSystem.isWalkable(targetX, targetY)) {
            // 壁などに当たった場合、向きだけ変える
            console.log('[PlayerGridMovement] Cannot walk to:', targetX, targetY);
            return false;
        }

        // 移動開始
        this.startMove(targetX, targetY);
        return true;
    }

    // ==========================================
    // 移動アニメーション開始
    // ==========================================
    startMove(targetX, targetY) {
        this.isMoving = true;
        this.moveProgress = 0;

        // 移動前の座標
        this.moveStartX = this.gridX;
        this.moveStartY = this.gridY;

        // 移動先の座標
        this.moveTargetX = targetX;
        this.moveTargetY = targetY;

        console.log(`[PlayerGridMovement] Moving from (${this.moveStartX}, ${this.moveStartY}) to (${this.moveTargetX}, ${this.moveTargetY})`);
    }

    // ==========================================
    // 更新（毎フレーム呼ばれる）
    // ==========================================
    update() {
        if (this.isMoving) {
            // 移動アニメーション進行
            this.moveProgress += this.moveSpeed;

            if (this.moveProgress >= 1.0) {
                // 移動完了
                this.moveProgress = 1.0;
                this.gridX = this.moveTargetX;
                this.gridY = this.moveTargetY;
                this.isMoving = false;

                // 移動完了後の処理
                this.onMoveComplete();
            }

            // 補間でスムーズに移動
            const t = this.easeInOut(this.moveProgress);
            const currentGridX = this.moveStartX + (this.moveTargetX - this.moveStartX) * t;
            const currentGridY = this.moveStartY + (this.moveTargetY - this.moveStartY) * t;

            // カメラ更新
            this.gridMapSystem.updateCamera(
                Math.round(currentGridX),
                Math.round(currentGridY)
            );
        }

        // ピクセル座標更新
        if (this.isMoving) {
            // 移動中は補間座標を使用
            const tileSize = this.gridMapSystem.tileSize;
            const cameraX = this.gridMapSystem.cameraX;
            const cameraY = this.gridMapSystem.cameraY;

            const t = this.easeInOut(this.moveProgress);
            const currentGridX = this.moveStartX + (this.moveTargetX - this.moveStartX) * t;
            const currentGridY = this.moveStartY + (this.moveTargetY - this.moveStartY) * t;

            this.pixelX = (currentGridX - cameraX) * tileSize + tileSize / 2;
            this.pixelY = (currentGridY - cameraY) * tileSize + tileSize / 2;
        } else {
            this.updatePixelPosition();
        }
    }

    // ==========================================
    // イージング関数（滑らかな加減速）
    // ==========================================
    easeInOut(t) {
        return t < 0.5
            ? 2 * t * t
            : -1 + (4 - 2 * t) * t;
    }

    // ==========================================
    // 移動完了時の処理
    // ==========================================
    onMoveComplete() {
        // 歩数カウント
        this.stepCount++;

        // エンカウント判定
        if (this.gridMapSystem.shouldEncounter(this.gridX, this.gridY)) {
            this.encounterCounter++;

            if (this.encounterCounter >= this.encounterThreshold) {
                this.encounterCounter = 0;

                // ランダムエンカウント（30%の確率）
                if (Math.random() < 0.3) {
                    console.log('[PlayerGridMovement] Random encounter!');
                    if (window.battleSystem) {
                        // 戦闘開始をコールバック
                        if (this.onEncounterCallback) {
                            this.onEncounterCallback();
                        }
                    }
                }
            }
        }

        // 出口チェック
        const exit = this.gridMapSystem.checkExit(this.gridX, this.gridY);
        if (exit) {
            console.log('[PlayerGridMovement] Exit detected:', exit);
            if (this.onExitCallback) {
                this.onExitCallback(exit);
            }
        }

        // UI更新コールバック
        if (this.onStepCallback) {
            this.onStepCallback(this.stepCount);
        }
    }

    // ==========================================
    // 描画
    // ==========================================
    render(ctx) {
        const playerSize = 28;

        // プレイヤースプライト（絵文字で代用）
        ctx.font = `${playerSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 向きに応じた絵文字（簡易版）
        let emoji = '🧑‍💼';
        switch (this.facing) {
            case 'up':
                emoji = '🧑‍💼'; // 上向き
                break;
            case 'down':
                emoji = '🧑‍💼'; // 下向き
                break;
            case 'left':
                emoji = '🧑‍💼'; // 左向き
                break;
            case 'right':
                emoji = '🧑‍💼'; // 右向き
                break;
        }

        ctx.fillText(emoji, this.pixelX, this.pixelY);

        // 名前表示
        ctx.font = '12px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('カイト', this.pixelX, this.pixelY + playerSize / 2 + 10);
    }

    // ==========================================
    // マップ切り替え時の座標設定
    // ==========================================
    setPosition(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.isMoving = false;
        this.moveProgress = 0;

        // カメラ更新
        this.gridMapSystem.updateCamera(gridX, gridY);
        this.updatePixelPosition();

        console.log('[PlayerGridMovement] Position set to:', gridX, gridY);
    }

    // ==========================================
    // コールバック登録
    // ==========================================
    setOnEncounterCallback(callback) {
        this.onEncounterCallback = callback;
    }

    setOnExitCallback(callback) {
        this.onExitCallback = callback;
    }

    setOnStepCallback(callback) {
        this.onStepCallback = callback;
    }
}

// グローバルに公開
window.PlayerGridMovement = PlayerGridMovement;
