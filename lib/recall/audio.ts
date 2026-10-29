/**
 * 「看字母說音」專用的音檔播放：
 * - 一般 key：Sound City Reading 預錄音（mp3 / ogg）
 * - ipa:hop_xxx：Wikimedia IPA 預錄音（er／ir／ur）
 * - blend:xx：子音連音，逐字母連續播放
 * 🐢 慢速：以 playbackRate 降低速度（保持音高）。
 */

import { ipaAudioPath } from '@/lib/ipaPhonemeAudio';
import {
  resolveSoundcityKey,
  soundcityAudioPath,
} from '@/lib/phonemeAudio';
import {
  hasScrSupplementKey,
  scrSupplementAudioPath,
} from '@/lib/scrSupplementAudio';
import { cancelSpeech, playAudioFile } from '@/lib/speech';

export const SLOW_RATE = 0.6;

/** 回傳單一音檔的網址；blend（多個音檔）或找不到時回傳 null */
export function resolveRecallAudioUrl(audio: string): string | null {
  if (audio.startsWith('ipa:')) return ipaAudioPath(audio.slice(4));
  if (audio.startsWith('blend:')) return null;
  const name = resolveSoundcityKey(audio);
  if (!name) return null;
  return hasScrSupplementKey(name)
    ? scrSupplementAudioPath(name)
    : soundcityAudioPath(name);
}

/** blend 會用到的字母音檔 key（逐字母） */
export function blendLetterKeys(audio: string): string[] {
  return audio.startsWith('blend:') ? audio.slice(6).split('') : [];
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function playRecallSound(
  audio: string,
  options: { slow?: boolean } = {},
): Promise<boolean> {
  const rate = options.slow ? SLOW_RATE : 1;
  if (audio.startsWith('blend:')) {
    cancelSpeech();
    const letters = blendLetterKeys(audio);
    let ok = true;
    for (let i = 0; i < letters.length; i++) {
      const url = resolveRecallAudioUrl(letters[i] as string);
      if (!url) {
        ok = false;
        continue;
      }
      const played = await playAudioFile(url, rate);
      ok = ok && played;
      // 慢速時音與音之間留長一點，連音聽得更清楚
      if (i < letters.length - 1) await wait(options.slow ? 380 : 120);
    }
    return ok;
  }
  const url = resolveRecallAudioUrl(audio);
  if (!url) return false;
  return playAudioFile(url, rate);
}
