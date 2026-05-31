# Phase 1: 骨格カットアウトキャラ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. NOTE: 視覚チューニングのステップは「PNGレンダリング→目視→定数調整」をテストとする（自動アサーション不可のため）。

**Goal:** 各キャラの既存walkスプライト(72×92・4方向)のframe0を頭/胴/左右脚(横向きは前後腕)に切り分け、骨格で振って「元の絵のまま」明確に歩行アニメさせる。主人公＋NPC。

**Architecture:** 新規 `skeletal-character.js` に `PART_RECTS`(方向別パーツ矩形＋ピボット) と `drawSkeletalChar(ctx, sprite, cx, footY, facing, isMoving, t, scale)` を実装し `window` 公開。`index.html drawPlayer` と `map-system.js drawNPCs` から呼ぶ。検証は `/tmp/claude/render`(@napi-rs/canvas, loadImage) で各キャラ4方向をPNG化し目視。デプロイは /tmp クローン経由(iCloud git回避)＋`?v`バンプ。

**Tech Stack:** 素のHTML/Canvas2D, Node(@napi-rs/canvas) でヘッドレス検証, gh CLI でデプロイ。

---

## ファイル構成

- Create: `skeletal-character.js` — 骨格描画の唯一の実装(PART_RECTS + drawSkeletalChar + window公開)。〜200行。
- Create: `/tmp/claude/render/skel.js` — 検証用モジュール(skeletal-character.js を require できる CommonJS ラッパ)。
- Modify: `index.html` — `<script src="skeletal-character.js?v=37">` 追加、`drawPlayer` を skeletal 呼び出しに、`?v` バンプ。
- Modify: `map-system.js` — `drawNPCs` の walkスプライト分岐を skeletal 呼び出しに。
- Verify: `/tmp/claude/render/render_skel.js` — 4キャラ×4方向×4フレームをPNG化。

---

## Task 1: skeletal-character.js の骨格描画を実装

**Files:**
- Create: `skeletal-character.js`
- Verify: `/tmp/claude/render/skel.js`, `/tmp/claude/render/render_skel.js`

- [ ] **Step 1: skeletal-character.js を作成（下記コードを丸ごと）**

