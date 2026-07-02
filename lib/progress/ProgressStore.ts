import type { UnitId } from '@/types/curriculum';
import type { UserProgress } from '@/types/progress';
import { CURRICULUM, getAllLessons } from '@/data/curriculum';
import { getPlayableLessons } from '@/types/curriculum';
import { DEV_UNLOCK_ALL_LESSONS } from '@/lib/devConfig';

export interface ProgressStore {
  getProgress(): UserProgress;
  saveProgress(progress: UserProgress): void;
  completeLesson(lessonId: string): UserProgress;
  setCurrentLesson(lessonId: string | null): UserProgress;
  recordWordAttempt(word: string, correct: boolean): UserProgress;
  isLessonCompleted(lessonId: string): boolean;
  isLessonUnlocked(lessonId: string): boolean;
  getUnitProgress(unitId: UnitId): { completed: number; total: number };
  getOverallProgress(): { completed: number; total: number };
  resetProgress(): void;
}

function cloneProgress(p: UserProgress): UserProgress {
  return {
    ...p,
    completedLessons: [...p.completedLessons],
    wordStats: { ...p.wordStats },
  };
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
    if (DEV_UNLOCK_ALL_LESSONS) return true;
    if (!lesson.implemented) return false;
    if (lesson.order === 1) return true;
    const prev = allLessons.find((l) => l.order === lesson.order - 1);
    if (!prev) return true;
    return isLessonCompleted(prev.id);
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

export function applyRecordWordAttempt(
  progress: UserProgress,
  word: string,
  correct: boolean,
): UserProgress {
  const next = cloneProgress(progress);
  const key = word.toLowerCase();
  const stat = next.wordStats[key] ?? { correct: 0, attempts: 0 };
  next.wordStats[key] = {
    correct: stat.correct + (correct ? 1 : 0),
    attempts: stat.attempts + 1,
  };
  next.lastPlayedAt = new Date().toISOString();
  return next;
}
