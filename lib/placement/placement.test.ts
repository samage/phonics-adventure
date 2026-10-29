import { describe, expect, it } from 'vitest';
import {
  applyPlacementToReview,
  buildPlacementTest,
  evaluatePlacement,
  placementTotal,
  PLACEMENT_PER_TIER,
} from './placement';
import { seededRng } from '@/lib/recall/quiz';
import { PLACED_BOX, isDue } from '@/lib/review/scheduler';
import { RECALL_ITEM_MAP } from '@/data/recall/items';

const TODAY = '2026-10-29';

describe('buildPlacementTest', () => {
  it('每層抽固定題數，總題數正確，且題目不重複', () => {
    const qs = buildPlacementTest(seededRng(1));
    expect(qs).toHaveLength(placementTotal());
    expect(new Set(qs.map((q) => q.itemId)).size).toBe(qs.length);
    const perTier: Record<string, number> = {};
    for (const q of qs) {
      const t = RECALL_ITEM_MAP[q.itemId].tier;
      perTier[t] = (perTier[t] ?? 0) + 1;
    }
    for (const [tier, n] of Object.entries(PLACEMENT_PER_TIER)) expect(perTier[tier]).toBe(n);
  });

  it('由簡到難排列', () => {
    const qs = buildPlacementTest(seededRng(2));
    expect(RECALL_ITEM_MAP[qs[0].itemId].tier).toBe('core');
    expect(RECALL_ITEM_MAP[qs[qs.length - 1].itemId].tier).toBe('blends');
  });
});

describe('evaluatePlacement', () => {
  const qs = buildPlacementTest(seededRng(3));

  it('全對 → 全部已會，沒有建議起點', () => {
    const r = evaluatePlacement(qs, qs.map((q) => ({ itemId: q.itemId, chosenId: q.answerId })));
    expect(r.knownIds).toHaveLength(qs.length);
    expect(r.missedIds).toHaveLength(0);
    expect(r.startTier).toBeNull();
  });

  it('全錯／不作答 → 全部進複習，建議從 core 開始', () => {
    const r = evaluatePlacement(qs, []);
    expect(r.knownIds).toHaveLength(0);
    expect(r.missedIds).toHaveLength(qs.length);
    expect(r.startTier).toBe('core');
  });

  it('基本字母會、其餘不會 → 建議從 letters 以外的第一個弱層開始', () => {
    const answers = qs
      .filter((q) => RECALL_ITEM_MAP[q.itemId].tier === 'core')
      .map((q) => ({ itemId: q.itemId, chosenId: q.answerId }));
    const r = evaluatePlacement(qs, answers);
    expect(r.knownIds).toHaveLength(PLACEMENT_PER_TIER.core);
    expect(r.startTier).toBe('letters');
  });
});

describe('applyPlacementToReview', () => {
  it('答對 → 盒子 3 且不是今天到期；答錯 → 盒子 1 今天到期', () => {
    const next = applyPlacementToReview({}, { knownIds: ['s', 'a'], missedIds: ['sh'] }, TODAY);
    expect(next.s.box).toBe(PLACED_BOX);
    expect(isDue(next.s, TODAY)).toBe(false);
    expect(next.sh.box).toBe(1);
    expect(isDue(next.sh, TODAY)).toBe(true);
  });

  it('不會把已經很熟的項目降級（只會因答錯回到盒子 1）', () => {
    const rich = { s: { box: 5 as const, due: '2026-12-01', seen: 9, right: 9, wrong: 0 } };
    const next = applyPlacementToReview(rich, { knownIds: ['s'], missedIds: [] }, TODAY);
    expect(next.s.box).toBe(5);
  });

  it('不改動傳入的 map', () => {
    const input = {};
    applyPlacementToReview(input, { knownIds: ['s'], missedIds: [] }, TODAY);
    expect(input).toEqual({});
  });
});
