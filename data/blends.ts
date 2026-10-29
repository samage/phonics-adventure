/**
 * 子音連音（consonant blends）單元。
 * 規則：連音的每個子音都要唸出來（st = s + t），例字全部是規則可拼的短母音字。
 */

export interface BlendLessonDef {
  /** 課程 ID（固定，不隨順序改變） */
  id: string;
  /** GraphemeContent.patternKey */
  key: string;
  blends: string[];
  words: string[];
  hint: string;
}

export const BLEND_LESSONS: BlendLessonDef[] = [
  { id: 'BL1', key: 'blends_s1', blends: ['st', 'sp', 'sn'], words: ['stop', 'step', 'spin', 'spot', 'snap', 'snip'], hint: 's 開頭的連音：s 加上 t／p／n，兩個音快快連在一起。' },
  { id: 'BL2', key: 'blends_s2', blends: ['sk', 'sm', 'sl', 'sw'], words: ['skip', 'skin', 'smell', 'smog', 'slip', 'slap', 'swim'], hint: 's 開頭的連音：s 加上 k／m／l／w。' },
  { id: 'BL3', key: 'blends_l1', blends: ['bl', 'cl', 'fl'], words: ['black', 'blot', 'clap', 'club', 'flag', 'flip'], hint: 'l 結尾的連音：b／c／f 後面接 l。' },
  { id: 'BL4', key: 'blends_l2', blends: ['gl', 'pl'], words: ['glad', 'glum', 'plan', 'plug', 'plum'], hint: 'l 結尾的連音：g／p 後面接 l。' },
  { id: 'BL5', key: 'blends_r1', blends: ['br', 'cr', 'dr'], words: ['brim', 'brag', 'crab', 'crop', 'drum', 'drip'], hint: 'r 結尾的連音：b／c／d 後面接 r。' },
  { id: 'BL6', key: 'blends_r2', blends: ['fr', 'gr', 'pr', 'tr'], words: ['frog', 'grab', 'grin', 'prop', 'trip', 'trap'], hint: 'r 結尾的連音：f／g／p／t 後面接 r。' },
  { id: 'BL7', key: 'blends_end1', blends: ['nd', 'nt', 'mp'], words: ['hand', 'sand', 'tent', 'ant', 'jump', 'lamp', 'camp'], hint: '字尾的連音：nd、nt、mp，兩個音都要唸清楚。' },
  { id: 'BL8', key: 'blends_end2', blends: ['nk', 'ft', 'lt'], words: ['pink', 'sink', 'lift', 'gift', 'belt', 'melt', 'left'], hint: '字尾的連音：nk、ft、lt。' },
  { id: 'BL9', key: 'blends_three', blends: ['str', 'spr', 'scr', 'spl'], words: ['strap', 'strip', 'scrap', 'scrub', 'split', 'sprint'], hint: '三個子音連在一起：s + t + r，每個音都要輕輕唸出來。' },
];

export function getBlendLesson(key: string): BlendLessonDef | null {
  return BLEND_LESSONS.find((b) => b.key === key) ?? null;
}
