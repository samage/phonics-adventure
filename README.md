# Phonics Adventure ☁️ 自然發音學習 App

給小朋友「看到字母／拼法，馬上說出它的聲音」的自然發音練習 App。孩子學過自然發音卻容易忘，所以這裡把**上課**和**間隔複習**接成同一條路：學新字 → 看字說音 → 明天自動回來複習。由吉祥物 **雲寶**（原創 SVG 的白色長耳小狗）陪著練習。全程不使用任何 AI 服務。

線上版：https://phonics-adventure-ten.vercel.app/

## 一個系統、一條路

```
首頁 /（今天要做什麼 + 課程地圖）
 ├─ 有待複習 → /review「今天複習」（Leitner 排程）
 ├─ 沒有待複習 → 接著上下一課 /learn/<id>
 ├─ 快速分班測驗 /placement（會的先跳過）
 └─ 試唸生字 /decode（小工具）
```

### 一堂課（`/learn/<id>`）

學新的 → **看字說音**（卡片＋4 選 1 小測驗）→ 例字示範（最多 3 個，可略過）→ 拼字 → 完成。

- 「看字說音」的結果寫進**同一份** Leitner 複習表，所以學完的字母明天就會出現在「今天複習」。
- 拼字拼錯的格子，對應的字母／拼法也記為「還不會」進複習（拼對不加分：有干擾積木可以猜，不能當成「會」的證據）。
- 特殊字（sight words）與讀短句課維持原本的練習，完成後標記課程完成。
- 課程地圖上，已完成的課若有到期的字母，會顯示 🔔 數量。

### 今天複習（`/review`）

- 先處理到期項目（每次最多 10 個）；答錯會換題型再試一次，重試只記 keep。
- 做完或沒有到期項目時，可以按「多練一輪」：從學過的字母挑一輪（到期的優先，再補沒練過的），同樣是「看字說音＋小測驗」，結果同樣寫進複習表。

### 小測驗不洩題

- 選項來自「易混淆組」（例如 b/d、m/n、a/e、sh/ch…），不是隨機亂湊。
- 干擾項的顏色／型別會跟正解相同，不會因為顏色不同就被猜到。
- 題目與選項不會出現會直接透露答案的字。
- 課內小測驗的選項池只取這一課以前教過的字（加上複習表已有的）；不到 8 個時用最基本的字母音補滿，不會用到還沒教的字母。

### 複習排程

- 盒子 1–5，間隔 `[0, 1, 2, 4, 8, 16]` 天。答對升一盒，答錯回第 1 盒。
- 分班測驗答對的字母直接放到第 3 盒。

### 課程

71 堂：入門、讀字基礎、**連音（BL1–BL9）**、進階（含獨立的 **-ck 課 CK1**）、替代拼法。課次 ID 固定不重編。

## 路由

| 路由 | 說明 |
| --- | --- |
| `/` | 首頁：今天（待複習數／下一課）、分班測驗、試唸生字、課程地圖 |
| `/learn/<id>` | 課程（L01–L61、BL1–BL9、CK1） |
| `/review` | 今天複習＋多練一輪 |
| `/placement` | 快速分班測驗（20 題） |
| `/decode` | 試唸生字：輸入單字，拆成 Sound buttons、混音 |
| `/mascot` | 雲寶表情一覽 |

舊網址會自動導向（`next.config.ts`）：`/recall`→`/review`、`/play/decode`→`/decode`、`/learn/<id>/play`→`/learn/<id>`、`/play/alchemist`、`/learn/stage1`→`/`。

## 發音音源

真人音素錄音：Sound City Reading（`/public/audio/soundcity/`）、Wikimedia IPA（`/public/audio/ipa/`）；沒有檔案時用瀏覽器 TTS 備援。連音（st、bl…）逐字母播放。

```bash
npm run download:audio   # 下載音檔（需 Python 3；Windows 用 py -3）
```

## 開發

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm test           # vitest：排程、出題、課程與題庫對照、複習回合、分班、進度遷移、課程資料
npx tsc --noEmit
npm run build
```

- Next.js 16（App Router）、React 19、Tailwind 4、framer-motion。
- 進度存在瀏覽器 localStorage（鍵 `phonics-adventure-progress-v8`），自動從 v7／v6／v5／v4 遷移，舊進度保留不刪除；已完成的課所教的字母會補進複習表（盒 2、3 天內分散到期）。
- `lib/devConfig.ts`：開發時可 `DEV_UNLOCK_ALL_LESSONS`，**正式環境一律關閉**。

## 程式結構

```
data/recall/items.ts      看字說音題庫（68 項、易混淆組）— 唯一的題庫
data/curriculum/          課程（71 堂）
lib/review/scheduler.ts   Leitner 排程 — 唯一的記憶模型
lib/learn/lessonItems.ts  課程 ↔ 題庫對照、學過的字、課內題目池
lib/recall/               出題（quiz）、複習回合挑題（session）、音檔播放（audio）
lib/placement/            分班測驗
lib/spelling/             拼字干擾積木
lib/progress/             進度存取與遷移（migrate）
components/learn/         課程流程（LessonFlow）、拼字、特殊字、讀句、地圖
components/recall/        看字說音回合（RecallRound）、複習、分班
components/home/          首頁「今天」區
components/mascot/        雲寶與裝飾（皆為原創 SVG）
```

## 下一步（第二階段，尚未實作）

麥克風「矯正發音」：Web Speech 辨識、最小對立組、錄音比對、嘴型提示、無法判定的音改用 CVC 字、孩子友善的回饋、全程本機處理保護隱私。
