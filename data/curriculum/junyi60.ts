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

function stub(
  id: string,
  order: number,
  unitId: Lesson['unitId'],
  title: string,
  graphemes?: string[],
): Lesson {
  const content: GraphemeContent = {
    kind: 'grapheme',
    patternKey: graphemes?.[0] ?? '',
    graphemes: graphemes ?? [],
    words: [],
  };
  return {
    id,
    order,
    unitId,
    title,
    graphemes,
    activities: [
      { id: `${id}-stub`, type: 'grapheme', title: '即將推出', content },
    ],
    implemented: false,
  };
}

export const UNITS: Unit[] = [
  { id: 'intro', order: 1, title: '開始', description: '自然發音六十堂課', accent: '#FFD54F', shadow: '#FFA000' },
  { id: 'consonants_voiced', order: 2, title: '有聲子音', description: 'b、dd、gg…', accent: '#4FC3F7', shadow: '#0288D1' },
  { id: 'consonants_voiceless', order: 3, title: '無聲子音', description: 'f、ck、sh、th…', accent: '#29B6F6', shadow: '#0277BD' },
  { id: 'vowels', order: 4, title: '母音', description: '短母音、長母音、雙母音', accent: '#FFD54F', shadow: '#FFA000' },
  { id: 'blending', order: 5, title: '混音拼讀', description: '把發音組合在一起', accent: '#81C784', shadow: '#388E3C' },
  { id: 'blends', order: 6, title: '混合子音', description: 'bl、tr、str 等', accent: '#81C784', shadow: '#388E3C' },
  { id: 'finals', order: 7, title: '字尾音', description: '-l、-m、-r、-s', accent: '#90CAF9', shadow: '#1565C0' },
  { id: 'affixes', order: 8, title: '前後綴', description: 'dis-、-tion、-ing 等', accent: '#F48FB1', shadow: '#C2185B' },
  { id: 'long_words', order: 9, title: '長單字', description: '多音節單字拼讀', accent: '#90A4AE', shadow: '#546E7A' },
];

const VOICED = HOP_ENGLISH_PATTERNS.filter((p) => p.category === 'voiced_consonant');
const VOICELESS = HOP_ENGLISH_PATTERNS.filter((p) => p.category === 'voiceless_consonant');
const VOWELS = HOP_ENGLISH_PATTERNS.filter((p) => p.category === 'vowel');

const L01_L42: Lesson[] = [
  {
    id: 'L01',
    order: 1,
    unitId: 'intro',
    title: '開始學習',
    subtitle: '自然發音六十堂課',
    activities: [
      {
        id: 'L01-act',
        type: 'course_intro',
        title: '開始',
        content: { kind: 'course_intro' },
      },
    ],
    implemented: true,
  },
  ...VOICED.map((p, i) =>
    patternLesson(`L${String(i + 2).padStart(2, '0')}`, i + 2, 'consonants_voiced', p.key),
  ),
  ...VOICELESS.map((p, i) =>
    patternLesson(
      `L${String(i + 17).padStart(2, '0')}`,
      i + 17,
      'consonants_voiceless',
      p.key,
    ),
  ),
  ...VOWELS.map((p, i) =>
    patternLesson(`L${String(i + 26).padStart(2, '0')}`, i + 26, 'vowels', p.key),
  ),
  {
    id: 'L42',
    order: 42,
    unitId: 'blending',
    title: '發音組合在一起怎麼念？',
    subtitle: '混音拼讀 CVC',
    words: ['sat', 'pin', 'bed', 'dog', 'sun', 'mat', 'pig', 'cup'],
    activities: [
      {
        id: 'L42-act',
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

const L43_L60: Lesson[] = [
  stub('L43', 43, 'blends', '發音（ bl fl cl ）', ['bl', 'fl', 'cl']),
  stub('L44', 44, 'blends', '發音（ gl pl sl ）', ['gl', 'pl', 'sl']),
  stub('L45', 45, 'blends', '發音（ br cr dr ）', ['br', 'cr', 'dr']),
  stub('L46', 46, 'blends', '發音（ gr fr tr ）', ['gr', 'fr', 'tr']),
  stub('L47', 47, 'finals', '發音（ -l ）', ['-l']),
  stub('L48', 48, 'finals', '發音（ -m ）', ['-m']),
  stub('L49', 49, 'finals', '發音（ -r ）', ['-r']),
  stub('L50', 50, 'finals', '發音（ -s ）', ['-s']),
  stub('L51', 51, 'affixes', '放在前面、後面的字（ dis un ）', ['dis', 'un']),
  stub('L52', 52, 'affixes', '放在前面、後面的字（ pre re ）', ['pre', 're']),
  stub('L53', 53, 'affixes', '放在前面、後面的字（ able ful ）', ['able', 'ful']),
  stub('L54', 54, 'affixes', '放在前面、後面的字（ less ness tion ）', ['less', 'ness', 'tion']),
  stub('L55', 55, 'affixes', '放在前面、後面的字（ ed ing ）', ['ed', 'ing']),
  stub('L56', 56, 'long_words', '很長的字，怎麼唸呢？'),
  stub('L57', 57, 'long_words', '很長的字（ afternoon birthday ）'),
  stub('L58', 58, 'long_words', '很長的字（ understand remember ）'),
  stub('L59', 59, 'long_words', '很長的字（ restaurant excellent ）'),
  stub('L60', 60, 'long_words', '很長的字（ weekday toothache ）'),
];

export const JUNYI_LESSONS: Lesson[] = [...L01_L42, ...L43_L60];

/** 全部希平方字母組合拼法 */
export const ALL_SPELLINGS: string[] = HOP_ENGLISH_PATTERNS.flatMap((p) => p.spellings);
