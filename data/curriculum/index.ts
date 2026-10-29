import type { Curriculum } from '@/types/curriculum';
import { PHONICS_LESSONS, UNITS, LEGACY_LESSON_ID_MAP } from './phonicsCurriculum';

export const CURRICULUM: Curriculum = {
  version: '8.0.0',
  units: UNITS,
  lessons: PHONICS_LESSONS,
};

export { PHONICS_LESSONS } from './phonicsCurriculum';

const LESSON_ID_SET = new Set(PHONICS_LESSONS.map((l) => l.id));

/**
 * 解析網址／書籤課次 ID。
 * v6 線性 L01–L59 優先；僅在不在現行課表時才套用舊版對照（E01、v4 Hop 等）。
 */
export function resolveLessonId(rawId: string): string {
  if (LESSON_ID_SET.has(rawId)) return rawId;
  return LEGACY_LESSON_ID_MAP[rawId] ?? rawId;
}

/** 從舊版進度遷移課次 ID（v4 的 L01–L41 與現行課次編號重疊，需強制對照） */
export function migrateLessonIdFromLegacy(
  id: string,
  source: 'v4' | 'v5',
): string {
  if (source === 'v4') return LEGACY_LESSON_ID_MAP[id] ?? id;
  if (LESSON_ID_SET.has(id)) return id;
  return LEGACY_LESSON_ID_MAP[id] ?? id;
}

export function getAllLessons() {
  return CURRICULUM.lessons;
}
