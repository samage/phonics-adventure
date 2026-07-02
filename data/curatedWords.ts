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
  mat: [
    { text: 'm', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'm' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'æ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  had: [
    { text: 'h', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'h' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'æ' },
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
  ],
  dog: [
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
    { text: 'o', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɒ' },
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
  ],
  hot: [
    { text: 'h', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'h' },
    { text: 'o', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɒ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  top: [
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
    { text: 'o', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɒ' },
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
  ],
  sun: [
    { text: 's', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
    { text: 'u', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ʌ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  bus: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'u', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ʌ' },
    { text: 's', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
  ],
  cup: [
    { text: 'c', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'u', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ʌ' },
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
  ],
  pig: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
  ],
  sit: [
    { text: 's', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  big: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
  ],
  bed: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'e', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɛ' },
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
  ],
  pen: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'e', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɛ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  leg: [
    { text: 'l', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
    { text: 'e', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɛ' },
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
  ],
  red: [
    { text: 'r', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'r' },
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
    { text: 'ar', type: 'r_controlled', soundRule: 'R-Controlled Vowel', phoneme: 'ɑːr' },
    { text: 'k', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
  ],
  bark: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'ar', type: 'r_controlled', soundRule: 'R-Controlled Vowel', phoneme: 'ɑːr' },
    { text: 'k', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
  ],
  cake: [
    { text: 'c', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'a', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'eɪ' },
    { text: 'k', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  bike: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'i', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'aɪ' },
    { text: 'k', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
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
  sat: [
    { text: 's', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'æ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  pin: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  tin: [
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  home: [
    { text: 'h', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'h' },
    { text: 'o', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'oʊ' },
    { text: 'm', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'm' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  cute: [
    { text: 'c', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'u', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'juː' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  wait: [
    { text: 'w', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'w' },
    { text: 'ai', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eɪ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  day: [
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
    { text: 'ay', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eɪ' },
  ],
  play: [
    { text: 'pl', type: 'blend', soundRule: 'Initial Blends', phoneme: 'pl' },
    { text: 'ay', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eɪ' },
  ],
  say: [
    { text: 's', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
    { text: 'ay', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eɪ' },
  ],
  haul: [
    { text: 'h', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'h' },
    { text: 'au', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'ɔː' },
    { text: 'l', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
  ],
  sauce: [
    { text: 's', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
    { text: 'au', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'ɔː' },
    { text: 'ce', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
  ],
  saw: [
    { text: 's', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
    { text: 'aw', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'ɔː' },
  ],
  paw: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'aw', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'ɔː' },
  ],
  bee: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'ee', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'iː' },
  ],
  tree: [
    { text: 'tr', type: 'blend', soundRule: 'Initial Blends', phoneme: 'tr' },
    { text: 'ee', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'iː' },
  ],
  feet: [
    { text: 'f', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'f' },
    { text: 'ee', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'iː' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  chair: [
    { text: 'ch', type: 'digraph', soundRule: 'Digraphs', phoneme: 'tʃ' },
    { text: 'air', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eə' },
  ],
  chop: [
    { text: 'ch', type: 'digraph', soundRule: 'Digraphs', phoneme: 'tʃ' },
    { text: 'o', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɒ' },
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
  ],
  duck: [
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
    { text: 'u', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ʌ' },
    { text: 'ck', type: 'digraph', soundRule: 'Digraphs', phoneme: 'k' },
  ],
  add: [
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'æ' },
    { text: 'dd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
  ],
  glass: [
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
    { text: 'l', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'æ' },
    { text: 'ss', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
  ],
  jelly: [
    { text: 'j', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'dʒ' },
    { text: 'e', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɛ' },
    { text: 'll', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
    { text: 'y', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'i' },
  ],
  gym: [
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'dʒ' },
    { text: 'y', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'm', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'm' },
  ],
  bridge: [
    { text: 'br', type: 'blend', soundRule: 'Initial Blends', phoneme: 'br' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'dge', type: 'consonant', soundRule: 'Digraphs', phoneme: 'dʒ' },
  ],
  page: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'a', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'eɪ' },
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  life: [
    { text: 'l', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
    { text: 'i', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'aɪ' },
    { text: 'f', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'f' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  bell: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'e', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɛ' },
    { text: 'll', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
  ],
  money: [
    { text: 'm', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'm' },
    { text: 'o', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ʌ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
    { text: 'ey', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'i' },
  ],
  ring: [
    { text: 'r', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'r' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'ng', type: 'digraph', soundRule: 'Digraphs', phoneme: 'ŋ' },
  ],
  pink: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'nk', type: 'blend', soundRule: 'Final Blends', phoneme: 'ŋk' },
  ],
  five: [
    { text: 'f', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'f' },
    { text: 'i', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'aɪ' },
    { text: 'v', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'v' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  vase: [
    { text: 'v', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'v' },
    { text: 'a', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'eɪ' },
    { text: 's', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  zip: [
    { text: 'z', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'z' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
  ],
  egg: [
    { text: 'e', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɛ' },
    { text: 'gg', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
  ],
  bread: [
    { text: 'br', type: 'blend', soundRule: 'Initial Blends', phoneme: 'br' },
    { text: 'ea', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɛ' },
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
  ],
  hit: [
    { text: 'h', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'h' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  pot: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'o', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɒ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  coin: [
    { text: 'c', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'oi', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'ɔɪ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  boy: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'oy', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'ɔɪ' },
  ],
  cow: [
    { text: 'c', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'ow', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'aʊ' },
  ],
  gate: [
    { text: 'g', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'g' },
    { text: 'a', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'eɪ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  tray: [
    { text: 'tr', type: 'blend', soundRule: 'Initial Blends', phoneme: 'tr' },
    { text: 'ay', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eɪ' },
  ],
  low: [
    { text: 'l', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
    { text: 'ow', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'oʊ' },
  ],
  bone: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'o', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'oʊ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  like: [
    { text: 'l', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
    { text: 'i', type: 'long_vowel', soundRule: 'Magic E', phoneme: 'aɪ' },
    { text: 'k', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'k' },
    { text: 'e', type: 'silent_e', soundRule: 'Magic E', phoneme: '' },
  ],
  pie: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'ie', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'aɪ' },
  ],
  shoe: [
    { text: 'sh', type: 'digraph', soundRule: 'Digraphs', phoneme: 'ʃ' },
    { text: 'oe', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'uː' },
  ],
  watch: [
    { text: 'w', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'w' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɒ' },
    { text: 'tch', type: 'digraph', soundRule: 'Digraphs', phoneme: 'tʃ' },
  ],
  then: [
    { text: 'th', type: 'consonant', soundRule: 'Digraphs', phoneme: 'ð' },
    { text: 'e', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɛ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  father: [
    { text: 'f', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'f' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɑ' },
    { text: 'th', type: 'consonant', soundRule: 'Digraphs', phoneme: 'ð' },
    { text: 'er', type: 'r_controlled', soundRule: 'R-Controlled', phoneme: 'ɚ' },
  ],
  math: [
    { text: 'm', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'm' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'æ' },
    { text: 'th', type: 'consonant', soundRule: 'Digraphs', phoneme: 'θ' },
  ],
  you: [
    { text: 'y', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'j' },
    { text: 'ou', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'uː' },
  ],
  back: [
    { text: 'b', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'b' },
    { text: 'a', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'æ' },
    { text: 'ck', type: 'digraph', soundRule: 'Digraphs', phoneme: 'k' },
  ],
  pick: [
    { text: 'p', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'p' },
    { text: 'i', type: 'short_vowel', soundRule: 'Short Vowel', phoneme: 'ɪ' },
    { text: 'ck', type: 'digraph', soundRule: 'Digraphs', phoneme: 'k' },
  ],
  laugh: [
    { text: 'l', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'l' },
    { text: 'au', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'ɔː' },
    { text: 'gh', type: 'silent_letter', soundRule: 'Silent / F', phoneme: 'f' },
  ],
  tough: [
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
    { text: 'ou', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'ʌ' },
    { text: 'gh', type: 'silent_letter', soundRule: 'Silent / F', phoneme: 'f' },
  ],
  vein: [
    { text: 'v', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'v' },
    { text: 'ei', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eɪ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  rein: [
    { text: 'r', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'r' },
    { text: 'ei', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'eɪ' },
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
  ],
  feud: [
    { text: 'f', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'f' },
    { text: 'eu', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'juː' },
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
  ],
  deuce: [
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
    { text: 'eu', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'juː' },
    { text: 'ce', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
  ],
  house: [
    { text: 'h', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'h' },
    { text: 'ou', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'aʊ' },
    { text: 'se', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
  ],
  mouse: [
    { text: 'm', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'm' },
    { text: 'ou', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'aʊ' },
    { text: 'se', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 's' },
  ],
  out: [
    { text: 'ou', type: 'diphthong', soundRule: 'Vowel Teams', phoneme: 'aʊ' },
    { text: 't', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 't' },
  ],
  new: [
    { text: 'n', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'n' },
    { text: 'ew', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'juː' },
  ],
  few: [
    { text: 'f', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'f' },
    { text: 'ew', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'juː' },
  ],
  dew: [
    { text: 'd', type: 'consonant', soundRule: 'Basic Consonant', phoneme: 'd' },
    { text: 'ew', type: 'long_vowel', soundRule: 'Vowel Teams', phoneme: 'juː' },
  ],
};

/** @deprecated 課程單字改由 data/curriculum 驅動；保留供向後相容 */
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
