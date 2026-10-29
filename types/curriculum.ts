export type UnitId = 'start' | 'cvc' | 'blends' | 'advanced' | 'alt_spellings';

type ActivityType = 'grapheme' | 'sight_word' | 'decodable_sentences';

type WordOrderMode = 'sequential' | 'random';

export interface GraphemeContent {
  kind: 'grapheme';
  patternKey: string;
  graphemes: string[];
  words: string[];
  wordOrder?: WordOrderMode;
  ruleHint?: string;
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

type ActivityContent =
  | GraphemeContent
  | SightWordContent
  | DecodableSentenceContent;

interface Activity {
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
  version: string;
  units: Unit[];
  lessons: Lesson[];
}

export function findLesson(
  curriculum: Curriculum,
  lessonId: string,
): Lesson | null {
  return curriculum.lessons.find((l) => l.id === lessonId) ?? null;
}

export function getPlayableLessons(curriculum: Curriculum): Lesson[] {
  return curriculum.lessons.filter((l) => l.implemented);
}
