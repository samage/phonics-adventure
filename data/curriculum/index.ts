import type { Curriculum } from '@/types/curriculum';
import { getPlayableLessons } from '@/types/curriculum';
import { HOP_LESSONS, UNITS } from './hopCurriculum';

export const CURRICULUM: Curriculum = {
  version: '3.0.0',
  units: UNITS,
  lessons: HOP_LESSONS,
};

export { HOP_LESSONS, UNITS, ALL_SPELLINGS } from './hopCurriculum';

/** @deprecated 改用 HOP_LESSONS */
export const JUNYI_LESSONS = HOP_LESSONS;

/** @deprecated 改用 ALL_SPELLINGS */
export const ALL_LETTERS: string[] = [];

export function getAllLessons() {
  return CURRICULUM.lessons;
}

export function getPlayableLessonCount(): number {
  return getPlayableLessons(CURRICULUM).length;
}
