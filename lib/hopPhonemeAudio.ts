import type { HopEnglishPattern } from '@/data/hopEnglishPatterns';
import {
  GRAPHEME_PHONEMES,
  LETTER_PHONEMES,
  LONG_VOWEL_PHONEMES,
} from '@/data/phonemeRegistry';

export { resolveHopClips } from '@/lib/phonemeClips';

function normalizeSpelling(sp: string): string {
  return sp
    .replace(/\(re\)/gi, '')
    .replace(/[^a-z-]/gi, '')
    .toLowerCase();
}

/**
 * 沒有預錄音檔的 Hop 課次（目前只有 ʒ：treasure 的 s）才會用到，
 * 回傳給裝置 TTS 念的音素文字。
 */
export function hopTtsPhonemeFallback(
  patternKey: string,
  pattern: HopEnglishPattern,
): string {
  if (patternKey === 'hop_s_si_z') return 'zh';

  const longRegistry: Record<string, string> = {
    hop_ee_ea_ie_e_ey: 'long_e',
    hop_ai_ay_ae: 'long_a',
    hop_igh_ie_y_i_ie: 'long_i',
    hop_oa_ow_o_oe: 'long_o',
    hop_oo_ou_ew_ue: 'long_u',
  };
  const longKey = longRegistry[patternKey];
  if (longKey && LONG_VOWEL_PHONEMES[longKey]) {
    return LONG_VOWEL_PHONEMES[longKey].fallback;
  }

  for (const sp of pattern.spellings) {
    const g = normalizeSpelling(sp).replace(/-e$/, '');
    if (GRAPHEME_PHONEMES[g]) return GRAPHEME_PHONEMES[g].fallback;
    if (g.length === 1 && LETTER_PHONEMES[g]) return LETTER_PHONEMES[g].fallback;
  }

  return 'uh';
}
