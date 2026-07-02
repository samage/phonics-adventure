import type { PhonicsBlock } from '@/types/phonics';
import { getHopPattern } from '@/data/hopEnglishPatterns';
import {
  GRAPHEME_PHONEMES,
  LETTER_PHONEMES,
  LONG_VOWEL_PHONEMES,
} from '@/data/phonemeRegistry';
import {
  getHopEnglishAudioId,
  hopEnglishLocalPath,
  hopEnglishRemoteUrl,
} from '@/data/hopEnglishPhonics';
import { cancelSpeech, playAudioFile, speak } from '@/lib/speech';

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

async function playHopEnglishKey(key: string): Promise<boolean> {
  const local = hopEnglishLocalPath(key);
  if (await playAudioFile(local)) return true;

  const remote = hopEnglishRemoteUrl(key);
  if (remote && (await playAudioFile(remote))) return true;

  return false;
}

/** 播放單一音素或希平方發音規則 */
export async function speakPhoneme(key: string): Promise<void> {
  cancelSpeech();
  const k = key.toLowerCase();

  // 希平方 pattern key（hop_d_dd 等）
  const pattern = getHopPattern(k);
  if (pattern) {
    const audioKey = pattern.key;
    const local = hopEnglishLocalPath(audioKey);
    if (await playAudioFile(local)) return;
    const remote = hopEnglishRemoteUrl(audioKey);
    if (remote && (await playAudioFile(remote))) return;
    // 備援：用 S3 音檔編號直接播
    const byId = `${hopEnglishRemoteUrl('a')?.replace(/\/\d+\.mp3$/, '')}/${pattern.audioId}.mp3`;
    if (await playAudioFile(byId)) return;
  }

  if (k.startsWith('blend:')) {
    const letters = k.slice(6);
    for (let i = 0; i < letters.length; i++) {
      await speakPhoneme(letters[i]);
      if (i < letters.length - 1) {
        await new Promise((r) => setTimeout(r, 80));
      }
    }
    return;
  }

  if (k === 'x') {
    await speakPhoneme('k');
    await new Promise((r) => setTimeout(r, 80));
    await speakPhoneme('s');
    return;
  }

  if (getHopEnglishAudioId(k)) {
    const played = await playHopEnglishKey(k);
    if (played) return;
  }

  const entry = LETTER_PHONEMES[k];
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
