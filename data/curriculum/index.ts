import type { Curriculum } from '@/types/curriculum';
import { getPlayableLessons } from '@/types/curriculum';
import { JUNYI_LESSONS, UNITS, ALL_LETTERS } from './junyi60';

export const CURRICULUM: Curriculum = {
  version: '2.0.0',
  units: UNITS,
  lessons: JUNYI_LESSONS,
};

export { JUNYI_LESSONS, UNITS, ALL_LETTERS } from './junyi60';

export function getAllLessons() {
  return CURRICULUM.lessons;
}

export function getPlayableLessonCount(): number {
  return getPlayableLessons(CURRICULUM).length;
}
