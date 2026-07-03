/** 不可硬拆的常見特殊字（Tricky / Sight words） */

export interface TrickyWord {
  word: string;
  hintZh: string;
  phaseIntroduced: 1 | 2 | 3 | 4 | 5;
}

export const TRICKY_WORDS: TrickyWord[] = [
  { word: 'the', hintZh: '整字記：the（這、那）', phaseIntroduced: 2 },
  { word: 'said', hintZh: '不照規則唸，整字記', phaseIntroduced: 2 },
  { word: 'was', hintZh: '整字記', phaseIntroduced: 2 },
  { word: 'they', hintZh: '整字記', phaseIntroduced: 3 },
  { word: 'one', hintZh: '整字記', phaseIntroduced: 3 },
  { word: 'are', hintZh: '整字記', phaseIntroduced: 3 },
  { word: 'come', hintZh: '整字記', phaseIntroduced: 3 },
  { word: 'some', hintZh: '整字記', phaseIntroduced: 4 },
  { word: 'have', hintZh: '整字記', phaseIntroduced: 4 },
  { word: 'what', hintZh: '整字記', phaseIntroduced: 4 },
];

export function isTrickyWord(word: string): boolean {
  return TRICKY_WORDS.some((t) => t.word === word.toLowerCase());
}

export function getTrickyWord(word: string): TrickyWord | null {
  return TRICKY_WORDS.find((t) => t.word === word.toLowerCase()) ?? null;
}

export function trickyWordsForPhase(phase: number): TrickyWord[] {
  return TRICKY_WORDS.filter((t) => t.phaseIntroduced <= phase);
}
