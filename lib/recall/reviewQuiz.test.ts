import { describe, expect, it } from 'vitest';
import { RECALL_ITEMS } from '@/data/recall/items';
import { TEXT_ITEMS } from '@/data/recall/textItems';
import { seededRng } from './quiz';
import {
  buildReviewQuiz,
  getReviewItem,
  isKnownReviewId,
  isTextQuestion,
  retryQuestion,
  type ReviewItem,
} from './reviewQuiz';

describe('reviewQuiz：字母與文字項目共用出題', () => {
  it('getReviewItem 找得到字母、特殊字、短句；找不到的 id 回傳 null', () => {
    expect(getReviewItem('s')?.id).toBe('s');
    expect(getReviewItem('w:the')?.id).toBe('w:the');
    expect(getReviewItem('s:L20:0')?.id).toBe('s:L20:0');
    expect(getReviewItem('zzz')).toBeNull();
    expect(isKnownReviewId('w:the')).toBe(true);
    expect(isKnownReviewId('w:nothing')).toBe(false);
  });

  it('混合的項目：每個項目一題、順序一致、題目種類對應項目種類', () => {
    const items: ReviewItem[] = [RECALL_ITEMS[0], TEXT_ITEMS[0], RECALL_ITEMS[5], TEXT_ITEMS[4]];
    const qs = buildReviewQuiz(items, seededRng(1), { text: TEXT_ITEMS });
    expect(qs.map((q) => q.itemId)).toEqual(items.map((i) => i.id));
    qs.forEach((q, i) => expect(isTextQuestion(q)).toBe('kind' in items[i]));
    for (const q of qs) {
      expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
      expect(q.options.some((o) => o.id === q.answerId)).toBe(true);
    }
  });

  it('只有特殊字的一輪：hear／sound 都會出現', () => {
    const words = TEXT_ITEMS.filter((t) => t.kind === 'word').slice(0, 4);
    const qs = buildReviewQuiz(words, seededRng(2), { text: TEXT_ITEMS });
    expect(new Set(qs.map((q) => (q as { mode: string }).mode)).size).toBe(2);
  });

  it('重考：字母題換 sound↔word；文字題換題型或空格', () => {
    const g = RECALL_ITEMS[0];
    const [gq] = buildReviewQuiz([g], seededRng(1));
    const g2 = retryQuestion(g, gq, seededRng(2));
    expect(isTextQuestion(g2)).toBe(false);
    expect((g2 as { mode: string }).mode).not.toBe((gq as { mode: string }).mode);

    const w = TEXT_ITEMS.find((t) => t.kind === 'word') as ReviewItem;
    const [wq] = buildReviewQuiz([w], seededRng(1), { text: TEXT_ITEMS });
    const w2 = retryQuestion(w, wq, seededRng(2), { text: TEXT_ITEMS });
    expect(isTextQuestion(w2) && w2.mode).not.toBe(isTextQuestion(wq) && wq.mode);
  });

  it('項目與題目種類不一致時重新出題而不是壞掉', () => {
    const g = RECALL_ITEMS[0];
    const w = TEXT_ITEMS.find((t) => t.kind === 'word') as ReviewItem;
    const [wq] = buildReviewQuiz([w], seededRng(1), { text: TEXT_ITEMS });
    const q = retryQuestion(g, wq, seededRng(2));
    expect(q.itemId).toBe(g.id);
  });
});
