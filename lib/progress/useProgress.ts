'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UnitId } from '@/types/curriculum';
import { DEFAULT_PROGRESS, type UserProgress } from '@/types/progress';
import { createProgressHelpers } from './ProgressStore';
import { getProgressStore } from './LocalProgressStore';

function cloneDefaultProgress(): UserProgress {
  return {
    ...DEFAULT_PROGRESS,
    completedLessons: [],
    wordStats: {},
  };
}

export function useProgress() {
  const store = getProgressStore();
  const [progress, setProgress] = useState<UserProgress>(cloneDefaultProgress);
  const [hydrated, setHydrated] = useState(false);

  const helpers = useMemo(
    () => createProgressHelpers(() => progress),
    [progress],
  );

  useEffect(() => {
    setProgress(store.getProgress());
    setHydrated(true);
  }, [store]);

  const completeLesson = useCallback(
    (lessonId: string) => {
      const next = store.completeLesson(lessonId);
      setProgress(next);
      return next;
    },
    [store],
  );

  const setCurrentLesson = useCallback(
    (lessonId: string | null) => {
      const next = store.setCurrentLesson(lessonId);
      setProgress(next);
      return next;
    },
    [store],
  );

  const recordWordAttempt = useCallback(
    (word: string, correct: boolean) => {
      const next = store.recordWordAttempt(word, correct);
      setProgress(next);
      return next;
    },
    [store],
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => helpers.isLessonCompleted(lessonId),
    [helpers],
  );

  const isLessonUnlocked = useCallback(
    (lessonId: string) => helpers.isLessonUnlocked(lessonId),
    [helpers],
  );

  const getUnitProgress = useCallback(
    (unitId: UnitId) => helpers.getUnitProgress(unitId),
    [helpers],
  );

  const getOverallProgress = useCallback(
    () => helpers.getOverallProgress(),
    [helpers],
  );

  return {
    progress,
    hydrated,
    completeLesson,
    setCurrentLesson,
    recordWordAttempt,
    isLessonCompleted,
    isLessonUnlocked,
    getUnitProgress,
    getOverallProgress,
  };
}
