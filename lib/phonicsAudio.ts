import type { PhonicsBlock } from '@/types/phonics';
import { getHopPattern } from '@/data/hopEnglishPatterns';
import { getPhonemeEntry } from '@/data/phonemeRegistry';
import { playClips, playPhonemeBlock, playPhonemeKey } from '@/lib/phonemeAudio';
import { hopTtsPhonemeFallback } from '@/lib/hopPhonemeAudio';
import { resolveHopClips } from '@/lib/phonemeClips';
import { AUDIO_PACING } from '@/lib/audioPacing';
import { cancelSpeech, speak } from '@/lib/speech';

/** 不發音的積木（Magic E 的 e、不發音的字母） */
export function isSilentBlock(block: PhonicsBlock): boolean {
  return block.type === 'silent_e' || block.phoneme.trim() === '';
}

function ttsFallbackForKey(key: string): string {
  const entry = getPhonemeEntry(key);
  if (entry) return entry.fallback;
  return key;
}

/**
 * 播放單一音素（key：字母、字素、long_x、hop_xxx、blend:xx、clip id）。
 * 預錄女聲優先；只有「沒有預錄檔」的音（ʒ）才退回裝置 TTS。
 */
export async function speakPhoneme(key: string): Promise<void> {
  cancelSpeech();
  const k = key.toLowerCase();

  if (k.startsWith('hop_')) {
    const pattern = getHopPattern(k);
    if (pattern) {
      const clips = resolveHopClips(k);
      if (clips.length > 0) {
        await playClips(clips, { gapMs: AUDIO_PACING.hopClipGapMs });
        return;
      }
      await speak(hopTtsPhonemeFallback(k, pattern), { rate: 0.45, pitch: 1.0 });
      return;
    }
  }

  if (await playPhonemeKey(k)) return;
  await speak(ttsFallbackForKey(k), { rate: 0.45, pitch: 1.0 });
}

/** Sound-talk、拼字遊戲用：唸一個積木的音 */
export async function speakBlockPhoneme(block: PhonicsBlock): Promise<void> {
  if (isSilentBlock(block)) return;
  cancelSpeech();
  if (await playPhonemeBlock(block)) return;
  await speak(ttsFallbackForKey(block.text.toLowerCase()), { rate: 0.45, pitch: 1.0 });
}
