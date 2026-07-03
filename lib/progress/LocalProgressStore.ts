import {
  DEFAULT_PROGRESS,
  LEGACY_PROGRESS_STORAGE_KEY,
  LEGACY_PROGRESS_V4_KEY,
  PROGRESS_STORAGE_KEY,
  type UserProgress,
} from '@/types/progress';
import { migrateLessonIdFromLegacy } from '@/data/curriculum';
import type { UnitId } from '@/types/curriculum';
import {
  applyCompleteLesson,
  applyRecordWordAttempt,
  createProgressHelpers,
  type ProgressStore,
} from './ProgressStore';

function migrateLessonIds(
  lessonIds: string[],
  source: 'v4' | 'v5',
): string[] {
  return lessonIds.map((id) => migrateLessonIdFromLegacy(id, source));
}

function migrateProgress(
  raw: UserProgress,
  source: 'v4' | 'v5',
): UserProgress {
  return {
    ...raw,
    completedLessons: migrateLessonIds(raw.completedLessons, source),
    currentLessonId: raw.currentLessonId
      ? migrateLessonIdFromLegacy(raw.currentLessonId, source)
      : null,
  };
}

function loadFromStorage(): UserProgress {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
  try {
    const rawV6 = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (rawV6) {
      const parsed = JSON.parse(rawV6) as UserProgress;
      return {
        completedLessons: Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons
          : [],
        currentLessonId: parsed.currentLessonId ?? null,
        wordStats: parsed.wordStats ?? {},
        lastPlayedAt: parsed.lastPlayedAt ?? '',
      };
    }

    const rawV5 = localStorage.getItem(LEGACY_PROGRESS_STORAGE_KEY);
    if (rawV5) {
      const parsed = JSON.parse(rawV5) as UserProgress;
      const migrated = migrateProgress({
        completedLessons: Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons
          : [],
        currentLessonId: parsed.currentLessonId ?? null,
        wordStats: parsed.wordStats ?? {},
        lastPlayedAt: parsed.lastPlayedAt ?? '',
      }, 'v5');
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    const rawV4 = localStorage.getItem(LEGACY_PROGRESS_V4_KEY);
    if (rawV4) {
      const parsed = JSON.parse(rawV4) as UserProgress;
      const migrated = migrateProgress({
        completedLessons: Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons
          : [],
        currentLessonId: parsed.currentLessonId ?? null,
        wordStats: parsed.wordStats ?? {},
        lastPlayedAt: parsed.lastPlayedAt ?? '',
      }, 'v4');
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return { ...DEFAULT_PROGRESS };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

function saveToStorage(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

let memoryCache: UserProgress | null = null;

export class LocalProgressStore implements ProgressStore {
  private get progress(): UserProgress {
    if (!memoryCache) memoryCache = loadFromStorage();
    return memoryCache;
  }

  private set progress(value: UserProgress) {
    memoryCache = value;
    saveToStorage(value);
  }

  getProgress(): UserProgress {
    return {
      ...this.progress,
      completedLessons: [...this.progress.completedLessons],
    };
  }

  saveProgress(progress: UserProgress): void {
    this.progress = progress;
  }

  completeLesson(lessonId: string): UserProgress {
    const next = applyCompleteLesson(this.progress, lessonId);
    this.progress = next;
    return this.getProgress();
  }

  setCurrentLesson(lessonId: string | null): UserProgress {
    const next = {
      ...this.progress,
      currentLessonId: lessonId,
      lastPlayedAt: new Date().toISOString(),
    };
    this.progress = next;
    return this.getProgress();
  }

  recordWordAttempt(word: string, correct: boolean): UserProgress {
    const next = applyRecordWordAttempt(this.progress, word, correct);
    this.progress = next;
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
    this.progress = { ...DEFAULT_PROGRESS };
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
