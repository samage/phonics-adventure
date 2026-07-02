import {
  blendDemoBlendPath,
  blendDemoOnsetPath,
  blendDemoRimePath,
  getDemoClipTiming,
  splitCvcOnsetRime,
} from '@/data/blendOnsetRime';
import { cancelSpeech, playAudioFile, playAudioFileRange } from '@/lib/speech';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function playDemoPart(word: string, part: 'onset' | 'rime' | 'blend'): Promise<boolean> {
  const src = part === 'onset'
    ? blendDemoOnsetPath(word)
    : part === 'rime'
      ? blendDemoRimePath(word)
      : blendDemoBlendPath(word);
  const { startMs, clipMs } = getDemoClipTiming(word, part);

  if (startMs > 0 || clipMs) {
    return playAudioFileRange(src, startMs, clipMs);
  }
  return playAudioFile(src);
}

export type BlendHighlight = 'onset' | 'rime' | 'word' | null;

/**
 * 三步混音示範（希平方音檔 + 例字截取）：
 * 1. 拉長首音（s…）或塞音短促音（ㄅ、ㄉ） 2. 讀韻尾（at） 3. 整字連讀
 */
export async function playBlendDemo(
  word: string,
  onStep?: (step: BlendHighlight) => void,
): Promise<boolean> {
  cancelSpeech();
  const split = splitCvcOnsetRime(word);
  if (!split) return false;

  const w = word.toLowerCase();

  onStep?.('onset');
  if (!(await playDemoPart(w, 'onset'))) return false;
  await delay(350);

  onStep?.('rime');
  if (!(await playDemoPart(w, 'rime'))) return false;
  await delay(350);

  onStep?.('word');
  if (!(await playDemoPart(w, 'blend'))) return false;
  onStep?.(null);
  return true;
}

export async function playBlendPartial(
  word: string,
  filledCount: number,
): Promise<void> {
  cancelSpeech();
  const split = splitCvcOnsetRime(word);
  if (!split || filledCount < 1) return;

  const w = word.toLowerCase();
  await playDemoPart(w, 'onset');
  if (filledCount < 2) return;

  await delay(280);
  await playDemoPart(w, 'rime');
}

/** @deprecated 改用 playBlendDemo */
export const playJunyiBlendDemo = playBlendDemo;
/** @deprecated 改用 playBlendPartial */
export const playJunyiBlendPartial = playBlendPartial;
