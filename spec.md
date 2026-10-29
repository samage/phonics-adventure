# Phonics Adventure 自然發音學習 App — 規格書

## 一、專案說明

給小朋友的自然發音練習。孩子學過自然發音卻容易忘，所以目標是「**看到字母／拼法就立刻知道聲音，並且能唸對**」。

整個 App 只有**一個學習系統**：課程地圖是主線；每堂課都包含「看字說音」提取練習與小測驗；所有練習都寫進**同一份** Leitner 間隔複習表；首頁告訴孩子今天該複習什麼、下一課是哪一課。不使用任何 AI 服務。

介面主題為原創吉祥物「雲寶」＋天空藍白、雲朵、星星與甜點，**所有頁面一致**（只用 sky／pink 兩組色階，不做全域色階覆寫）。

**音檔：** Sound City Reading 真人音素、Wikimedia IPA；無檔時 Web Speech 備援。

## 二、課程架構 v8.0.0

| Tab | Unit ID | 課次 | 內容 |
| --- | --- | --- | --- |
| 入門拼讀 | `start` | L01–L08 | s a t p i n m d |
| 讀字基礎 | `cvc` | L09–L21 | 其餘 CVC 字母 + 讀短句 + 特殊字 |
| 連音 | `blends` | BL1–BL9 | st/sp/sn、sk/sm/sl/sw、bl/cl/fl、gl/pl、br/cr/dr、fr/gr/pr/tr、nd/nt/mp、nk/ft/lt、str/spr/scr/spl（皆為規則短母音字） |
| 進階發音 | `advanced` | L22–L32、CK1 | sh、ch、th、ng、長母音、母音組；開頭先排規則字；**CK1 為獨立的 -ck 課**（duck、sock…） |
| 替代拼法 | `alt_spellings` | L33–L61 | bb、ph、kn、schwa… + 讀短句 + 特殊字 |

**共 71 堂**。課次 ID 一律固定、不重編（新課用 `BL*`／`CK1`），所以舊書籤與舊進度不會失效。課程內容有三種：grapheme（字母／拼法）、sight_word（特殊字）、decodable_sentences（讀短句）。

### 解鎖規則

- 第一堂永遠開放。
- 做過分班測驗 → 全部開放。
- 完成較後面的課 → 之前的課全部開放（避免舊使用者被鎖住）。

## 三、使用流程

首頁 `/`（由上而下）：

1. **今天**卡片：有待複習 → 「今天複習（N 個）」；沒有 → 「繼續上課」（下一個已開放且未完成的課）；全部上完 → 「多練一輪」。
2. 快速分班測驗（`/placement`）、試唸生字（`/decode`）。
3. 課程地圖：進度條、五個單元、每課節點；已完成且有到期字母的課顯示 🔔 N。

### 一堂課（`/learn/<id>`，grapheme 課）

| 步驟 | 內容 | 與複習表的關係 |
| --- | --- | --- |
| ① 學新的 | 字母／拼法的發音示範、例字、拼法 | 不計入 |
| ② 看字說音 | 逐張卡片：先自己說 → 🔊／🐢 聽答案 → 自評 → 4 選 1 小測驗 | 「還不會」→ wrong；其餘依小測驗結果 right／wrong |
| ③ 例字示範 | 最多 3 個例字：Sound buttons → Sound-talk → Blend（可略過） | 不計入 |
| ④ 拼字 | 拖拉／點選積木拼字，混入干擾積木 | 拼錯的格子 → wrong；拼對不加分 |
| ⑤ 完成 | 標記課程完成，提示「明天會在今天複習出現」 | — |

沒有對應題庫項目的課（少數替代拼法）略過步驟 ②。特殊字課、讀短句課維持各自的練習，完成後標記課程完成（不寫入複習表）。

### 看字說音回合（`RecallRound`）

課內與「多練一輪」共用同一個元件、同一套出題邏輯：

1. 卡片顯示字母／拼法，孩子先大聲說。
2. 🔊 播放真人音素，🐢 慢速（0.6 倍）。
3. 自評：**還不會**（立刻計為答錯、進今天複習）／**我會**（交給小測驗判定）。
4. 小測驗 4 選 1：看字母選聲音，或選有該音的例字；干擾項取自易混淆組，且不洩題（見 `lib/recall/quiz.test.ts`）。
5. 自評「不會」的項目，測驗結果不計入（避免剛看完答案就升盒）。

### 今天複習（`/review`）

