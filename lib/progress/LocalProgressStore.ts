import {
  PROGRESS_STORAGE_KEY,
  createDefaultProgress,
  type UserProgress,
} from '@/types/progress';
import type { UnitId } from '@/types/curriculum';
import type { ReviewOutcome } from '@/lib/review/scheduler';
import type { PlacementResult } from '@/lib/placement/placement';
import {
  applyCompleteLesson,
  applyGraphemeOutcome,
  applyPlacement,
  applyRecordWordAttempt,
  createProgressHelpers,
  type ProgressStore,
} from './ProgressStore';
import { loadProgress } from './migrate';

function loadFromStorage(): UserProgress {
  if (typeof window === 'undefined') return createDefaultProgress();
  try {
    const loaded = loadProgress((key) => localStorage.getItem(key));
    if (loaded.needsPersist) {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(loaded.progress));
    }
    return loaded.progress;
  } catch {
    return createDefaultProgress();
  }
}

function saveToStorage(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 儲存空間滿了或被瀏覽器擋住（隱私模式）：這次先留在記憶體，不要讓畫面壞掉
  }
}

let memoryCache: UserProgress | null = null;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT: UserProgress = createDefaultProgress();

export class LocalProgressStore implements ProgressStore {
  private get progress(): UserProgress {
    if (!memoryCache) memoryCache = loadFromStorage();
    return memoryCache;
  }

  private set progress(value: UserProgress) {
    memoryCache = value;
    saveToStorage(value);
    listeners.forEach((l) => l());
  }

  /** useSyncExternalStore 用：訂閱進度變化 */
  subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  /** useSyncExternalStore 用：目前進度（不可變物件，改動時才換新參考） */
  getSnapshot = (): UserProgress => this.progress;

  getServerSnapshot = (): UserProgress => SERVER_SNAPSHOT;

  getProgress(): UserProgress {
    const p = this.progress;
    return {
      ...p,
      completedLessons: [...p.completedLessons],
      wordStats: { ...p.wordStats },
      review: { ...p.review },
    };
  }

  saveProgress(progress: UserProgress): void {
    this.progress = progress;
  }

  completeLesson(lessonId: string): UserProgress {
    this.progress = applyCompleteLesson(this.progress, lessonId);
    return this.getProgress();
  }

  setCurrentLesson(lessonId: string | null): UserProgress {
    this.progress = {
      ...this.progress,
      currentLessonId: lessonId,
      lastPlayedAt: new Date().toISOString(),
    };
    return this.getProgress();
  }

  recordWordAttempt(word: string, correct: boolean): UserProgress {
    this.progress = applyRecordWordAttempt(this.progress, word, correct);
    return this.getProgress();
  }

  recordGraphemeOutcome(itemId: string, outcome: ReviewOutcome): UserProgress {
    this.progress = applyGraphemeOutcome(this.progress, itemId, outcome);
    return this.getProgress();
  }

  applyPlacementResult(result: PlacementResult): UserProgress {
    this.progress = applyPlacement(this.progress, result);
    return this.getProgress();
  }

  isLessonCompleted(lessonId: string): boolean {
    return createProgressHelpers(() => this.progress).isLessonCompleted(lessonId);
  }

  isLessonUnlocked(lessonId: string): boolean {
    return createProgressHelpers(() => this.progress).isLessonUnlocked(lessonId);
  }

  getUnitProgress(unitId: UnitId): { completed: number; total: number } {
    return createProgressHelpers(() => this.progress).getUnitProgress(unitId);
  }

  getOverallProgress(): { completed: number; total: number } {
    return createProgressHelpers(() => this.progress).getOverallProgress();
  }

  resetProgress(): void {
    this.progress = createDefaultProgress();
  }
}

let storeInstance: LocalProgressStore | null = null;

export function getProgressStore(): LocalProgressStore {
  if (!storeInstance) storeInstance = new LocalProgressStore();
  return storeInstance;
}

export class ApiProgressStore implements ProgressStore {
  getProgress(): UserProgress {
    throw new Error('ApiProgressStore not implemented');
  }
  saveProgress(): void {
    throw new Error('ApiProgressStore not implemented');
  }
  completeLesson(): UserProgress {
    throw new Error('ApiProgressStore not implemented');
  }
  setCurrentLesson(): UserProgress {
    throw new Error('ApiProgressStore not implemented');
  }
  recordWordAttempt(): UserProgress {
    throw new Error('ApiProgressStore not implemented');
  }
  recordGraphemeOutcome(): UserProgress {
    throw new Error('ApiProgressStore not implemented');
  }
  applyPlacementResult(): UserProgress {
    throw new Error('ApiProgressStore not implemented');
  }
  isLessonCompleted(): boolean {
    throw new Error('ApiProgressStore not implemented');
  }
  isLessonUnlocked(): boolean {
    throw new Error('ApiProgressStore not implemented');
  }
  getUnitProgress(): { completed: number; total: number } {
    throw new Error('ApiProgressStore not implemented');
  }
  getOverallProgress(): { completed: number; total: number } {
    throw new Error('ApiProgressStore not implemented');
  }
  resetProgress(): void {
    throw new Error('ApiProgressStore not implemented');
  }
}
