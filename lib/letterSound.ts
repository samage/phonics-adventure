import type { PhonicsBlock } from '@/types/phonics';
import { getLetterPhonics } from '@/data/letterPhonics';
import { speakPhoneme } from '@/lib/phonicsAudio';

export { speakBlockPhoneme } from '@/lib/phonicsAudio';

/** 單一字母 → 發音積木（沒有收錄時當成一般子音） */
export function letterToBlock(letter: string): PhonicsBlock {
  const key = letter.toLowerCase();
  const meta = getLetterPhonics(key);
  if (meta) {
    return {
      text: key,
      type: meta.phonicsType,
      soundRule: meta.soundRule,
      phoneme: meta.phoneme,
    };
  }
  return {
    text: key,
    type: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: key,
  };
}

/** 唸出一個字母／字母組合的「音」（預錄音素，不是字母名稱） */
export async function speakGrapheme(key: string): Promise<void> {
  return speakPhoneme(key);
}
