# Phonics Adventure 自然發音遊戲化 App — 規格書

## 一、專案說明

專為 8 歲左右、遇到新單字容易產生挫折感的孩子設計的自然發音（Phonics）遊戲化 App。

核心理念：**不背規則、不查音標；透過操作遊戲機制，自然內化發音直覺。**
把英文字母組合轉化為「有聲音的積木」，讓孩子在拖拉、碰撞、解謎中訓練大腦的「混音（Blending）」與「解碼（Decoding）」能力。

本次交付範圍（第一階段 MVP）：

- 核心發音切片引擎（規則演算法 + 精選教學單字白名單）
- Web Speech 語音控制
- 兒童友善 UI 系統與勝利彩花特效
- 關卡一「字母積木煉金術」完整可玩體驗

關卡二「字尾大冒險」、關卡三「時空 X 光機」已預留架構，後續接續開發。

## 二、技術棧

| 類別 | 技術 |
| --- | --- |
| 框架 | Next.js 16（App Router）+ React 19 + TypeScript |
| 樣式 | Tailwind CSS v4（CSS-based 設定）+ 自訂 keyframes |
| 動畫 / 拖拉 | framer-motion |
| 勝利特效 | canvas-confetti |
| 語音 | 瀏覽器原生 Web Speech API（window.speechSynthesis），免外部付費 API |
| 字體 | Fredoka（圓潤粗體，next/font/google） |

> 備註：Tailwind v4 採 CSS 設定，`tailwindcss-animate` 對 v4 相容性不佳，
> 故改以 `app/globals.css` 內的自訂 keyframes（pop-in / wiggle / glow / float）實作動畫。

## 三、程式架構

```
app/
  layout.tsx                 # 根佈局，套用圓潤字體與背景
  page.tsx                   # 首頁：三大關卡選單
  globals.css                # 全域樣式、糖果背景、動畫 keyframes
  play/
    alchemist/page.tsx       # 關卡一遊戲頁
components/
  PhonicsBlockCard.tsx       # 依發音類型上色的「聲音積木」
  ConfettiBurst.tsx          # 勝利彩花特效（fireConfetti）
  games/SoundAlchemist/
    SoundAlchemist.tsx       # 關卡一：字母積木煉金術
constants/
  themeColors.ts             # THEME_COLORS：PhonicsType → 糖果配色
data/
  curatedWords.ts            # 精選教學單字白名單 + 關卡一單字清單
lib/
  speech.ts                  # Web Speech API 封裝
types/
  phonics.ts                 # PhonicsType / PhonicsBlock 型別
utils/
  phonicsEngine.ts           # parseWordToBlocks 切片演算法
```

## 四、核心 API 規格

### 4.1 型別 `types/phonics.ts`

```ts
type PhonicsType =
  | 'consonant' | 'short_vowel' | 'long_vowel'
  | 'digraph' | 'blend' | 'silent_e';

interface PhonicsBlock {
  text: string;       // 顯示的字母組合，如 "sh"、"ai"、"t"
  type: PhonicsType;  // 發音類型
  soundRule: string;  // 發音規則名稱，如 "Digraphs"
  phoneme: string;    // 音素標記，供 TTS / 語音引導使用
}
```

### 4.2 發音引擎 `utils/phonicsEngine.ts`

```ts
function parseWordToBlocks(word: string): PhonicsBlock[]
```

雙軌策略：

1. **白名單優先**：命中 `CURATED_WORDS` 即回傳人工校對切片（保證教學正確）。
2. **規則演算法**：由左到右貪婪比對，優先級
   `Magic-E > Digraphs / Vowel Teams（最長組合）> Blends > 單一字母`。
   - Magic-E：字尾 `子音 + 母音 + 子音 + e` → 母音轉長音、結尾 `e` 標 `silent_e`。
   - Digraphs：`sh ch th ph wh ck ng igh`
   - Vowel Teams：`ai ay ee ea oa oo ow ou oi oy au aw ew`
   - Blends：字首 `bl br cl ... tr tw`；字尾 `nd nk nt mp ...`

範例：

```jsonc
parseWordToBlocks("train")
// [
//   { "text": "tr", "type": "blend",      "soundRule": "Initial Blends", "phoneme": "tr" },
//   { "text": "ai", "type": "long_vowel", "soundRule": "Vowel Teams",    "phoneme": "eɪ" },
//   { "text": "n",  "type": "consonant",  "soundRule": "Basic Consonant","phoneme": "n"  }
// ]
```

### 4.3 語音控制 `lib/speech.ts`

| 函數 | 說明 |
| --- | --- |
| `speakWord(word)` | 流暢唸出完整單字（rate 0.75） |
| `speakBlock(block)` | 唸出單一積木音素（rate 0.6，音調略高） |
| `speakBlend(blocks, gapMs?)` | 依序播放多積木混音，silent_e 不發聲 |
| `cancelSpeech()` | 停止所有語音 |

- `lang` 固定 `en-US`，`rate` 預設 `0.75`（標準語速對初學者太快）。
- 預留 `speakSnippet(key)` 介面：日後可接預錄 Audio Snippets 取代原生 TTS，呼叫端不必更動。

### 4.4 主題配色 `constants/themeColors.ts`

`THEME_COLORS: Record<PhonicsType, ThemeColor>`，每種發音類型有專屬糖果色，
孩子單看顏色即可預期發音結構（子音=天空藍、短母音=檸檬黃、長母音=蜜桃橘、
複合子母音=葡萄紫、混合子音=蘋果綠、Magic-E=安靜灰）。

## 五、關卡一玩法（字母積木煉金術）

1. 隨機抽一個單字（取自 `ALCHEMIST_WORDS`），切片成聲音積木散落於積木池。
2. 點一下積木 → 唸出該音素；拖進中央「煉金爐」。
3. 須依正確順序放入；放對 → 卡扣並播放目前序列的連音（混音）。
4. 全部正確 → 煉金爐發光、噴灑彩花、流暢唸出完整單字。
5. 可「換一個單字」重玩。

## 六、本機開發

開發環境：Windows 11 / Node 22+（本機 v24）。PowerShell 指令請分行執行（`&&` 非有效分隔符）。

```powershell
npm install
npm run dev      # 開發伺服器 http://localhost:3000
npm run build    # 產線建置
npm run lint     # ESLint 檢查
```

## 七、後續規劃

- 關卡二「字尾大冒險」：狀態機控制 `currentPrefix` / `currentSuffix` 動態渲染。
- 關卡三「時空 X 光機」：手電筒滑動高亮長單字的各組合。
- 發音例外字以白名單持續補修正；必要時導入預錄 Audio Snippets。
