import type { Lesson, UnitId } from '@/types/curriculum';
import type { UserProgress } from '@/types/progress';
import {
  applyOutcome,
  dueIds,
  todayString,
  type ReviewOutcome,
} from '@/lib/review/scheduler';
import { applyPlacementToReview, type PlacementResult } from '@/lib/placement/placement';
import { CURRICULUM, getAllLessons } from '@/data/curriculum';
import { getPlayableLessons } from '@/types/curriculum';
import { DEV_UNLOCK_ALL_LESSONS } from '@/lib/devConfig';
import { isKnownReviewId } from '@/lib/recall/reviewQuiz';

function cloneProgress(p: UserProgress): UserProgress {
  return {
    ...p,
    completedLessons: [...p.completedLessons],
    review: { ...p.review },
  };
}

/**
 * 課程是否可進入（純函式，方便測試）。
 * 規則：
 * 1. 第一課永遠可進。
 * 2. 前一課完成 → 可進（原本的線性解鎖）。
 * 3. 後面任何一課已完成 → 可進（舊進度、跳著學的孩子不會被新增的課卡住）。
 * 4. 做過分班測驗 → 全部可進（會的孩子不必從 L01 開始）。
 */
export function isLessonUnlockedFor(
  progress: UserProgress,
  lessons: readonly Lesson[],
  lessonId: string,
  devUnlockAll = false,
): boolean {
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return false;
  if (devUnlockAll) return true;
  if (!lesson.implemented) return false;
  if (lesson.order === 1) return true;
  if (progress.placement) return true;
  const done = new Set(progress.completedLessons);
  const prev = lessons.find((l) => l.order === lesson.order - 1);
  if (!prev || done.has(prev.id)) return true;
  return lessons.some((l) => l.order > lesson.order && done.has(l.id));
}

export function createProgressHelpers(getProgress: () => UserProgress) {
  const allLessons = getAllLessons();
  const playable = getPlayableLessons(CURRICULUM);

  function findLesson(lessonId: string) {
    return allLessons.find((l) => l.id === lessonId) ?? null;
  }

  function isLessonCompleted(lessonId: string): boolean {
    return getProgress().completedLessons.includes(lessonId);
  }

  function isLessonUnlocked(lessonId: string): boolean {
    const lesson = findLesson(lessonId);
    if (!lesson) return false;
    return isLessonUnlockedFor(getProgress(), allLessons, lessonId, DEV_UNLOCK_ALL_LESSONS);
  }

  function getUnitProgress(unitId: UnitId): { completed: number; total: number } {
    const unitLessons = playable.filter((l) => l.unitId === unitId);
    const completed = unitLessons.filter((l) => isLessonCompleted(l.id)).length;
    return { completed, total: unitLessons.length };
  }

  function getOverallProgress(): { completed: number; total: number } {
    const completed = playable.filter((l) => isLessonCompleted(l.id)).length;
    return { completed, total: playable.length };
  }

  return {
    isLessonCompleted,
    isLessonUnlocked,
    getUnitProgress,
    getOverallProgress,
  };
}

export function applyCompleteLesson(
  progress: UserProgress,
  lessonId: string,
): UserProgress {
  const next = cloneProgress(progress);
  if (!next.completedLessons.includes(lessonId)) {
    next.completedLessons.push(lessonId);
  }
  next.currentLessonId = lessonId;
  next.lastPlayedAt = new Date().toISOString();
  return next;
}

/**
 * 孩子對某個複習項目（字母、特殊字、短句）的一次作答
 * （自評、小測驗、複習、拼字錯誤）。所有項目共用同一份複習表。
 */
export function applyReviewOutcome(
  progress: UserProgress,
  itemId: string,
  outcome: ReviewOutcome,
  today: string = todayString(),
): UserProgress {
  const next = cloneProgress(progress);
  next.review[itemId] = applyOutcome(next.review[itemId], outcome, today);
  next.lastPlayedAt = new Date().toISOString();
  return next;
}

export function applyPlacement(
  progress: UserProgress,
  result: PlacementResult,
  today: string = todayString(),
  nowIso: string = new Date().toISOString(),
): UserProgress {
  const next = cloneProgress(progress);
  next.review = applyPlacementToReview(next.review, result, today);
  next.placement = {
    takenAt: nowIso,
    knownIds: [...result.knownIds],
    missedIds: [...result.missedIds],
    startTier: result.startTier,
  };
  next.lastPlayedAt = nowIso;
  return next;
}

/** 今天到期的項目 id（只算現行課程裡存在的項目，舊資料裡找不到的 id 不會讓數字對不上） */
export function getDueIds(
  progress: UserProgress,
  today: string = todayString(),
  limit?: number,
): string[] {
  const ids = dueIds(progress.review, today).filter(isKnownReviewId);
  return limit === undefined ? ids : ids.slice(0, limit);
}

export function getDueCount(progress: UserProgress, today: string = todayString()): number {
  return getDueIds(progress, today).length;
}
