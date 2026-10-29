import type { WordStat } from '@/types/progress';

/** 一個字至少作答幾次、正確率低於多少，才算「還不穩」 */
export const WEAK_MIN_ATTEMPTS = 1;
export const WEAK_ACCURACY = 0.7;

export function isWeakWord(stat: WordStat | undefined): boolean {
  if (!stat || stat.attempts < WEAK_MIN_ATTEMPTS) return false;
  return stat.correct / stat.attempts < WEAK_ACCURACY;
}

/** 以前拼不好的字排在前面（其餘維持原順序），讓孩子先把弱點練掉 */
export function prioritizeWeakWords(
  words: readonly string[],
  stats: Record<string, WordStat>,
): string[] {
  const weak = words.filter((w) => isWeakWord(stats[w]));
  const rest = words.filter((w) => !isWeakWord(stats[w]));
  return [...weak, ...rest];
}
