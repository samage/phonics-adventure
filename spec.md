# Phonics Adventure 自然發音學習 App — 規格書

## 一、專案說明

參考 [HOPE English 希平方 — 自然發音入門班](https://www.hopenglish.com/hope-tips-basic-phonics)，以 **60 堂線性課程** 循序教導自然發音。每堂課對應一組字母拼法（如 `d / dd`）與希平方例字。

第一階段交付：L01–L42 完整可玩，L43–L60 骨架預留。

## 二、技術棧

| 類別 | 技術 |
| --- | --- |
| 框架 | Next.js 16 + React 19 + TypeScript |
| 樣式 | Tailwind CSS v4 |
| 動畫 | framer-motion |
| 語音 | 希平方預錄 MP3 + TTS 備援 |
| 進度 | localStorage（`phonics-adventure-progress-v2`） |

## 三、課程架構

```
Curriculum v2.0.0
  ├── units[]     # UI 分段標籤
  └── lessons[]   # L01–L60 扁平線性課程
```

### 單元分段

| Unit | 課次 | 內容 |
| --- | --- | --- |
| intro | L01 | 開始（無長篇說明） |
| consonants_voiced | L02–L16 | 有聲子音 15 組 |
| consonants_voiceless | L17–L25 | 無聲子音 9 組 |
| vowels | L26–L41 | 母音 16 組 |
| blending | L42 | 混音拼讀 CVC |
| blends | L43–L46 | 混合子音（骨架） |
| finals | L47–L50 | 字尾音（骨架） |
| affixes | L51–L55 | 前後綴（骨架） |
| long_words | L56–L60 | 長單字（骨架） |

### L02–L41 希平方 40 組發音規則

每堂一組，標題格式：`發音（ d / dd ）`，例字來自希平方表格。

| 課次 | 字母組合 | 例字 |
| --- | --- | --- |
| L02 | b / bb | banana, bubble |
| L03 | d / dd | duck, add |
| … | … | … |
| L41 | oi / oy | coin, boy |

完整對照見 `data/hopEnglishPatterns.ts`。

## 四、程式架構

```
data/
  hopEnglishPatterns.ts   # 40 組拼法 + 例字（課程來源）
  hopEnglishPhonics.ts    # 音檔 key 對應
  curriculum/junyi60.ts   # 60 堂課程
components/activities/
  CourseIntro.tsx         # L01 極簡開始
  GraphemeLesson.tsx      # L02–L41 發音規則課
  BlendIntroLesson.tsx    # L42 混音拼讀
```

## 五、發音系統

音檔來源：[自然發音入門班](https://www.hopenglish.com/hope-tips-basic-phonics)

- 每組發音規則一個音檔（如 `hop_d_dd.mp3`）
- 路徑：`/public/audio/hopenglish/{patternKey}.mp3`
- 下載：`npm run download:hopenglish-audio`

## 六、路由

| 路由 | 用途 |
| --- | --- |
| `/` | 60 堂課程路徑 |
| `/learn/L03/play` | 發音（ d / dd ） |
| `/learn/L42/play` | 混音拼讀 |
| `/play/alchemist` | 導向 L42 |

## 七、本機開發

```powershell
npm install
npm run dev
npm run download:hopenglish-audio
npm run build
```
