import type { PhonicsType } from '@/types/phonics';

export interface LetterPhonicsMeta {
  letter: string;
  /** 階段一只出現 consonant 與 short_vowel */
  phonicsType: Extract<PhonicsType, 'consonant' | 'short_vowel'>;
  soundRule: string;
  phoneme: string;
  /** 範例單字，幫助建立音形連結 */
  exampleWord: string;
  /** 給孩子看的提示 */
  hint: string;
}

/**
 * 26 個字母的 Phonics 分類（階段一）。
 *
 * - a, e, i, o, u → 短母音（Short Vowel）
 * - 其餘 → 子音（Consonant）
 *
 * 長母音、母音團隊、Magic E 等留待階段四以後，不在此出現。
 */
export const LETTER_PHONICS: Record<string, LetterPhonicsMeta> = {
  a: {
    letter: 'a',
    phonicsType: 'short_vowel',
    soundRule: 'Short Vowel',
    phoneme: 'æ',
    exampleWord: 'apple',
    hint: '短母音 a，像 apple 的開頭',
  },
  b: {
    letter: 'b',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'b',
    exampleWord: 'bed',
    hint: '子音 b，像 bed 的開頭',
  },
  c: {
    letter: 'c',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'k',
    exampleWord: 'cat',
    hint: '子音 c，像 cat 的開頭（發 /k/）',
  },
  d: {
    letter: 'd',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'd',
    exampleWord: 'dog',
    hint: '子音 d，像 dog 的開頭',
  },
  e: {
    letter: 'e',
    phonicsType: 'short_vowel',
    soundRule: 'Short Vowel',
    phoneme: 'ɛ',
    exampleWord: 'egg',
    hint: '短母音 e，像 egg 的開頭',
  },
  f: {
    letter: 'f',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'f',
    exampleWord: 'fish',
    hint: '子音 f，像 fish 的開頭',
  },
  g: {
    letter: 'g',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'g',
    exampleWord: 'goat',
    hint: '子音 g，像 goat 的開頭',
  },
  h: {
    letter: 'h',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'h',
    exampleWord: 'hat',
    hint: '子音 h，像 hat 的開頭',
  },
  i: {
    letter: 'i',
    phonicsType: 'short_vowel',
    soundRule: 'Short Vowel',
    phoneme: 'ɪ',
    exampleWord: 'igloo',
    hint: '短母音 i，像 igloo 的開頭',
  },
  j: {
    letter: 'j',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'dʒ',
    exampleWord: 'jam',
    hint: '子音 j，像 jam 的開頭',
  },
  k: {
    letter: 'k',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'k',
    exampleWord: 'kite',
    hint: '子音 k，像 kite 的開頭',
  },
  l: {
    letter: 'l',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'l',
    exampleWord: 'leg',
    hint: '子音 l，像 leg 的開頭',
  },
  m: {
    letter: 'm',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'm',
    exampleWord: 'map',
    hint: '子音 m，像 map 的開頭',
  },
  n: {
    letter: 'n',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'n',
    exampleWord: 'net',
    hint: '子音 n，像 net 的開頭',
  },
  o: {
    letter: 'o',
    phonicsType: 'short_vowel',
    soundRule: 'Short Vowel',
    phoneme: 'ɒ',
    exampleWord: 'octopus',
    hint: '短母音 o，像 octopus 的開頭',
  },
  p: {
    letter: 'p',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'p',
    exampleWord: 'pig',
    hint: '子音 p，像 pig 的開頭',
  },
  q: {
    letter: 'q',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'kw',
    exampleWord: 'queen',
    hint: '子音 qu，像 queen 的開頭',
  },
  r: {
    letter: 'r',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'r',
    exampleWord: 'rat',
    hint: '子音 r，像 rat 的開頭',
  },
  s: {
    letter: 's',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 's',
    exampleWord: 'sun',
    hint: '子音 s，像 sun 的開頭',
  },
  t: {
    letter: 't',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 't',
    exampleWord: 'top',
    hint: '子音 t，像 top 的開頭',
  },
  u: {
    letter: 'u',
    phonicsType: 'short_vowel',
    soundRule: 'Short Vowel',
    phoneme: 'ʌ',
    exampleWord: 'umbrella',
    hint: '短母音 u，像 umbrella 的開頭',
  },
  v: {
    letter: 'v',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'v',
    exampleWord: 'van',
    hint: '子音 v，像 van 的開頭',
  },
  w: {
    letter: 'w',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'w',
    exampleWord: 'web',
    hint: '子音 w，像 web 的開頭',
  },
  x: {
    letter: 'x',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'ks',
    exampleWord: 'box',
    hint: '子音 x，像 box 結尾的 ks',
  },
  y: {
    letter: 'y',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'j',
    exampleWord: 'yes',
    hint: '子音 y，像 yes 的開頭',
  },
  z: {
    letter: 'z',
    phonicsType: 'consonant',
    soundRule: 'Basic Consonant',
    phoneme: 'z',
    exampleWord: 'zip',
    hint: '子音 z，像 zip 的開頭',
  },
};

export function getLetterPhonics(letter: string): LetterPhonicsMeta | null {
  return LETTER_PHONICS[letter.toLowerCase()] ?? null;
}

export const STAGE1_SHORT_VOWELS = ['a', 'e', 'i', 'o', 'u'] as const;
export const STAGE1_CONSONANTS = Object.keys(LETTER_PHONICS).filter(
  (l) => LETTER_PHONICS[l].phonicsType === 'consonant',
);
