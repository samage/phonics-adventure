import {
  PROGRESS_STORAGE_KEY,
  createDefaultProgress,
  type UserProgress,
} from '@/types/progress';
import type { ReviewOutcome } from '@/lib/review/scheduler';
import type { PlacementResult } from '@/lib/placement/placement';
import {
  applyCompleteLesson,
  applyGraphemeOutcome,
  applyPlacement,
} from './logic';
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

export class LocalProgressStore {
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

  completeLesson(lessonId: string): void {
    this.progress = applyCompleteLesson(this.progress, lessonId);
  }

  setCurrentLesson(lessonId: string | null): void {
    this.progress = {
      ...this.progress,
      currentLessonId: lessonId,
      lastPlayedAt: new Date().toISOString(),
    };
  }

  /** 對某個字母／字母組合的一次作答，不論來自哪個活動，都寫進同一份複習表 */
  recordGraphemeOutcome(itemId: string, outcome: ReviewOutcome): void {
    this.progress = applyGraphemeOutcome(this.progress, itemId, outcome);
  }

  applyPlacementResult(result: PlacementResult): void {
    this.progress = applyPlacement(this.progress, result);
  }
}

let storeInstance: LocalProgressStore | null = null;

export function getProgressStore(): LocalProgressStore {
  if (!storeInstance) storeInstance = new LocalProgressStore();
  return storeInstance;
}