```js
// 骨格カットアウト: 既存walkスプライト(72x92,4x4)のframe0をパーツに切り分け、
// hip/shoulderピボットで振って歩行を生成。元アートを保持する。
(function (global) {
  'use strict';
  const FW = 72, FH = 92;
  // frame0(各方向の中立)を素材に使う。col=0。row: down0 left1 right2 up3。
  const ROW = { down: 0, left: 1, right: 2, up: 3 };
  // 方向別パーツ矩形(フレーム内px)とピボット。境界は少し重ねて継ぎ目を防ぐ。
  // 初期値(プロト由来)。Task2でレンダリングしながら微調整する。
  const PART_RECTS = {
    down:  { head:{x:8,y:0,w:56,h:42},  torso:{x:14,y:36,w:44,h:28}, legL:{x:18,y:58,w:20,h:34}, legR:{x:34,y:58,w:20,h:34}, hipY:60, shoulderY:40 },
    up:    { head:{x:8,y:0,w:56,h:42},  torso:{x:14,y:36,w:44,h:28}, legL:{x:18,y:58,w:20,h:34}, legR:{x:34,y:58,w:20,h:34}, hipY:60, shoulderY:40 },
    left:  { head:{x:8,y:0,w:56,h:42},  torso:{x:18,y:36,w:38,h:28}, legL:{x:22,y:58,w:18,h:34}, legR:{x:32,y:58,w:18,h:34}, armFront:{x:14,y:38,w:14,h:26}, armBack:{x:44,y:38,w:14,h:26}, hipY:60, shoulderY:42 },
    right: { head:{x:8,y:0,w:56,h:42},  torso:{x:16,y:36,w:38,h:28}, legL:{x:22,y:58,w:18,h:34}, legR:{x:32,y:58,w:18,h:34}, armFront:{x:44,y:38,w:14,h:26}, armBack:{x:14,y:38,w:14,h:26}, hipY:60, shoulderY:42 }
  };

  function _drawRegion(ctx, sprite, srcX, srcY, R, dx, dy) {
    ctx.drawImage(sprite, srcX + R.x, srcY + R.y, R.w, R.h, dx, dy, R.w, R.h);
  }
  function _drawLeg(ctx, sprite, srcX, srcY, R, pivotX, pivotY, angle, frameTopY, frameLeft) {
    // 脚をピボット(股関節)周りに回転。脚領域の上端=pivotに合わせる。
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    // 領域内でのピボットからのオフセット
    const offX = (frameLeft + R.x) - pivotX;
    const offY = (frameTopY + R.y) - pivotY;
    ctx.drawImage(sprite, srcX + R.x, srcY + R.y, R.w, R.h, offX, offY, R.w, R.h);
    ctx.restore();
  }

  function drawSkeletalChar(ctx, sprite, cx, footY, facing, isMoving, t, scale) {
    if (!sprite || !sprite.width) return false; // 呼び元でフォールバック
    scale = scale || 1; const S = scale;
    const P = PART_RECTS[facing] || PART_RECTS.down;
    const srcRow = ROW[facing] != null ? ROW[facing] : 0;
    const srcX = 0, srcY = srcRow * FH; // col0

    const cyc = (t / 1000) * Math.PI * 2 * 2.2;
    const phase = isMoving ? Math.sin(cyc) : 0;
    const bob = isMoving ? Math.abs(Math.sin(cyc)) * 2.2 * S : 0;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // フレーム→画面のマッピング(足元=footY, 中央=cx, bobで上に持ち上げ)
    // スケール適用: フレームを中心(cx)・足元(footY)基準に S 倍で描く。
    ctx.translate(cx, footY - bob);
    ctx.scale(S, S);
    ctx.translate(-FW / 2, -FH); // frame座標系: (0,0)=フレーム左上, (FW,FH)=足元中央下
    const frameLeft = 0, frameTopY = 0;
    const hipScreenY = frameTopY + P.hipY;

    if (facing === 'left' || facing === 'right') {
      const d = facing === 'right' ? 1 : -1;
      const legAng = 0.5 * phase;
      // 奥腕→奥脚→胴→頭→手前脚→手前腕 の順
      if (P.armBack) _drawLeg(ctx, sprite, srcX, srcY, P.armBack, FW / 2, frameTopY + P.shoulderY, -d * 0.4 * phase, frameTopY, frameLeft);
      _drawLeg(ctx, sprite, srcX, srcY, P.legL, FW / 2, hipScreenY, -legAng, frameTopY, frameLeft);
      _drawRegion(ctx, sprite, srcX, srcY, P.torso, frameLeft + P.torso.x, frameTopY + P.torso.y);
      _drawRegion(ctx, sprite, srcX, srcY, P.head, frameLeft + P.head.x, frameTopY + P.head.y);
      _drawLeg(ctx, sprite, srcX, srcY, P.legR, FW / 2, hipScreenY, legAng, frameTopY, frameLeft);
      if (P.armFront) _drawLeg(ctx, sprite, srcX, srcY, P.armFront, FW / 2, frameTopY + P.shoulderY, d * 0.5 * phase, frameTopY, frameLeft);
    } else {
      // down / up: 脚を縦に交互リフト＋わずかな回転
      const lLift = Math.max(0, phase) * 3.0;
      const rLift = Math.max(0, -phase) * 3.0;
      const lAng = 0.18 * phase, rAng = -0.18 * phase;
      _drawLeg(ctx, sprite, srcX, srcY, P.legL, frameLeft + P.legL.x + P.legL.w / 2, hipScreenY - lLift, lAng, frameTopY - lLift, frameLeft);
      _drawLeg(ctx, sprite, srcX, srcY, P.legR, frameLeft + P.legR.x + P.legR.w / 2, hipScreenY - rLift, rAng, frameTopY - rLift, frameLeft);
      _drawRegion(ctx, sprite, srcX, srcY, P.torso, frameLeft + P.torso.x, frameTopY + P.torso.y);
      _drawRegion(ctx, sprite, srcX, srcY, P.head, frameLeft + P.head.x, frameTopY + P.head.y);
    }
    ctx.restore();
    return true;
  }

  global.drawSkeletalChar = drawSkeletalChar;
  global.SKELETAL_PART_RECTS = PART_RECTS;
})(typeof window !== 'undefined' ? window : globalThis);

if (typeof module !== 'undefined') module.exports = { drawSkeletalChar: (typeof window !== 'undefined' ? window : globalThis).drawSkeletalChar, PART_RECTS: (typeof window !== 'undefined' ? window : globalThis).SKELETAL_PART_RECTS };
```

