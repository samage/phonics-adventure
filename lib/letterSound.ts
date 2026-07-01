import type { PhonicsBlock } from '@/types/phonics';
import { getLetterPhonics } from '@/data/letterPhonics';
import { graphemeToBlock, getGraphemePhonics } from '@/data/graphemePhonics';
import { speakPhoneme } from './phonicsAudio';

export { speakPhoneme as speakLetterSound } from './phonicsAudio';

export function isSingleLetter(char: string): boolean {
  return /^[a-z]$/i.test(char);
}

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

export function keyToBlock(key: string): PhonicsBlock {
  if (getGraphemePhonics(key)) return graphemeToBlock(key);
  return letterToBlock(key);
}

export { getLetterPhonics } from '@/data/letterPhonics';
export { getGraphemePhonics, graphemeToBlock } from '@/data/graphemePhonics';

export async function speakGrapheme(key: string): Promise<void> {
  return speakPhoneme(key);
}
