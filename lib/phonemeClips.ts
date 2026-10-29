/**
 * 孤立音素的「解析」層（純函式，不碰瀏覽器）：
 * 把積木／字素／IPA 解析成 public/audio/phonemes/<id>.mp3 的 clip id。
 *
 * 音檔由 scripts/build_audio.py 處理（來源見 data/phonemeClips.json）：
 * 多數音來自 SCR 女聲，SCR 沒有的母音由同一支女聲 TTS 補。
 * 子音不用 TTS 切（聽起來太假），所以 ʒ（television 的 s）目前沒有檔案，
 * 解析結果會是 null，播放層才會退回裝置 TTS。
 */
import clipSpecs from '@/data/phonemeClips.json';
import { getHopPattern } from '@/data/hopEnglishPatterns';
import {
  GRAPHEME_PHONEMES,
  LETTER_PHONEMES,
  LONG_VOWEL_PHONEMES,
} from '@/data/phonemeRegistry';
import type { PhonicsBlock } from '@/types/phonics';

export const CLIP_IDS: readonly string[] = (clipSpecs as { id: string }[]).map((c) => c.id);
const CLIP_SET = new Set(CLIP_IDS);

export function hasClip(id: string): boolean {
  return CLIP_SET.has(id);
}

export function clipUrl(id: string): string {
  return `/audio/phonemes/${id}.mp3`;
}

/** IPA 音素 → clip id。沒有的（ʒ）刻意留空，不用 TTS 硬切。 */
const IPA_TO_CLIP: Record<string, string> = {
  p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g',
  f: 'f', v: 'v', θ: 'th_voiceless', ð: 'th_voiced',
  s: 's', z: 'z', ʃ: 'sh', h: 'h', tʃ: 'ch', dʒ: 'j',
  m: 'm', n: 'n', ŋ: 'ng', l: 'l', r: 'r', ɹ: 'r', j: 'y', w: 'w',
  kw: 'qu', ks: 'x',
  æ: 'a_short', ɛ: 'e_short', ɪ: 'i_short', ɒ: 'o_short', ɑ: 'o_short',
  ʌ: 'u_short', ʊ: 'oo_short', ə: 'schwa',
  eɪ: 'a_long', iː: 'e_long', i: 'e_long', aɪ: 'i_long', oʊ: 'o_long',
  juː: 'u_long', uː: 'oo_long',
  ɔ: 'aw', ɔː: 'aw', ɔɪ: 'oi', aʊ: 'ou',
  ɚ: 'er', ɜː: 'er', ɜ: 'er',
  ɑːr: 'ar', ɑr: 'ar', ɑɹ: 'ar',
  ɔːr: 'or', ɔr: 'or', ɔɹ: 'or',
  eə: 'air',
};

/** 由長到短，貪婪比對（dʒ、aʊ、ɑːr …要整個吃掉，不能拆成 d+ʒ、a+ʊ） */
const IPA_TOKENS = Object.keys(IPA_TO_CLIP)
  .concat(['ʒ'])
  .sort((a, b) => b.length - a.length);

/** 把 IPA 字串切成音素；字母 c 視為 k（blend 的 phoneme 欄有 'kl'、'scr' 這類寫法） */
export function tokenizeIpa(ipa: string): string[] {
  const s = ipa.replace(/[\s.ˈˌ/]/g, '').replace(/c/g, 'k');
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    const hit = IPA_TOKENS.find((t) => s.startsWith(t, i));
    if (hit) {
      out.push(hit);
      i += hit.length;
    } else {
      out.push(s[i] as string); // 未知符號：保留，讓呼叫端看得到 missing
      i += 1;
    }
  }
  return out;
}

export interface ClipResolution {
  /** 依序要播的 clip id */
  clips: string[];
  /** 找不到檔案的音素（例如 ʒ） */
  missing: string[];
}

export function clipsForIpa(ipa: string): ClipResolution {
  const clips: string[] = [];
  const missing: string[] = [];
  for (const tok of tokenizeIpa(ipa)) {
    const id = IPA_TO_CLIP[tok];
    if (id && CLIP_SET.has(id)) clips.push(id);
    else missing.push(tok);
  }
  return { clips, missing };
}

/**
 * 積木 → clip。以積木的 IPA 為準（不再用「包含」比對，避免 ʊ 誤判成 aʊ），
 * 只有「字母本身就是一個 clip（c、q）」時沿用字母音檔。
 * 靜音積木（silent_e、不發音的字母）回傳空陣列。
 */
export function clipsForBlock(block: PhonicsBlock): ClipResolution {
  const text = block.text.toLowerCase();
  const phoneme = block.phoneme.trim();
  if (block.type === 'silent_e' || phoneme === '') return { clips: [], missing: [] };
  const res = clipsForIpa(phoneme);
  if (text === 'c' && res.clips.length === 1 && res.clips[0] === 'k') return { clips: ['c'], missing: [] };
  return res;
}

