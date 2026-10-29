/**
 * 進度載入與版本遷移（純函式，不碰 localStorage，方便測試）。
 *
 * 讀取順序：v7 → v6 → v5 → v4。
 * - v6 → v7：課次 ID 沒有變（Phase 1 新增的課用新的固定 ID），只補上 review／placement 欄位。
 * - v5／v4 → v7：課次 ID 先依舊對照表轉成現行 ID。
 * 舊版 key 不會被刪除，萬一要回退，孩子的進度還在。
 */

import {
  LEGACY_PROGRESS_STORAGE_KEY,
  LEGACY_PROGRESS_V4_KEY,
  LEGACY_PROGRESS_V6_KEY,
  PROGRESS_STORAGE_KEY,
  createDefaultProgress,
  type PlacementInfo,
  type UserProgress,
} from '@/types/progress';
import { migrateLessonIdFromLegacy } from '@/data/curriculum';
import { sanitizeReviewMap } from '@/lib/review/scheduler';

export type ProgressSource = 'v7' | 'v6' | 'v5' | 'v4' | 'none';

export interface LoadedProgress {
  progress: UserProgress;
  source: ProgressSource;
  /** 來源不是 v7，需要寫回新格式 */
  needsPersist: boolean;
}

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

/** 把任意解析出的 JSON 整理成完整的 UserProgress（缺欄位補預設值） */
export function sanitizeProgress(raw: unknown): UserProgress {
  const base = createDefaultProgress();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const wordStats: UserProgress['wordStats'] = {};
  if (r.wordStats && typeof r.wordStats === 'object') {
    for (const [w, s] of Object.entries(r.wordStats as Record<string, unknown>)) {
      const st = s as { correct?: unknown; attempts?: unknown };
      if (!st || typeof st !== 'object') continue;
      wordStats[w] = {
        correct: Math.max(0, Number(st.correct) || 0),
        attempts: Math.max(0, Number(st.attempts) || 0),
      };
    }
  }
  return {
    completedLessons: [...new Set(strArray(r.completedLessons))],
    currentLessonId: typeof r.currentLessonId === 'string' ? r.currentLessonId : null,
    wordStats,
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

function tryParse(text: string | null): unknown | undefined {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function loadProgress(read: (key: string) => string | null): LoadedProgress {
  const v7 = tryParse(read(PROGRESS_STORAGE_KEY));
  if (v7 !== undefined) {
    return { progress: sanitizeProgress(v7), source: 'v7', needsPersist: false };
  }
  const v6 = tryParse(read(LEGACY_PROGRESS_V6_KEY));
  if (v6 !== undefined) {
    return { progress: sanitizeProgress(v6), source: 'v6', needsPersist: true };
  }
  const v5 = tryParse(read(LEGACY_PROGRESS_STORAGE_KEY));
  if (v5 !== undefined) {
    return { progress: migrateIds(sanitizeProgress(v5), 'v5'), source: 'v5', needsPersist: true };
  }
  const v4 = tryParse(read(LEGACY_PROGRESS_V4_KEY));
  if (v4 !== undefined) {
    return { progress: migrateIds(sanitizeProgress(v4), 'v4'), source: 'v4', needsPersist: true };
  }
  return { progress: createDefaultProgress(), source: 'none', needsPersist: false };
}
