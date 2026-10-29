# Phonics Adventure ☁️ 自然發音學習 App

給小朋友「看到字母／拼法，馬上說出它的聲音」的自然發音練習 App。由吉祥物 **雲寶**（原創 SVG 的白色長耳小狗）陪著練習。

線上版：https://phonics-adventure-ten.vercel.app/

## 功能

| 功能 | 路由 | 說明 |
| --- | --- | --- |
| 看字母說音 | `/recall` | 看到字母／拼法 → 先自己說 → 按 🔊 / 🐢（慢速）聽真人音素 → 自評 會／不會 → 4 選 1 小測驗 |
| 今天複習 | `/review` | 每個字母／拼法各自排程（Leitner 5 盒），答錯與「不會」會進來；首頁顯示待複習數量 |
| 快速分班測驗 | `/placement` | 20 題，答對的直接記為已會；測完所有課程開放，不必逐課解鎖 |
| 課程 | `/learn/<id>/play` | 71 堂：入門、讀字基礎、**連音（BL1–BL9）**、進階（含獨立的 **-ck 課 CK1**）、替代拼法 |
| 拼字遊戲 | 課程內 | 拖拉積木拼字，會混入長得像的**干擾積木**；拼錯的格子會進今天複習 |
| 試唸生字 | `/play/decode` | 輸入單字，拆成 Sound buttons |
| 雲寶表情 | `/mascot` | 吉祥物的 6 種表情 |

### 小測驗不洩題

- 選項來自「易混淆組」（例如 b/d、m/n、a/e、sh/ch…），不是隨機亂湊。
- 干擾項的顏色／型別會跟正解相同，不會因為顏色不同就被猜到。
- 題目與選項不會出現會直接透露答案的字。

### 複習排程

- 盒子 1–5，間隔 `[0, 1, 2, 4, 8, 16]` 天。答對升一盒，答錯回第 1 盒。
- 分班測驗答對的字母直接放到第 3 盒。
- 單字作答次數／正確率會被記錄，拼不好的字下次拼字練習會排在前面。

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
npm test           # vitest：排程、干擾項不洩題、分班、進度遷移、課程資料
npx tsc --noEmit
npm run build
```

- Next.js 16（App Router）、React 19、Tailwind 4、framer-motion。
- 進度存在瀏覽器 localStorage（鍵 `phonics-adventure-progress-v7`），自動從 v6／v5／v4 遷移，舊進度保留。
- `lib/devConfig.ts`：開發時可 `DEV_UNLOCK_ALL_LESSONS`，**正式環境一律關閉**。

## 程式結構

```
data/recall/items.ts      看字說音題庫（68 項、易混淆組）
lib/review/scheduler.ts   Leitner 排程
lib/recall/               出題（quiz）、回合流程（session）、音檔播放（audio）
lib/placement/            分班測驗
lib/spelling/             拼字干擾積木
lib/progress/             進度存取與遷移
components/mascot/        雲寶與裝飾（皆為原創 SVG）
```

## 下一步（第二階段，尚未實作）

麥克風「矯正發音」：Web Speech 辨識、最小對立組、錄音比對、嘴型提示、無法判定的音改用 CVC 字、孩子友善的回饋、全程本機處理保護隱私。
