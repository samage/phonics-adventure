import { splitCvcOnsetRime } from '@/data/blendOnsetRime';
import { speakBlockPhoneme } from '@/lib/phonicsAudio';
import { cancelSpeech, speakWord } from '@/lib/speech';
import { parseWordToBlocks } from '@/utils/phonicsEngine';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export type BlendHighlight = 'onset' | 'rime' | 'word' | null;

/**
 * 三步混音示範（SCR 音素 + Web Speech 整字）：
 * 1. 首音 2. 韻尾／其餘音素 3. 整字 TTS
 */
export async function playBlendDemo(
  word: string,
  onStep?: (step: BlendHighlight) => void,
): Promise<boolean> {
  cancelSpeech();
  const blocks = parseWordToBlocks(word);
  if (blocks.length === 0) return false;

  const split = splitCvcOnsetRime(word);
  const playable = blocks.filter((b) => b.type !== 'silent_e');

  if (split && playable.length >= 2) {
    onStep?.('onset');
    await speakBlockPhoneme(playable[0]);
    await delay(350);

    onStep?.('rime');
    for (let i = 1; i < playable.length; i++) {
      await speakBlockPhoneme(playable[i]);
      await delay(220);
    }
    await delay(280);

    onStep?.('word');
    await speakWord(word);
    onStep?.(null);
    return true;
  }

  for (const block of playable) {
    await speakBlockPhoneme(block);
    await delay(280);
  }
  await speakWord(word);
  onStep?.(null);
  return true;
}

export async function playBlendPartial(
  word: string,
  filledCount: number,
): Promise<void> {
  cancelSpeech();
  const blocks = parseWordToBlocks(word).filter((b) => b.type !== 'silent_e');
  if (filledCount < 1 || blocks.length === 0) return;

  await speakBlockPhoneme(blocks[0]);
  if (filledCount < 2) return;

  await delay(260);
  for (let i = 1; i < Math.min(filledCount, blocks.length); i++) {
    await speakBlockPhoneme(blocks[i]);
    await delay(200);
  }
}

/** @deprecated 改用 playBlendDemo */
export const playJunyiBlendDemo = playBlendDemo;
/** @deprecated 改用 playBlendPartial */
export const playJunyiBlendPartial = playBlendPartial;
