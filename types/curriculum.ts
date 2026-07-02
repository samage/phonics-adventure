export type UnitId =
  | 'intro'
  | 'consonants_voiced'
  | 'consonants_voiceless'
  | 'vowels'
  | 'blending'
  | 'blends'
  | 'finals'
  | 'affixes'
  | 'long_words';

export type ActivityType =
  | 'course_intro'
  | 'letter_group'
  | 'blend_intro'
  | 'grapheme'
  | 'blend'
  | 'segment'
  | 'sight_word';

export type WordOrderMode = 'sequential' | 'random';

export interface CourseIntroContent {
  kind: 'course_intro';
}

export interface LetterGroupContent {
  kind: 'letter_group';
  letters: string[];
  quizCount?: number;
}

export interface BlendIntroContent {
  kind: 'blend_intro';
  words: string[];
  wordOrder?: WordOrderMode;
}

export interface GraphemeContent {
  kind: 'grapheme';
  /** Hop English 發音規則 key，如 hop_d_dd */
  patternKey: string;
  graphemes: string[];
  words: string[];
  wordOrder?: WordOrderMode;
  ruleHint?: string;
}

export interface BlendContent {
  kind: 'blend';
  words: string[];
  wordOrder?: WordOrderMode;
}

export interface SegmentContent {
  kind: 'segment';
  words: string[];
}

export interface SightWordContent {
  kind: 'sight_word';
  words: string[];
}

export type ActivityContent =
  | CourseIntroContent
  | LetterGroupContent
  | BlendIntroContent
  | GraphemeContent
  | BlendContent
  | SegmentContent
  | SightWordContent;

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  content: ActivityContent;
}

export interface Lesson {
  id: string;
  order: number;
  unitId: UnitId;
  title: string;
  subtitle?: string;
  graphemes?: string[];
  letters?: string[];
  words?: string[];
  activities: Activity[];
  implemented: boolean;
}

export interface Unit {
  id: UnitId;
  order: number;
  title: string;
  description: string;
  accent: string;
  shadow: string;
}

export interface Curriculum {
  version: '2.0.0';
  units: Unit[];
  lessons: Lesson[];
}

export function findLesson(
  curriculum: Curriculum,
  lessonId: string,
): Lesson | null {
  return curriculum.lessons.find((l) => l.id === lessonId) ?? null;
}

export function findUnit(
  curriculum: Curriculum,
  unitId: UnitId,
): Unit | null {
  return curriculum.units.find((u) => u.id === unitId) ?? null;
}

export function getPlayableLessons(curriculum: Curriculum): Lesson[] {
  return curriculum.lessons.filter((l) => l.implemented);
}

export function getPreviousLessonId(
  curriculum: Curriculum,
  lessonId: string,
): string | null {
  const lesson = findLesson(curriculum, lessonId);
  if (!lesson || lesson.order <= 1) return null;
  return (
    curriculum.lessons.find((l) => l.order === lesson.order - 1)?.id ?? null
  );
}
