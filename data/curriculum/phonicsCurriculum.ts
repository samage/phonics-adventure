import type {
  DecodableSentenceContent,
  GraphemeContent,
  Lesson,
  SightWordContent,
  Unit,
} from '@/types/curriculum';
import {
  ADVANCED_HOP_KEYS,
  ALT_SPELLING_HOP_KEYS,
  CVC_LETTERS,
  START_LETTERS,
  UNIT2_SENTENCES,
  UNIT4_SENTENCES,
  type BasicLetterSet,
} from '@/data/curriculum/lettersSoundsSets';
import {
  HOP_ENGLISH_PATTERNS,
  getHopPattern,
  practiceWordsForPattern,
} from '@/data/hopEnglishPatterns';
import { TRICKY_WORDS } from '@/data/trickyWords';

export const UNITS: Unit[] = [
  {
    id: 'start',
    order: 1,
    title: '入門拼讀',
    description: 's a t p i n m d — 學幾個音就練幾個字',
    accent: '#81C784',
    shadow: '#388E3C',
  },
  {
    id: 'cvc',
    order: 2,
    title: '讀字基礎',
    description: '補齊字母，讀更多短母音字',
    accent: '#4FC3F7',
    shadow: '#0288D1',
  },
  {
    id: 'advanced',
    order: 3,
    title: '進階發音',
    description: 'sh、th、長母音、母音組 — 每個音只學一次',
    accent: '#FFD54F',
    shadow: '#FFA000',
  },
  {
    id: 'alt_spellings',
    order: 4,
    title: '替代拼法',
    description: '同一個音，多種拼法（bb、ph、kn…）',
    accent: '#CE93D8',
    shadow: '#8E24AA',
  },
];

const TH_COMBINED_WORDS = ['thin', 'math', 'then', 'father'];

function letterLesson(
  id: string,
  order: number,
  unitId: Lesson['unitId'],
  set: BasicLetterSet,
): Lesson {
  const content: GraphemeContent = {
    kind: 'grapheme',
    patternKey: set.grapheme,
    graphemes: [set.grapheme],
    words: set.practiceWords,
    wordOrder: 'sequential',
    lessonSteps: ['phoneme', 'grapheme', 'examples', 'word_lab', 'spelling'],
  };
  return {
    id,
    order,
    unitId,
    title: `發音（ ${set.display} ）`,
    subtitle: set.display,
    graphemes: [set.grapheme],
    words: set.practiceWords,
    activities: [
      { id: `${id}-act`, type: 'grapheme', title: `發音（ ${set.display} ）`, content },
    ],
    implemented: true,
  };
}

function hopLesson(
  id: string,
  order: number,
  unitId: Lesson['unitId'],
  patternKey: string,
  options?: { words?: string[]; ruleHint?: string; title?: string },
): Lesson {
  const pattern = getHopPattern(patternKey)!;
  const words = options?.words ?? practiceWordsForPattern(patternKey, 4);
  const content: GraphemeContent = {
    kind: 'grapheme',
    patternKey,
    graphemes: [patternKey],
    words,
    wordOrder: 'sequential',
    ruleHint: options?.ruleHint ?? pattern.ruleDetail,
    lessonSteps: ['phoneme', 'grapheme', 'examples', 'word_lab', 'spelling'],
  };
  return {
    id,
    order,
    unitId,
    title: options?.title ?? `發音（ ${pattern.display} ）`,
    subtitle: pattern.display,
    graphemes: [patternKey],
    words,
    activities: [
      {
        id: `${id}-act`,
        type: 'grapheme',
        title: options?.title ?? `發音（ ${pattern.display} ）`,
        content,
      },
    ],
    implemented: true,
  };
}

function sentenceLesson(
  id: string,
  order: number,
  unitId: Lesson['unitId'],
  sentences: string[],
): Lesson {
  const content: DecodableSentenceContent = {
    kind: 'decodable_sentences',
    sentences,
    phase: 1,
  };
  return {
    id,
    order,
    unitId,
    title: '讀短句',
    subtitle: '用已學的音讀句子',
    activities: [
      { id: `${id}-act`, type: 'decodable_sentences', title: '讀短句', content },
    ],
    implemented: true,
  };
}

function trickyLesson(
  id: string,
  order: number,
  unitId: Lesson['unitId'],
  words: string[],
): Lesson {
  const content: SightWordContent = {
    kind: 'sight_word',
    words,
    phase: 1,
  };
  return {
    id,
    order,
    unitId,
    title: '特殊字',
    subtitle: '不能硬拆，請整字記',
    words,
    activities: [
      { id: `${id}-act`, type: 'sight_word', title: '特殊字', content },
    ],
    implemented: true,
  };
}

