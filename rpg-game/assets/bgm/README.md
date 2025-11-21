# 🎵 BGM音楽ファイル配置ガイド

## ⚠️ 重要：音楽ファイルはここに配置してください

このフォルダ（`rpg-game/assets/bgm/`）に以下の音楽ファイルを配置してください。

## 📁 必要なファイル一覧

以下の**13個のMP3ファイル**を配置してください：

### ストーリー・システム楽曲
- `opening.mp3` - オープニング
- `battle.mp3` - 通常戦闘
- `boss_battle.mp3` - ボス戦

### フィールド楽曲
- `shinjuku_city.mp3` - 新宿中央区画
- `subway.mp3` - 地下鉄エリア
- `shrine.mp3` - 明治神宮参道
- `tokyo_gov.mp3` - 東京都庁
- `dungeon.mp3` - 深層地下トンネル第1層
- `deep_dungeon.mp3` - 深層地下トンネル第2層
- `shopping.mp3` - 商業街
- `residential.mp3` - 住宅街
- `black_market.mp3` - 闇市
- `biodome.mp3` - バイオドーム植物園

## 📂 正しいファイル配置

```
rpg-game/
└── assets/
    └── bgm/
        ├── opening.mp3          ← ここに配置
        ├── battle.mp3           ← ここに配置
        ├── boss_battle.mp3      ← ここに配置
        ├── shinjuku_city.mp3    ← ここに配置
        ├── subway.mp3           ← ここに配置
        ├── shrine.mp3           ← ここに配置
        ├── tokyo_gov.mp3        ← ここに配置
        ├── dungeon.mp3          ← ここに配置
        ├── deep_dungeon.mp3     ← ここに配置
        ├── shopping.mp3         ← ここに配置
        ├── residential.mp3      ← ここに配置
        ├── black_market.mp3     ← ここに配置
        └── biodome.mp3          ← ここに配置
```

## ✅ 確認方法

1. **ファイルを配置後**、ブラウザのコンソール（F12）を開く
2. ゲームを起動
3. コンソールに以下のようなメッセージが表示されるか確認：

**成功例：**
```
[BGM] Attempting to load: assets/bgm/opening.mp3
[BGM] File loaded successfully: オープニング
[BGM] ✓ Now playing: オープニング (loop: true)
```

**失敗例（ファイルが見つからない）：**
```
[BGM ERROR] File not found or cannot be loaded: assets/bgm/opening.mp3
[BGM] Make sure the file exists at: rpg-game/assets/bgm/opening.mp3
```

## 🔧 対応フォーマット

- **推奨**: MP3（.mp3）
- **代替**: OGG（.ogg）、WAV（.wav）

## 🎵 音質推奨設定

- **ビットレート**: 128-192 kbps
- **サンプリングレート**: 44.1 kHz
- **ステレオ/モノラル**: ステレオ推奨
- **ファイルサイズ**: 各2-5 MB程度

## 🎹 フリー音楽素材サイト

音楽ファイルを入手できるサイト：

### 日本語
1. **魔王魂** - https://maou.audio/
2. **DOVA-SYNDROME** - https://dova-s.jp/
3. **甘茶の音楽工房** - https://amachamusic.chagasi.com/
4. **煉獄庭園** - http://www.rengoku-teien.com/

### 英語
1. **Incompetech** - https://incompetech.com/
2. **Purple Planet Music** - https://www.purple-planet.com/
3. **Bensound** - https://www.bensound.com/

## 📖 詳細情報

各楽曲のイメージや推奨ジャンルについては、
**`../BGM_GUIDE.md`** を参照してください。

## ❓ トラブルシューティング

### BGMが再生されない場合

1. **ファイル名を確認**
   - 正確なファイル名（例：`opening.mp3`）
   - 拡張子は小文字（`.mp3`、`.MP3`ではない）

2. **ファイルの場所を確認**
   - `rpg-game/assets/bgm/` フォルダ内に配置

3. **ブラウザのコンソールでエラー確認**
   - F12キーでコンソールを開く
   - `[BGM ERROR]` メッセージを確認

4. **ブラウザの自動再生ポリシー**
   - 最新のブラウザは自動再生を制限します
   - ゲーム画面を**クリック**するとBGMが再生開始します

5. **ファイル形式を確認**
   - MP3形式であることを確認
   - 破損していないか確認

### それでも再生されない場合

ブラウザのコンソールに表示されるエラーメッセージをコピーして、
開発者に報告してください。

---

**デウス・コード 八百万の神託**
BGMシステム Version 1.1
