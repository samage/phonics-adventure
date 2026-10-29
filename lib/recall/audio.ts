/**
 * 「看字母說音」專用的音檔播放：
 * - 一般 key：預錄女聲音素（public/audio/phonemes/）
 * - blend:xx：子音連音，逐字母連續播放
 * 🐢 慢速：以 playbackRate 降低速度（保持音高）。
 */

import { clipUrl, clipsForKey } from '@/lib/phonemeClips';
import { cancelSpeech, playAudioFile } from '@/lib/speech';

const SLOW_RATE = 0.6;

/** 回傳單一音檔的網址；blend（多個音檔）或找不到時回傳 null */
export function resolveRecallAudioUrl(audio: string): string | null {
  if (audio.startsWith('blend:')) return null;
  const { clips, missing } = clipsForKey(audio);
  if (clips.length !== 1 || missing.length > 0) return null;
  return clipUrl(clips[0] as string);
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
