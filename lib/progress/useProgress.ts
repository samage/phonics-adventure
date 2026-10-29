'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { UnitId } from '@/types/curriculum';
import type { PlacementResult } from '@/lib/placement/placement';
import { getDueCount, getDueIds, createProgressHelpers } from './logic';
import { getProgressStore } from './LocalProgressStore';
import type { ReviewOutcome } from '@/lib/review/scheduler';
import { todayString } from '@/lib/review/scheduler';

const noopSubscribe = () => () => {};

export function useProgress() {
  const store = getProgressStore();

  // 進度存在 localStorage：伺服器端渲染時給空進度，瀏覽器端用真實進度。
  const progress = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  // 伺服器與 hydration 期間為 false，hydration 完成後為 true
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const helpers = useMemo(() => createProgressHelpers(() => progress), [progress]);

  const completeLesson = useCallback(
    (lessonId: string) => store.completeLesson(lessonId),
    [store],
  );

  const setCurrentLesson = useCallback(
    (lessonId: string | null) => store.setCurrentLesson(lessonId),
    [store],
  );

  const recordOutcome = useCallback(
    (itemId: string, outcome: ReviewOutcome) => store.recordOutcome(itemId, outcome),
    [store],
  );

  const applyPlacementResult = useCallback(
    (result: PlacementResult) => store.applyPlacementResult(result),
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

  const getOverallProgress = useCallback(() => helpers.getOverallProgress(), [helpers]);

  /** 今天要複習的項目數（只在瀏覽器端有意義；hydrated 之前為 0） */
  const dueToday = hydrated ? getDueCount(progress, todayString()) : 0;
  const dueTodayIds = useCallback(
    (limit?: number) => getDueIds(store.getSnapshot(), todayString(), limit),
    [store],
  );

  return {
    progress,
    hydrated,
    completeLesson,
    setCurrentLesson,
    recordOutcome,
    applyPlacementResult,
    isLessonCompleted,
    isLessonUnlocked,
    getUnitProgress,
    getOverallProgress,
    dueToday,
    dueTodayIds,
  };
}
