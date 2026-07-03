export interface OnsetRimeSplit {
  onset: string;
  rime: string;
}

/** 簡單 CVC 三字拆成首音 + 韻尾 */
export function splitCvcOnsetRime(word: string): OnsetRimeSplit | null {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length !== 3) return null;
  return { onset: w[0], rime: w.slice(1) };
}
