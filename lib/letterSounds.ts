/**
 * 單一字母 a–z 的 Letter Sound 對照表。
 *
 * Web Speech API 無法穩定發出孤立音素：
 * - 唸 "s" 會變成字母名 /ɛs/（聽起來像「诶死」）
 * - 唸 "b" 會變成 /biː/（「比」）
 *
 * 策略：
 * 1. 優先播放預錄音檔 /public/audio/letter-sounds/{letter}.mp3
 * 2. 備援用拉長摩擦音（sss、fff）或輕 schwa 塞音（puh、tuh）
 */
export const LETTER_SOUND_SPOKEN: Record<string, string> = {
  a: 'ah',
  e: 'eh',
  i: 'ih',
  o: 'aw',
  u: 'uh',
  f: 'fff',
  h: 'hhh',
  l: 'lll',
  m: 'mmm',
  n: 'nnn',
  r: 'rrr',
  s: 'sss',
  v: 'vvv',
  z: 'zzz',
  b: 'buh',
  c: 'kuh',
  d: 'duh',
  g: 'guh',
  j: 'juh',
  k: 'kuh',
  p: 'puh',
  t: 'tuh',
  q: 'kw',
  w: 'wuh',
  x: 'ks',
  y: 'yuh',
};

export const LETTER_PHONEME_IPA: Record<string, string> = {
  a: 'æ',
  b: 'b',
  c: 'k',
  d: 'd',
  e: 'ɛ',
  f: 'f',
  g: 'g',
  h: 'h',
  i: 'ɪ',
  j: 'dʒ',
  k: 'k',
  l: 'l',
  m: 'm',
  n: 'n',
  o: 'ɒ',
  p: 'p',
  q: 'kw',
  r: 'r',
  s: 's',
  t: 't',
  u: 'ʌ',
  v: 'v',
  w: 'w',
  x: 'ks',
  y: 'j',
  z: 'z',
};

export const letterSoundAudioPath = (letter: string) =>
  `/audio/letter-sounds/${letter.toLowerCase()}.mp3`;
