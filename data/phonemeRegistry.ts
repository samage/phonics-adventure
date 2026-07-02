/**
 * 音素音檔登錄表。
 * 播放優先使用 HOPE English 希平方音檔（/public/audio/hopenglish/）。
 * @see data/hopEnglishPhonics.ts
 */
export interface PhonemeEntry {
  key: string;
  ipa: string;
  /** TTS 備援用文字（僅音檔缺失時使用） */
  fallback: string;
}

/** 26 個字母音 */
export const LETTER_PHONEMES: Record<string, PhonemeEntry> = {
  a: { key: 'a', ipa: 'æ', fallback: 'a' },
  b: { key: 'b', ipa: 'b', fallback: 'b' },
  c: { key: 'c', ipa: 'k', fallback: 'k' },
  d: { key: 'd', ipa: 'd', fallback: 'd' },
  e: { key: 'e', ipa: 'ɛ', fallback: 'e' },
  f: { key: 'f', ipa: 'f', fallback: 'f' },
  g: { key: 'g', ipa: 'g', fallback: 'g' },
  h: { key: 'h', ipa: 'h', fallback: 'h' },
  i: { key: 'i', ipa: 'ɪ', fallback: 'i' },
  j: { key: 'j', ipa: 'dʒ', fallback: 'j' },
  k: { key: 'k', ipa: 'k', fallback: 'k' },
  l: { key: 'l', ipa: 'l', fallback: 'l' },
  m: { key: 'm', ipa: 'm', fallback: 'm' },
  n: { key: 'n', ipa: 'n', fallback: 'n' },
  o: { key: 'o', ipa: 'ɑ', fallback: 'o' },
  p: { key: 'p', ipa: 'p', fallback: 'p' },
  q: { key: 'q', ipa: 'k', fallback: 'k' },
  r: { key: 'r', ipa: 'ɹ', fallback: 'r' },
  s: { key: 's', ipa: 's', fallback: 's' },
  t: { key: 't', ipa: 't', fallback: 't' },
  u: { key: 'u', ipa: 'ʌ', fallback: 'u' },
  v: { key: 'v', ipa: 'v', fallback: 'v' },
  w: { key: 'w', ipa: 'w', fallback: 'w' },
  x: { key: 'x', ipa: 'k s', fallback: 'ks' },
  y: { key: 'y', ipa: 'j', fallback: 'y' },
  z: { key: 'z', ipa: 'z', fallback: 'z' },
};

/** Magic E 長母音 */
export const LONG_VOWEL_PHONEMES: Record<string, PhonemeEntry> = {
  long_a: { key: 'long_a', ipa: 'eɪ', fallback: 'ay' },
  long_e: { key: 'long_e', ipa: 'iː', fallback: 'ee' },
  long_i: { key: 'long_i', ipa: 'aɪ', fallback: 'eye' },
  long_o: { key: 'long_o', ipa: 'oʊ', fallback: 'oh' },
  long_u: { key: 'long_u', ipa: 'juː', fallback: 'you' },
};

/** 字母組合音（L9–L20） */
export const GRAPHEME_PHONEMES: Record<string, PhonemeEntry> = {
  ai: { key: 'ai', ipa: 'eɪ', fallback: 'ay' },
  ay: { key: 'ay', ipa: 'eɪ', fallback: 'ay' },
  au: { key: 'au', ipa: 'ɔ', fallback: 'aw' },
  aw: { key: 'aw', ipa: 'ɔ', fallback: 'aw' },
  ee: { key: 'ee', ipa: 'iː', fallback: 'ee' },
  ch: { key: 'ch', ipa: 'tʃ', fallback: 'ch' },
  ck: { key: 'ck', ipa: 'k', fallback: 'k' },
  gh: { key: 'gh', ipa: 'f', fallback: 'f' },
  ei: { key: 'ei', ipa: 'eɪ', fallback: 'ay' },
  eu: { key: 'eu', ipa: 'juː', fallback: 'you' },
  ou: { key: 'ou', ipa: 'aʊ', fallback: 'ow' },
  ew: { key: 'ew', ipa: 'juː', fallback: 'oo' },
  sh: { key: 'sh', ipa: 'ʃ', fallback: 'sh' },
  th: { key: 'th', ipa: 'θ', fallback: 'th' },
  ng: { key: 'ng', ipa: 'ŋ', fallback: 'ng' },
  oa: { key: 'oa', ipa: 'oʊ', fallback: 'oh' },
  oo: { key: 'oo', ipa: 'uː', fallback: 'oo' },
  ow: { key: 'ow', ipa: 'oʊ', fallback: 'oh' },
  oi: { key: 'oi', ipa: 'ɔɪ', fallback: 'oy' },
  ar: { key: 'ar', ipa: 'ɑɹ', fallback: 'ar' },
  or: { key: 'or', ipa: 'ɔɹ', fallback: 'or' },
  er: { key: 'er', ipa: 'ɚ', fallback: 'er' },
  ph: { key: 'ph', ipa: 'f', fallback: 'f' },
  wh: { key: 'wh', ipa: 'w', fallback: 'w' },
  igh: { key: 'igh', ipa: 'aɪ', fallback: 'eye' },
};

/** Magic E 規則說明（非音素，僅 L08 介紹用） */
export const MAGIC_E_RULE: PhonemeEntry = {
  key: 'magic_e_rule',
  ipa: '',
  fallback: 'magic e makes the vowel long',
};

export function getPhonemeEntry(key: string): PhonemeEntry | null {
  const k = key.toLowerCase();
  return (
    LETTER_PHONEMES[k] ??
    LONG_VOWEL_PHONEMES[k] ??
    GRAPHEME_PHONEMES[k] ??
    (k === 'magic_e' || k === 'magic_e_rule' ? MAGIC_E_RULE : null)
  );
}

export function phonemeAudioPath(key: string): string {
  return `/audio/hopenglish/${key.toLowerCase()}.mp3`;
}

/** 取得所有需產生音檔的 key → ipa */
export function getAllPhonemeKeysForGeneration(): Array<{ key: string; ipa: string }> {
  const entries = [
    ...Object.values(LETTER_PHONEMES),
    ...Object.values(LONG_VOWEL_PHONEMES),
    ...Object.values(GRAPHEME_PHONEMES),
    MAGIC_E_RULE,
  ];
  return entries
    .filter((e) => e.ipa.length > 0 || e.key === 'magic_e_rule')
    .map((e) => ({
      key: e.key,
      ipa: e.ipa || e.fallback,
    }));
}
