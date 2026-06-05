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
// v4: 可動域(目視トレース) + collisionRects(障害物トレース)。
//     屋外は中央床＋通路で側面建物を除外、屋内は generous。可動域内の建物/什器/プランター/機械を
//     collisionRects でブロック。連結性検証(可動域−障害物で全出口到達・断片化<25%)＆通路修正済み。

window.MAP_WALKABILITY_DEFAULTS = {
  "deep_tunnel": {
    walkableRects: [ { x: 45, y: 100, width: 710, height: 260 }, { x: 739, y: 189, width: 61, height: 222 }, { x: 289, y: 344, width: 222, height: 86 } ],
    collisionRects: [ { x: 130, y: 108, width: 80, height: 77 }, { x: 230, y: 108, width: 115, height: 77 }, { x: 365, y: 108, width: 95, height: 77 }, { x: 485, y: 108, width: 145, height: 77 }, { x: 710, y: 108, width: 45, height: 77 }, { x: 110, y: 250, width: 100, height: 75 }, { x: 230, y: 250, width: 115, height: 75 }, { x: 365, y: 250, width: 105, height: 75 }, { x: 490, y: 250, width: 135, height: 75 }, { x: 690, y: 250, width: 65, height: 75 } ]
  },
  "deep_tunnel_2": {
    walkableRects: [ { x: 45, y: 100, width: 710, height: 260 }, { x: 289, y: 0, width: 222, height: 116 }, { x: 289, y: 344, width: 222, height: 86 } ],
    collisionRects: [ { x: 130, y: 108, width: 80, height: 77 }, { x: 230, y: 108, width: 115, height: 77 }, { x: 365, y: 108, width: 95, height: 77 }, { x: 485, y: 108, width: 145, height: 77 }, { x: 710, y: 108, width: 45, height: 77 }, { x: 110, y: 250, width: 100, height: 75 }, { x: 230, y: 250, width: 115, height: 75 }, { x: 365, y: 250, width: 105, height: 75 }, { x: 490, y: 250, width: 135, height: 75 }, { x: 690, y: 250, width: 65, height: 75 } ]
  },
  "house_1": {
    walkableRects: [ { x: 24, y: 150, width: 752, height: 82 }, { x: 339, y: 216, width: 122, height: 214 } ],
    collisionRects: [ { x: 125, y: 150, width: 78, height: 20 }, { x: 555, y: 158, width: 20, height: 28 }, { x: 597, y: 150, width: 12, height: 42 } ]
  },
  "shrine_inner": {
    walkableRects: [ { x: 290, y: 24, width: 220, height: 408 }, { x: 220, y: 300, width: 360, height: 132 }, { x: 500, y: 150, width: 290, height: 100 } ],
    collisionRects: [ { x: 315, y: 62, width: 30, height: 48 }, { x: 455, y: 62, width: 32, height: 48 }, { x: 320, y: 178, width: 32, height: 122 }, { x: 448, y: 178, width: 30, height: 122 }, { x: 292, y: 300, width: 36, height: 66 }, { x: 472, y: 300, width: 36, height: 66 }, { x: 510, y: 168, width: 42, height: 46 }, { x: 652, y: 214, width: 32, height: 38 } ]
  },
  "tokyo_gov_floor2": {
    walkableRects: [ { x: 295, y: 24, width: 210, height: 408 }, { x: 180, y: 360, width: 440, height: 72 }, { x: 18, y: 185, width: 292, height: 80 }, { x: 490, y: 185, width: 292, height: 80 }, { x: 339, y: 0, width: 122, height: 40 } ],
    collisionRects: [ { x: 145, y: 185, width: 50, height: 55 }, { x: 610, y: 185, width: 50, height: 55 }, { x: 300, y: 160, width: 48, height: 72 }, { x: 455, y: 160, width: 48, height: 72 }, { x: 300, y: 285, width: 48, height: 75 }, { x: 455, y: 285, width: 48, height: 75 }, { x: 255, y: 360, width: 100, height: 42 }, { x: 445, y: 360, width: 100, height: 42 } ]
  },
  "tokyo_gov_floor3": {
    walkableRects: [ { x: 295, y: 24, width: 210, height: 408 }, { x: 180, y: 360, width: 440, height: 72 }, { x: 18, y: 185, width: 292, height: 80 }, { x: 490, y: 185, width: 292, height: 80 } ],
    collisionRects: [ { x: 145, y: 185, width: 50, height: 55 }, { x: 610, y: 185, width: 50, height: 55 }, { x: 300, y: 160, width: 48, height: 72 }, { x: 455, y: 160, width: 48, height: 72 }, { x: 300, y: 285, width: 48, height: 75 }, { x: 455, y: 285, width: 48, height: 75 }, { x: 255, y: 360, width: 100, height: 42 }, { x: 445, y: 360, width: 100, height: 42 } ]
  },
  "deep_tunnel_3": {
    walkableRects: [ { x: 45, y: 100, width: 710, height: 260 }, { x: 339, y: 0, width: 122, height: 116 }, { x: 339, y: 344, width: 122, height: 86 } ],
    collisionRects: [ { x: 130, y: 108, width: 80, height: 77 }, { x: 230, y: 108, width: 115, height: 77 }, { x: 365, y: 108, width: 95, height: 77 }, { x: 485, y: 108, width: 145, height: 77 }, { x: 710, y: 108, width: 45, height: 77 }, { x: 110, y: 250, width: 100, height: 75 }, { x: 230, y: 250, width: 115, height: 75 }, { x: 365, y: 250, width: 105, height: 75 }, { x: 490, y: 250, width: 135, height: 75 }, { x: 690, y: 250, width: 65, height: 75 } ]
  },
  "deep_tunnel_4": {
    walkableRects: [ { x: 45, y: 100, width: 710, height: 260 }, { x: 339, y: 0, width: 122, height: 116 }, { x: 339, y: 344, width: 122, height: 86 } ],
    collisionRects: [ { x: 130, y: 108, width: 80, height: 77 }, { x: 230, y: 108, width: 115, height: 77 }, { x: 365, y: 108, width: 95, height: 77 }, { x: 485, y: 108, width: 145, height: 77 }, { x: 710, y: 108, width: 45, height: 77 }, { x: 110, y: 250, width: 100, height: 75 }, { x: 230, y: 250, width: 115, height: 75 }, { x: 365, y: 250, width: 105, height: 75 }, { x: 490, y: 250, width: 135, height: 75 }, { x: 690, y: 250, width: 65, height: 75 } ]
  },
  "deep_tunnel_boss": {
    walkableRects: [ { x: 295, y: 24, width: 210, height: 408 }, { x: 180, y: 360, width: 440, height: 72 }, { x: 18, y: 185, width: 292, height: 80 }, { x: 490, y: 185, width: 292, height: 80 } ],
    collisionRects: [ { x: 145, y: 185, width: 50, height: 55 }, { x: 610, y: 185, width: 50, height: 55 }, { x: 300, y: 160, width: 48, height: 72 }, { x: 455, y: 160, width: 48, height: 72 }, { x: 300, y: 285, width: 48, height: 75 }, { x: 455, y: 285, width: 48, height: 75 }, { x: 255, y: 360, width: 100, height: 42 }, { x: 445, y: 360, width: 100, height: 42 } ]
  },
  "shinjuku_center_plaza": {
    walkableRects: [ { x: 120, y: 55, width: 560, height: 368 }, { x: 18, y: 188, width: 112, height: 92 }, { x: 672, y: 188, width: 112, height: 92 }, { x: 352, y: 28, width: 90, height: 40 } ],
    collisionRects: [ { x: 152, y: 90, width: 84, height: 30 }, { x: 522, y: 78, width: 100, height: 44 }, { x: 132, y: 128, width: 58, height: 60 }, { x: 612, y: 138, width: 56, height: 60 }, { x: 182, y: 244, width: 106, height: 60 }, { x: 512, y: 244, width: 98, height: 60 } ]
  },
  "shinjuku_station_gate": {
    walkableRects: [ { x: 30, y: 115, width: 650, height: 295 }, { x: 676, y: 110, width: 118, height: 252 } ],
    collisionRects: [ { x: 45, y: 180, width: 105, height: 105 }, { x: 270, y: 160, width: 70, height: 62 }, { x: 393, y: 183, width: 47, height: 35 }, { x: 447, y: 158, width: 26, height: 62 }, { x: 478, y: 192, width: 22, height: 28 }, { x: 30, y: 345, width: 155, height: 43 }, { x: 688, y: 115, width: 40, height: 45 }, { x: 756, y: 115, width: 38, height: 45 }, { x: 676, y: 322, width: 38, height: 36 } ]
  },
  "subway_concourse_a": {
    walkableRects: [ { x: 45, y: 100, width: 710, height: 260 }, { x: 642, y: 34, width: 65, height: 82 } ],
    collisionRects: [ { x: 130, y: 108, width: 80, height: 77 }, { x: 230, y: 108, width: 115, height: 77 }, { x: 365, y: 108, width: 95, height: 77 }, { x: 485, y: 108, width: 145, height: 77 }, { x: 710, y: 108, width: 45, height: 77 }, { x: 110, y: 250, width: 100, height: 75 }, { x: 230, y: 250, width: 115, height: 75 }, { x: 365, y: 250, width: 105, height: 75 }, { x: 490, y: 250, width: 135, height: 75 }, { x: 690, y: 250, width: 65, height: 75 } ]
  },
  "shopping_street_north": {
    walkableRects: [ { x: 90, y: 30, width: 620, height: 402 } ],
    collisionRects: [ { x: 200, y: 35, width: 60, height: 42 }, { x: 540, y: 35, width: 60, height: 42 }, { x: 255, y: 190, width: 50, height: 55 }, { x: 500, y: 190, width: 50, height: 55 }, { x: 365, y: 170, width: 70, height: 75 }, { x: 175, y: 305, width: 85, height: 62 }, { x: 545, y: 305, width: 80, height: 62 }, { x: 360, y: 305, width: 80, height: 42 } ]
  },
  "shopping_street_south": {
    walkableRects: [ { x: 120, y: 30, width: 570, height: 402 }, { x: 674, y: 255, width: 93, height: 72 }, { x: 24, y: 285, width: 112, height: 118 } ],
    collisionRects: [ { x: 215, y: 150, width: 83, height: 46 }, { x: 242, y: 222, width: 52, height: 40 }, { x: 502, y: 150, width: 83, height: 46 }, { x: 508, y: 222, width: 56, height: 40 }, { x: 560, y: 302, width: 60, height: 90 }, { x: 620, y: 298, width: 68, height: 104 } ]
  },
  "black_market_entrance": {
    walkableRects: [ { x: 45, y: 30, width: 745, height: 380 } ],
    collisionRects: [ { x: 65, y: 100, width: 120, height: 80 }, { x: 200, y: 293, width: 62, height: 52 }, { x: 345, y: 280, width: 65, height: 45 }, { x: 490, y: 295, width: 25, height: 30 }, { x: 555, y: 205, width: 85, height: 65 }, { x: 480, y: 360, width: 65, height: 45 } ]
  },
  "residential_street": {
    walkableRects: [ { x: 24, y: 150, width: 752, height: 82 } ],
    collisionRects: [ { x: 125, y: 150, width: 78, height: 20 }, { x: 555, y: 158, width: 20, height: 28 }, { x: 597, y: 150, width: 12, height: 42 } ]
  },
  "shrine_south_gate": {
    walkableRects: [ { x: 290, y: 24, width: 220, height: 408 }, { x: 220, y: 300, width: 360, height: 132 }, { x: 500, y: 150, width: 290, height: 100 } ],
    collisionRects: [ { x: 315, y: 62, width: 30, height: 48 }, { x: 455, y: 62, width: 32, height: 48 }, { x: 320, y: 178, width: 32, height: 122 }, { x: 448, y: 178, width: 30, height: 122 }, { x: 292, y: 300, width: 36, height: 66 }, { x: 472, y: 300, width: 36, height: 66 }, { x: 510, y: 168, width: 42, height: 46 }, { x: 652, y: 214, width: 32, height: 38 } ]
  },
  "tokyo_gov_approach": {
    walkableRects: [ { x: 295, y: 24, width: 210, height: 408 }, { x: 180, y: 360, width: 440, height: 72 }, { x: 18, y: 185, width: 292, height: 80 }, { x: 490, y: 185, width: 292, height: 80 } ],
    collisionRects: [ { x: 145, y: 185, width: 50, height: 55 }, { x: 610, y: 185, width: 50, height: 55 }, { x: 300, y: 160, width: 48, height: 72 }, { x: 455, y: 160, width: 48, height: 72 }, { x: 300, y: 285, width: 48, height: 75 }, { x: 455, y: 285, width: 48, height: 75 }, { x: 255, y: 360, width: 100, height: 42 }, { x: 445, y: 360, width: 100, height: 42 } ]
  },
  "biodome_gate": {
    walkableRects: [ { x: 330, y: 24, width: 150, height: 408 }, { x: 220, y: 150, width: 360, height: 150 }, { x: 18, y: 175, width: 220, height: 120 }, { x: 120, y: 360, width: 560, height: 70 } ],
    collisionRects: [ { x: 180, y: 250, width: 65, height: 45 }, { x: 290, y: 150, width: 55, height: 60 }, { x: 500, y: 150, width: 70, height: 60 }, { x: 150, y: 360, width: 90, height: 45 }, { x: 250, y: 360, width: 50, height: 45 }, { x: 300, y: 360, width: 55, height: 45 }, { x: 445, y: 360, width: 55, height: 45 }, { x: 510, y: 360, width: 110, height: 45 } ]
  }
};
