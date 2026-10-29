/**
 * 快速分班測驗：看字母／字母組合，選出它的聲音。
 * 答對的項目直接標成「已會」（進複習盒子 3），答錯的進今天複習。
 * 純函式，亂數可注入，方便測試。
 */

import { RECALL_ITEMS, RECALL_TIERS, type RecallTier } from '@/data/recall/items';
import { buildQuiz, shuffled, type QuizQuestion, type Rng } from '@/lib/recall/quiz';
import {
  applyOutcome,
  type ReviewMap,
} from '@/lib/review/scheduler';

/** 每個難度層抽幾題（共 20 題） */
export const PLACEMENT_PER_TIER: Record<RecallTier, number> = {
  core: 4,
  letters: 4,
  digraphs: 3,
  long_vowels: 3,
  teams: 3,
  blends: 3,
};

export function placementTotal(): number {
  return RECALL_TIERS.reduce((n, t) => n + PLACEMENT_PER_TIER[t], 0);
}

/** 由簡到難，每層隨機抽題；題型輪流 */
export function buildPlacementTest(rng: Rng = Math.random): QuizQuestion[] {
  const targets = RECALL_TIERS.flatMap((tier) =>
    shuffled(
      RECALL_ITEMS.filter((it) => it.tier === tier),
      rng,
    ).slice(0, PLACEMENT_PER_TIER[tier]),
  );
  return buildQuiz(targets, rng);
}

export interface PlacementAnswer {
  itemId: string;
  chosenId: string | null;
}

export interface PlacementResult {
  /** 答對的項目 */
  knownIds: string[];
  /** 答錯或沒作答的項目 */
  missedIds: string[];
  tierScores: Record<RecallTier, { right: number; total: number }>;
  /** 建議從哪一層開始練（第一個答對率不到 75% 的層）；全都會則為 null */
  startTier: RecallTier | null;
}

export function evaluatePlacement(
  questions: readonly QuizQuestion[],
  answers: readonly PlacementAnswer[],
): PlacementResult {
  const chosen = new Map(answers.map((a) => [a.itemId, a.chosenId]));
  const knownIds: string[] = [];
  const missedIds: string[] = [];
  const tierScores = Object.fromEntries(
    RECALL_TIERS.map((t) => [t, { right: 0, total: 0 }]),
  ) as PlacementResult['tierScores'];

  const tierOf = new Map(RECALL_ITEMS.map((it) => [it.id, it.tier]));
  for (const q of questions) {
    const tier = tierOf.get(q.itemId);
    if (!tier) continue;
    tierScores[tier].total += 1;
    if (chosen.get(q.itemId) === q.answerId) {
      knownIds.push(q.itemId);
      tierScores[tier].right += 1;
    } else {
      missedIds.push(q.itemId);
    }
  }

  const startTier =
    RECALL_TIERS.find((t) => {
      const s = tierScores[t];
      return s.total > 0 && s.right / s.total < 0.75;
    }) ?? null;

  return { knownIds, missedIds, tierScores, startTier };
}

/** 把測驗結果寫進複習盒子（不會把已有的較高盒子降級） */
export function applyPlacementToReview(
  review: ReviewMap,
  result: Pick<PlacementResult, 'knownIds' | 'missedIds'>,
  today: string,
): ReviewMap {
  const next: ReviewMap = { ...review };
  for (const id of result.knownIds) next[id] = applyOutcome(next[id], 'placed', today);
  for (const id of result.missedIds) next[id] = applyOutcome(next[id], 'wrong', today);
  return next;
}
