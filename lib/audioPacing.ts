/**
 * 所有播放節奏的設定集中在這裡（毫秒）。孩子聽不懂就改這裡，不用到處找。
 * 音檔本身不做時間伸縮（子音不拉長，免得出現嘶聲）；慢，是靠「間隔」與「預錄的慢速整字」。
 */
export const AUDIO_PACING = {
  /** 同一個積木內相鄰兩個音（bl、str 的 b+l）的間隔 */
  blockClipGapMs: 120,
  /** Sound-talk（切音）：每個音之間的間隔 */
  soundTalkGapMs: 1000,
  /** 沒有預錄檔的 Hop 課次（多個音）之間的間隔 */
  hopClipGapMs: 600,
  /** 混音示範 */
  blend: {
    /** 首音 → 其餘音 */
    afterOnset: 1000,
    /** 其餘音之間 */
    betweenRime: 1000,
    /** 切開念完 → 連起來念 */
    beforeBlend: 1000,
    /** 「連起來念」那一步，音與音之間 */
    runTogetherGap: 250,
    /** 連起來念完 → 整字錄音 */
    beforeWord: 800,
  },
  /** 複習／回想的 🐢：單音素重複播放的次數與間隔；整字改播預錄的慢速版 */
  slowPhoneme: { repeats: 2, gapMs: 1000 },
  /** 複習時 blend:xx（如 st）一般播放，字母之間的間隔 */
  recallBlendLetterGapMs: 250,
} as const;
