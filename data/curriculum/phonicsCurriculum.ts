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
import { BLEND_LESSONS } from '@/data/blends';

export const UNITS: Unit[] = [
  {
    id: 'start',
    order: 1,
    title: '入門拼讀',
    description: 's a t p i n m d — 學幾個音就練幾個字',
    accent: '#7EC8F2',
    shadow: '#388E3C',
  },
  {
    id: 'cvc',
    order: 2,
    title: '讀字基礎',
    description: '補齊字母，讀更多短母音字',
    accent: '#F4A6C1',
    shadow: '#0288D1',
  },
  {
    id: 'blends',
    order: 3,
    title: '連音',
    description: 'st、bl、tr、str… 子音連在一起，每個音都要唸出來',
    accent: '#A9B8F5',
    shadow: '#0097A7',
  },
  {
    id: 'advanced',
    order: 4,
    title: '進階發音',
    description: 'sh、th、長母音、母音組 — 每個音只學一次',
    accent: '#8FD3E8',
    shadow: '#FFA000',
  },
  {
    id: 'alt_spellings',
    order: 5,
    title: '替代拼法',
    description: '同一個音，多種拼法（bb、ph、kn…）',
    accent: '#C6B0F2',
    shadow: '#8E24AA',
  },
];

const TH_COMBINED_WORDS = ['thin', 'math', 'then', 'that'];

/**
 * 進階單元開頭改用「規則、可拼」的例字（原本的 machine、station、watch、tongue 太不規則）。
 * 不規則的例字保留在 Hop 規則說明裡，之後的課再遇到。
 */
const ADVANCED_REGULAR_WORDS: Record<string, string[]> = {
  hop_sh_ch_ti: ['ship', 'shop', 'fish', 'shed'],
  hop_ch_tch_ture: ['chip', 'chop', 'much', 'rich'],
  hop_ng_n_ngue: ['ring', 'sing', 'king', 'long'],
};

/**
 * Phase 1 新增課次的固定 ID。ID 會存進孩子的進度，絕對不能因為插課而改變，
 * 所以只重排 order，不重編 id。
 */
const CK_LESSON_ID = 'CK1';

function blendLesson(def: (typeof BLEND_LESSONS)[number], order: number): Lesson {
  const title = `連音（ ${def.blends.join(' / ')} ）`;
  const content: GraphemeContent = {
    kind: 'grapheme',
    patternKey: def.key,
    graphemes: def.blends,
    words: def.words,
    wordOrder: 'sequential',
    ruleHint: def.hint,
  };
  return {
    id: def.id,
    order,
    unitId: 'blends',
    title,
    subtitle: def.blends.join(' / '),
    graphemes: def.blends,
    words: def.words,
    activities: [{ id: `${def.id}-act`, type: 'grapheme', title, content }],
    implemented: true,
  };
}

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
      lessons.push(
        hopLesson(padId(order), order, 'advanced', key, {
          words: ADVANCED_REGULAR_WORDS[key],
        }),
      );
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

  return withPhase1Lessons(lessons);
}

/** 插入連音單元與 -ck 課，並依新順序重排 order（id 不變） */
function withPhase1Lessons(base: Lesson[]): Lesson[] {
  const out: Lesson[] = [];
  let blendsInserted = false;
  for (const lesson of base) {
    if (lesson.unitId === 'advanced' && !blendsInserted) {
      out.push(...BLEND_LESSONS.map((def) => blendLesson(def, 0)));
      blendsInserted = true;
    }
    out.push(lesson);
    if (
      lesson.activities[0]?.content.kind === 'grapheme' &&
      lesson.activities[0].content.patternKey === 'hop_ch_tch_ture'
    ) {
      out.push(
        hopLesson(CK_LESSON_ID, 0, 'advanced', 'hop_ck', {
          words: ['duck', 'sock', 'back', 'pick', 'kick'],
        }),
      );
    }
  }
  return out.map((l, i) => ({ ...l, order: i + 1 }));
}

export const PHONICS_LESSONS: Lesson[] = buildLessons();

/** 依 Hop patternKey 查新課次 ID */
function lessonIdForHopKey(patternKey: string): string | null {
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