- [ ] **Step 2: 構文チェック**

Run: `node --check skeletal-character.js`
Expected: エラーなし（無出力）

- [ ] **Step 3: 検証用ラッパ `/tmp/claude/render/skel.js` を作成**

```js
require('/Users/takayamanoboruhaku/Documents/gazoubiruda/rpg-game/skeletal-character.js');
module.exports = { drawSkeletalChar: globalThis.drawSkeletalChar, PART_RECTS: globalThis.SKELETAL_PART_RECTS };
```

- [ ] **Step 4: レンダラ `/tmp/claude/render/render_skel.js` を作成**（実スプライトを読み、4キャラ×4方向×4フレームをPNG化）

```js
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
require('/Users/takayamanoboruhaku/Documents/gazoubiruda/rpg-game/skeletal-character.js');
const draw = globalThis.drawSkeletalChar;
const ROOT = '/Users/takayamanoboruhaku/Documents/gazoubiruda/rpg-game/assets/characters/sprites/';
(async () => {
  const chars = (process.argv[2] || 'kaito,akari,riku,yami').split(',');
  const sprites = {};
  for (const c of chars) sprites[c] = await loadImage(ROOT + c + '_walk.png');
  const dirs = ['down','left','right','up'];
  const frames = [0,114,227,341];
  const cellW=86, cellH=128, pad=14, labelH=18, S=2.4;
  const blockW = frames.length*cellW + pad;
  const W = chars.length*blockW + pad, H = dirs.length*cellH + labelH + pad*2;
  const cv = createCanvas(W,H), ctx = cv.getContext('2d');
  ctx.fillStyle='#243042'; ctx.fillRect(0,0,W,H);
  chars.forEach((c,ci)=>{
    const ox = pad + ci*blockW;
    ctx.fillStyle='#cfe0f0'; ctx.font='bold 13px sans-serif'; ctx.fillText(c, ox, pad+10);
    dirs.forEach((dir,ri)=>{
      frames.forEach((t,fi)=>{
        const x0=ox+fi*cellW, y0=pad+labelH+ri*cellH;
        ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.strokeRect(x0,y0,cellW,cellH);
        const cx=x0+cellW/2, footY=y0+cellH-14;
        if(fi===0){ctx.fillStyle='#7e93a8'; ctx.font='10px sans-serif'; ctx.fillText(dir,x0+2,y0+11);}
        try{ draw(ctx, sprites[c], cx, footY, dir, true, t, S); }catch(e){ if(ri+fi===0)console.error('ERR',e.message); }
      });
    });
  });
  fs.writeFileSync('/tmp/claude/render/skel_out.png', cv.toBuffer('image/png'));
  console.log('wrote skel_out.png', W+'x'+H);
})();
```

- [ ] **Step 5: レンダリング実行 → 目視（テスト）**

Run: `cd /tmp/claude/render && node render_skel.js kaito,akari,riku,yami`
Expected: `skel_out.png` 生成。Readで目視し「元の絵のまま・4方向で脚/腕が振れて歩行に見える・継ぎ目が目立たない」を確認。

