/**
 * 孤立音素的播放層：解析（lib/phonemeClips.ts）之後，把 clip 依序播出來。
 * 全部是預錄女聲 mp3（public/audio/phonemes/），不再有男聲或 .ogg。
 */
import type { PhonicsBlock } from '@/types/phonics';
import { clipUrl, clipsForBlock, clipsForKey } from '@/lib/phonemeClips';
import { playAudioFile } from '@/lib/speech';

/** 同一個積木裡（如 bl、str）相鄰兩個音的間隔：短，聽起來連在一起 */
export const CLIP_GAP_MS = 60;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 依序播放多個 clip；全部播成功才回傳 true */
export async function playClips(
  ids: readonly string[],
  options: { rate?: number; gapMs?: number } = {},
): Promise<boolean> {
  const gap = options.gapMs ?? CLIP_GAP_MS;
  let ok = ids.length > 0;
  for (let i = 0; i < ids.length; i++) {
    const played = await playAudioFile(clipUrl(ids[i] as string), options.rate ?? 1);
    ok = ok && played;
    if (i < ids.length - 1) await wait(gap);
  }
  return ok;
}

/** 積木 → 預錄音。有任何一個音沒有檔案（例如 ʒ）就不播，交給呼叫端退回 TTS */
export async function playPhonemeBlock(block: PhonicsBlock): Promise<boolean> {
  const { clips, missing } = clipsForBlock(block);
  if (clips.length === 0 || missing.length > 0) return false;
  return playClips(clips);
}

export async function playPhonemeKey(key: string, rate = 1): Promise<boolean> {
  const { clips, missing } = clipsForKey(key);
  if (clips.length === 0 || missing.length > 0) return false;
  return playClips(clips, { rate });
}
