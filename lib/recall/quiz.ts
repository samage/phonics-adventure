/**
 * 看字選音小測驗：題目產生器（純函式，可注入亂數，方便測試）。
 *
 * 防洩題原則：
 * 1. 四個選項的 soundId 互不相同 → 正確答案唯一（ai／ay 這種同音字不會同時出現）。
 * 2. 正確答案的位置是隨機的。
 * 3. 干擾選項優先取自「容易混淆組」（a/e、b/d、sh/ch、th 清濁、i/ee…），
 *    但不會全部都來自同組，避免「找出最像的那個就是答案」。
 * 4. 選例字題：干擾例字不得出現題目這個聲音的任何已知拼法（ck 的題目不會出現 skip）。
 * 5. 聽音選字題：選項字形不得重複（th 清音／濁音只會出現一個）。
 * 6. 題目本身（QuizQuestion 的 prompt）不含答案音檔以外的任何答案資訊；
 *    選項只帶 id／文字／音檔，不帶「是否正確」，正解另存在 answerId。
 */

import {
  CONFUSION_GROUPS,
  RECALL_ITEMS,
  type RecallItem,
} from '@/data/recall/items';

export type Rng = () => number;
export type QuizMode = 'sound' | 'word' | 'hear';

export interface QuizOption {
  /** 該選項來源的項目 id（在同一題中唯一） */
  id: string;
  /** 顯示文字：word 模式為例字、hear 模式為字形；sound 模式沒有文字 */
  label: string | null;
  /** sound 模式：此選項的預錄音 key */
  audio: string | null;
}

export interface QuizQuestion {
  /** 題目對應的字素項目 */
  itemId: string;
  mode: QuizMode;
  options: QuizOption[];
  /** 正解（= itemId 的選項 id） */
  answerId: string;
}

export const OPTION_COUNT = 4;

/** 可重現的亂數（mulberry32） */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(arr: readonly T[], rng: Rng = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';

/** 例字裡是否出現此字母組合（Magic E 用「母音 + 子音 + e」判斷） */
export function wordContainsGrapheme(word: string, grapheme: string): boolean {
  const w = word.toLowerCase();
  const g = grapheme.toLowerCase();
  const magic = g.match(/^([aeiou])-e$/);
  if (magic) {
    return new RegExp(`${magic[1]}[${CONSONANTS}]e(?![a-z])`).test(w);
  }
  return w.includes(g);
}

/** 同一個聲音的所有拼法（c／k／ck 都是 /k/；ai／ay／a-e 都是長 a） */
const SPELLINGS_BY_SOUND: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const it of RECALL_ITEMS) {
    const list = map.get(it.soundId) ?? [];
    if (!list.includes(it.display)) list.push(it.display);
    map.set(it.soundId, list);
  }
  return map;
})();

/** 例字裡是否出現「題目這個聲音」的任何已知拼法（有的話就可能也是正解） */
export function wordHasSoundOf(word: string, target: RecallItem): boolean {
  const spellings = SPELLINGS_BY_SOUND.get(target.soundId) ?? [target.display];
  return spellings.some((sp) => wordContainsGrapheme(word, sp));
}

/** 與目標同組的項目 → 親近度（所在最小組的大小，越小越容易混淆） */
function confusableScores(target: RecallItem): Map<string, number> {
  const scores = new Map<string, number>();
  for (const group of CONFUSION_GROUPS) {
    if (!group.includes(target.id)) continue;
    for (const id of group) {
      if (id === target.id) continue;
      const prev = scores.get(id);
      if (prev === undefined || group.length < prev) scores.set(id, group.length);
    }
  }
  return scores;
}

function usableAsDistractor(
  target: RecallItem,
  cand: RecallItem,
  mode: QuizMode,
): boolean {
  if (cand.id === target.id) return false;
  if (cand.soundId === target.soundId) return false;
  if (mode === 'hear' && cand.display === target.display) return false;
  if (mode === 'word') {
    // 至少要有一個不含題目字母組合的例字
    return cand.words.some((w) => !wordHasSoundOf(w, target));
  }
  return true;
}

/** 挑出 count 個干擾項目（soundId 互不相同） */
export function pickDistractors(
  target: RecallItem,
  mode: QuizMode,
  count: number,
  rng: Rng = Math.random,
  pool: readonly RecallItem[] = RECALL_ITEMS,
): RecallItem[] {
  const valid = pool.filter((c) => usableAsDistractor(target, c, mode));
  const scores = confusableScores(target);
  const confusable = new Set(scores.keys());
  // 先洗牌再依親近度（穩定）排序：越像的越優先，同分隨機
  const groupMates = shuffled(valid.filter((c) => confusable.has(c.id)), rng).sort(
    (x, y) => (scores.get(x.id) ?? 99) - (scores.get(y.id) ?? 99),
  );
  const sameCategory = shuffled(
    valid.filter((c) => !confusable.has(c.id) && c.category === target.category),
    rng,
  );
  const rest = shuffled(
    valid.filter((c) => !confusable.has(c.id) && c.category !== target.category),
    rng,
  );

  // 最多 2 個來自混淆組，其餘取同類別，最後才用其他
  const ordered = [
    ...groupMates.slice(0, 2),
    ...sameCategory,
    ...groupMates.slice(2),
    ...rest,
  ];

  const picked: RecallItem[] = [];
  const usedSounds = new Set<string>([target.soundId]);
  const usedDisplays = new Set<string>(mode === 'hear' ? [target.display] : []);
  for (const cand of ordered) {
    if (picked.length >= count) break;
    if (usedSounds.has(cand.soundId)) continue;
    if (mode === 'hear' && usedDisplays.has(cand.display)) continue;
    picked.push(cand);
    usedSounds.add(cand.soundId);
    if (mode === 'hear') usedDisplays.add(cand.display);
  }
  return picked;
}

function pickWord(
  cand: RecallItem,
  target: RecallItem,
  isAnswer: boolean,
  rng: Rng,
): string {
  const words = isAnswer
    ? cand.words
    : cand.words.filter((w) => !wordHasSoundOf(w, target));
  return words[Math.floor(rng() * words.length)] as string;
}

export function makeQuestion(
  target: RecallItem,
  mode: QuizMode,
  rng: Rng = Math.random,
  pool: readonly RecallItem[] = RECALL_ITEMS,
): QuizQuestion {
  const distractors = pickDistractors(target, mode, OPTION_COUNT - 1, rng, pool);
  const all = shuffled([target, ...distractors], rng);
  const options: QuizOption[] = all.map((it) => {
    const isAnswer = it.id === target.id;
    switch (mode) {
      case 'sound':
        return { id: it.id, label: null, audio: it.audio };
      case 'word':
        return { id: it.id, label: pickWord(it, target, isAnswer, rng), audio: null };
      case 'hear':
      default:
        return {
          id: it.id,
          label: it.tag ? `${it.display}（${it.tag.slice(0, 2)}）` : it.display,
          audio: null,
        };
    }
  });
  return { itemId: target.id, mode, options, answerId: target.id };
}

const MODE_CYCLE: QuizMode[] = ['sound', 'word', 'hear'];

/** 依序為每個項目出一題，題型輪流（順序打亂） */
export function buildQuiz(
  targets: readonly RecallItem[],
  rng: Rng = Math.random,
  pool: readonly RecallItem[] = RECALL_ITEMS,
): QuizQuestion[] {
  const offset = Math.floor(rng() * MODE_CYCLE.length);
  return targets.map((t, i) =>
    makeQuestion(t, MODE_CYCLE[(i + offset) % MODE_CYCLE.length] as QuizMode, rng, pool),
  );
}
