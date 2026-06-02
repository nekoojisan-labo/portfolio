// ==========================================
// マップ可動域デフォルト (Map Walkability Defaults)
// ==========================================
// このファイルは map-editor.html で生成した可動域データを「ソースに焼き込む」ための置き場。
// 座標は base 800×450 空間（背景画像と1:1）。ゲーム側 applyWalkabilityOverrides が
// map.worldScale(=1.55) を掛けてワールド座標へ展開する。
//
// 優先順位:  MAP_WALKABILITY_DEFAULTS（ここ／全端末・本番）  <  localStorage（エディタの即時プレビュー・ブラウザ限定）
//
// 形式:
//   window.MAP_WALKABILITY_DEFAULTS = {
//     "<mapId>": {
//       walkableRects:  [{ x, y, width, height }, ...],   // 歩行可能領域（白リスト）。空なら「建物以外は歩ける」
//       collisionRects: [{ x, y, width, height }, ...],   // 壁・建物（通行不可）
//       exits:          [{ x, y, width, height, to, spawnX?, spawnY? }, ...]
//     },
//     ...
//   };

window.MAP_WALKABILITY_DEFAULTS = {};
