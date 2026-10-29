/**
 * 「多練一輪」每一輪要練哪些項目（純函式，亂數可注入）。
 *
 * 優先順序：① 今天到期要複習的 → ② 沒看過的新項目（每輪最多 NEW_PER_SESSION 個，
 * 避免一次塞太多）→ ③ 還沒學穩（盒子 < 4）的項目補滿。
 */

import type { RecallItem } from '@/data/recall/items';
import { isDue, type ReviewMap } from '@/lib/review/scheduler';
import { shuffled, type Rng } from './quiz';

export const SESSION_SIZE = 8;
export const NEW_PER_SESSION = 5;

/**
 * @param candidates 可以出現在這一輪的項目（通常是「已學過」的項目，見 learnedItems）
 */
export function pickRecallSession(
  review: ReviewMap,
  candidates: readonly RecallItem[],
  today: string,
  rng: Rng = Math.random,
  size: number = SESSION_SIZE,
): RecallItem[] {
  const pool = candidates;
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
