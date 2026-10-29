/**
 * 拼字遊戲的干擾積木：除了拼這個字需要的積木，再多給 1–2 塊「長得像或聽起來像」的，
 * 讓孩子真的要想「這個音怎麼拼」，而不是把積木排一排就好。
 * 純函式，亂數可注入，方便測試。
 */

import type { PhonicsBlock, PhonicsType } from '@/types/phonics';
import { RECALL_ITEMS, type RecallItem } from '@/data/recall/items';
import { shuffled, type Rng } from '@/lib/recall/quiz';

/** 容易拼錯的對象（字形像、聲音像、或同音不同拼法） */
const SPELLING_CONFUSIONS: Record<string, string[]> = {
  a: ['e', 'o', 'u'],
  e: ['a', 'i'],
  i: ['e', 'y'],
  o: ['a', 'u'],
  u: ['o', 'a'],
  b: ['d', 'p'],
  d: ['b', 't'],
  p: ['b', 'q'],
  q: ['p', 'g'],
  m: ['n', 'w'],
  n: ['m', 'r'],
  t: ['d', 'f'],
  g: ['j', 'k'],
  j: ['g', 'y'],
  c: ['k', 's'],
  k: ['c', 'g'],
  f: ['v', 'th'],
  v: ['f', 'w'],
  s: ['z', 'c'],
  z: ['s', 'x'],
  w: ['v', 'y'],
  l: ['r', 'i'],
  r: ['l', 'n'],
  h: ['n', 'k'],
  sh: ['ch', 'th'],
  ch: ['sh', 'th'],
  th: ['sh', 'ch'],
  ck: ['k', 'c'],
  ng: ['nk', 'n'],
  ph: ['f', 'th'],
  wh: ['w', 'h'],
  ai: ['ay', 'ee'],
  ay: ['ai', 'ey'],
  ee: ['ea', 'ie'],
  ea: ['ee', 'ai'],
  oa: ['ow', 'oo'],
  igh: ['ie', 'ay'],
  oo: ['ou', 'ew'],
  ew: ['ue', 'oo'],
  ue: ['ew', 'oo'],
  ou: ['ow', 'oo'],
  ow: ['ou', 'oa'],
  oi: ['oy', 'ai'],
  oy: ['oi', 'ay'],
  er: ['ir', 'ur'],
  ir: ['er', 'ur'],
  ur: ['er', 'ir'],
  or: ['ar', 'er'],
  ar: ['or', 'er'],
  st: ['sp', 'sk'],
  sp: ['st', 'sk'],
  sk: ['sp', 'st'],
  sn: ['sm', 'sl'],
  sm: ['sn', 'sw'],
  sl: ['sw', 'sn'],
  sw: ['sl', 'sm'],
  bl: ['br', 'pl'],
  br: ['bl', 'dr'],
  cl: ['cr', 'gl'],
  cr: ['cl', 'gr'],
  fl: ['fr', 'bl'],
  fr: ['fl', 'tr'],
  gl: ['gr', 'cl'],
  gr: ['gl', 'cr'],
  pl: ['pr', 'bl'],
  pr: ['pl', 'br'],
  dr: ['tr', 'br'],
  tr: ['dr', 'fr'],
  str: ['spr', 'scr'],
  spr: ['str', 'spl'],
  scr: ['str', 'skr'],
  spl: ['spr', 'sp'],
  nd: ['nt', 'mp'],
  nt: ['nd', 'nk'],
  mp: ['nd', 'nt'],
  nk: ['ng', 'nt'],
  ft: ['lt', 'pt'],
  lt: ['ft', 'lp'],
};

const FALLBACK_BY_TYPE: Partial<Record<PhonicsType, string[]>> = {
  consonant: ['b', 'd', 'p', 't', 'm', 'n', 'k', 'g'],
  short_vowel: ['a', 'e', 'i', 'o', 'u'],
  long_vowel: ['ai', 'ee', 'oa', 'oo'],
  digraph: ['sh', 'ch', 'th'],
  blend: ['st', 'bl', 'tr'],
  diphthong: ['ou', 'oi'],
  r_controlled: ['er', 'ir', 'ur'],
};

/** 1–3 塊的字加 1 塊干擾，更長的字加 2 塊 */
export function distractorCountFor(blockCount: number): number {
  return blockCount <= 3 ? 1 : 2;
}

export function pickSpellingDistractors(
  blocks: readonly PhonicsBlock[],
  rng: Rng = Math.random,
  count: number = distractorCountFor(blocks.length),
): PhonicsBlock[] {
  const inWord = new Set(blocks.map((b) => b.text.toLowerCase()));
  const used = new Set<string>();
  const slots = shuffled(
    blocks.filter((b) => b.type !== 'silent_e' && b.type !== 'silent_letter'),
    rng,
  );
  const out: PhonicsBlock[] = [];
  for (const slot of slots) {
    if (out.length >= count) break;
    const text = slot.text.toLowerCase();
    const pool = [
      ...shuffled(SPELLING_CONFUSIONS[text] ?? [], rng),
      ...shuffled(FALLBACK_BY_TYPE[slot.type] ?? [], rng),
    ];
    const pick = pool.find((t) => !inWord.has(t) && !used.has(t) && t !== text);
    if (!pick) continue;
    used.add(pick);
    // 沿用被模仿積木的類型 → 顏色一樣，不會因為顏色露出哪一塊是多的
    out.push({ text: pick, type: slot.type, soundRule: slot.soundRule, phoneme: '' });
  }
  return out;
}

/**
 * 這一格積木對應到哪個「看字說音」項目（拼錯時記進複習用）。
 * 找不到對應（例如沒有收錄的拼法）回傳 null。
 */
export function recallItemIdForSlot(
  blocks: readonly PhonicsBlock[],
  index: number,
): string | null {
  const block = blocks[index];
  if (!block) return null;
  const text = block.text.toLowerCase();
  if (block.type === 'silent_e') return null;

  // Magic e：a…e → a-e
  const next = blocks[index + 1];
  const magicCandidates: Array<RecallItem | undefined> = [];
  if (block.type === 'long_vowel' && text.length === 1) {
    const hasSilentE = blocks.slice(index + 1).some((b) => b.type === 'silent_e');
    if (hasSilentE) magicCandidates.push(RECALL_ITEMS.find((i) => i.id === `${text}-e`));
  }
  void next;
  const magic = magicCandidates.find(Boolean);
  if (magic) return magic.id;

  const matches = RECALL_ITEMS.filter((i) => i.display.toLowerCase() === text);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0].id;
  // 同字形多個音（th 清／濁、oo 長／短）：用音標分辨
  const ph = block.phoneme.replace(/[\/\[\]]/g, '');
  const byIpa = matches.find((i) => i.ipa.replace(/[\/\[\]]/g, '') === ph);
  if (byIpa) return byIpa.id;
  if (text === 'th') return ph === 'ð' ? 'th_voiced' : 'th_voiceless';
  if (text === 'oo') return ph === 'ʊ' || ph === 'u' ? 'oo_short' : 'oo_long';
  return matches[0].id;
}
