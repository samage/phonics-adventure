import { AUDIO_PACING } from '@/lib/audioPacing';
import { splitCvcOnsetRime } from '@/data/blendOnsetRime';
import { playPhonemeBlock } from '@/lib/phonemeAudio';
import { isSilentBlock, speakBlockPhoneme } from '@/lib/phonicsAudio';
import { cancelSpeech, speakWord } from '@/lib/speech';
import type { PhonicsBlock } from '@/types/phonics';
import { parseWordToBlocks } from '@/utils/phonicsEngine';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** 「連起來念」：每個音依序播，音與音間隔 runTogetherGap（慢一點，孩子才聽得出每個音） */
async function playRunTogether(playable: PhonicsBlock[]): Promise<void> {
  for (let i = 0; i < playable.length; i++) {
    const block = playable[i] as PhonicsBlock;
    if (!(await playPhonemeBlock(block))) await speakBlockPhoneme(block);
    if (i < playable.length - 1) await delay(BLEND_SEGMENT_GAPS.runTogetherGap);
  }
}

export type BlendHighlight = 'onset' | 'rime' | 'word' | null;

/** 混音間隔（毫秒），設定在 lib/audioPacing.ts */
export const BLEND_SEGMENT_GAPS = AUDIO_PACING.blend;

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
    await playRunTogether(playable);
    await delay(BLEND_SEGMENT_GAPS.beforeWord);
    await speakWord(word);
    onStep?.(null);
    return true;
  }

  for (const block of playable) {
    await speakBlockPhoneme(block);
    await delay(AUDIO_PACING.soundTalkGapMs);
  }
  await delay(BLEND_SEGMENT_GAPS.beforeBlend);
  await playRunTogether(playable);
  await delay(BLEND_SEGMENT_GAPS.beforeWord);
  await speakWord(word);
  onStep?.(null);
  return true;
}
