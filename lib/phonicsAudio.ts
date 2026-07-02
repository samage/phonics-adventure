import type { PhonicsBlock } from '@/types/phonics';
import {
  blendPhonemeAudioPath,
  getBlendPhoneme,
} from '@/data/blendPedagogy';
import { getHopPattern } from '@/data/hopEnglishPatterns';
import {
  GRAPHEME_PHONEMES,
  LETTER_PHONEMES,
  LONG_VOWEL_PHONEMES,
  getPhonemeEntry,
} from '@/data/phonemeRegistry';
import { hopEnglishLocalPath, hopEnglishRemoteUrl } from '@/data/hopEnglishPhonics';
import { cancelSpeech, playAudioFile, playAudioFileSegment, speak } from '@/lib/speech';

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

async function playHopPattern(key: string): Promise<boolean> {
  const pattern = getHopPattern(key);
  if (!pattern) return false;

  const audioKey = pattern.key;
  const local = hopEnglishLocalPath(audioKey);
  if (await playAudioFile(local)) return true;

  const remote = hopEnglishRemoteUrl(audioKey);
  if (remote && (await playAudioFile(remote))) return true;

  const base = hopEnglishRemoteUrl('hop_a')?.replace(/\/\d+\.mp3$/, '');
  if (base && (await playAudioFile(`${base}/${pattern.audioId}.mp3`))) return true;

  return false;
}

/** 混音教學音：絲—誒—特（拉長音 + 可選短截） */
async function playBlendPhoneme(key: string): Promise<boolean> {
  const k = key.toLowerCase();
  const entry = getBlendPhoneme(k);
  if (!entry) return false;

  const src = blendPhonemeAudioPath(k);
  if (entry.playMs && entry.playMs > 0) {
    return playAudioFileSegment(src, entry.playMs);
  }
  return playAudioFile(src);
}

/** 播放單一音素或希平方發音規則 */
export async function speakPhoneme(key: string): Promise<void> {
  cancelSpeech();
  const k = key.toLowerCase();

  if (k.startsWith('hop_') && (await playHopPattern(k))) return;

  if (k.startsWith('blend:')) {
    const letters = k.slice(6);
    for (let i = 0; i < letters.length; i++) {
      await speakPhoneme(letters[i]);
      if (i < letters.length - 1) {
        const gap = getBlendPhoneme(letters[i])?.gapAfterMs ?? 280;
        await new Promise((r) => setTimeout(r, gap));
      }
    }
    return;
  }

  if (k === 'x') {
    await speakPhoneme('k');
    await new Promise((r) => setTimeout(r, 200));
    await speakPhoneme('s');
    return;
  }

  if (isSingleLetter(k) && LETTER_PHONEMES[k]) {
    if (await playBlendPhoneme(k)) return;
  }

  const entry = getPhonemeEntry(k);
  if (entry) {
    return speak(entry.fallback, { rate: 0.45, pitch: 1.0 });
  }

  return speak(k, { rate: 0.45, pitch: 1.0 });
}

export async function speakBlockPhoneme(block: PhonicsBlock): Promise<void> {
  if (block.type === 'silent_e') return;
  const key = resolveBlockAudioKey(block);
  return speakPhoneme(key);
}

export { speakPhoneme as speakLetterSound };
