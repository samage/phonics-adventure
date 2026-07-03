import type { PhonicsBlock } from '@/types/phonics';
import { getHopPattern } from '@/data/hopEnglishPatterns';
import {
  GRAPHEME_PHONEMES,
  LETTER_PHONEMES,
  LONG_VOWEL_PHONEMES,
  getPhonemeEntry,
} from '@/data/phonemeRegistry';
import {
  playSoundcityForBlock,
  playSoundcityKey,
} from '@/lib/phonemeAudio';
import {
  hopTtsPhonemeFallback,
  resolveHopSoundcityKeys,
} from '@/lib/hopPhonemeAudio';
import { playIpaHopPhoneme } from '@/lib/ipaPhonemeAudio';
import { cancelSpeech, speak } from '@/lib/speech';

function isSingleLetter(char: string): boolean {
  return /^[a-z]$/i.test(char);
}

export function resolveBlockAudioKey(block: PhonicsBlock): string {
  const text = block.text.toLowerCase();

  if (text.includes('_e') && text.length >= 3) {
    const vowel = text[0];
    const longKey = `long_${vowel}`;
    if (LONG_VOWEL_PHONEMES[longKey]) return longKey;
  }

  if (GRAPHEME_PHONEMES[text]) return text;

  if (isSingleLetter(text) && LETTER_PHONEMES[text]) return text;

  if (block.type === 'blend' && text.length >= 2) {
    return `blend:${text}`;
  }

  return text;
}

function ttsFallbackForKey(key: string): string {
  const entry = getPhonemeEntry(key);
  if (entry) return entry.fallback;
  return key;
}

/** 播放單一音素：Sound City Reading → Web Speech */
export async function speakPhoneme(key: string): Promise<void> {
  cancelSpeech();
  const k = key.toLowerCase();

  if (k.startsWith('hop_')) {
    const pattern = getHopPattern(k);
    if (pattern) {
      if (await playIpaHopPhoneme(k)) return;

      const scrKeys = resolveHopSoundcityKeys(k);
      if (scrKeys.length > 0) {
        for (let i = 0; i < scrKeys.length; i++) {
          if (i > 0) {
            await new Promise((r) => setTimeout(r, 400));
          }
          await playSoundcityKey(scrKeys[i]);
        }
        return;
      }
      await speak(hopTtsPhonemeFallback(k, pattern), { rate: 0.45, pitch: 1.0 });
      return;
    }
  }

  if (k.startsWith('blend:')) {
    const letters = k.slice(6);
    for (let i = 0; i < letters.length; i++) {
      await speakPhoneme(letters[i]);
      if (i < letters.length - 1) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    return;
  }

  if (k === 'x') {
    await speakPhoneme('k');
    await new Promise((r) => setTimeout(r, 180));
    await speakPhoneme('s');
    return;
  }

  if (await playSoundcityKey(k)) return;

  await speak(ttsFallbackForKey(k), { rate: 0.45, pitch: 1.0 });
}

export async function speakBlockPhoneme(block: PhonicsBlock): Promise<void> {
  if (block.type === 'silent_e') return;
  cancelSpeech();
  if (await playSoundcityForBlock(block)) return;
  const key = resolveBlockAudioKey(block);
  return speakPhoneme(key);
}

export { speakPhoneme as speakLetterSound };