- [ ] **Step 6: PART_RECTS を微調整（目視で継ぎ目/位置がズレる場合のみ）**

`skeletal-character.js` の `PART_RECTS`(矩形/hipY/shoulderY) と脚の `lLift/legAng`/角度係数を調整 → Step5 を再実行。OKになるまで反復。

- [ ] **Step 7: コミット（/tmp クローン経由で後段デプロイ時にまとめて。ここではローカル保存のみ）**

iCloud下のため `git` はローカルで実行しない。ファイルはローカルに保存済みとする（デプロイは Task4 で /tmp クローン経由）。

---

## Task 2: index.html の drawPlayer を骨格描画に接続

**Files:**
- Modify: `index.html`（`<head>`付近のスクリプト読込に追加、`drawPlayer` 本体）

- [ ] **Step 1: スクリプトタグ追加**

`index.html` の外部スクリプト群（`<script src="bgm-system.js?v=35"></script>` の並び）に追加:
```html
    <script src="skeletal-character.js?v=37"></script>
```

- [ ] **Step 2: drawPlayer を差し替え**

`drawPlayer` 内、影描画の後の `drawWalkChar(...)` 呼び出し部分を以下に置換（`playerSprite` は既存のwalk画像、`playerSpriteLoaded` は既存フラグ）:
```js
            const footY = playerDrawY + 6;
            ctx.imageSmoothingEnabled = false;
            let drew = false;
            if (playerSpriteLoaded && window.drawSkeletalChar) {
                drew = window.drawSkeletalChar(ctx, playerSprite, playerDrawX, footY, player.facing, player.isMoving, player.animTime || 0, 1.0);
            }
            if (!drew && window.drawWalkChar) {
                window.drawWalkChar(ctx, playerDrawX, footY, player.facing, player.isMoving, player.animTime || 0, CHAR_PALETTES.kaito_walk, 1.3);
            }
```
（注: `playerSprite`/`playerSpriteLoaded` の正確な変数名は drawPlayer 周辺を grep して合わせる。frame0素材なので drawSkeletalChar はスプライト全体を受け取り内部で row/col を切り出す。スケール1.0で従来の66px相当になるよう Task1 Step6 で footY/サイズ感を調整済みとする。）

- [ ] **Step 3: インラインJS構文チェック**

Run:
```bash
cd /Users/takayamanoboruhaku/Documents/gazoubiruda/rpg-game && python3 -c "
import re
h=open('index.html').read()
o=[m.group(2) for m in re.finditer(r'<script([^>]*)>(.*?)</script>',h,re.S|re.I) if 'src=' not in m.group(1).lower()]
open('/tmp/claude/idx.js','w').write('\n;\n'.join(o))" && node --check /tmp/claude/idx.js && echo OK
```
Expected: `OK`

---

## Task 3: map-system.js の drawNPCs を骨格描画に接続

**Files:**
- Modify: `map-system.js`（`drawNPCs` の walkスプライト分岐）

- [ ] **Step 1: drawNPCs の walkスプライト分岐を差し替え**

`drawNPCs` 内、`window.drawWalkChar` を呼んでいるブロック（walkスプライトNPC）を以下に置換。`sprite` は既存のロード済みNPC画像、`spritePath` は既存変数:
```js
                    let drewNpc = false;
                    if (window.drawSkeletalChar) {
                        const sc = npc.hostile ? 1.2 : 1.0;
                        drewNpc = window.drawSkeletalChar(ctx, sprite, position.x, position.y + 6, npc.facing || 'down', npc.isMoving, npc.animTime || 0, sc);
                    }
                    if (!drewNpc) {
                        const f = this.computeWalkFrame(npc.facing, npc.isMoving, npc.animTime || 0);
                        const dw = npc.hostile ? 56 : 48, dh = npc.hostile ? 72 : 62;
                        const ps = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(sprite, f.sx, f.sy, f.sw, f.sh, position.x - dw/2, position.y - dh + 6, dw, dh);
                        ctx.imageSmoothingEnabled = ps;
                    }
```
（注: 既存の `isWalkSpriteSheet` 判定の中だけを置換し、ドローン等の非walkフォールバック/絵文字は触らない。`sprite`/`spritePath`/`position` の正確な変数名は周辺を確認して合わせる。）

