import type { PhonicsBlock } from '@/types/phonics';

/**
 * Phase 1 補充的精選字：
 * - 三字母連音（str / spr / scr / spl）當成單一積木
 * - that / this 的 th 標成濁音 /ð/（規則引擎沒有分清濁）
 */
function b3(text: string): PhonicsBlock {
  return { text, type: 'blend', soundRule: 'Consonant Blend', phoneme: text };
}
function c(text: string): PhonicsBlock {
  return { text, type: 'consonant', soundRule: 'Basic Consonant', phoneme: text };
}
function v(text: string, phoneme: string): PhonicsBlock {
  return { text, type: 'short_vowel', soundRule: 'Short Vowel', phoneme };
}
function d(text: string, phoneme: string): PhonicsBlock {
  return { text, type: 'digraph', soundRule: 'Digraphs', phoneme };
}

export const CURATED_BLEND_WORDS: Record<string, PhonicsBlock[]> = {
  that: [d('th', 'ð'), v('a', 'æ'), c('t')],
  this: [d('th', 'ð'), v('i', 'ɪ'), c('s')],
  strap: [b3('str'), v('a', 'æ'), c('p')],
  strip: [b3('str'), v('i', 'ɪ'), c('p')],
  scrap: [b3('scr'), v('a', 'æ'), c('p')],
  scrub: [b3('scr'), v('u', 'ʌ'), c('b')],
  split: [b3('spl'), v('i', 'ɪ'), c('t')],
  splash: [b3('spl'), v('a', 'æ'), d('sh', 'ʃ')],
  sprig: [b3('spr'), v('i', 'ɪ'), c('g')],
  sprint: [b3('spr'), v('i', 'ɪ'), { text: 'nt', type: 'blend', soundRule: 'Consonant Blend', phoneme: 'nt' }],
};
