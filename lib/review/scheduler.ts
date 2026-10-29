/**
 * 字素 Leitner 間隔複習（純函式，沒有任何 I/O，方便測試）。
 *
 * - 盒子 1–5；答對升一盒，答錯退回盒子 1 並「今天就複習」。
 * - 各盒子的複習間隔（天）：1 → 1 天、2 → 2 天、3 → 4 天、4 → 8 天、5 → 16 天。
 * - 第一次看到就答對 → 直接進盒子 2；第一次不會 → 盒子 1，今天複習。
 * - 分班測驗確認「已會」→ 盒子 3（隔幾天後再確認一次，不會永遠消失）。
 *
 * 概念沿用姊妹專案 word-buddy 的 mastery.ts（Leitner 盒子 + 本地日期）。
 */

export const MAX_BOX = 5;
/** 各盒子的複習間隔（天）；索引 = 盒子編號（索引 0 不使用，留作對齊） */
export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 8, 16] as const;
export const PLACED_BOX = 3;

export type Box = 1 | 2 | 3 | 4 | 5;

export interface ReviewRecord {
  box: Box;
  /** 下次複習日（本地日期 YYYY-MM-DD；小於等於今天即「該複習了」） */
  due: string;
  seen: number;
  right: number;
  wrong: number;
}

export type ReviewMap = Record<string, ReviewRecord>;

/**
 * right = 答對／自評「會」；wrong = 答錯／自評「還不會」；
 * keep = 同一輪裡錯後重考（不升也不退）；placed = 分班測驗確認已會。
 */
export type ReviewOutcome = 'right' | 'wrong' | 'keep' | 'placed';

export function formatDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayString(now: Date = new Date()): string {
  return formatDay(now);
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return formatDay(new Date(y, m - 1, d + n));
}

function clampBox(n: number): Box {
  return Math.min(MAX_BOX, Math.max(1, Math.round(n))) as Box;
}

/** 套用一次結果，回傳新的紀錄（不修改傳入物件） */
export function applyOutcome(
  rec: ReviewRecord | undefined,
  outcome: ReviewOutcome,
  today: string,
): ReviewRecord {
  const prev: ReviewRecord = rec ?? { box: 1, due: today, seen: 0, right: 0, wrong: 0 };
  const seen = prev.seen + 1;
  switch (outcome) {
    case 'right': {
      const box = rec ? clampBox(prev.box + 1) : 2;
      return {
        ...prev,
        box,
        seen,
        right: prev.right + 1,
        due: addDays(today, BOX_INTERVAL_DAYS[box]),
      };
    }
    case 'wrong':
      return { ...prev, box: 1, seen, wrong: prev.wrong + 1, due: today };
    case 'placed': {
      // 已有更高盒子的紀錄就不降級
      const box = rec ? clampBox(Math.max(prev.box, PLACED_BOX)) : PLACED_BOX;
      return {
        ...prev,
        box,
        seen,
        right: prev.right + 1,
        due: addDays(today, BOX_INTERVAL_DAYS[box]),
      };
    }
    case 'keep':
    default:
      return { ...prev, seen, due: addDays(today, BOX_INTERVAL_DAYS[prev.box]) };
  }
}

export function isDue(rec: ReviewRecord | undefined, today: string): boolean {
  return !!rec && rec.due <= today;
}

/** 到期項目：先複習最久沒碰、盒子最低的 */
export function dueIds(map: ReviewMap, today: string, limit?: number): string[] {
  const ids = Object.entries(map)
    .filter(([, r]) => isDue(r, today))
    .sort(([ka, a], [kb, b]) =>
      a.due === b.due ? a.box - b.box || ka.localeCompare(kb) : a.due.localeCompare(b.due),
    )
    .map(([id]) => id);
  return limit === undefined ? ids : ids.slice(0, limit);
}

export function dueCount(map: ReviewMap, today: string): number {
  return Object.values(map).filter((r) => isDue(r, today)).length;
}

/** 已熟練：盒子 4 以上 */
export function isMastered(rec: ReviewRecord | undefined): boolean {
  return !!rec && rec.box >= 4;
}

export function sanitizeReviewMap(raw: unknown): ReviewMap {
  const out: ReviewMap = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue;
    const r = v as Partial<ReviewRecord>;
    if (typeof r.due !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.due)) continue;
    out[id] = {
      box: clampBox(typeof r.box === 'number' ? r.box : 1),
      due: r.due,
      seen: Math.max(0, Number(r.seen) || 0),
      right: Math.max(0, Number(r.right) || 0),
      wrong: Math.max(0, Number(r.wrong) || 0),
    };
  }
  return out;
}
