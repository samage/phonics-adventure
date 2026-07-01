import type { PhonicsBlock, PhonicsType } from '@/types/phonics';

export interface GraphemePhonicsMeta {
  key: string;
  display: string;
  phonicsType: PhonicsType;
  soundRule: string;
  phoneme: string;
  spoken: string;
  exampleWord: string;
  hint: string;
}

export const GRAPHEME_PHONICS: Record<string, GraphemePhonicsMeta> = {
  magic_e: {
    key: 'magic_e',
    display: 'a_e',
    phonicsType: 'long_vowel',
    soundRule: 'Magic E',
    phoneme: 'eɪ',
    spoken: 'magic e',
    exampleWord: 'cake',
    hint: '字尾 e 不發音，母音變長音',
  },
  ai: {
    key: 'ai',
    display: 'ai',
    phonicsType: 'long_vowel',
    soundRule: 'Vowel Team',
    phoneme: 'eɪ',
    spoken: 'ay',
    exampleWord: 'rain',
    hint: 'ai 發 /eɪ/ 長音',
  },
  ay: {
    key: 'ay',
    display: 'ay',
    phonicsType: 'long_vowel',
    soundRule: 'Vowel Team',
    phoneme: 'eɪ',
    spoken: 'ay',
    exampleWord: 'day',
    hint: 'ay 發 /eɪ/ 長音',
  },
  au: {
    key: 'au',
    display: 'au',
    phonicsType: 'diphthong',
    soundRule: 'Vowel Team',
    phoneme: 'ɔː',
    spoken: 'aw',
    exampleWord: 'sauce',
    hint: 'au 發 /ɔː/',
  },
  aw: {
    key: 'aw',
    display: 'aw',
    phonicsType: 'diphthong',
    soundRule: 'Vowel Team',
    phoneme: 'ɔː',
    spoken: 'aw',
    exampleWord: 'saw',
    hint: 'aw 發 /ɔː/',
  },
  ee: {
    key: 'ee',
    display: 'ee',
    phonicsType: 'long_vowel',
    soundRule: 'Vowel Team',
    phoneme: 'iː',
    spoken: 'ee',
    exampleWord: 'bee',
    hint: 'ee 發 /iː/ 長音',
  },
  ch: {
    key: 'ch',
    display: 'ch',
    phonicsType: 'digraph',
    soundRule: 'Digraph',
    phoneme: 'tʃ',
    spoken: 'ch',
    exampleWord: 'chip',
    hint: 'ch 發 /tʃ/',
  },
  ck: {
    key: 'ck',
    display: 'ck',
    phonicsType: 'digraph',
    soundRule: 'Digraph',
    phoneme: 'k',
    spoken: 'k',
    exampleWord: 'duck',
    hint: 'ck 在短母音後發 /k/',
  },
  gh: {
    key: 'gh',
    display: 'gh',
    phonicsType: 'silent_letter',
    soundRule: 'Silent / F',
    phoneme: 'f',
    spoken: 'f',
    exampleWord: 'laugh',
    hint: 'gh 有時發 /f/ 或不發音',
  },
  ei: {
    key: 'ei',
    display: 'ei',
    phonicsType: 'long_vowel',
    soundRule: 'Vowel Team',
    phoneme: 'eɪ',
    spoken: 'ay',
    exampleWord: 'vein',
    hint: 'ei 常發 /eɪ/',
  },
  eu: {
    key: 'eu',
    display: 'eu',
    phonicsType: 'long_vowel',
    soundRule: 'Vowel Team',
    phoneme: 'juː',
    spoken: 'you',
    exampleWord: 'feud',
    hint: 'eu 常發 /juː/',
  },
  ou: {
    key: 'ou',
    display: 'ou',
    phonicsType: 'diphthong',
    soundRule: 'Vowel Team',
    phoneme: 'aʊ',
    spoken: 'ow',
    exampleWord: 'house',
    hint: 'ou 發 /aʊ/',
  },
  ew: {
    key: 'ew',
    display: 'ew',
    phonicsType: 'long_vowel',
    soundRule: 'Vowel Team',
    phoneme: 'juː',
    spoken: 'oo',
    exampleWord: 'new',
    hint: 'ew 常發 /juː/',
  },
};

export function getGraphemePhonics(key: string): GraphemePhonicsMeta | null {
  return GRAPHEME_PHONICS[key.toLowerCase()] ?? null;
}

export function graphemeToBlock(key: string): PhonicsBlock {
  const meta = getGraphemePhonics(key);
  if (meta) {
    return {
      text: meta.display,
      type: meta.phonicsType,
      soundRule: meta.soundRule,
      phoneme: meta.phoneme,
    };
  }
  return {
    text: key,
    type: 'digraph',
    soundRule: 'Grapheme',
    phoneme: key,
  };
}

export const graphemeAudioPath = (key: string) =>
  `/audio/graphemes/${key.toLowerCase()}.mp3`;
