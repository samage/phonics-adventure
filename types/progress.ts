export interface WordStat {
  correct: number;
  attempts: number;
}

export interface UserProgress {
  completedLessons: string[];
  currentLessonId: string | null;
  wordStats: Record<string, WordStat>;
  lastPlayedAt: string;
}

export const DEFAULT_PROGRESS: UserProgress = {
  completedLessons: [],
  currentLessonId: null,
  wordStats: {},
  lastPlayedAt: '',
};

export const PROGRESS_STORAGE_KEY = 'phonics-adventure-progress-v2';
