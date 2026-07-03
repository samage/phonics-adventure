import type { PhonicsBlock, PhonicsType } from '@/types/phonics';
import { CURATED_WORDS } from '@/data/curatedWords';

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

const SHORT_VOWEL_PHONEME: Record<string, string> = {
  a: 'æ',
  e: 'ɛ',
  i: 'ɪ',
  o: 'ɒ',
  u: 'ʌ',
};

const LONG_VOWEL_PHONEME: Record<string, string> = {
  a: 'eɪ',
  e: 'iː',
  i: 'aɪ',
  o: 'oʊ',
  u: 'juː',
};

const CONSONANT_PHONEME: Record<string, string> = {
  b: 'b',
  c: 'k',
  d: 'd',
  f: 'f',
  g: 'g',
  h: 'h',
  j: 'dʒ',
  k: 'k',
  l: 'l',
  m: 'm',
  n: 'n',
  p: 'p',
  q: 'kw',
  r: 'r',
  s: 's',
  t: 't',
  v: 'v',
  w: 'w',
  x: 'ks',
  y: 'j',
  z: 'z',
};

/** 複合子音/母音（單一聲音的雙/三字母組合）。優先級最高。 */
const DIGRAPHS: Record<string, string> = {
  igh: 'aɪ',
  sh: 'ʃ',
  ch: 'tʃ',
  th: 'θ',
  ph: 'f',
  wh: 'w',
  ck: 'k',
  ng: 'ŋ',
};

/** 母音團隊（長母音組合）。 */
const VOWEL_TEAMS: Record<string, string> = {
  ai: 'eɪ',
  ay: 'eɪ',
  ee: 'iː',
  ea: 'iː',
  oa: 'oʊ',
  oo: 'uː',
  ow: 'oʊ',
  ou: 'aʊ',
  oi: 'ɔɪ',
  oy: 'ɔɪ',
  au: 'ɔː',
  aw: 'ɔː',
  ew: 'juː',
  ei: 'eɪ',
  eu: 'juː',
  ie: 'iː',
  ue: 'uː',
  ui: 'uː',
};

/** 混合子音（每個字母仍可聽出，但連在一起）。字首與字尾。 */
const BLENDS = new Set([
  // 字首
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr',
  'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw',
  // 字尾
  'nd', 'nk', 'nt', 'mp', 'ld', 'lk', 'lt', 'ft', 'ct',
]);

function makeBlock(
  text: string,
  type: PhonicsType,
  soundRule: string,
  phoneme: string,
): PhonicsBlock {
  return { text, type, soundRule, phoneme };
}

function isConsonant(ch: string): boolean {
  return /^[a-z]$/.test(ch) && !VOWELS.has(ch);
}

/**
 * 偵測 Magic-E（silent_e）模式：字尾為 子音 + 母音 + 子音 + e。
 * 命中時回傳被 silent e 影響的母音索引（母音改長音、字尾 e 標為 silent_e）。
 * 例如 cake -> 母音 a 在索引 1，結尾 e 為 silent。
 */
function detectMagicE(word: string): number | null {
  const len = word.length;
  if (len < 3) return null;
  if (word[len - 1] !== 'e') return null;

  const lastConsonant = word[len - 2];
  const vowel = word[len - 3];

  if (!isConsonant(lastConsonant)) return null;
  if (!VOWELS.has(vowel)) return null;

  // a_e、i_e、o_e、u_e、e_e 皆視為 Magic E（含 vowel + consonant + e）
  return len - 3;
}

/**
 * 將任何英文單字拆解成「發音積木」。
 *
 * 策略：
 * 1. 先查精選白名單（CURATED_WORDS），命中即回傳人工校對切片。
 * 2. 否則使用規則演算法，由左到右貪婪比對，優先級：
 *    Magic-E > Digraphs/Vowel Teams（最長組合）> Blends > 單一字母。
 */
export function parseWordToBlocks(word: string): PhonicsBlock[] {
  const clean = (word ?? '').toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length === 0) return [];

  const curated = CURATED_WORDS[clean];
  if (curated) {
    // 回傳副本，避免外部修改污染白名單。
    return curated.map((b) => ({ ...b }));
  }

  const magicVowelIndex = detectMagicE(clean);
  const silentEIndex = magicVowelIndex !== null ? clean.length - 1 : -1;

  const blocks: PhonicsBlock[] = [];
  let i = 0;

  while (i < clean.length) {
    if (i === silentEIndex) {
      blocks.push(makeBlock('e', 'silent_e', 'Magic E', ''));
      i += 1;
      continue;
    }

    if (i === magicVowelIndex) {
      const vowel = clean[i];
      blocks.push(
        makeBlock(
          vowel,
          'long_vowel',
          'Magic E',
          LONG_VOWEL_PHONEME[vowel] ?? vowel,
        ),
      );
      i += 1;
      continue;
    }

    const three = clean.slice(i, i + 3);
    const two = clean.slice(i, i + 2);
    const one = clean[i];

    // 三字母 digraph（如 igh）
    if (three.length === 3 && DIGRAPHS[three]) {
      blocks.push(makeBlock(three, 'long_vowel', 'Vowel Teams', DIGRAPHS[three]));
      i += 3;
      continue;
    }

    // 雙字母 digraph
    if (two.length === 2 && DIGRAPHS[two]) {
      blocks.push(makeBlock(two, 'digraph', 'Digraphs', DIGRAPHS[two]));
      i += 2;
      continue;
    }

    // 雙字母母音團隊（長母音）
    if (two.length === 2 && VOWEL_TEAMS[two]) {
      blocks.push(makeBlock(two, 'long_vowel', 'Vowel Teams', VOWEL_TEAMS[two]));
      i += 2;
      continue;
    }

    // 雙字母混合子音
    if (two.length === 2 && BLENDS.has(two)) {
      blocks.push(
        makeBlock(
          two,
          'blend',
          i === 0 ? 'Initial Blends' : 'Final Blends',
          (CONSONANT_PHONEME[two[0]] ?? '') + (CONSONANT_PHONEME[two[1]] ?? ''),
        ),
      );
      i += 2;
      continue;
    }

    // 單一母音（短音）
    if (VOWELS.has(one)) {
      blocks.push(
        makeBlock(one, 'short_vowel', 'Short Vowel', SHORT_VOWEL_PHONEME[one] ?? one),
      );
      i += 1;
      continue;
    }

    // 單一子音
    blocks.push(
      makeBlock(one, 'consonant', 'Basic Consonant', CONSONANT_PHONEME[one] ?? one),
    );
    i += 1;
  }

  return blocks;
}

export interface DecodeWordResult {
  word: string;
  blocks: PhonicsBlock[];
  fromCurated: boolean;
  decodable: boolean;
}

/** 自由輸入生字：回傳拆音結果與是否來自白名單 */
export function decodeWordAnalysis(word: string): DecodeWordResult {
  const clean = (word ?? '').toLowerCase().replace(/[^a-z]/g, '');
  const fromCurated = Boolean(clean && CURATED_WORDS[clean]);
  const blocks = parseWordToBlocks(clean);
  return {
    word: clean,
    blocks,
    fromCurated,
    decodable: blocks.length > 0,
  };
}
