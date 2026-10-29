import { describe, expect, it } from 'vitest';
import {
  addDays,
  applyOutcome,
  dueCount,
  dueIds,
  formatDay,
  isDue,
  sanitizeReviewMap,
  type ReviewMap,
} from './scheduler';

const TODAY = '2026-10-29';

describe('addDays / formatDay', () => {
  it('跨月、跨年都正確', () => {
    expect(addDays('2026-10-29', 3)).toBe('2026-11-01');
    expect(addDays('2026-12-30', 4)).toBe('2027-01-03');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });
  it('formatDay 使用本地日期並補零', () => {
    expect(formatDay(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('applyOutcome（Leitner）', () => {
  it('第一次就答對 → 盒子 2，隔 2 天', () => {
    const r = applyOutcome(undefined, 'right', TODAY);
    expect(r).toMatchObject({ box: 2, due: '2026-10-31', seen: 1, right: 1, wrong: 0 });
  });

  it('第一次不會 → 盒子 1，今天就到期', () => {
    const r = applyOutcome(undefined, 'wrong', TODAY);
    expect(r).toMatchObject({ box: 1, due: TODAY, wrong: 1 });
    expect(isDue(r, TODAY)).toBe(true);
  });

  it('連續答對一路升到盒子 5 並封頂，間隔拉長', () => {
    let r = applyOutcome(undefined, 'right', TODAY);
    const dues: string[] = [r.due];
    for (let i = 0; i < 6; i++) {
      r = applyOutcome(r, 'right', TODAY);
      dues.push(r.due);
    }
    expect(r.box).toBe(5);
    expect(dues).toEqual([
      '2026-10-31',
      '2026-11-02',
      '2026-11-06',
      '2026-11-14',
      '2026-11-14',
      '2026-11-14',
      '2026-11-14',
    ]);
  });

  it('答錯 → 不論原本在哪一盒都退回盒子 1、今天到期', () => {
    const high = { box: 5 as const, due: '2026-12-01', seen: 9, right: 8, wrong: 0 };
    const r = applyOutcome(high, 'wrong', TODAY);
    expect(r).toMatchObject({ box: 1, due: TODAY, wrong: 1, seen: 10 });
  });

  it('keep 不升不降', () => {
    const rec = { box: 3 as const, due: TODAY, seen: 2, right: 2, wrong: 0 };
    const r = applyOutcome(rec, 'keep', TODAY);
    expect(r.box).toBe(3);
    expect(r.due).toBe(addDays(TODAY, 4));
  });

  it('placed：新字進盒子 3；已有更高盒子不降級', () => {
    expect(applyOutcome(undefined, 'placed', TODAY)).toMatchObject({ box: 3, due: '2026-11-02' });
    const rec = { box: 5 as const, due: TODAY, seen: 3, right: 3, wrong: 0 };
    expect(applyOutcome(rec, 'placed', TODAY).box).toBe(5);
  });

  it('不會修改傳入的紀錄', () => {
    const rec = { box: 2 as const, due: TODAY, seen: 1, right: 1, wrong: 0 };
    const snapshot = { ...rec };
    applyOutcome(rec, 'wrong', TODAY);
    expect(rec).toEqual(snapshot);
  });
});

describe('到期清單', () => {
  const map: ReviewMap = {
    a: { box: 3, due: '2026-10-29', seen: 3, right: 3, wrong: 0 },
    b: { box: 1, due: '2026-10-29', seen: 2, right: 0, wrong: 2 },
    c: { box: 2, due: '2026-10-25', seen: 2, right: 2, wrong: 0 },
    d: { box: 4, due: '2026-11-05', seen: 5, right: 5, wrong: 0 },
  };

  it('只列出到期（含今天與過期）', () => {
    expect(dueCount(map, TODAY)).toBe(3);
    expect(dueIds(map, TODAY)).not.toContain('d');
  });

  it('排序：過期最久優先，同日期時低盒子優先', () => {
    expect(dueIds(map, TODAY)).toEqual(['c', 'b', 'a']);
  });

  it('limit 限制數量', () => {
    expect(dueIds(map, TODAY, 2)).toEqual(['c', 'b']);
  });
});

describe('sanitizeReviewMap', () => {
  it('丟掉壞資料、補齊欄位、限制盒子範圍', () => {
    const out = sanitizeReviewMap({
      ok: { box: 9, due: '2026-10-29', seen: 1 },
      bad1: { box: 2, due: 'tomorrow' },
      bad2: 'x',
    });
    expect(Object.keys(out)).toEqual(['ok']);
    expect(out.ok).toEqual({ box: 5, due: '2026-10-29', seen: 1, right: 0, wrong: 0 });
    expect(sanitizeReviewMap(null)).toEqual({});
  });
});
