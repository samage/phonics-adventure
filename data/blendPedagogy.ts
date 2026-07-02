import type { PhonicsBlock } from '@/types/phonics';
import manifest from '@/data/blendPhonemeManifest.json';

export interface BlendPhonemeEntry {
  spoken: string;
  rate: string;
  hintZh: string;
  ipa: string;
  playMs: number | null;
  gapAfterMs: number;
}

const BLEND_PHONEMES = manifest as Record<string, BlendPhonemeEntry>;

export function getBlendPhoneme(key: string): BlendPhonemeEntry | null {
  return BLEND_PHONEMES[key.toLowerCase()] ?? null;
}

export function blendPhonemeAudioPath(key: string): string {
  return `/audio/blend-phonemes/${key.toLowerCase()}.mp3`;
}

/** 積木下方顯示的中文混音提示（如 絲、誒、特） */
export function getBlendHintForBlock(block: PhonicsBlock): string | null {
  const text = block.text.toLowerCase();
  if (text.includes('_e') && text.length >= 3) {
    return getBlendPhoneme(`long_${text[0]}`)?.hintZh ?? getBlendPhoneme(text[0])?.hintZh ?? null;
  }
  if (text.length === 1) return getBlendPhoneme(text)?.hintZh ?? null;
  return getBlendPhoneme(text)?.hintZh ?? null;
}

/** 混音時音素之間的停頓（母音後較長，模擬 絲—誒——特） */
export function getBlendGapAfterBlock(block: PhonicsBlock, isLast: boolean): number {
  if (isLast) return 0;
  const text = block.text.toLowerCase();
  const key = text.includes('_e') && text.length >= 3 ? `long_${text[0]}` : text;
  return getBlendPhoneme(key)?.gapAfterMs ?? (block.type.includes('vowel') ? 480 : 280);
}

export function getAllBlendPhonemeKeys(): string[] {
  return Object.keys(BLEND_PHONEMES);
}
