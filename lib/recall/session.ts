/**
 * 「看字母說音」每一輪要練哪些項目（純函式，亂數可注入）。
 *
 * 優先順序：① 今天到期要複習的 → ② 沒看過的新項目（每輪最多 NEW_PER_SESSION 個，
 * 避免一次塞太多）→ ③ 還沒學穩（盒子 < 4）的項目補滿。
 */

import { RECALL_ITEMS, type RecallItem, type RecallTier } from '@/data/recall/items';
import { isDue, type ReviewMap } from '@/lib/review/scheduler';
import { shuffled, type Rng } from './quiz';

export const SESSION_SIZE = 8;
export const NEW_PER_SESSION = 5;

export function pickRecallSession(
  review: ReviewMap,
  tier: RecallTier | null,
  today: string,
  rng: Rng = Math.random,
  size: number = SESSION_SIZE,
): RecallItem[] {
  const pool = RECALL_ITEMS.filter((it) => tier === null || it.tier === tier);
  const due = pool.filter((it) => review[it.id] && isDue(review[it.id], today));
  const fresh = pool.filter((it) => !review[it.id]).slice(0, NEW_PER_SESSION);
  const weak = pool.filter(
    (it) => review[it.id] && !isDue(review[it.id], today) && (review[it.id]?.box ?? 5) < 4,
  );

  const picked: RecallItem[] = [];
  const seen = new Set<string>();
  const take = (list: RecallItem[]) => {
    for (const it of list) {
      if (picked.length >= size) return;
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      picked.push(it);
    }
  };
  take(shuffled(due, rng));
  take(fresh);
  take(shuffled(weak, rng));
  return shuffled(picked, rng);
}

/** 某個難度層的進度：已掌握（盒子 ≥ 4）／看過／總數 */
export function tierSummary(review: ReviewMap, tier: RecallTier) {
  const items = RECALL_ITEMS.filter((it) => it.tier === tier);
  const seen = items.filter((it) => review[it.id]).length;
  const strong = items.filter((it) => (review[it.id]?.box ?? 0) >= 4).length;
  return { total: items.length, seen, strong };
}
