import type { GraphemeContent, Lesson, Unit } from '@/types/curriculum';
import {
  HOP_ENGLISH_PATTERNS,
  practiceWordsForPattern,
} from '@/data/hopEnglishPatterns';

function patternLesson(
  id: string,
  order: number,
  unitId: Lesson['unitId'],
  patternKey: string,
): Lesson {
  const pattern = HOP_ENGLISH_PATTERNS.find((p) => p.key === patternKey)!;
  const words = practiceWordsForPattern(patternKey, 4);
  const content: GraphemeContent = {
    kind: 'grapheme',
    patternKey,
    graphemes: [patternKey],
    words,
    wordOrder: 'sequential',
    ruleHint: pattern.ruleDetail,
  };
  return {
    id,
    order,
    unitId,
    title: `發音（ ${pattern.display} ）`,
    subtitle: pattern.display,
    graphemes: [patternKey],
    words,
    activities: [
      {
        id: `${id}-act`,
        type: 'grapheme',
        title: `發音（ ${pattern.display} ）`,
        content,
      },
    ],
    implemented: true,
  };
}

export const UNITS: Unit[] = [
  {
    id: 'consonants_voiced',
    order: 1,
    title: '有聲子音',
    description: 'b、dd、gg…',
    accent: '#4FC3F7',
    shadow: '#0288D1',
  },
  {
    id: 'consonants_voiceless',
    order: 2,
    title: '無聲子音',
    description: 'f、ck、sh、th…',
    accent: '#29B6F6',
    shadow: '#0277BD',
  },
  {
    id: 'vowels',
    order: 3,
    title: '母音',
    description: '短母音、長母音、雙母音',
    accent: '#FFD54F',
    shadow: '#FFA000',
  },
  {
    id: 'blending',
    order: 4,
    title: '混音拼讀',
    description: '把發音組合在一起',
    accent: '#81C784',
    shadow: '#388E3C',
  },
];

const VOICED = HOP_ENGLISH_PATTERNS.filter((p) => p.category === 'voiced_consonant');
const VOICELESS = HOP_ENGLISH_PATTERNS.filter((p) => p.category === 'voiceless_consonant');
const VOWELS = HOP_ENGLISH_PATTERNS.filter((p) => p.category === 'vowel');

/** 希平方入門班：40 組規則 + 混音拼讀（共 41 堂） */
export const HOP_LESSONS: Lesson[] = [
  ...VOICED.map((p, i) =>
    patternLesson(`L${String(i + 1).padStart(2, '0')}`, i + 1, 'consonants_voiced', p.key),
  ),
  ...VOICELESS.map((p, i) =>
    patternLesson(
      `L${String(i + 16).padStart(2, '0')}`,
      i + 16,
      'consonants_voiceless',
      p.key,
    ),
  ),
  ...VOWELS.map((p, i) =>
    patternLesson(`L${String(i + 25).padStart(2, '0')}`, i + 25, 'vowels', p.key),
  ),
  {
    id: 'L41',
    order: 41,
    unitId: 'blending',
    title: '發音組合在一起怎麼念？',
    subtitle: '混音拼讀 CVC',
    words: ['sat', 'pin', 'bed', 'dog', 'sun', 'mat', 'pig', 'cup'],
    activities: [
      {
        id: 'L41-act',
        type: 'blend_intro',
        title: '混音拼讀',
        content: {
          kind: 'blend_intro',
          words: ['sat', 'pin', 'bed', 'dog', 'sun', 'mat', 'pig', 'cup'],
          wordOrder: 'sequential',
        },
      },
    ],
    implemented: true,
  },
];

/** 全部希平方字母組合拼法 */
export const ALL_SPELLINGS: string[] = HOP_ENGLISH_PATTERNS.flatMap((p) => p.spellings);
