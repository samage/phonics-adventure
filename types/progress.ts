import type { ReviewMap } from '@/lib/review/scheduler';

/** 快速分班測驗結果（v7 起） */
export interface PlacementInfo {
  /** ISO 時間 */
  takenAt: string;
  knownIds: string[];
  missedIds: string[];
  startTier: string | null;
}

export interface UserProgress {
  completedLessons: string[];
  currentLessonId: string | null;
  lastPlayedAt: string;
  /** 每個複習項目（字母、特殊字、短句）的間隔複習紀錄（item id → 盒子與到期日），v7 起；特殊字與短句 v9 起 */
  review: ReviewMap;
  /** 做過分班測驗就不再強制線性解鎖 */
  placement: PlacementInfo | null;
}

export function createDefaultProgress(): UserProgress {
  return {
    completedLessons: [],
    currentLessonId: null,
    lastPlayedAt: '',
    review: {},
    placement: null,
  };
}

/** 目前使用的儲存格式版本。舊版 key 只讀不刪，方便回退。 */
export const PROGRESS_STORAGE_KEY = 'phonics-adventure-progress-v9';
export const LEGACY_PROGRESS_V8_KEY = 'phonics-adventure-progress-v8';
export const LEGACY_PROGRESS_V7_KEY = 'phonics-adventure-progress-v7';
export const LEGACY_PROGRESS_V6_KEY = 'phonics-adventure-progress-v6';
export const LEGACY_PROGRESS_STORAGE_KEY = 'phonics-adventure-progress-v5';
export const LEGACY_PROGRESS_V4_KEY = 'phonics-adventure-progress-v4';
