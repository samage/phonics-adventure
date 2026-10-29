/**
 * 把「字母項目」和「特殊字／短句項目」放在同一套出題流程裡：
 * 一個複習項目（ReviewItem）= RecallItem（字母）或 TextItem（特殊字、短句），
 * 一個題目（ReviewQuestion）= QuizQuestion（字母題）或 TextQuestion（文字題）。
 * 複習本（/review）、課程裡的「學完馬上練」、「多練一輪」都用這裡的函式出題。
 */

import { getRecallItem, type RecallItem } from '@/data/recall/items';
import { getTextItem, isTextItem, type TextItem } from '@/data/recall/textItems';
import {
  buildQuiz,
  makeQuestion,
  type QuizMode,
  type QuizQuestion,
  type Rng,
} from './quiz';
import {
  defaultTextMode,
  makeTextQuestion,
  retryTextQuestion,
  type TextQuestion,
} from './textQuiz';

export type ReviewItem = RecallItem | TextItem;
export type ReviewQuestion = QuizQuestion | TextQuestion;

/** 干擾選項的來源（沒給就用預設：字母＝全部字母項目；文字＝簡單字補滿） */
export interface QuizPools {
  grapheme?: readonly RecallItem[];
  text?: readonly TextItem[];
}

export function isTextQuestion(q: ReviewQuestion): q is TextQuestion {
  return 'kind' in q;
}

/** 以複習表裡的 id 找到項目；找不到（舊資料、已移除的項目）回傳 null */
export function getReviewItem(id: string): ReviewItem | null {
  return getRecallItem(id) ?? getTextItem(id);
}

/** 複習表裡這個 id 是否是現行課程裡存在的項目 */
export function isKnownReviewId(id: string): boolean {
  return getReviewItem(id) !== null;
}

/**
 * 依序為每個項目出一題。字母題的題型輪流，特殊字 hear／sound 輪流，短句固定填空。
 * 回傳順序和 items 相同。
 */
export function buildReviewQuiz(
  items: readonly ReviewItem[],
  rng: Rng = Math.random,
  pools: QuizPools = {},
): ReviewQuestion[] {
  const graphemes = items.filter((it): it is RecallItem => !isTextItem(it));
  const graphemeQs = new Map(
    buildQuiz(graphemes, rng, pools.grapheme).map((q) => [q.itemId, q] as const),
  );
  let wordSeq = Math.floor(rng() * 2);
  return items.map((it) => {
    if (!isTextItem(it)) return graphemeQs.get(it.id) as QuizQuestion;
    const mode = defaultTextMode(it, it.kind === 'word' ? wordSeq++ : 0);
    return makeTextQuestion(it, mode, rng, pools.text);
  });
}

/** 答錯後換一種題型再問一次 */
export function retryQuestion(
  item: ReviewItem,
  previous: ReviewQuestion,
  rng: Rng = Math.random,
  pools: QuizPools = {},
): ReviewQuestion {
  if (isTextItem(item) && isTextQuestion(previous)) {
    return retryTextQuestion(item, previous, rng, pools.text);
  }
  if (!isTextItem(item) && !isTextQuestion(previous)) {
    const other: QuizMode = previous.mode === 'sound' ? 'word' : 'sound';
    return makeQuestion(item, other, rng, pools.grapheme);
  }
  // 項目和題目種類不一致（不應發生）：重新出一題
  return buildReviewQuiz([item], rng, pools)[0] as ReviewQuestion;
}
