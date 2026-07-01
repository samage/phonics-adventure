# Phonics Adventure 自然發音學習 App — 規格書

## 一、專案說明

參考 [均一教育平台 — 自然發音的六十堂課](https://www.junyiacademy.org/topics/eephn)，以 **60 堂線性課程** 循序教導自然發音。核心理念：看到字就會念、會念就會拼。

第一階段交付：L01–L20 完整可玩，L21–L60 骨架預留。

## 二、技術棧

| 類別 | 技術 |
| --- | --- |
| 框架 | Next.js 16 + React 19 + TypeScript |
| 樣式 | Tailwind CSS v4 |
| 動畫 | framer-motion |
| 語音 | 預錄 MP3 優先 + Web Speech TTS 備援 |
| 進度 | localStorage（`phonics-adventure-progress-v2`） |

## 三、課程架構（均一 60 堂）

```
Curriculum v2.0.0
  ├── units[]     # UI 分段標籤（子音、母音、混音…）
  └── lessons[]   # L01–L60 扁平線性課程
```

### 單元分段

| Unit | 課次 | 內容 |
| --- | --- | --- |
| intro | L01 | 課程介紹 |
| consonants | L02–L04 | 子音三組 |
| vowels | L05–L06 | 短母音 a,e,i / o,u |
| blending | L07 | 混音拼讀 CVC |
| magic_e | L08 | 母音+子音+e |
| graphemes | L09–L33 | 一組合一堂（L09–L20 可玩） |
| finals | L34–L37 | 字尾音（骨架） |
| blends | L38–L43 | 混合子音（骨架） |
| affixes | L44–L52 | 前後綴（骨架） |
| long_words | L53–L60 | 長單字（骨架） |

### L01–L20 可玩課程

| 課次 | 標題 | 活動 |
| --- | --- | --- |
| L01 | 課程介紹 | course_intro |
| L02 | b c d f g h j | letter_group |
| L03 | k l m n p q | letter_group |
| L04 | r s t v w x y z | letter_group |
| L05 | a e i | letter_group |
| L06 | o u | letter_group |
| L07 | 發音組合在一起 | blend_intro |
| L08 | Magic E | grapheme |
| L09–L20 | ai, ay, au…ew | grapheme（各一組合） |

## 四、程式架構

```
app/
  page.tsx                    # 60 堂課程路徑
  learn/[lessonId]/page.tsx   # 課程詳情
  learn/[lessonId]/play/      # 活動遊玩
data/
  curriculum/junyi60.ts       # 60 堂課程資料
  letterPhonics.ts            # 26 字母分類
  graphemePhonics.ts          # 字母組合分類
  curatedWords.ts             # 發音白名單
lib/
  phonicsAudio.ts             # 統一發音解析
  progress/                   # 線性解鎖 v2
components/
  learn/LessonPath60.tsx
  activities/
    CourseIntro.tsx           # L01
    LetterGroupLesson.tsx     # L02–L06
    BlendIntroLesson.tsx      # L07
    GraphemeLesson.tsx        # L08–L20
  games/SoundAlchemist/       # 混音拼字
```

## 五、發音系統

`speakPhoneme(key)` 解析順序：

1. `/audio/graphemes/{key}.mp3` — 字母組合（ai, ch, magic_e…）
2. `/audio/letter-sounds/{key}.mp3` — 單字母
3. TTS 備援

產生音檔：`npm run generate:phonics-audio`（需 Python + edge-tts）

## 六、進度 API

- **線性解鎖**：完成 L(n) 解鎖 L(n+1)
- `getUnitProgress(unitId)` — 單元完成統計
- `getOverallProgress()` — 可玩課程完成數 / 20

## 七、路由

| 路由 | 用途 |
| --- | --- |
| `/` | 60 堂課程路徑 |
| `/learn/L02` | 課程詳情 |
| `/learn/L07/play` | 開始活動 |
| `/play/alchemist` | 導向 L07 |
| `/learn/stage1` | 導向首頁（舊路由） |

## 八、本機開發

```powershell
npm install
npm run dev
npm run build
npm run generate:phonics-audio
```

## 九、後續規劃

- L21–L60 活動實作
- 均一式轉盤/抽球互動
- 學習單匯出
- 真人錄音取代 TTS