function padId(n: number): string {
  return `L${String(n).padStart(2, '0')}`;
}

function buildLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  let order = 1;

  for (const set of START_LETTERS) {
    lessons.push(letterLesson(padId(order), order, 'start', set));
    order += 1;
  }

  for (const set of CVC_LETTERS) {
    lessons.push(letterLesson(padId(order), order, 'cvc', set));
    order += 1;
  }

  lessons.push(sentenceLesson(padId(order), order, 'cvc', UNIT2_SENTENCES));
  order += 1;

  lessons.push(
    trickyLesson(
      padId(order),
      order,
      'cvc',
      TRICKY_WORDS.filter((t) => ['the', 'said', 'was'].includes(t.word)).map((t) => t.word),
    ),
  );
  order += 1;

  for (const key of ADVANCED_HOP_KEYS) {
    if (key === 'hop_th_combined') {
      lessons.push(
        hopLesson(padId(order), order, 'advanced', 'hop_th_combined', {
          title: '發音（ th 清／濁 ）',
          words: TH_COMBINED_WORDS,
        }),
      );
    } else {
      lessons.push(hopLesson(padId(order), order, 'advanced', key));
    }
    order += 1;
  }

  for (const key of ALT_SPELLING_HOP_KEYS) {
    lessons.push(hopLesson(padId(order), order, 'alt_spellings', key));
    order += 1;
  }

  lessons.push(sentenceLesson(padId(order), order, 'alt_spellings', UNIT4_SENTENCES));
  order += 1;

  lessons.push(
    trickyLesson(
      padId(order),
      order,
      'alt_spellings',
      TRICKY_WORDS.filter((t) => !['the', 'said', 'was'].includes(t.word)).map((t) => t.word),
    ),
  );

  return lessons;
}

export const PHONICS_LESSONS: Lesson[] = buildLessons();

/** 依 Hop patternKey 查新課次 ID */
export function lessonIdForHopKey(patternKey: string): string | null {
  const lesson = PHONICS_LESSONS.find((l) =>
    l.activities.some(
      (a) =>
        a.content.kind === 'grapheme' &&
        a.content.patternKey === patternKey,
    ),
  );
  return lesson?.id ?? null;
}

/** 舊課次 ID → 新線性課次（v4 Hop、v5 分段、舊混音課） */
export const LEGACY_LESSON_ID_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};

  HOP_ENGLISH_PATTERNS.forEach((p, i) => {
    const oldV4 = `L${String(i + 1).padStart(2, '0')}`;
    const newId = lessonIdForHopKey(p.key);
    if (newId) map[oldV4] = newId;
  });

  map.L41 = PHONICS_LESSONS[PHONICS_LESSONS.length - 2]?.id ?? 'L01';

  const startIds = PHONICS_LESSONS.filter((l) => l.unitId === 'start').map((l) => l.id);
  START_LETTERS.forEach((_, i) => {
    if (startIds[i]) map[`E${String(i + 1).padStart(2, '0')}`] = startIds[i];
  });

  const cvcLetterLessons = PHONICS_LESSONS.filter(
    (l) => l.unitId === 'cvc' && l.activities[0]?.type === 'grapheme',
  ).map((l) => l.id);
  CVC_LETTERS.forEach((_, i) => {
    if (cvcLetterLessons[i]) map[`C${String(i + 1).padStart(2, '0')}`] = cvcLetterLessons[i];
  });

  let advIdx = 0;
  ADVANCED_HOP_KEYS.forEach((key) => {
    const hopKey = key === 'hop_th_combined' ? 'hop_th_combined' : key;
    const id = lessonIdForHopKey(hopKey);
    if (id) map[`G${String(advIdx + 1).padStart(2, '0')}`] = id;
    advIdx += 1;
  });

  ALT_SPELLING_HOP_KEYS.forEach((key, i) => {
    const id = lessonIdForHopKey(key);
    if (id) map[`H${String(i + 1).padStart(2, '0')}`] = id;
  });

  map.B01 = lessonIdForHopKey('hop_b_bb') ?? map.L41 ?? 'L01';
  map.B02 = lessonIdForHopKey('hop_sh_ch_ti') ?? map.B01;
  map.B03 = lessonIdForHopKey('hop_ai_ay_ae') ?? map.B02;

  return map;
})();

export { HOP_ENGLISH_PATTERNS };
export const ALL_SPELLINGS: string[] = HOP_ENGLISH_PATTERNS.flatMap((p) => p.spellings);
