/**
 * 特殊字／短句的小測驗題目產生器（純函式，可注入亂數，方便測試）。
 *
 * 題型：
 * - word：hear —— 聽到一個字，從長得很像的字裡選出來（the／then／they）。
 * - word：sound —— 看到一個字，從四個「聲音」裡選出它的唸法（選項是 🔊 按鈕，用 TTS 唸）。
 * - sentence：cloze —— 聽整句、看到少一個字的句子，選出缺的字。
 *
 * 防洩題原則（和字母小測驗一致）：
 * 1. 選項互不重複、且不含正解以外的「也說得通」的字：
 *    短句題的干擾字不會是句子裡本來就有的字。
 * 2. 正解位置隨機。
 * 3. 題目只帶選項，不帶「哪個是對的」；正解另存 answerId。
 * 4. 特殊字的干擾項優先用長得像的字，但不會用同音字（避免答案不唯一）。
 */

import type { SentenceItem, TextItem, WordItem } from '@/data/recall/textItems';
import { shuffled, type Rng } from './quiz';

export type TextQuizMode = 'hear' | 'sound' | 'cloze';

interface TextQuizOption {
  /** 選項 id（同一題中唯一；就是小寫的字） */
  id: string;
  /** 顯示的字 */
  label: string;
}

export interface TextQuestion {
  /** 用來和字母題（QuizQuestion）區分 */
  kind: 'text';
  itemId: string;
  mode: TextQuizMode;
  options: TextQuizOption[];
  answerId: string;
  /** cloze：被挖掉的字在句子裡的位置 */
  blankIndex?: number;
}

export const TEXT_OPTION_COUNT = 4;

/** 長得像（或讀音容易搞混）的字，刻意避開同音字 */
const LOOKALIKES: Record<string, string[]> = {
  the: ['then', 'they', 'this', 'she'],
  said: ['say', 'sad', 'sail', 'paid'],
  was: ['saw', 'wash', 'war', 'has'],
  they: ['then', 'them', 'the', 'than'],
  one: ['on', 'once', 'none', 'nose'],
  are: ['art', 'ate', 'air', 'arm'],
  come: ['came', 'some', 'home', 'cone'],
  some: ['same', 'come', 'soon', 'sore'],
  have: ['hive', 'save', 'gave', 'hate'],
  what: ['that', 'went', 'when', 'white'],
};

/** 實在湊不滿時才用的簡單字 */
const FILLER_WORDS = ['cat', 'sun', 'pig', 'bed', 'cup', 'map', 'top', 'hen', 'dog', 'fun'];

function similarity(a: string, b: string): number {
  let score = 0;
  if (a[0] === b[0]) score += 2;
  if (a[a.length - 1] === b[b.length - 1]) score += 1;
  score -= Math.abs(a.length - b.length) * 0.5;
  return score;
}

function wordDistractors(
  target: WordItem,
  count: number,
  rng: Rng,
  pool: readonly TextItem[],
): string[] {
  const own = target.word;
  const looks = shuffled(LOOKALIKES[own] ?? [], rng);
  const learned = pool
    .filter((p): p is WordItem => p.kind === 'word' && p.id !== target.id)
    .map((p) => p.word);
  const similarLearned = shuffled(learned, rng).sort(
    (x, y) => similarity(own, y) - similarity(own, x),
  );
  // 先 2 個長得像的，再混入學過的特殊字，最後才用剩下的長得像的字和簡單字
  const ordered = [
    ...looks.slice(0, 2),
    ...similarLearned,
    ...looks.slice(2),
    ...shuffled(FILLER_WORDS, rng),
  ];
  const picked: string[] = [];
  for (const w of ordered) {
    if (picked.length >= count) break;
    if (w === own || picked.includes(w)) continue;
    picked.push(w);
  }
  return picked;
}

/** 句子裡可以拿來挖空的位置（偏好 3 個字母以上的字，太短的字沒有辨識價值） */
function blankCandidates(words: string[]): number[] {
  const long = words.map((w, i) => [w, i] as const).filter(([w]) => w.length >= 3);
  const list = long.length > 0 ? long : words.map((w, i) => [w, i] as const);
  return list.map(([, i]) => i);
}

function capitalise(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function clozeQuestion(
  target: SentenceItem,
  rng: Rng,
  pool: readonly TextItem[],
  avoidBlank?: number,
): TextQuestion {
  let candidates = blankCandidates(target.words);
  if (avoidBlank !== undefined && candidates.length > 1) {
    candidates = candidates.filter((i) => i !== avoidBlank);
  }
  const blankIndex = candidates[Math.floor(rng() * candidates.length)] as number;
  const answer = (target.words[blankIndex] as string).toLowerCase();
  const inSentence = new Set(target.words.map((w) => w.toLowerCase()));

  const poolWords = new Set<string>();
  for (const p of pool) {
    if (p.id === target.id) continue;
    const ws = p.kind === 'sentence' ? p.words : [p.word];
    for (const w of ws) poolWords.add(w.toLowerCase());
  }
  const fromPool = shuffled(
    [...poolWords].filter((w) => !inSentence.has(w) && w.length >= 2),
    rng,
  ).sort((x, y) => Math.abs(x.length - answer.length) - Math.abs(y.length - answer.length));
  const ordered = [...fromPool, ...shuffled(FILLER_WORDS, rng)];
  const distractors: string[] = [];
  for (const w of ordered) {
    if (distractors.length >= TEXT_OPTION_COUNT - 1) break;
    if (inSentence.has(w) || distractors.includes(w)) continue;
    distractors.push(w);
  }
  const options = shuffled([answer, ...distractors], rng).map((w) => ({
    id: w,
    label: blankIndex === 0 ? capitalise(w) : w,
  }));
  return { kind: 'text', itemId: target.id, mode: 'cloze', options, answerId: answer, blankIndex };
}

export function makeTextQuestion(
  target: TextItem,
  mode: TextQuizMode,
  rng: Rng = Math.random,
  pool: readonly TextItem[] = [],
  avoidBlank?: number,
): TextQuestion {
  if (target.kind === 'sentence') return clozeQuestion(target, rng, pool, avoidBlank);
  const wordMode: TextQuizMode = mode === 'sound' ? 'sound' : 'hear';
  const distractors = wordDistractors(target, TEXT_OPTION_COUNT - 1, rng, pool);
  const options = shuffled([target.word, ...distractors], rng).map((w) => ({ id: w, label: w }));
  return {
    kind: 'text',
    itemId: target.id,
    mode: wordMode,
    options,
    answerId: target.word,
  };
}

/** 這個項目預設的題型（特殊字依序輪流 hear／sound） */
export function defaultTextMode(item: TextItem, seq = 0): TextQuizMode {
  if (item.kind === 'sentence') return 'cloze';
  return seq % 2 === 0 ? 'hear' : 'sound';
}

/** 答錯後重考：換一種題型（特殊字 hear↔sound；短句換一個空格） */
export function retryTextQuestion(
  target: TextItem,
  previous: TextQuestion,
  rng: Rng = Math.random,
  pool: readonly TextItem[] = [],
): TextQuestion {
  if (target.kind === 'sentence') {
    return makeTextQuestion(target, 'cloze', rng, pool, previous.blankIndex);
  }
  return makeTextQuestion(target, previous.mode === 'hear' ? 'sound' : 'hear', rng, pool);
}
