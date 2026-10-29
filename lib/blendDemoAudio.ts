import { splitCvcOnsetRime } from '@/data/blendOnsetRime';
import { playPhonemeBlock } from '@/lib/phonemeAudio';
import { isSilentBlock, speakBlockPhoneme } from '@/lib/phonicsAudio';
import { cancelSpeech, speakWord } from '@/lib/speech';
import { parseWordToBlocks } from '@/utils/phonicsEngine';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export type BlendHighlight = 'onset' | 'rime' | 'word' | null;

/** 混音間隔（毫秒）：切開念的間隔，與連起來念時音與音之間的間隔 */
export const BLEND_SEGMENT_GAPS = { afterOnset: 350, betweenRime: 220, beforeBlend: 300, beforeWord: 300 } as const;

/**
 * 混音示範（全部是預錄女聲）：
 * 1. 首音 2. 韻尾／其餘音素（切開念） 3. 把所有音連起來念 4. 整字
 */
export async function playBlendDemo(
  word: string,
  onStep?: (step: BlendHighlight) => void,
): Promise<boolean> {
  cancelSpeech();
  const blocks = parseWordToBlocks(word);
  if (blocks.length === 0) return false;

  const split = splitCvcOnsetRime(word);
  const playable = blocks.filter((b) => !isSilentBlock(b));

  if (split && playable.length >= 2) {
    onStep?.('onset');
    await speakBlockPhoneme(playable[0]);
    await delay(BLEND_SEGMENT_GAPS.afterOnset);

    onStep?.('rime');
    for (let i = 1; i < playable.length; i++) {
      await speakBlockPhoneme(playable[i]);
      await delay(BLEND_SEGMENT_GAPS.betweenRime);
    }
    await delay(BLEND_SEGMENT_GAPS.beforeBlend);

    onStep?.('word');
    for (const block of playable) {
      if (!(await playPhonemeBlock(block))) await speakBlockPhoneme(block);
    }
    await delay(BLEND_SEGMENT_GAPS.beforeWord);
    await speakWord(word);
    onStep?.(null);
    return true;
  }

  for (const block of playable) {
    await speakBlockPhoneme(block);
    await delay(280);
  }
  await delay(BLEND_SEGMENT_GAPS.beforeBlend);
  for (const block of playable) {
    if (!(await playPhonemeBlock(block))) await speakBlockPhoneme(block);
  }
  await delay(BLEND_SEGMENT_GAPS.beforeWord);
  await speakWord(word);
  onStep?.(null);
  return true;
}
