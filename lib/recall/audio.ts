/**
 * 「看字母說音」專用的音檔播放：
 * - 一般 key：預錄女聲音素（public/audio/phonemes/）
 * - blend:xx：子音連音，逐字母連續播放
 * 🐢 慢速：重複播放兩次（見 lib/audioPacing.ts）。
 */

import { clipUrl, clipsForKey } from '@/lib/phonemeClips';
import { AUDIO_PACING } from '@/lib/audioPacing';
import { cancelSpeech, playAudioFile } from '@/lib/speech';

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

/** 播一遍：blend:xx 逐字母播（間隔 recallBlendLetterGapMs），其他播單一音檔 */
async function playOnce(audio: string): Promise<boolean> {
  if (audio.startsWith('blend:')) {
    const letters = blendLetterKeys(audio);
    let ok = true;
    for (let i = 0; i < letters.length; i++) {
      const url = resolveRecallAudioUrl(letters[i] as string);
      if (!url) {
        ok = false;
        continue;
      }
      ok = (await playAudioFile(url)) && ok;
      if (i < letters.length - 1) await wait(AUDIO_PACING.recallBlendLetterGapMs);
    }
    return ok;
  }
  const url = resolveRecallAudioUrl(audio);
  if (!url) return false;
  return playAudioFile(url);
}

/**
 * 一般：播一遍。🐢：同一個音重複 slowPhoneme.repeats 次，中間隔 slowPhoneme.gapMs
 * （音檔本身不拉長，所以不會有嘶聲）。
 */
export async function playRecallSound(
  audio: string,
  options: { slow?: boolean } = {},
): Promise<boolean> {
  cancelSpeech();
  const times = options.slow ? AUDIO_PACING.slowPhoneme.repeats : 1;
  let ok = true;
  for (let n = 0; n < times; n++) {
    ok = (await playOnce(audio)) && ok;
    if (n < times - 1) await wait(AUDIO_PACING.slowPhoneme.gapMs);
  }
  return ok;
}