- 每個項目各自排程（Leitner，盒 1–5，間隔 `[0,1,2,4,8,16]` 天）；題庫 `data/recall/items.ts` 共 68 項。
- 結果：right（升盒）、wrong（回盒 1）、keep（不變）、placed（分班放盒 3）。
- 到期項目每次最多 10 題；答錯後換題型再試一次，重試只記 keep。
- 「多練一輪」：從**學過的字**挑一輪（`pickRecallSession`：到期優先、再補沒練過的，一輪 8 個、新字至多 5 個），同樣進入看字說音回合，結果寫入同一份複習表。
- 還沒學過任何字時，引導去上第一課。

### 分班測驗（`/placement`）

20 題（涵蓋 6 個層級）；答對者直接標為已會（盒 3），答錯者進今天複習；按下「記起來」後所有課程開放。

### 試唸生字（`/decode`）

小工具：輸入任何單字，拆成 Sound buttons 並可混音。不寫入複習表。

## 四、發音系統

| 情境 | 音源 |
| --- | --- |
| 單音素 | `/audio/soundcity/` |
| 長 a、ai、oo 等 | `/audio/ipa/`、supplement manifest |
| 連音 | `blend:xx` — 逐字母依序播放 |
| 其餘 | SCR 近似音素 → TTS |

```bash
npm run download:audio
```

## 五、進度與遷移

- Storage：`phonics-adventure-progress-v8`；讀取 v7、v6、v5、v4 作為遷移來源，**舊資料不刪除**。
- 形狀：`{ completedLessons, currentLessonId, lastPlayedAt, review, placement }`。
- v7 → v8：移除單字統計（已併入複習表）；已完成的課所教的字母，若複習表還沒有紀錄，補上「盒 2」，到期日分散在今天起 3 天內（舊使用者的字母自然進入每天複習，不會一次擠在今天）。已有紀錄（含分班結果）完全不動。
- v6 → v8：課次 ID 不變，只補欄位再補複習紀錄。v5／v4 → v8：先依對照表轉成現行課次 ID。
- 遷移測試：`lib/progress/migrate.test.ts`。

## 六、路由

| 路由 | 說明 |
| --- | --- |
| `/` | 首頁：今天（待複習數／下一課）、分班測驗、試唸生字、課程地圖 |
| `/learn/<id>` | 課程（L01–L61、BL1–BL9、CK1；舊 ID 自動對應） |
| `/review` | 今天複習＋多練一輪 |
| `/placement` | 分班測驗 |
| `/decode` | 試唸生字 |
| `/mascot` | 雲寶表情一覽 |

舊網址以 `next.config.ts` 永久導向：`/recall`→`/review`、`/play/decode`→`/decode`、`/learn/<id>/play`→`/learn/<id>`、`/play/alchemist`→`/`、`/learn/stage1`→`/`。

## 七、已移除的舊功能（整併時）

- 舊版「Sound Alchemist」獨立遊戲、`/play/alchemist`：拼字併入每堂課的第 ④ 步。
- 舊的 `/learn/<id>/play` 課程流程、`/learn/stage1`、`/recall` 獨立頁：改由 `/learn/<id>` 與 `/review` 取代。
- 單字統計（wordStats）：複習表以字母／拼法為單位，是唯一的記憶模型。
- 舊的 Hop English 課表資料、混音（blend）清單與相關下載／產生腳本、各種舊的字母發音實作：統一走 `lib/phonemeAudio` 系列。
- 色階覆寫（amber→sky、purple→lavender）：各元件直接使用 sky／pink。

## 八、主題與素材

- 吉祥物「雲寶」、雲朵、星星、杯子蛋糕、布丁皆為**原創 SVG**，不使用任何第三方角色素材或商標。
- 全站天空藍／白／粉彩；字型為圓體（Huninn）；按鈕樣式集中在 `components/ui/PageHeader.tsx`（`BTN_PRIMARY`／`BTN_SECONDARY`／`BTN_PINK`）。

## 九、工程

- Next 16、React 19，`npm audit` 0 個弱點。
- Vitest 測試：排程、出題與干擾項不洩題、課程↔題庫對照、複習回合挑題、音檔對應、分班、進度遷移、課程資料。
- `DEV_UNLOCK_ALL_LESSONS` 僅在開發環境有效。

## 十、第二階段（尚未實作）：矯正發音

麥克風檢查 → Web Speech 辨識評估 → 最小對立組 → 錄音比對 → 嘴型提示 → 辨識不了的音改用 CVC 字 → 孩子友善回饋 → 全程本機處理（不上傳語音）。
