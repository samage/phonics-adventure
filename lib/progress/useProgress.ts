'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UnitId } from '@/types/curriculum';
import type { UserProgress } from '@/types/progress';
import { getProgressStore } from './LocalProgressStore';

export function useProgress() {
  const store = getProgressStore();
  const [progress, setProgress] = useState<UserProgress>(() =>
    store.getProgress(),
  );
  const [hydrated, setHydrated] = useState(false);

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
    (lessonId: string) => store.isLessonCompleted(lessonId),
    [store, progress],
  );

  const isLessonUnlocked = useCallback(
    (lessonId: string) => store.isLessonUnlocked(lessonId),
    [store, progress],
  );

  const getUnitProgress = useCallback(
    (unitId: UnitId) => store.getUnitProgress(unitId),
    [store, progress],
  );

  const getOverallProgress = useCallback(
    () => store.getOverallProgress(),
    [store, progress],
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
