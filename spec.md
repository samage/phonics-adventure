# Phonics Adventure 自然發音學習 App — 規格書

## 一、專案說明

給小朋友的自然發音練習：Oxford 風格互動（Sound buttons → Sound-talk → Blend），再加上 **「看字母說音」提取練習** 與 **間隔複習**，目標是「看到字母／拼法就立刻知道聲音」。介面主題為原創吉祥物「雲寶」＋天空藍白、雲朵、星星與甜點。

**音檔：** Sound City Reading 真人音素、Wikimedia IPA；無檔時 Web Speech 備援。

## 二、課程架構 v7.0.0

| Tab | Unit ID | 課次 | 內容 |
| --- | --- | --- | --- |
| 入門拼讀 | `start` | L01–L08 | s a t p i n m d |
| 讀字基礎 | `cvc` | L09–L21 | 其餘 CVC 字母 + 讀短句 + 特殊字 |
| 連音 | `blends` | BL1–BL9 | st/sp/sn、sk/sm/sl/sw、bl/cl/fl、gl/pl、br/cr/dr、fr/gr/pr/tr、nd/nt/mp、nk/ft/lt、str/spr/scr/spl（皆為規則短母音字） |
| 進階發音 | `advanced` | L22–L32、CK1 | sh、ch、th、ng、長母音、母音組；開頭先排規則字；**CK1 為獨立的 -ck 課**（duck、sock…） |
| 替代拼法 | `alt_spellings` | L33–L61 | bb、ph、kn、schwa… + 讀短句 + 特殊字 |

**共 71 堂**（原 61 + 連音 9 + CK1）。課次 ID 一律固定、不重編（新課用 `BL*`／`CK1`），只調整 `order`，所以舊書籤與舊進度不會失效。

### 解鎖規則

- 第一堂永遠開放。
- 做過分班測驗 → 全部開放。
- 完成較後面的課 → 之前的課全部開放（避免舊使用者被鎖住）。

## 三、看字母說音與複習

### 題庫

`data/recall/items.ts`：68 項（基本字母、其他字母、雙字母、長母音、母音組合、連音），每項有 `display`、`audio`、例字、`tier`、易混淆組。

### 看字母說音（`/recall`）

1. 卡片顯示字母／拼法，孩子先大聲說。
2. 🔊 播放真人音素，🐢 慢速（0.6 倍）。
3. 自評：**還不會**（立刻計為答錯、進今天複習）／**我會**（交給小測驗判定）。
4. 小測驗 4 選 1：看字母選聲音（選項為可播放的聲音）或選有該音的例字；干擾項取自易混淆組，且不洩題（見 `lib/recall/quiz.test.ts`）。
5. 自評「不會」的項目，測驗結果不計入（避免剛看完答案就升盒）。

### 今天複習（`/review`）

- 每個項目各自排程（Leitner，盒 1–5，間隔 `[0,1,2,4,8,16]` 天）。
- 結果：right（升盒）、wrong（回盒 1）、keep（不變）、placed（分班放盒 3）。
- 答錯後換題型再試一次，重試只記 keep。
- 首頁入口顯示到期數量。

### 分班測驗（`/placement`）

20 題（涵蓋 6 個層級）；答對者直接標為已會（盒 3），答錯者進今天複習；按下「記起來」後所有課程開放。

### 單字統計

`recordWordAttempt(word, correct)` 記錄真實對錯（過去永遠傳 true，已修正）；正確率低的字在拼字練習中優先出現（`lib/progress/wordStats.ts`）。

## 四、拼字遊戲（SoundAlchemist 拼字模式）

- 除了正解積木，另加 1–2 塊干擾積木（來自易混淆組，型別／顏色與被模仿者相同）。
- 拼錯某一格 → 該字母／拼法記為 wrong，進今天複習（每字每格只記一次）。
- 回饋：雲寶溫柔鼓勵，不用紅色叉叉。
- 示範（Sound buttons）與例字練習不算作答。

## 五、發音系統

| 情境 | 音源 |
| --- | --- |
| 單音素 | `/audio/soundcity/` |
| 長 a、ai、oo 等 | `/audio/ipa/`、supplement manifest |
| 連音 | `blend:xx` — 逐字母依序播放 |
| 其餘 | SCR 近似音素 → TTS |

```bash
npm run download:audio
```

## 六、進度

- Storage：`phonics-adventure-progress-v7`（讀取 v6、v5、v4 作為遷移來源，舊資料不刪除）。
- v7 新增：`review`（每項 Leitner 狀態）、`placement`（分班結果）、單字統計。
- 遷移測試：`lib/progress/migrate.test.ts`。

## 七、路由

| 路由 | 說明 |
| --- | --- |
| `/` | 首頁：看字母說音、今天複習（到期數）、分班測驗、課程路徑 |
| `/recall` | 看字母說音 |
| `/review` | 今天複習 |
| `/placement` | 分班測驗 |
| `/learn/<id>/play` | 課程（L01–L61、BL1–BL9、CK1） |
| `/play/decode` | 試唸生字 |
| `/mascot` | 雲寶表情一覽 |

## 八、主題與素材

- 吉祥物「雲寶」、雲朵、星星、杯子蛋糕、布丁皆為**原創 SVG**，不使用任何第三方角色素材或商標。
- 以 Tailwind `@theme` 覆寫色階，全站天空藍／白／粉彩；字型為圓體（Huninn）。

## 九、工程

- Next 16.4.3、React 19.3.1，`npm audit` 0 個弱點。
- Vitest 測試：排程、干擾項不洩題、音檔對應、分班、進度遷移、課程資料、單字統計。
- `DEV_UNLOCK_ALL_LESSONS` 僅在開發環境有效。

## 十、第二階段（尚未實作）：矯正發音

麥克風檢查 → Web Speech 辨識評估 → 最小對立組 → 錄音比對 → 嘴型提示 → 辨識不了的音改用 CVC 字 → 孩子友善回饋 → 全程本機處理（不上傳語音）。
