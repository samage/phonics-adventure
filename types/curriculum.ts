export type UnitId =
  | 'start'
  | 'cvc'
  | 'advanced'
  | 'alt_spellings'
  /** @deprecated 舊版相容 */
  | 'early_blend'
  | 'cvc_expand'
  | 'digraphs'
  | 'long_vowel'
  | 'hop_rules'
  | 'blending'
  | 'consonants_voiced'
  | 'consonants_voiceless'
  | 'vowels';

export type PhaseId = 1 | 2 | 3 | 4 | 5;

export type LessonStep =
  | 'phoneme'
  | 'grapheme'
  | 'examples'
  | 'word_lab'
  | 'spelling';

export type ActivityType =
  | 'letter_group'
  | 'blend_intro'
  | 'grapheme'
  | 'blend'
  | 'segment'
  | 'sight_word'
  | 'decodable_sentences'
  | 'decode_word';

export type WordOrderMode = 'sequential' | 'random';

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
  patternKey: string;
  graphemes: string[];
  words: string[];
  wordOrder?: WordOrderMode;
  ruleHint?: string;
  lessonSteps?: LessonStep[];
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
  phase?: number;
}

export interface DecodableSentenceContent {
  kind: 'decodable_sentences';
  sentences: string[];
  phase: number;
}

export interface DecodeWordContent {
  kind: 'decode_word';
}

export type ActivityContent =
  | LetterGroupContent
  | BlendIntroContent
  | GraphemeContent
  | BlendContent
  | SegmentContent
  | SightWordContent
  | DecodableSentenceContent
  | DecodeWordContent;

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
  version: '2.0.0' | '3.0.0' | '5.0.0' | '6.0.0';
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
