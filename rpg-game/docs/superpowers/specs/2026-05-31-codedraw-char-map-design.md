# 設計書: 元アート保持の骨格キャラ＋背景/オブジェクト分離マップ

- 日付: 2026-05-31
- 対象: デウス・コード 八百万の神託（`~/Documents/gazoubiruda/rpg-game`）
- デプロイ先: `nekoojisan-labo/portfolio`(`/rpg-game/`) ＋ `nekoojisan-labo/deus-code-rpg`

## 1. 目的 / 背景

オーバーワールド表現の品質を上げる。これまでの経緯:
- 元のwalkスプライト4フレームは front/back で脚がほぼ動かず「歩いて見えない」
- 手続き描画(`drawWalkChar`)に置換したら動きは出たが**元の絵が失われた**（不採用）

ユーザー確定方針(2026-05-31):
- **元の画像イメージはそのまま使う**（AI生成スプライト/背景を破棄しない）
- キャラ: 元の絵を**パーツに切り分け、骨格(スケルトン)で手足を動かす**（2Dカットアウト）。主人公＋NPC
- マップ: 背景はそのまま、**オブジェクトを画像として分離**(B案)＋可動域/非可動域を明確化。品質優先(多少重くても可)

検証: `/tmp/claude/render/proto_skel.png` で、kaito下向きframe0を頭/胴/左右脚に分割し脚スイング＋bobで歩かせ、**元アート保持のまま明確な歩行**を確認済み。

## 2. 非目標 (YAGNI)

- キャラの新規AIアート生成（APIキー無し・不要）
- 物理エンジン/本格スケルタルIK（単純なピボット回転で十分）
- マップの完全タイル化（背景は既存画像を使う）

## 3. アーキテクチャ

### 3.1 キャラ: 骨格カットアウト

**パーツ領域定義(1セットで全キャラ共通)** — 全walkスプライトは同一原図の色替えなのでジオメトリ共通(72×92)。方向ごとにframe0(中立)を素材に、以下を切り出す:
- `head`(髪+顔), `torso`(胴+固定肩), `legL`,`legR`(脚)。横向きは `armFront`,`armBack` も。
- 各方向の領域は定数 `PART_RECTS[dir] = { head, torso, legL, legR, armFront?, armBack? }`(フレーム内px)。`hipY`(脚ピボット), `shoulderY`(腕ピボット) も方向ごとに持つ。

**リグ/モーション(既存リグ流用)**:
```
cyc = (t/1000)*2π*2.2; phase = isMoving? sin(cyc):0; bob = isMoving? |sin(cyc)|*k:0
down/up : 脚を縦に交互リフト + わずかな回転、腕は省略可、bodyはbob
left/right: 脚を hip 周りに ±angle 回転(前後スイング)、armFront/Back を shoulder 周りに逆位相回転
```
- 描画は元スプライトの該当領域を `drawImage(sx,sy,sw,sh,...)` で部品ごとに配置/回転。`imageSmoothingEnabled=false`。
- idle時は frame0 をそのまま(回転0,bob0)。

**コンポーネント**: `skeletal-character.js`(新規, 小さく独立) に `drawSkeletalChar(ctx, sprite, cx, footY, facing, isMoving, animTimeMs, scale)` と `PART_RECTS` を実装。`window` 公開。
- `index.html drawPlayer`: 既存 `playerSprite`(walk画像)を渡して `drawSkeletalChar` を呼ぶ。
- `map-system.js drawNPCs`: walkスプライトNPCは `window.drawSkeletalChar(... npcSprite ...)`。非walk(ドローン等)は従来描画。
- 旧 `drawWalkChar`(手続き)と `computeWalkFrame` は撤去 or フォールバック保持。

**検証**: `/tmp/claude/render/` に `loadImage` で各キャラ・各方向の骨格歩行をPNG化し目視 → デプロイ。

### 3.2 マップ: 背景/オブジェクト分離 (B案) ＋可動域

**レイヤー構成(描画順)**:
1. `background` (既存マップ画像。オブジェクト込みの元画像をそのまま)
2. エンティティ(NPC/プレイヤー) — y でソート
3. `objectsFront` — オブジェクトの**前面/上部を背景から切り出した重ねレイヤー**(プレイヤーが奥に回り込む建物等)。各オブジェクトに `footY`(これより上にプレイヤーが居れば前面を被せる)を持たせて奥行き表現。背景に穴は空けない(元画像が基層なのでインペイント不要)。

**データ(マップごと)**:
```
objects: [ { id, srcRect:{x,y,w,h}, drawRect:{x,y,w,h}, footY, solid:bool } ]  // 切り出し矩形=背景座標
collision: 矩形 or ポリゴンの非可動域（buildings相当を精緻化）
walkable:  可動域（walkableRects を精緻化、または低解像度グリッドマスク）
```
- 切り出しは背景画像から `srcRect` を別 canvas/Image に転写(ビルド時 or 実行時)。20マップ分。
- `map-walkability-editor.html`/`map-editor.html` を拡張してオブジェクト矩形・可動域を視覚的に定義。
- 既存 `checkBuildingCollision`/`isWalkable`/`checkMapTransition`/`getSpawnPoint`/`checkAutoEnterAhead` はこの新 collision/walkable データを参照するよう接続(挙動は維持)。

**奥行き**: gameLoop の描画で `objectsFront` を `player.y < object.footY` の時にプレイヤー後に重ねる。

### 3.3 既存システムとの統合(不変条件)

- 移動(`updatePlayer`)、遷移(`transitionToMap`/`getSpawnPoint`/`checkAutoEnterAhead`)、戦闘、BGM(世代トークン)、装備、操作UIは変更しない。
- 当たり判定/可動域のデータソースだけ精緻化する。

## 4. 段階リリース

- **Phase 1: キャラ骨格**（`skeletal-character.js` + drawPlayer/drawNPCs接続）。1リグで全キャラ。レンダリング検証 → 両リポジトリへデプロイ(`?v` バンプ)。
- **Phase 2: マップ分離**（まず商店街 `shopping_street_north` で型を確立 → エディタ拡張 → 全マップへ展開）。オブジェクト切り出し＋可動域＋奥行き。

## 5. テスト / 検証

- キャラ: `/tmp/claude/render`(@napi-rs/canvas)で各キャラ4方向×Nフレームを目視。`node --check`。
- マップ: ローカル `python3 -m http.server` ＋ 実ブラウザでドア出入り・奥行き・可動域確認。
- デプロイ: /tmp クローン経由(iCloud git ハング回避)、Pagesビルド→ライブ grep 確認。

## 6. リスク

- 72×92は小さく、パーツ境界に継ぎ目が出る可能性 → 領域を少し重ね、回転中心を調整して吸収。
- 横向き腕の前後関係 → 描画順(奥腕→胴→手前腕)で対応。
- マップ20枚のオブジェクト切り出しは手間 → エディタで効率化、Phase 2 を1マップずつ。
- 奥行きfootYの調整が必要 → エディタで可視化。

## 7. 受け入れ基準

- 全キャラ(主人公+NPC)が**元の絵のまま**4方向で明確に歩行アニメする。
- 各マップで非可動域に入れず、ドアは座標に乗れば(向いて歩けば)入れる。
- プレイヤーが対象オブジェクトの奥へ回り込める。
- 実URL `portfolio/rpg-game` に反映され、既存機能の回帰なし。
