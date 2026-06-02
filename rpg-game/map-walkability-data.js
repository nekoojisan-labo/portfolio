// ==========================================
// マップ可動域デフォルト (Map Walkability Defaults)
// ==========================================
// このファイルは map-walkability-editor.html で生成した可動域データを「ソースに焼き込む」置き場。
// 座標は base 800×450 空間（背景画像と1:1）。ゲーム側 applyWalkabilityOverrides が
// map.worldScale(=1.55) を掛けてワールド座標へ展開する。
//
// 優先順位:  MAP_WALKABILITY_DEFAULTS（ここ／全端末・本番）  <  localStorage（エディタの即時プレビュー）
//
// 形式: { "<mapId>": { walkableRects:[{x,y,width,height}], collisionRects:[...], exits:[{x,y,width,height,to,spawnX?,spawnY?}] } }
//
// v1 下書き: 各フィールドマップ = 上部スカイラインを除いた全幅の中央床 + 北側出口への縦通路。
//           全出口の到達性を保証済み。建物の精密カットはエディタで微調整する。

window.MAP_WALKABILITY_DEFAULTS = {
  "deep_tunnel": {
    walkableRects: [ { x: 22, y: 36, width: 756, height: 396 } ]
  },
  "deep_tunnel_2": {
    walkableRects: [ { x: 22, y: 36, width: 756, height: 396 }, { x: 292, y: 0, width: 216, height: 48 } ]
  },
  "house_1": {
    walkableRects: [ { x: 22, y: 64, width: 756, height: 368 } ]
  },
  "shrine_inner": {
    walkableRects: [ { x: 22, y: 78, width: 756, height: 354 } ]
  },
  "tokyo_gov_floor2": {
    walkableRects: [ { x: 22, y: 88, width: 756, height: 344 }, { x: 342, y: 0, width: 116, height: 100 } ]
  },
  "tokyo_gov_floor3": {
    walkableRects: [ { x: 22, y: 88, width: 756, height: 344 } ]
  },
  "deep_tunnel_3": {
    walkableRects: [ { x: 22, y: 36, width: 756, height: 396 }, { x: 342, y: 0, width: 116, height: 48 } ]
  },
  "deep_tunnel_4": {
    walkableRects: [ { x: 22, y: 36, width: 756, height: 396 }, { x: 342, y: 0, width: 116, height: 48 } ]
  },
  "deep_tunnel_boss": {
    walkableRects: [ { x: 22, y: 88, width: 756, height: 344 } ]
  },
  "shinjuku_center_plaza": {
    walkableRects: [ { x: 22, y: 58, width: 756, height: 374 }, { x: 362, y: 0, width: 67, height: 70 } ]
  },
  "shinjuku_station_gate": {
    walkableRects: [ { x: 22, y: 30, width: 756, height: 402 } ]
  },
  "subway_concourse_a": {
    walkableRects: [ { x: 22, y: 36, width: 756, height: 396 }, { x: 645, y: 0, width: 59, height: 48 } ]
  },
  "shopping_street_north": {
    walkableRects: [ { x: 22, y: 92, width: 756, height: 340 }, { x: 359, y: 0, width: 66, height: 104 } ]
  },
  "shopping_street_south": {
    walkableRects: [ { x: 22, y: 92, width: 756, height: 340 }, { x: 367, y: 0, width: 68, height: 104 } ]
  },
  "black_market_entrance": {
    walkableRects: [ { x: 22, y: 70, width: 756, height: 362 } ]
  },
  "residential_street": {
    walkableRects: [ { x: 22, y: 64, width: 756, height: 368 } ]
  },
  "shrine_south_gate": {
    walkableRects: [ { x: 22, y: 78, width: 756, height: 354 } ]
  },
  "tokyo_gov_approach": {
    walkableRects: [ { x: 22, y: 88, width: 756, height: 344 } ]
  },
  "biodome_gate": {
    walkableRects: [ { x: 22, y: 66, width: 756, height: 366 } ]
  }
};
