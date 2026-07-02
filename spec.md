# Phonics Adventure 自然發音學習 App — 規格書

## 一、專案說明

參考 [HOPE English 希平方 — 自然發音入門班](https://www.hopenglish.com/hope-tips-basic-phonics)，以 **希平方 40 組發音規則** 為核心，搭配混音拼讀練習，循序建立「字形 ↔ 發音」連結。

**課程來源：** 希平方入門班（音檔可下載使用）。均一教育平台的影片音檔無法抽取，故不作為課程內容來源。

## 二、技術棧

| 類別 | 技術 |
| --- | --- |
| 框架 | Next.js 16 + React 19 + TypeScript |
| 樣式 | Tailwind CSS v4 |
| 動畫 | framer-motion |
| 語音 | 希平方預錄 MP3 + 例字音檔截取 + 瀏覽器 TTS 備援 |
| 進度 | localStorage（`phonics-adventure-progress-v4`） |

## 三、課程架構

```
Curriculum v3.0.0
  ├── units[]     # UI 分段標籤（5 個單元）
  └── lessons[]   # L01–L41 線性課程（41 堂可玩）
```

### 單元分段

| Unit | 課次 | 內容 |
| --- | --- | --- |
| consonants_voiced | L01–L15 | 有聲子音 15 組 |
| consonants_voiceless | L16–L24 | 無聲子音 9 組 |
| vowels | L25–L40 | 母音 16 組 |
| blending | L41 | 混音拼讀 CVC |

### L01–L40 希平方 40 組發音規則

每堂一組，標題格式：`發音（ d / dd ）`，例字來自希平方表格。

完整對照見 `data/hopEnglishPatterns.ts`。

### L41 混音拼讀

- 示範字：sat, pin, bed, dog, sun, mat, pig, cup
- 首音：希平方規則音檔截取（如前 1.8 秒）
- 韻尾／整字：例字音檔 `blend-words/` 時間軸截取

## 四、程式架構

```
data/
  hopEnglishPatterns.ts    # 40 組拼法 + 例字（課程來源）
  hopEnglishPhonics.ts     # 音檔 key 對應
  blendDemoManifest.json   # 混音示範音設定
  curriculum/hopCurriculum.ts  # 課程定義
components/activities/
  GraphemeLesson.tsx       # L01–L40 發音規則課
  BlendIntroLesson.tsx     # L41 混音拼讀
```

## 五、發音系統

| 情境 | 音源 |
| --- | --- |
| L01–L40 規則課 | `/audio/hopenglish/{patternKey}.mp3` |
| L41 混音首音 | 希平方音檔截取（`hopClip`） |
| L41 韻尾／整字 | `/audio/blend-words/{word}.mp3` 截取 |
| 單字母點擊（練習） | `/audio/blend-phonemes/{letter}.mp3` |
| 整字備援 | 瀏覽器 Web Speech API |

下載希平方音檔：`npm run download:hopenglish-audio`

## 六、路由

| 路由 | 用途 |
| --- | --- |
| `/` | 課程路徑 |
| `/learn/L01/play` | 第一堂：發音規則 |
| `/learn/L41/play` | 混音拼讀 |
| `/play/alchemist` | 導向 L41 |

## 七、本機開發

```powershell
npm install
npm run dev
npm run download:hopenglish-audio
npm run build
```

## 八、API 規格

本專案為純前端 App，無後端 API。進度儲存於瀏覽器 localStorage。

```typescript
interface UserProgress {
  completedLessons: string[];  // e.g. ['L01', 'L02']
  currentLessonId: string | null;
  wordStats: Record<string, { correct: number; attempts: number }>;
  lastPlayedAt: string;
}
```

解鎖規則：線性解鎖，完成第 N 堂後解鎖第 N+1 堂。開發環境可設 `NEXT_PUBLIC_DEV_UNLOCK_ALL_LESSONS=true` 略過。
