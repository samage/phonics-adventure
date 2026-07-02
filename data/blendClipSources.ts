import { LETTER_PHONICS } from '@/data/letterPhonics';

/** 混音拼讀：從希平方例字開頭截取音素 */
export interface BlendClipSource {
  word: string;
  clipMs: number;
}

/** 母音例字覆寫（比 letterPhonics 更貼近 L42 短母音） */
const VOWEL_OVERRIDES: Record<string, BlendClipSource> = {
  o: { word: 'pot', clipMs: 260 },
};

const VOWEL_MS = 300;
const CONTINUANT_MS = 260;
const NASAL_MS = 220;
const STOP_MS = 110;

function defaultClipMs(letter: string): number {
  const l = letter.toLowerCase();
  if ('aeiou'.includes(l)) return VOWEL_MS;
  if ('sfvzh'.includes(l)) return CONTINUANT_MS;
  if ('mnlrwy'.includes(l)) return NASAL_MS;
  return STOP_MS;
}

export function getBlendClipSource(letter: string): BlendClipSource | null {
  const l = letter.toLowerCase();
  if (VOWEL_OVERRIDES[l]) return VOWEL_OVERRIDES[l];
  const meta = LETTER_PHONICS[l];
  if (!meta) return null;
  return { word: meta.exampleWord, clipMs: defaultClipMs(l) };
}

export function blendWordAudioPath(word: string): string {
  return `/audio/blend-words/${word.toLowerCase()}.mp3`;
}

/** 產生音檔腳本用 */
export function getAllBlendWords(): string[] {
  const words = new Set<string>(['pot', 'sat', 'pin', 'mat', 'cup']);
  for (const meta of Object.values(LETTER_PHONICS)) {
    words.add(meta.exampleWord);
  }
  return [...words].sort();
}