- [ ] **Step 2: 構文チェック**

Run: `cd /Users/takayamanoboruhaku/Documents/gazoubiruda/rpg-game && node --check map-system.js && echo OK`
Expected: `OK`

---

## Task 4: 統合検証 → 両リポジトリへデプロイ

**Files:** `index.html`, `map-system.js`, `skeletal-character.js`, 設計書/計画書

- [ ] **Step 1: 統合後の最終レンダリング目視**

Run: `cd /tmp/claude/render && node render_skel.js kaito,akari,riku,yami,npc_priest,npc_citizen_female`
Expected: `skel_out.png` で主要キャラ＋NPCが元アートのまま4方向歩行。Readで確認。

- [ ] **Step 2: 全ファイル構文チェック**

Run:
```bash
cd /Users/takayamanoboruhaku/Documents/gazoubiruda/rpg-game
node --check skeletal-character.js && node --check map-system.js && echo "js OK"
python3 -c "import re;h=open('index.html').read();o=[m.group(2) for m in re.finditer(r'<script([^>]*)>(.*?)</script>',h,re.S|re.I) if 'src=' not in m.group(1).lower()];open('/tmp/claude/idx.js','w').write('\n;\n'.join(o))" && node --check /tmp/claude/idx.js && echo "index OK"
```
Expected: `js OK` と `index OK`

- [ ] **Step 3: /tmp クローンへコピー＆コミット＆プッシュ（両リポジトリ）**

```bash
SRC=/Users/takayamanoboruhaku/Documents/gazoubiruda/rpg-game
for f in index.html map-system.js skeletal-character.js; do
  cp "$SRC/$f" /tmp/claude/deus-deploy/$f
  cp "$SRC/$f" /tmp/claude/portfolio-deploy/rpg-game/$f
done
cp -R "$SRC/docs" /tmp/claude/deus-deploy/ ; cp -R "$SRC/docs" /tmp/claude/portfolio-deploy/rpg-game/
GN='nekoojisan-labo'; GE='nyaledge.capital1983@gmail.com'
MSG='feat(rpg-game): キャラを骨格カットアウトに（元アート保持＋脚/腕スイングで歩行明確化）'
cd /tmp/claude/deus-deploy && git add -A && git -c user.name="$GN" -c user.email="$GE" commit -q -m "$MSG" && git push origin main
cd /tmp/claude/portfolio-deploy && git add -A && git -c user.name="$GN" -c user.email="$GE" commit -q -m "$MSG" && git push origin main
```
Expected: 両方 `main -> main` 成功（dangerouslyDisableSandbox 必要）

- [ ] **Step 4: Pagesビルド→ライブ確認**

Run: portfolio の Pages build が `built` になり、`curl .../portfolio/rpg-game/skeletal-character.js?v=...` が `drawSkeletalChar` を含むことを確認。
Expected: live に `drawSkeletalChar` 存在。

---

## Self-Review チェック結果

- Spec coverage: ①キャラ骨格(3.1)=Task1-4 で網羅。Phase2(マップ)は本計画対象外（概略のみ、別計画）。
- Placeholder: 変数名は「周辺をgrepして合わせる」と明記（drawPlayer/drawNPCsの既存変数は実装時に確認）。コードは全ステップ実体あり。
- Type一貫性: `drawSkeletalChar(ctx,sprite,cx,footY,facing,isMoving,t,scale)` 戻り値 bool を Task1/2/3 で一貫使用。`window.drawSkeletalChar`/`SKELETAL_PART_RECTS` 命名一貫。
