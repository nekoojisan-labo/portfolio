// ==========================================================================
// char-anim.js  —  クリーン再構築の第1モジュール: キャラ歩行アニメ
// 整列済みwalkスプライト(72x92, 4x4, 全方向 feet@y84/head@y10/center@x36/身長74)を
// 上半身は静止描画、脚だけを骨格でスイングさせて「本物の歩行」を出す。
// 全身bobはしない(=跳ねない)。元アートはそのまま使う。
// drawCharAnim(ctx, sprite, cx, footY, facing, isMoving, t, scale) -> bool
// ==========================================================================
(function (global) {
  'use strict';

  const FW = 72, FH = 92;
  const ROW = { down: 0, left: 1, right: 2, up: 3 };

  // 計測済みジオメトリ(フレーム内px)
  const FOOT_Y = 84;       // 全方向で足元はここ
  const HIP_Y = 56;        // 脚の付け根(ピボット)
  const UPPER_BOTTOM = 60; // 上半身を切る下端(脚の付け根を少し覆って継ぎ目を隠す)
  const SPLIT_X = 36;      // 左右脚の分割
  const LEG_PAD = 6;       // 脚矩形の左右余白

  // フレーム領域をそのまま配置
  function blit(ctx, img, srcY0, rx0, ry0, rx1, ry1, dx, dy) {
    ctx.drawImage(img, rx0, srcY0 + ry0, rx1 - rx0, ry1 - ry0, rx0 + dx, ry0 + dy, rx1 - rx0, ry1 - ry0);
  }

  // 領域をピボット(frame座標)周りに回転して配置
  function blitRot(ctx, img, srcY0, rx0, ry0, rx1, ry1, pivotX, pivotY, angle) {
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    ctx.drawImage(img, rx0, srcY0 + ry0, rx1 - rx0, ry1 - ry0, rx0 - pivotX, ry0 - pivotY, rx1 - rx0, ry1 - ry0);
    ctx.restore();
  }

  function drawCharAnim(ctx, sprite, cx, footY, facing, isMoving, t, scale) {
    if (!sprite || !sprite.width) return false;
    scale = scale || 1;
    const S = scale;
    const row = ROW[facing] != null ? ROW[facing] : 0;
    const srcY0 = row * FH;

    const cyc = (t / 1000) * Math.PI * 2 * 2.0;   // 約2歩/秒
    const ph = isMoving ? Math.sin(cyc) : 0;       // -1..1
    // 上半身の微小カウンターバウンス(接地で僅かに沈む)。跳ねない範囲。
    const settle = isMoving ? (1 - Math.abs(ph)) * 0.8 : 0;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // frame座標系: 画面の(cx,footY)に frame の(中央x=36, 足元y=84)を合わせ、S倍
    ctx.translate(Math.round(cx), Math.round(footY));
    ctx.scale(S, S);
    ctx.translate(-FW / 2, -FOOT_Y);

    // 全方向共通: 左右の脚(フレーム下部)を交互に上下リフト＋前方への僅かな送り。
    // 回転を使わない→矩形端が露出せずクリーン。横向きでも足が交互に持ち上がり歩いて見える。
    const lift = 3.4;
    const fwd = (facing === 'right') ? 1 : (facing === 'left') ? -1 : 0; // 横向きは前方へ送る
    const lDy = Math.max(0, ph) * lift;    // 左(手前)脚が上がる
    const rDy = Math.max(0, -ph) * lift;   // 右(奥)脚が上がる
    const lDx = Math.max(0, ph) * 1.6 * fwd;
    const rDx = Math.max(0, -ph) * 1.6 * fwd;
    // 左脚
    blit(ctx, sprite, srcY0, LEG_PAD, HIP_Y, SPLIT_X, FH, lDx, -lDy);
    // 右脚
    blit(ctx, sprite, srcY0, SPLIT_X, HIP_Y, FW - LEG_PAD, FH, rDx, -rDy);
    // 上半身(脚の付け根を覆って継ぎ目を隠す)
    blit(ctx, sprite, srcY0, 0, 0, FW, UPPER_BOTTOM, 0, settle);

    ctx.restore();
    return true;
  }

  global.drawCharAnim = drawCharAnim;
})(typeof window !== 'undefined' ? window : globalThis);

if (typeof module !== 'undefined') {
  module.exports = { drawCharAnim: (typeof window !== 'undefined' ? window : globalThis).drawCharAnim };
}
