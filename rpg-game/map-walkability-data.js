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
// v2 下書き: 各背景画像を目視トレースし、屋外マップは中央床＋通路で側面建物を除外、
//           屋内ホールは床が画面を占めるため generous。全出口の到達性を保証済み（NG0）。
//           建物・障害物の精密カットはエディタで微調整する。

window.MAP_WALKABILITY_DEFAULTS = {
  "deep_tunnel": {
    walkableRects: [ { x: 45, y: 30, width: 710, height: 375 }, { x: 739, y: 189, width: 61, height: 222 }, { x: 289, y: 395, width: 222, height: 35 } ]
  },
  "deep_tunnel_2": {
    walkableRects: [ { x: 45, y: 30, width: 710, height: 375 }, { x: 289, y: 0, width: 222, height: 46 }, { x: 289, y: 389, width: 222, height: 41 } ]
  },
  "house_1": {
    walkableRects: [ { x: 24, y: 150, width: 752, height: 82 }, { x: 339, y: 216, width: 122, height: 214 } ]
  },
  "shrine_inner": {
    walkableRects: [ { x: 290, y: 24, width: 220, height: 408 }, { x: 220, y: 300, width: 360, height: 132 }, { x: 500, y: 150, width: 290, height: 100 } ]
  },
  "tokyo_gov_floor2": {
    walkableRects: [ { x: 295, y: 24, width: 210, height: 408 }, { x: 180, y: 360, width: 440, height: 72 }, { x: 18, y: 185, width: 290, height: 80 }, { x: 339, y: 0, width: 122, height: 40 } ]
  },
  "tokyo_gov_floor3": {
    walkableRects: [ { x: 295, y: 24, width: 210, height: 408 }, { x: 180, y: 360, width: 440, height: 72 }, { x: 18, y: 185, width: 290, height: 80 } ]
  },
  "deep_tunnel_3": {
    walkableRects: [ { x: 45, y: 30, width: 710, height: 375 }, { x: 339, y: 0, width: 122, height: 46 }, { x: 339, y: 389, width: 122, height: 41 } ]
  },
  "deep_tunnel_4": {
    walkableRects: [ { x: 45, y: 30, width: 710, height: 375 }, { x: 339, y: 0, width: 122, height: 46 }, { x: 339, y: 389, width: 122, height: 41 } ]
  },
  "deep_tunnel_boss": {
    walkableRects: [ { x: 295, y: 24, width: 210, height: 408 }, { x: 180, y: 360, width: 440, height: 72 }, { x: 18, y: 185, width: 290, height: 80 } ]
  },
  "shinjuku_center_plaza": {
    walkableRects: [ { x: 120, y: 55, width: 560, height: 368 }, { x: 18, y: 188, width: 112, height: 92 }, { x: 672, y: 188, width: 112, height: 92 }, { x: 352, y: 28, width: 90, height: 40 } ]
  },
  "shinjuku_station_gate": {
    walkableRects: [ { x: 30, y: 115, width: 650, height: 295 }, { x: 676, y: 110, width: 118, height: 252 } ]
  },
  "subway_concourse_a": {
    walkableRects: [ { x: 45, y: 30, width: 710, height: 375 } ]
  },
  "shopping_street_north": {
    walkableRects: [ { x: 90, y: 30, width: 620, height: 402 } ]
  },
  "shopping_street_south": {
    walkableRects: [ { x: 120, y: 30, width: 570, height: 402 }, { x: 674, y: 255, width: 93, height: 72 }, { x: 24, y: 285, width: 112, height: 118 } ]
  },
  "black_market_entrance": {
    walkableRects: [ { x: 45, y: 30, width: 710, height: 380 } ]
  },
  "residential_street": {
    walkableRects: [ { x: 24, y: 150, width: 752, height: 82 } ]
  },
  "shrine_south_gate": {
    walkableRects: [ { x: 290, y: 24, width: 220, height: 408 }, { x: 220, y: 300, width: 360, height: 132 }, { x: 500, y: 150, width: 290, height: 100 } ]
  },
  "tokyo_gov_approach": {
    walkableRects: [ { x: 295, y: 24, width: 210, height: 408 }, { x: 180, y: 360, width: 440, height: 72 }, { x: 18, y: 185, width: 290, height: 80 } ]
  },
  "biodome_gate": {
    walkableRects: [ { x: 330, y: 24, width: 150, height: 408 }, { x: 220, y: 150, width: 360, height: 150 }, { x: 18, y: 175, width: 220, height: 120 }, { x: 120, y: 360, width: 560, height: 70 } ]
  }
};
