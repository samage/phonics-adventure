import { getLetterPhonics } from '@/data/letterPhonics';
import {
  getGraphemePhonics,
  graphemeAudioPath,
} from '@/data/graphemePhonics';
import { letterSoundAudioPath, LETTER_SOUND_SPOKEN } from '@/lib/letterSounds';
import { cancelSpeech, playAudioFile, speak } from '@/lib/speech';

function isSingleLetter(char: string): boolean {
  return /^[a-z]$/i.test(char);
}

/** 播放字母或字母組合的發音 */
export async function speakPhoneme(key: string): Promise<void> {
  cancelSpeech();
  const k = key.toLowerCase();

  const grapheme = getGraphemePhonics(k);
  if (grapheme) {
    const played = await playAudioFile(graphemeAudioPath(grapheme.key));
    if (played) return;
    return speak(grapheme.spoken, { rate: 0.45, pitch: 1.05 });
  }

  if (isSingleLetter(k)) {
    const played = await playAudioFile(letterSoundAudioPath(k));
    if (played) return;
    const spoken = LETTER_SOUND_SPOKEN[k] ?? k;
    const elongated = /^(.)\1{2,}$/.test(spoken);
    const meta = getLetterPhonics(k);
    return speak(spoken, {
      rate: elongated ? 0.35 : 0.45,
      pitch: meta?.phonicsType === 'short_vowel' ? 1.05 : 1.0,
    });
  }

  const played = await playAudioFile(graphemeAudioPath(k));
  if (played) return;
  return speak(k, { rate: 0.45, pitch: 1.05 });
}

export { speakPhoneme as speakLetterSound };
