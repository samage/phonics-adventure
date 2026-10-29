import { describe, expect, it } from 'vitest';
import { createDefaultProgress } from '@/types/progress';
import { applyReviewOutcome, getDueCount, getDueIds } from './logic';

const TODAY = '2026-10-29';
const rec = (due: string) => ({ box: 1 as const, due, seen: 1, right: 0, wrong: 1 });

describe('複習表：字母、特殊字、短句共用', () => {
  it('特殊字、短句答錯／答對都寫進同一份複習表', () => {
    let p = createDefaultProgress();
    p = applyReviewOutcome(p, 'w:the', 'wrong', TODAY);
    expect(p.review['w:the']).toMatchObject({ box: 1, due: TODAY, wrong: 1 });
    p = applyReviewOutcome(p, 's:L20:0', 'right', TODAY);
    expect(p.review['s:L20:0']).toMatchObject({ box: 2, right: 1 });
    p = applyReviewOutcome(p, 'w:the', 'right', TODAY);
    expect(p.review['w:the']?.box).toBe(2);
  });

  it('今天到期的 id 與數量包含特殊字、短句', () => {
    const p = {
      ...createDefaultProgress(),
      review: { s: rec(TODAY), 'w:the': rec(TODAY), 's:L20:1': rec('2026-10-01'), 'w:was': rec('2026-11-30') },
    };
    expect(getDueIds(p, TODAY, 10).sort()).toEqual(['s', 's:L20:1', 'w:the']);
    expect(getDueCount(p, TODAY)).toBe(3);
  });

  it('不在現行課程裡的舊 id（例如已移除的項目）不算進到期數，首頁徽章與複習佇列一致', () => {
    const p = {
      ...createDefaultProgress(),
      review: { s: rec(TODAY), 'w:gone': rec(TODAY), zzz: rec(TODAY) },
    };
    expect(getDueIds(p, TODAY, 10)).toEqual(['s']);
    expect(getDueCount(p, TODAY)).toBe(1);
  });
});
