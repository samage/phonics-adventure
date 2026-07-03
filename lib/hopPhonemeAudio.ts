import type { HopEnglishPattern } from '@/data/hopEnglishPatterns';
import { getHopPattern } from '@/data/hopEnglishPatterns';
import {
  GRAPHEME_PHONEMES,
  LETTER_PHONEMES,
  LONG_VOWEL_PHONEMES,
} from '@/data/phonemeRegistry';
import { hasSoundcityKey } from '@/lib/phonemeAudio';
import { hasIpaHopPhoneme } from '@/lib/ipaPhonemeAudio';

/**
 * Hop 規則 → 預錄音檔 key（SCR .mp3 或 supplement .ogg）。
 * 長母音字素優先使用 Wikimedia supplement 獨立檔。
 */
const HOP_SOUNDCITY_MAP: Record<string, string | string[]> = {
  hop_sh_ch_ti: 'sh',
  hop_ch_tch_ture: 'ch',
  hop_th_voiceless: 'th_voiceless',
  hop_th_voiced: 'th_voiced',
  hop_th_combined: ['th_voiceless', 'th_voiced'],
  hop_ng_n_ngue: 'ng',
  hop_ee_ea_ie_e_ey: 'ee',
  hop_ai_ay_ae: 'ai',
  hop_igh_ie_y_i_ie: 'igh',
  hop_oa_ow_o_oe: 'oa',
  hop_oo_ou_ew_ue: 'oo',
  hop_ou_ow: 'ou',
  hop_oi_oy: 'oi',
  hop_b_bb: 'b',
  hop_d_dd: 'd',
  hop_g_gg: 'g',
  hop_j_g_dge_ge: 'ge',
  hop_l_ll: 'l',
  hop_m_mm_mb: 'm',
  hop_n_nn_kn: 'n',
  hop_r_rr_wr: 'r',
  hop_v_ve: 'v',
  hop_w_wh_u: 'w',
  hop_z_zz_s_se: 'z',
  hop_f_ff_ph_gh: 'f',
  hop_h_wh: 'h',
  hop_p_pp: 'p',
  hop_t_tt: 't',
  hop_c_k_ck_q_ch: 'k',
  hop_s_ss_ce_se_c_sc: 's',
  hop_a: 'a_short',
  hop_e_ea: 'e_short',
  hop_i_y: 'i_short',
  hop_o_a: 'o_short',
  hop_u_o_oo: 'u_short',
  hop_oo_u_ou: 'oo_short',
};

/** SCR 無檔、且無 IPA 補網時，TTS 念音素（不念整個例字） */
const HOP_TTS_PHONEME: Record<string, string> = {};

/** spellings 解析後的 supplement / SCR 後備 */
const LONG_VOWEL_AUDIO: Record<string, string> = {
  hop_ee_ea_ie_e_ey: 'ee',
  hop_ai_ay_ae: 'ai',
  hop_igh_ie_y_i_ie: 'igh',
  hop_oa_ow_o_oe: 'oa',
  hop_oo_ou_ew_ue: 'oo',
};

function normalizeSpelling(sp: string): string {
  return sp
    .replace(/\(re\)/gi, '')
    .replace(/[^a-z-]/gi, '')
    .toLowerCase();
}

/** 解析 Hop 課程應播放的音檔 key（可為多個，如 th 清＋濁）；IPA 課次不在此列 */
export function resolveHopSoundcityKeys(patternKey: string): string[] {
  if (hasIpaHopPhoneme(patternKey)) return [];
  const mapped = HOP_SOUNDCITY_MAP[patternKey];
  if (mapped) {
    const keys = Array.isArray(mapped) ? mapped : [mapped];
    return keys.filter((key) => hasSoundcityKey(key));
  }

  const pattern = getHopPattern(patternKey);
  if (!pattern) return [];

  for (const sp of pattern.spellings) {
    const letters = normalizeSpelling(sp);
    if (!letters) continue;

    if (hasSoundcityKey(letters)) return [letters];

    const magic = letters.match(/^([aeiou])-e$/);
    if (magic) {
      const supplementMagic = `${magic[1]}-e`;
      if (hasSoundcityKey(supplementMagic)) return [supplementMagic];
      const scrLong = `${magic[1]}_long`;
      if (hasSoundcityKey(scrLong)) return [scrLong];
    }

    if (letters.length === 1 && hasSoundcityKey(`${letters}_short`)) {
      return [`${letters}_short`];
    }
  }

  const longKey = LONG_VOWEL_AUDIO[patternKey];
  if (longKey && hasSoundcityKey(longKey)) return [longKey];

  return [];
}

export function hopTtsPhonemeFallback(
  patternKey: string,
  pattern: HopEnglishPattern,
): string {
  if (HOP_TTS_PHONEME[patternKey]) return HOP_TTS_PHONEME[patternKey];

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

  if (pattern.phonicsType === 'diphthong') {
    const g = normalizeSpelling(pattern.spellings[0] ?? '');
    if (GRAPHEME_PHONEMES[g]) return GRAPHEME_PHONEMES[g].fallback;
  }

  return 'uh';
}