/** 舊的／簡寫 key → clip（複習題、長母音卡、Hop 用） */
const KEY_ALIAS: Record<string, string> = {
  ck: 'k', q: 'qu', th: 'th_voiceless',
  'a-e': 'a_long', 'e-e': 'e_long', 'i-e': 'i_long', 'o-e': 'o_long', 'u-e': 'u_long',
  ee: 'e_long', ea: 'e_long', igh: 'i_long', oa: 'o_long', ai: 'a_long', ay: 'a_long',
  oo: 'oo_long', ow: 'ou', oy: 'oi', 'ipa:hop_ir_er_ur_or': 'er',
};

/** Hop 課次 → clip（人工逐條對過例字；ʒ 沒有檔案，所以 hop_s_si_z 是空的） */
const HOP_CLIPS: Record<string, string[]> = {
  hop_b_bb: ['b'], hop_d_dd: ['d'], hop_g_gg: ['g'], hop_j_g_dge_ge: ['j'],
  hop_l_ll: ['l'], hop_m_mm_mb: ['m'], hop_n_nn_kn: ['n'], hop_r_rr_wr: ['r'],
  hop_v_ve: ['v'], hop_w_wh_u: ['w'], hop_z_zz_s_se: ['z'],
  hop_s_si_z: [],
  hop_th_voiced: ['th_voiced'], hop_th_voiceless: ['th_voiceless'],
  hop_th_combined: ['th_voiceless', 'th_voiced'],
  hop_ng_n_ngue: ['ng'], hop_y_i_u: ['y'],
  hop_f_ff_ph_gh: ['f'], hop_h_wh: ['h'], hop_c_k_ck_q_ch: ['k'], hop_ck: ['k'],
  hop_p_pp: ['p'], hop_s_ss_ce_se_c_sc: ['s'], hop_t_tt: ['t'],
  hop_ch_tch_ture: ['ch'], hop_sh_ch_ti: ['sh'],
  hop_a: ['a_short'], hop_e_ea: ['e_short'], hop_i_y: ['i_short'],
  hop_o_a: ['o_short'], hop_u_o_oo: ['u_short'],
  hop_a_o_oa_ough: ['aw'], hop_oo_u_ou: ['oo_short'],
  hop_ir_er_ur_or: ['er'], hop_schwa: ['schwa'],
  hop_ee_ea_ie_e_ey: ['e_long'], hop_oo_ou_ew_ue: ['oo_long'],
  hop_ai_ay_ae: ['a_long'], hop_oa_ow_o_oe: ['o_long'],
  hop_igh_ie_y_i_ie: ['i_long'],
  hop_ou_ow: ['ou'], hop_oi_oy: ['oi'],
};

export function resolveHopClips(patternKey: string): string[] {
  return (HOP_CLIPS[patternKey] ?? []).filter(hasClip);
}

/** 所有 Hop 課次 key（測試用，確認每一課都有人工對應） */
export const HOP_CLIP_KEYS = Object.keys(HOP_CLIPS);

/**
 * 任意 key（clip id、字母、字素、long_x、hop_、blend:xx、舊簡寫）→ clip。
 * blend:xx 逐字母展開。
 */
export function clipsForKey(rawKey: string): ClipResolution {
  const key = rawKey.toLowerCase();

  if (key.startsWith('hop_')) {
    if (!getHopPattern(key) && !(key in HOP_CLIPS)) return { clips: [], missing: [key] };
    const clips = resolveHopClips(key);
    return { clips, missing: clips.length ? [] : [key] };
  }

  if (key.startsWith('blend:')) {
    const clips: string[] = [];
    const missing: string[] = [];
    for (const ch of key.slice(6)) {
      const r = clipsForKey(ch);
      clips.push(...r.clips);
      missing.push(...r.missing);
    }
    return { clips, missing };
  }

  if (CLIP_SET.has(key) && key.length > 1) return { clips: [key], missing: [] };
  if (KEY_ALIAS[key]) return { clips: [KEY_ALIAS[key] as string], missing: [] };

  // 單一字母：用字母登錄表的 IPA（a→æ、o→ɑ、c→k …）
  const letter = LETTER_PHONEMES[key];
  if (letter) {
    if (key === 'c') return { clips: ['c'], missing: [] };
    return clipsForIpa(letter.ipa);
  }
  const entry = LONG_VOWEL_PHONEMES[key] ?? GRAPHEME_PHONEMES[key];
  if (entry) return clipsForIpa(entry.ipa);

  if (CLIP_SET.has(key)) return { clips: [key], missing: [] };
  return { clips: [], missing: [key] };
}
