import type { PhonicsBlock } from '@/types/phonics';

/**
 * 精選教學單字白名單。
 *
 * 英文發音存在大量例外，純規則演算法無法 100% 正確。
 * 命中白名單的單字會直接回傳人工校對過的切片，保證教學正確性。
 * 未命中的單字才會交給 utils/phonicsEngine.ts 的規則演算法處理。
 *
 * key 一律使用小寫。
 */
export const CURATED_WORDS: Record<string, PhonicsBlock[]> = {
  cat: [
    { text: 'c', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'æ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  dog: [
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
    { text: 'o', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɒ' },
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
  ],
  sun: [
    { text: 's', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
    { text: 'u', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ʌ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  pig: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
  ],
  bed: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'e', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɛ' },
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
  ],
  train: [
    { text: 'tr', type: 'blend', soundRule: 'Initial Blends', phoneme: 'tr' },
    { text: 'ai', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eɪ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  ship: [
    { text: 'sh', type: 'digraph', soundRule: 'Digraphs', phoneme: 'ʃ' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
  ],
  fish: [
    { text: 'f', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'f' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'sh', type: 'digraph', soundRule: 'Digraphs', phoneme: 'ʃ' },
  ],
  chip: [
    { text: 'ch', type: 'digraph', soundRule: 'Digraphs', phoneme: 'tʃ' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
  ],
  shark: [
    { text: 'sh', type: 'digraph', soundRule: 'Digraphs', phoneme: 'ʃ' },
    { text: 'ar', type: 'long_vowel', soundRule: 'R-Controlled Vowel', phoneme: 'ɑːr' },
    { text: 'k', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
  ],
  bark: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'ar', type: 'long_vowel', soundRule: 'R-Controlled Vowel', phoneme: 'ɑːr' },
    { text: 'k', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
  ],
  cake: [
    { text: 'c', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'a_e', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'eɪ' },
    { text: 'k', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
  ],
  bike: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'i_e', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'aɪ' },
    { text: 'k', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
  ],
  rain: [
    { text: 'r', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'r' },
    { text: 'ai', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eɪ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  boat: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'oa', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'oʊ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  frog: [
    { text: 'fr', type: 'blend', soundRule: 'Initial Blends', phoneme: 'fr' },
    { text: 'o', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɒ' },
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
  ],
  stop: [
    { text: 'st', type: 'blend', soundRule: 'Initial Blends', phoneme: 'st' },
    { text: 'o', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɒ' },
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
  ],
  flashlight: [
    { text: 'fl', type: 'blend', soundRule: 'Initial Blends', phoneme: 'fl' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'æ' },
    { text: 'sh', type: 'digraph', soundRule: 'Digraphs', phoneme: 'ʃ' },
    { text: 'l', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
    { text: 'igh', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'aɪ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
};

/** 取得適合關卡一（短單字）的精選單字 key 清單。 */
export const ALCHEMIST_WORDS: string[] = [
  'cat',
  'dog',
  'sun',
  'pig',
  'bed',
  'ship',
  'fish',
  'chip',
  'frog',
  'stop',
  'cake',
  'bike',
  'rain',
  'boat',
  'train',
];
