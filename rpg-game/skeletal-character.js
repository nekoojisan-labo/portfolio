// 骨格カットアウト: 既存walkスプライト(72x92, 4x4)のframe0をパーツに切り分け、
// hip/shoulder ピボットで振って歩行を生成する。元アートをそのまま使う。
(function (global) {
  'use strict';
  const FW = 72, FH = 92;
  const ROW = { down: 0, left: 1, right: 2, up: 3 };

  // 方向別パーツ矩形(フレーム内px)とピボット。境界を少し重ねて継ぎ目を防ぐ。
  // torso は脚の付け根(hipY)を覆うよう下端を hipY より下まで伸ばし、回転する脚の上端の継ぎ目を隠す。
  const PART_RECTS = {
    down:  { head:{x:8,y:0,w:56,h:46},  torso:{x:13,y:36,w:46,h:30}, legL:{x:18,y:56,w:20,h:36}, legR:{x:34,y:56,w:20,h:36}, hipY:58, shoulderY:42 },
    up:    { head:{x:8,y:0,w:56,h:46},  torso:{x:13,y:36,w:46,h:30}, legL:{x:18,y:56,w:20,h:36}, legR:{x:34,y:56,w:20,h:36}, hipY:58, shoulderY:42 },
    left:  { head:{x:8,y:0,w:56,h:46},  torso:{x:17,y:36,w:40,h:30}, legL:{x:22,y:56,w:18,h:36}, legR:{x:32,y:56,w:18,h:36}, armFront:{x:12,y:40,w:16,h:26}, armBack:{x:44,y:40,w:16,h:26}, hipY:58, shoulderY:44 },
    right: { head:{x:8,y:0,w:56,h:46},  torso:{x:15,y:36,w:40,h:30}, legL:{x:22,y:56,w:18,h:36}, legR:{x:32,y:56,w:18,h:36}, armFront:{x:44,y:40,w:16,h:26}, armBack:{x:12,y:40,w:16,h:26}, hipY:58, shoulderY:44 }
  };

  function _region(ctx, sprite, srcX, srcY, R, dx, dy) {
    ctx.drawImage(sprite, srcX + R.x, srcY + R.y, R.w, R.h, dx, dy, R.w, R.h);
  }
  // パーツをピボット(frame座標)周りに回転して描く
  function _rot(ctx, sprite, srcX, srcY, R, pivotX, pivotY, angle) {
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    ctx.drawImage(sprite, srcX + R.x, srcY + R.y, R.w, R.h, R.x - pivotX, R.y - pivotY, R.w, R.h);
    ctx.restore();
  }

  function drawSkeletalChar(ctx, sprite, cx, footY, facing, isMoving, t, scale) {
    if (!sprite || !sprite.width) return false; // 呼び元でフォールバック
    scale = scale || 1; const S = scale;
    const P = PART_RECTS[facing] || PART_RECTS.down;
    const srcRow = ROW[facing] != null ? ROW[facing] : 0;
    const srcX = 0, srcY = srcRow * FH; // col0 = 中立フレーム

    const cyc = (t / 1000) * Math.PI * 2 * 2.2;
    const phase = isMoving ? Math.sin(cyc) : 0;
    const bob = isMoving ? Math.abs(Math.sin(cyc)) * 2.2 : 0; // frame座標(px)。Sは外側のscaleで効く

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // frame座標系を確立: 中央=cx, 足元=footY, bobで持ち上げ, S倍
    ctx.translate(cx, footY);
    ctx.scale(S, S);
    ctx.translate(-FW / 2, -FH - bob);
    const hipY = P.hipY;

    if (facing === 'left' || facing === 'right') {
      const d = facing === 'right' ? 1 : -1;
      const legAng = 0.42 * phase;
      if (P.armBack) _rot(ctx, sprite, srcX, srcY, P.armBack, FW / 2, P.shoulderY, -d * 0.42 * phase);
      _rot(ctx, sprite, srcX, srcY, P.legL, FW / 2, hipY, -legAng);
      _region(ctx, sprite, srcX, srcY, P.torso, P.torso.x, P.torso.y);
      _region(ctx, sprite, srcX, srcY, P.head, P.head.x, P.head.y);
      _rot(ctx, sprite, srcX, srcY, P.legR, FW / 2, hipY, legAng);
      if (P.armFront) _rot(ctx, sprite, srcX, srcY, P.armFront, FW / 2, P.shoulderY, d * 0.5 * phase);
    } else {
      // down / up: 脚を縦に交互リフト(回転なし=矩形端の露出を避ける)。torsoが脚上端を覆う。
      const lLift = Math.max(0, phase) * 2.6;
      const rLift = Math.max(0, -phase) * 2.6;
      ctx.save(); ctx.translate(0, -lLift); _region(ctx, sprite, srcX, srcY, P.legL, P.legL.x, P.legL.y); ctx.restore();
      ctx.save(); ctx.translate(0, -rLift); _region(ctx, sprite, srcX, srcY, P.legR, P.legR.x, P.legR.y); ctx.restore();
      _region(ctx, sprite, srcX, srcY, P.torso, P.torso.x, P.torso.y);
      _region(ctx, sprite, srcX, srcY, P.head, P.head.x, P.head.y);
    }
    ctx.restore();
    return true;
  }

  global.drawSkeletalChar = drawSkeletalChar;
  global.SKELETAL_PART_RECTS = PART_RECTS;
})(typeof window !== 'undefined' ? window : globalThis);

if (typeof module !== 'undefined') {
  const g = (typeof window !== 'undefined' ? window : globalThis);
  module.exports = { drawSkeletalChar: g.drawSkeletalChar, PART_RECTS: g.SKELETAL_PART_RECTS };
}
