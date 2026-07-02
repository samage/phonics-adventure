import type { PhonicsBlock } from '@/types/phonics';
import { resolveBlockAudioKey } from '@/lib/phonicsAudio';
import { getBlendPhoneme, blendPhonemeAudioPath } from '@/data/blendPedagogy';
import { smoothWordAudioPath } from '@/data/smoothBlendWords';
import { cancelSpeech, playAudioFile, playAudioFileSegment } from '@/lib/speech';

/** 音素幾乎無停頓地接在一起 */
export const SMOOTH_PHONEME_GAP_MS = 40;

async function playBlendLetter(key: string): Promise<boolean> {
  const k = key.toLowerCase();
  const entry = getBlendPhoneme(k);
  if (!entry) return false;
  const src = blendPhonemeAudioPath(k);
  if (entry.playMs && entry.playMs > 0) {
    return playAudioFileSegment(src, entry.playMs);
  }
  return playAudioFile(src);
}

/** 播放預錄的平滑混音示範（s a t 連讀） */
export async function speakSmoothWordDemo(word: string): Promise<boolean> {
  cancelSpeech();
  return playAudioFile(smoothWordAudioPath(word));
}

/** 即時平滑混音：拖積木時音素緊密相接 */
export async function speakSmoothPhonemeBlend(blocks: PhonicsBlock[]): Promise<void> {
  cancelSpeech();
  const active = blocks.filter((b) => b.type !== 'silent_e');
  for (let i = 0; i < active.length; i++) {
    const key = resolveBlockAudioKey(active[i]);
    if (key === 'x') {
      await playBlendLetter('k');
      await new Promise((r) => setTimeout(r, SMOOTH_PHONEME_GAP_MS));
      await playBlendLetter('s');
    } else {
      await playBlendLetter(key);
    }
    if (i < active.length - 1) {
      await new Promise((r) => setTimeout(r, SMOOTH_PHONEME_GAP_MS));
    }
  }
}
