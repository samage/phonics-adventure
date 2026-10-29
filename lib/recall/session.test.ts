import { describe, expect, it } from 'vitest';
import { RECALL_ITEMS } from '@/data/recall/items';
import { seededRng } from './quiz';
import { NEW_PER_SESSION, SESSION_SIZE, pickRecallSession, tierSummary } from './session';
import type { ReviewMap } from '@/lib/review/scheduler';

const TODAY = '2026-10-29';
const rec = (box: 1 | 2 | 3 | 4 | 5, due: string) => ({ box, due, seen: 1, right: 1, wrong: 0 });

describe('pickRecallSession', () => {
  it('全新使用者：最多 5 個新項目', () => {
    const picked = pickRecallSession({}, null, TODAY, seededRng(1));
    expect(picked.length).toBe(NEW_PER_SESSION);
    expect(new Set(picked.map((p) => p.id)).size).toBe(picked.length);
  });

  it('到期的項目優先出現', () => {
    const review: ReviewMap = {
      [RECALL_ITEMS[10].id]: rec(1, TODAY),
      [RECALL_ITEMS[11].id]: rec(2, '2026-10-20'),
    };
    const ids = pickRecallSession(review, null, TODAY, seededRng(2)).map((p) => p.id);
    expect(ids).toContain(RECALL_ITEMS[10].id);
    expect(ids).toContain(RECALL_ITEMS[11].id);
  });

  it('尚未到期且已學穩的項目不會被抽到', () => {
    const review: ReviewMap = Object.fromEntries(
      RECALL_ITEMS.map((it) => [it.id, rec(5, '2026-12-01')]),
    );
    expect(pickRecallSession(review, null, TODAY, seededRng(3))).toEqual([]);
  });

  it('指定難度層時只出該層的項目，且不超過一輪的題數', () => {
    const picked = pickRecallSession({}, 'digraphs', TODAY, seededRng(4));
    expect(picked.every((p) => p.tier === 'digraphs')).toBe(true);
    expect(picked.length).toBeLessThanOrEqual(SESSION_SIZE);
  });
});

describe('tierSummary', () => {
  it('統計總數、看過、學穩', () => {
    const first = RECALL_ITEMS.filter((i) => i.tier === 'core');
    const review: ReviewMap = {
      [first[0].id]: rec(4, TODAY),
      [first[1].id]: rec(1, TODAY),
    };
    const s = tierSummary(review, 'core');
    expect(s).toEqual({ total: first.length, seen: 2, strong: 1 });
  });
});
