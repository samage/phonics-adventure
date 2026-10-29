import type { PhonicsBlock, PhonicsType } from '@/types/phonics';

/**
 * 規則演算法會念錯的字（come 的 o 不是 /oʊ/、what 的 a 不是 /æ/ …），
 * 在這裡人工校對切片與音素。優先於 phonicsEngine 的規則。
 *
 * 每塊：[字母, 類型, 音素]；類型縮寫見 TYPE。
 * 音素必須能由 lib/phonemeClips.ts 對應到預錄音檔（ʒ 除外：沒有錄音，會退回裝置 TTS）。
 */
const TYPE: Record<string, [PhonicsType, string]> = {
  C: ['consonant', 'Basic Consonant'],
  S: ['short_vowel', 'Short Vowel'],
  L: ['long_vowel', 'Vowel Teams'],
  P: ['diphthong', 'Vowel Teams'],
  D: ['digraph', 'Digraphs'],
  R: ['r_controlled', 'R-Controlled Vowel'],
  B: ['blend', 'Blends'],
  X: ['silent_e', 'Magic E'],
  Q: ['silent_letter', 'Silent Letters'],
};

type Piece = [text: string, type: keyof typeof TYPE, phoneme: string];

const SPEC: Record<string, Piece[]> = {
  are: [['ar', 'R', 'ɑːr'], ['e', 'X', '']],
  have: [['h', 'C', 'h'], ['a', 'S', 'æ'], ['v', 'C', 'v'], ['e', 'X', '']],
  come: [['c', 'C', 'k'], ['o', 'S', 'ʌ'], ['m', 'C', 'm'], ['e', 'X', '']],
  some: [['s', 'C', 's'], ['o', 'S', 'ʌ'], ['m', 'C', 'm'], ['e', 'X', '']],
  one: [['o', 'S', 'wʌ'], ['n', 'C', 'n'], ['e', 'X', '']],
  who: [['wh', 'D', 'h'], ['o', 'L', 'uː']],
  the: [['th', 'D', 'ð'], ['e', 'S', 'ə']],
  they: [['th', 'D', 'ð'], ['ey', 'L', 'eɪ']],
  my: [['m', 'C', 'm'], ['y', 'L', 'aɪ']],
  was: [['w', 'C', 'w'], ['a', 'S', 'ʌ'], ['s', 'C', 'z']],
  what: [['wh', 'D', 'w'], ['a', 'S', 'ɒ'], ['t', 'C', 't']],
  wash: [['w', 'C', 'w'], ['a', 'S', 'ɒ'], ['sh', 'D', 'ʃ']],
  swan: [['sw', 'B', 'sw'], ['a', 'S', 'ɒ'], ['n', 'C', 'n']],
  word: [['w', 'C', 'w'], ['or', 'R', 'ɚ'], ['d', 'C', 'd']],
  her: [['h', 'C', 'h'], ['er', 'R', 'ɚ']],
  term: [['t', 'C', 't'], ['er', 'R', 'ɚ'], ['m', 'C', 'm']],
  fern: [['f', 'C', 'f'], ['er', 'R', 'ɚ'], ['n', 'C', 'n']],
  turn: [['t', 'C', 't'], ['ur', 'R', 'ɚ'], ['n', 'C', 'n']],
  burn: [['b', 'C', 'b'], ['ur', 'R', 'ɚ'], ['n', 'C', 'n']],
  bird: [['b', 'C', 'b'], ['ir', 'R', 'ɚ'], ['d', 'C', 'd']],
  girl: [['g', 'C', 'g'], ['ir', 'R', 'ɚ'], ['l', 'C', 'l']],
  now: [['n', 'C', 'n'], ['ow', 'P', 'aʊ']],
  said: [['s', 'C', 's'], ['ai', 'S', 'ɛ'], ['d', 'C', 'd']],
  blood: [['bl', 'B', 'bl'], ['oo', 'S', 'ʌ'], ['d', 'C', 'd']],
  book: [['b', 'C', 'b'], ['oo', 'S', 'ʊ'], ['k', 'C', 'k']],
  broad: [['br', 'B', 'br'], ['oa', 'P', 'ɔː'], ['d', 'C', 'd']],
  machine: [['m', 'C', 'm'], ['a', 'S', 'ə'], ['ch', 'D', 'ʃ'], ['i', 'L', 'iː'], ['n', 'C', 'n'], ['e', 'X', '']],
  scene: [['sc', 'D', 's'], ['e', 'L', 'iː'], ['n', 'C', 'n'], ['e', 'X', '']],
  since: [['s', 'C', 's'], ['i', 'S', 'ɪ'], ['n', 'C', 'n'], ['c', 'C', 's'], ['e', 'X', '']],
  please: [['pl', 'B', 'pl'], ['ea', 'L', 'iː'], ['se', 'C', 'z']],
  toe: [['t', 'C', 't'], ['oe', 'L', 'oʊ']],
  tongue: [['t', 'C', 't'], ['o', 'S', 'ʌ'], ['ng', 'D', 'ŋ'], ['ue', 'Q', '']],
  treasure: [['tr', 'B', 'tr'], ['ea', 'S', 'ɛ'], ['s', 'C', 'ʒ'], ['ure', 'R', 'ɚ']],
  seizure: [['s', 'C', 's'], ['ei', 'L', 'iː'], ['z', 'C', 'ʒ'], ['ure', 'R', 'ɚ']],
  television: [['t', 'C', 't'], ['e', 'S', 'ɛ'], ['l', 'C', 'l'], ['e', 'S', 'ɛ'], ['v', 'C', 'v'], ['i', 'S', 'ɪ'], ['si', 'D', 'ʒ'], ['o', 'S', 'ə'], ['n', 'C', 'n']],
  station: [['st', 'B', 'st'], ['a', 'L', 'eɪ'], ['ti', 'D', 'ʃ'], ['o', 'S', 'ə'], ['n', 'C', 'n']],
  island: [['i', 'L', 'aɪ'], ['s', 'Q', ''], ['l', 'C', 'l'], ['a', 'S', 'ə'], ['nd', 'B', 'nd']],
  onion: [['o', 'S', 'ʌ'], ['n', 'C', 'n'], ['io', 'S', 'jə'], ['n', 'C', 'n']],
  future: [['f', 'C', 'f'], ['u', 'L', 'juː'], ['tu', 'D', 'tʃ'], ['re', 'R', 'ɚ']],
  umbrella: [['u', 'S', 'ʌ'], ['m', 'C', 'm'], ['br', 'B', 'br'], ['e', 'S', 'ɛ'], ['ll', 'C', 'l'], ['a', 'S', 'ə']],
  apple: [['a', 'S', 'æ'], ['pp', 'C', 'p'], ['le', 'C', 'əl']],
  bubble: [['b', 'C', 'b'], ['u', 'S', 'ʌ'], ['bb', 'C', 'b'], ['le', 'C', 'əl']],
  little: [['l', 'C', 'l'], ['i', 'S', 'ɪ'], ['tt', 'C', 't'], ['le', 'C', 'əl']],
  enough: [['e', 'S', 'ɪ'], ['n', 'C', 'n'], ['ough', 'S', 'ʌf']],
  fought: [['f', 'C', 'f'], ['ough', 'S', 'ɔː'], ['t', 'C', 't']],
  president: [['pr', 'B', 'pr'], ['e', 'S', 'ɛ'], ['s', 'C', 's'], ['i', 'S', 'ɪ'], ['d', 'C', 'd'], ['e', 'S', 'ə'], ['nt', 'B', 'nt']],
  celebrate: [['c', 'C', 's'], ['e', 'S', 'ɛ'], ['l', 'C', 'l'], ['e', 'S', 'ɛ'], ['br', 'B', 'br'], ['a', 'L', 'eɪ'], ['t', 'C', 't'], ['e', 'X', '']],
  kingdom: [['k', 'C', 'k'], ['i', 'S', 'ɪ'], ['ng', 'D', 'ŋ'], ['d', 'C', 'd'], ['o', 'S', 'ə'], ['m', 'C', 'm']],
  photo: [['ph', 'D', 'f'], ['o', 'L', 'oʊ'], ['t', 'C', 't'], ['o', 'L', 'oʊ']],
  hello: [['h', 'C', 'h'], ['e', 'S', 'ɛ'], ['ll', 'C', 'l'], ['o', 'L', 'oʊ']],
  banana: [['b', 'C', 'b'], ['a', 'S', 'ə'], ['n', 'C', 'n'], ['a', 'S', 'æ'], ['n', 'C', 'n'], ['a', 'S', 'ə']],
  bigger: [['b', 'C', 'b'], ['i', 'S', 'ɪ'], ['gg', 'C', 'g'], ['er', 'R', 'ɚ']],
  dinner: [['d', 'C', 'd'], ['i', 'S', 'ɪ'], ['nn', 'C', 'n'], ['er', 'R', 'ɚ']],
  summer: [['s', 'C', 's'], ['u', 'S', 'ʌ'], ['mm', 'C', 'm'], ['er', 'R', 'ɚ']],
  center: [['c', 'C', 's'], ['e', 'S', 'ɛ'], ['nt', 'B', 'nt'], ['er', 'R', 'ɚ']],
  puppet: [['p', 'C', 'p'], ['u', 'S', 'ʌ'], ['pp', 'C', 'p'], ['e', 'S', 'ɛ'], ['t', 'C', 't']],
  campus: [['c', 'C', 'k'], ['a', 'S', 'æ'], ['mp', 'B', 'mp'], ['u', 'S', 'ə'], ['s', 'C', 's']],
  carrot: [['c', 'C', 'k'], ['a', 'S', 'æ'], ['rr', 'C', 'r'], ['o', 'S', 'ə'], ['t', 'C', 't']],
  kitchen: [['k', 'C', 'k'], ['i', 'S', 'ɪ'], ['tch', 'D', 'tʃ'], ['e', 'S', 'ə'], ['n', 'C', 'n']],
  chris: [['ch', 'D', 'k'], ['r', 'C', 'r'], ['i', 'S', 'ɪ'], ['s', 'C', 's']],
  knot: [['k', 'Q', ''], ['n', 'C', 'n'], ['o', 'S', 'ɒ'], ['t', 'C', 't']],
  write: [['wr', 'D', 'r'], ['i', 'L', 'aɪ'], ['t', 'C', 't'], ['e', 'X', '']],
  comb: [['c', 'C', 'k'], ['o', 'L', 'oʊ'], ['m', 'C', 'm'], ['b', 'Q', '']],
  i: [['i', 'L', 'aɪ']],
};

export const CURATED_IRREGULAR_WORDS: Record<string, PhonicsBlock[]> = Object.fromEntries(
  Object.entries(SPEC).map(([word, pieces]) => [
    word,
    pieces.map(([text, t, phoneme]) => {
      const [type, soundRule] = TYPE[t] as [PhonicsType, string];
      return { text, type, soundRule, phoneme };
    }),
  ]),
);
