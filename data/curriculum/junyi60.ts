import type {
  GraphemeContent,
  Lesson,
  LetterGroupContent,
  Unit,
} from '@/types/curriculum';

function letterGroup(
  id: string,
  order: number,
  unitId: Lesson['unitId'],
  title: string,
  letters: string[],
  quizCount = 4,
): Lesson {
  const content: LetterGroupContent = { kind: 'letter_group', letters, quizCount };
  return {
    id,
    order,
    unitId,
    title,
    subtitle: title.replace('發音（ ', '').replace(' ）', ''),
    letters,
    activities: [
      { id: `${id}-act`, type: 'letter_group', title, content },
    ],
    implemented: true,
  };
}

function graphemeLesson(
  id: string,
  order: number,
  grapheme: string,
  words: string[],
  ruleHint?: string,
): Lesson {
  const content: GraphemeContent = {
    kind: 'grapheme',
    graphemes: [grapheme],
    words,
    wordOrder: 'sequential',
    ruleHint,
  };
  return {
    id,
    order,
    unitId: order === 8 ? 'magic_e' : 'graphemes',
    title: `發音（ ${grapheme} ）`,
    subtitle: grapheme,
    graphemes: [grapheme],
    words,
    activities: [
      { id: `${id}-act`, type: 'grapheme', title: `發音（ ${grapheme} ）`, content },
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
  { id: 'intro', order: 1, title: '課程介紹', description: '認識學習方式與積木顏色', accent: '#FFD54F', shadow: '#FFA000' },
  { id: 'consonants', order: 2, title: '子音', description: 'b–z 子音發音', accent: '#4FC3F7', shadow: '#0288D1' },
  { id: 'vowels', order: 3, title: '母音', description: '短母音 a, e, i, o, u', accent: '#FFD54F', shadow: '#FFA000' },
  { id: 'blending', order: 4, title: '混音拼讀', description: '把發音組合在一起', accent: '#81C784', shadow: '#388E3C' },
  { id: 'magic_e', order: 5, title: 'Magic E', description: '母音 + 子音 + e', accent: '#FF8A65', shadow: '#E64A19' },
  { id: 'graphemes', order: 6, title: '字母組合', description: 'ai, ch, oo 等組合發音', accent: '#BA68C8', shadow: '#7B1FA2' },
  { id: 'finals', order: 7, title: '字尾音', description: '-l, -m, -r, -s', accent: '#90CAF9', shadow: '#1565C0' },
  { id: 'blends', order: 8, title: '混合子音', description: 'bl, tr, str 等', accent: '#81C784', shadow: '#388E3C' },
  { id: 'affixes', order: 9, title: '前後綴', description: 'dis-, -tion, -ing 等', accent: '#F48FB1', shadow: '#C2185B' },
  { id: 'long_words', order: 10, title: '長單字', description: '多音節單字拼讀', accent: '#90A4AE', shadow: '#546E7A' },
];

const L01_L20: Lesson[] = [
  {
    id: 'L01',
    order: 1,
    unitId: 'intro',
    title: '課程介紹',
    subtitle: '自然發音的六十堂課',
    activities: [
      {
        id: 'L01-act',
        type: 'course_intro',
        title: '課程介紹',
        content: { kind: 'course_intro' },
      },
    ],
    implemented: true,
  },
  letterGroup('L02', 2, 'consonants', '發音（ b c d f g h j ）', ['b', 'c', 'd', 'f', 'g', 'h', 'j']),
  letterGroup('L03', 3, 'consonants', '發音（ k l m n p q ）', ['k', 'l', 'm', 'n', 'p', 'q']),
  letterGroup('L04', 4, 'consonants', '發音（ r s t v w x y z ）', ['r', 's', 't', 'v', 'w', 'x', 'y', 'z']),
  letterGroup('L05', 5, 'vowels', '發音（ a e i ）', ['a', 'e', 'i']),
  letterGroup('L06', 6, 'vowels', '發音（ o u ）', ['o', 'u']),
  {
    id: 'L07',
    order: 7,
    unitId: 'blending',
    title: '發音組合在一起怎麼念？',
    subtitle: '混音拼讀 CVC',
    words: ['sat', 'pin', 'bed', 'cup', 'dog', 'sun', 'mat', 'tin'],
    activities: [
      {
        id: 'L07-act',
        type: 'blend_intro',
        title: '混音拼讀',
        content: {
          kind: 'blend_intro',
          words: ['sat', 'pin', 'bed', 'cup', 'dog', 'sun', 'mat', 'tin'],
          wordOrder: 'sequential',
        },
      },
    ],
    implemented: true,
  },
  {
    id: 'L08',
    order: 8,
    unitId: 'magic_e',
    title: '發音（ a e i o u ＋ ? ＋ e ）',
    subtitle: 'Magic E',
    graphemes: ['magic_e'],
    words: ['cake', 'bike', 'home', 'cute'],
    activities: [
      {
        id: 'L08-act',
        type: 'grapheme',
        title: 'Magic E',
        content: {
          kind: 'grapheme',
          graphemes: ['magic_e'],
          words: ['cake', 'bike', 'home', 'cute'],
          wordOrder: 'sequential',
          ruleHint: '字尾 e 不發音，前面的母音變長音',
        },
      },
    ],
    implemented: true,
  },
  graphemeLesson('L09', 9, 'ai', ['rain', 'train', 'wait']),
  graphemeLesson('L10', 10, 'ay', ['day', 'play', 'say']),
  graphemeLesson('L11', 11, 'au', ['haul', 'sauce']),
  graphemeLesson('L12', 12, 'aw', ['saw', 'paw']),
  graphemeLesson('L13', 13, 'ee', ['bee', 'tree', 'feet']),
  graphemeLesson('L14', 14, 'ch', ['chip', 'chair', 'chop']),
  graphemeLesson('L15', 15, 'ck', ['duck', 'back', 'pick']),
  graphemeLesson('L16', 16, 'gh', ['laugh', 'tough']),
  graphemeLesson('L17', 17, 'ei', ['vein', 'rein']),
  graphemeLesson('L18', 18, 'eu', ['feud', 'deuce']),
  graphemeLesson('L19', 19, 'ou', ['house', 'mouse', 'out']),
  graphemeLesson('L20', 20, 'ew', ['new', 'few', 'dew']),
];

const L21_L60: Lesson[] = [
  stub('L21', 21, 'graphemes', '發音（ ie ）', ['ie']),
  stub('L22', 22, 'graphemes', '發音（ kn ）', ['kn']),
  stub('L23', 23, 'graphemes', '發音（ th ）', ['th']),
  stub('L24', 24, 'graphemes', '發音（ wh ）', ['wh']),
  stub('L25', 25, 'graphemes', '發音（ oa ）', ['oa']),
  stub('L26', 26, 'graphemes', '發音（ oo ）', ['oo']),
  stub('L27', 27, 'graphemes', '發音（ ow ）', ['ow']),
  stub('L28', 28, 'graphemes', '發音（ ue ）', ['ue']),
  stub('L29', 29, 'graphemes', '發音（ ui ）', ['ui']),
  stub('L30', 30, 'graphemes', '發音（ wr ）', ['wr']),
  stub('L31', 31, 'graphemes', '發音（ ph ）', ['ph']),
  stub('L32', 32, 'graphemes', '發音（ qu ）', ['qu']),
  stub('L33', 33, 'graphemes', '發音（ sh ）', ['sh']),
  stub('L34', 34, 'finals', '發音（ -l ）', ['-l']),
  stub('L35', 35, 'finals', '發音（ -m ）', ['-m']),
  stub('L36', 36, 'finals', '發音（ -r ）', ['-r']),
  stub('L37', 37, 'finals', '發音（ -s ）', ['-s']),
  stub('L38', 38, 'blends', '發音（ bl fl cl ）', ['bl', 'fl', 'cl']),
  stub('L39', 39, 'blends', '發音（ gl pl sl ）', ['gl', 'pl', 'sl']),
  stub('L40', 40, 'blends', '發音（ br cr dr ）', ['br', 'cr', 'dr']),
  stub('L41', 41, 'blends', '發音（ gr fr tr ）', ['gr', 'fr', 'tr']),
  stub('L42', 42, 'blends', '發音（ pr str sn ）', ['pr', 'str', 'sn']),
  stub('L43', 43, 'blends', '發音（ sp sw sm st ）', ['sp', 'sw', 'sm', 'st']),
  stub('L44', 44, 'affixes', '放在前面、後面的字（ dis un ）', ['dis', 'un']),
  stub('L45', 45, 'affixes', '放在前面、後面的字（ in im ）', ['in', 'im']),
  stub('L46', 46, 'affixes', '放在前面、後面的字（ pre re ）', ['pre', 're']),
  stub('L47', 47, 'affixes', '放在前面、後面的字（ over under ）', ['over', 'under']),
  stub('L48', 48, 'affixes', '放在前面、後面的字（ able ful ish ）', ['able', 'ful', 'ish']),
  stub('L49', 49, 'affixes', '放在前面、後面的字（ less ness tion ）', ['less', 'ness', 'tion']),
  stub('L50', 50, 'affixes', '放在前面、後面的字（ en er ly y ）', ['en', 'er', 'ly']),
  stub('L51', 51, 'affixes', '放在前面、後面的字（ s es ies ）', ['s', 'es', 'ies']),
  stub('L52', 52, 'affixes', '放在前面、後面的字（ ed ing ）', ['ed', 'ing']),
  stub('L53', 53, 'long_words', '很長的字，怎麼唸呢？'),
  stub('L54', 54, 'long_words', '很長的字（ thirteen fourteen… ）'),
  stub('L55', 55, 'long_words', '很長的字（ supermarket hamburger… ）'),
  stub('L56', 56, 'long_words', '很長的字（ afternoon birthday… ）'),
  stub('L57', 57, 'long_words', '很長的字（ understand remember… ）'),
  stub('L58', 58, 'long_words', '很長的字（ restaurant motorcycle ）'),
  stub('L59', 59, 'long_words', '很長的字（ excellent different… ）'),
  stub('L60', 60, 'long_words', '很長的字（ weekday toothache… ）'),
];

export const JUNYI_LESSONS: Lesson[] = [...L01_L20, ...L21_L60];

/** 全部 26 字母（L02-L06） */
export const ALL_LETTERS: string[] = JUNYI_LESSONS.filter((l) => l.letters?.length)
  .flatMap((l) => l.letters ?? []);
