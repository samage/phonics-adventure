import type { PhonicsBlock } from '@/types/phonics';
import { speakBlockPhoneme } from '@/lib/phonicsAudio';
import { cancelSpeech, speakWord } from '@/lib/speech';

/** 音素幾乎無停頓地接在一起 */
export const SMOOTH_PHONEME_GAP_MS = 80;

/** 播放整字（Web Speech） */
export async function speakSmoothWordDemo(word: string): Promise<boolean> {
  cancelSpeech();
  await speakWord(word);
  return true;
}

/** 即時平滑混音：SCR 音素緊密相接 */
export async function speakSmoothPhonemeBlend(blocks: PhonicsBlock[]): Promise<void> {
  cancelSpeech();
  const active = blocks.filter((b) => b.type !== 'silent_e');
  for (let i = 0; i < active.length; i++) {
    await speakBlockPhoneme(active[i]);
    if (i < active.length - 1) {
      await new Promise((r) => setTimeout(r, SMOOTH_PHONEME_GAP_MS));
    }
  }
}
