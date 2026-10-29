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
- 特殊字（sight words）課與讀短句課也一樣：學（整字記／逐字讀句子）→ **看字說說看**（卡片＋小測驗）→ 完成，結果寫進同一份複習表。
  - 特殊字：一個字一個項目（`w:the`）；卡片看字→自己唸→🔊 聽答案→自評。小測驗輪流出兩種：聽聲音選字（干擾是長得像的字，如 the／then／they），或看字選正確唸法（選項是 🔊 按鈕）。
  - 短句：一句一個項目（`s:L20:0`）；卡片逐句讀→🔊 聽整句→自評。小測驗是「聽整句、選出空格裡缺的字」，干擾字不會是句子裡本來就有的字；答錯重考會換一個空格。
- 課程地圖上，已完成的課若有到期的項目（字母、特殊字、短句），會顯示 🔔 數量。

### 今天複習（`/review`）

- 先處理到期項目（每次最多 10 個）；答錯會換題型再試一次，重試只記 keep。
- 做完或沒有到期項目時，可以按「多練一輪」：從學過的字母、特殊字和句子挑一輪（到期的優先，再補沒練過的），同樣是「看字說音＋小測驗」，結果同樣寫進複習表。

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

全部是預錄的**女聲**，App 不再混用男聲，也不再用逐字母 TTS 拼音：

- **單音素（46 個，`public/audio/phonemes/`）**：38 個來自 Sound City Reading（SCR）女聲錄音（原檔在 `audio-src/scr/`）；8 個 SCR 沒有的母音／r 母音（oo 長短、aw、er、ar、or、air、弱化 ə）用 Kokoro 女聲 `af_nova` 合成。**子音一律不用 TTS 切**（合成子音聽起來太假），所以 SCR 沒有的子音 ʒ（television／treasure 的 s）目前沒有錄音，只有 `hop_s_si_z` 這一課會退回裝置 TTS。
- **整字與短句（`public/audio/speech/`）**：所有課程例字、拼字／複習單字與短句，由同一個 Kokoro `af_nova` 聲音預先產生，混音（blend）與整字播放都用這些檔案（語速 0.8，比預設稍慢）；另外有一份更慢的版本 `public/audio/speech_slow/`（語速 0.6），給 🐢 按鈕用；裝置 TTS 只在檔案不存在時（例如「試唸生字」的自由輸入）才當最後備援。
- 所有檔案經 `scripts/build_audio.py` 統一裁切（停止音前留約 100 ms、保留較完整的送氣，尾端漸弱約 60 ms，不硬切）、響度正規化到 −20 LUFS，輸出單聲道 24 kHz mp3。
- 音素對應（`lib/phonemeClips.ts`）以 IPA 音素精確比對（不再用字串 `includes`），並有測試保證每一課的每個單字都對得到檔案。

**授權：** Kokoro 模型權重為 Apache-2.0；它的訓練資料含 CC BY 素材（Koniwa tnc：CC BY 3.0、SIWIS：CC BY 4.0），在此標示出處。SCR 錄音版權屬原作者，請依其網站條款使用。已移除原本的 Wikimedia IPA 男聲錄音、`public/audio/soundcity/`、`public/audio/ipa/` 與舊的音檔 manifest。

```bash
pip install -r scripts/requirements-audio.txt   # 只有重建音檔才需要（Python 3.10+、ffmpeg）
npm run download:soundcity-audio   # 下載 SCR 原始錄音到 audio-src/scr/
npm run export:speech-texts        # 從課程資料匯出所有要預錄的單字與短句 → data/speechTexts.json
npm run build:audio                # 重新產生 public/audio/phonemes、public/audio/speech 與 public/audio/speech_slow（首次會自動下載 Kokoro 模型到 .cache/kokoro）
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
- 進度存在瀏覽器 localStorage（鍵 `phonics-adventure-progress-v9`），自動從 v8／v7／v6／v5／v4 遷移，舊進度保留不刪除；已完成的課所教的字母、特殊字、句子會補進複習表（盒 2、4 天內分散到期），既有紀錄不動。
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
components/learn/         課程流程（LessonFlow）、拼字、特殊字課／讀句課（TextLessonFlow）、地圖
components/recall/        看字說音回合（RecallRound）、複習、分班
components/home/          首頁「今天」區
components/mascot/        雲寶與裝飾（皆為原創 SVG）
```

## 下一步（第二階段，尚未實作）

麥克風「矯正發音」：Web Speech 辨識、最小對立組、錄音比對、嘴型提示、無法判定的音改用 CVC 字、孩子友善的回饋、全程本機處理保護隱私。

### 播放節奏（Sound-talk）

所有間隔集中在 `lib/audioPacing.ts` 一處調整：切音區塊間隔 120 ms；Sound-talk 各段間隔 1 秒；「連起來念」每個音間隔 250 ms；連起來念之後停 800 ms 才念整字。複習／回想的單音素按一次只播一次；🐢 會把同一個音播兩次（中間隔 1 秒），整字則播 `speech_slow` 的慢速錄音。節奏靠間隔與獨立的慢速錄音達成，不對音檔做時間拉伸（避免嘶聲）。
