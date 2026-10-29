/**
 * 進度載入與版本遷移（純函式，不碰 localStorage，方便測試）。
 *
 * 讀取順序：v8 → v7 → v6 → v5 → v4。
 * - v7 → v8：拿掉單字統計（wordStats，已併入字素複習表）；已完成的課所教的字母，
 *   若複習表裡還沒有紀錄，就補上「盒子 2」的紀錄，並把到期日分散在今天起 3 天內，
 *   這樣舊使用者學過的字母會自然進入每天的複習，但不會一次全部擠在今天。
 * - v6 → v8：課次 ID 沒有變，只補上 review／placement 欄位，再同上補紀錄。
 * - v5／v4 → v8：課次 ID 先依舊對照表轉成現行 ID，再同上。
 * 舊版 key 不會被刪除，萬一要回退，孩子的進度還在。
 */

import {
  LEGACY_PROGRESS_STORAGE_KEY,
  LEGACY_PROGRESS_V4_KEY,
  LEGACY_PROGRESS_V6_KEY,
  LEGACY_PROGRESS_V7_KEY,
  PROGRESS_STORAGE_KEY,
  createDefaultProgress,
  type PlacementInfo,
  type UserProgress,
} from '@/types/progress';
import { PHONICS_LESSONS, migrateLessonIdFromLegacy } from '@/data/curriculum';
import { recallItemsForLesson } from '@/lib/learn/lessonItems';
import { addDays, sanitizeReviewMap, todayString } from '@/lib/review/scheduler';

type ProgressSource = 'v8' | 'v7' | 'v6' | 'v5' | 'v4' | 'none';

interface LoadedProgress {
  progress: UserProgress;
  source: ProgressSource;
  /** 來源不是 v8，需要寫回新格式 */
  needsPersist: boolean;
}

/** 補上的複習紀錄，到期日分散在今天起幾天內 */
const SEED_SPREAD_DAYS = 4;
const SEED_BOX = 2;

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function sanitizePlacement(raw: unknown): PlacementInfo | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Partial<PlacementInfo>;
  if (typeof p.takenAt !== 'string') return null;
  return {
    takenAt: p.takenAt,
    knownIds: strArray(p.knownIds),
    missedIds: strArray(p.missedIds),
    startTier: typeof p.startTier === 'string' ? p.startTier : null,
  };
}

/** 把任意解析出的 JSON 整理成完整的 UserProgress（缺欄位補預設值；舊的 wordStats 會被丟掉） */
export function sanitizeProgress(raw: unknown): UserProgress {
  const base = createDefaultProgress();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  return {
    completedLessons: [...new Set(strArray(r.completedLessons))],
    currentLessonId: typeof r.currentLessonId === 'string' ? r.currentLessonId : null,
    lastPlayedAt: typeof r.lastPlayedAt === 'string' ? r.lastPlayedAt : '',
    review: sanitizeReviewMap(r.review),
    placement: sanitizePlacement(r.placement),
  };
}

function migrateIds(p: UserProgress, source: 'v4' | 'v5'): UserProgress {
  return {
    ...p,
    completedLessons: [
      ...new Set(p.completedLessons.map((id) => migrateLessonIdFromLegacy(id, source))),
    ],
    currentLessonId: p.currentLessonId
      ? migrateLessonIdFromLegacy(p.currentLessonId, source)
      : null,
  };
}

/**
 * 已完成的課教過的字母，複習表還沒有紀錄的就補上（盒子 2，今天起 SEED_SPREAD_DAYS 天內到期）。
 * 已有紀錄的（含分班測驗結果）完全不動。
 */
function seedReviewFromCompletedLessons(
  progress: UserProgress,
  today: string,
): UserProgress {
  const done = new Set(progress.completedLessons);
  const review = { ...progress.review };
  let n = 0;
  for (const lesson of PHONICS_LESSONS) {
    if (!done.has(lesson.id)) continue;
    for (const item of recallItemsForLesson(lesson)) {
      if (review[item.id]) continue;
      review[item.id] = {
        box: SEED_BOX,
        due: addDays(today, n % SEED_SPREAD_DAYS),
        seen: 0,
        right: 0,
        wrong: 0,
      };
      n += 1;
    }
  }
  return { ...progress, review };
}

function tryParse(text: string | null): unknown | undefined {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function loadProgress(
  read: (key: string) => string | null,
  today: string = todayString(),
): LoadedProgress {
  const v8 = tryParse(read(PROGRESS_STORAGE_KEY));
  if (v8 !== undefined) {
    return { progress: sanitizeProgress(v8), source: 'v8', needsPersist: false };
  }
  const legacy = (
    [
      ['v7', LEGACY_PROGRESS_V7_KEY],
      ['v6', LEGACY_PROGRESS_V6_KEY],
      ['v5', LEGACY_PROGRESS_STORAGE_KEY],
      ['v4', LEGACY_PROGRESS_V4_KEY],
    ] as const
  ).map(([source, key]) => ({ source, raw: tryParse(read(key)) }));

  for (const { source, raw } of legacy) {
    if (raw === undefined) continue;
    let progress = sanitizeProgress(raw);
    if (source === 'v5' || source === 'v4') progress = migrateIds(progress, source);
    return {
      progress: seedReviewFromCompletedLessons(progress, today),
      source,
      needsPersist: true,
    };
  }
  return { progress: createDefaultProgress(), source: 'none', needsPersist: false };
}
