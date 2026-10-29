import { describe, expect, it } from 'vitest';
import { TEXT_ITEMS, type SentenceItem, type WordItem } from '@/data/recall/textItems';
import { seededRng } from './quiz';
import {
  TEXT_OPTION_COUNT,
  defaultTextMode,
  makeTextQuestion,
  retryTextQuestion,
} from './textQuiz';

const WORDS = TEXT_ITEMS.filter((t): t is WordItem => t.kind === 'word');
const SENTENCES = TEXT_ITEMS.filter((t): t is SentenceItem => t.kind === 'sentence');

describe('特殊字題目', () => {
  it('hear／sound 都是 4 個互不重複的選項，正解剛好出現一次', () => {
    for (const w of WORDS) {
      for (const mode of ['hear', 'sound'] as const) {
        for (let seed = 1; seed <= 20; seed++) {
          const q = makeTextQuestion(w, mode, seededRng(seed), TEXT_ITEMS);
          expect(q.mode).toBe(mode);
          expect(q.options).toHaveLength(TEXT_OPTION_COUNT);
          const ids = q.options.map((o) => o.id);
          expect(new Set(ids).size).toBe(TEXT_OPTION_COUNT);
          expect(ids.filter((id) => id === q.answerId)).toHaveLength(1);
          expect(q.answerId).toBe(w.word);
        }
      }
    }
  });

  it('沒給選項池也湊得滿 4 個（用簡單字補）', () => {
    const q = makeTextQuestion(WORDS[0], 'hear', seededRng(3));
    expect(q.options).toHaveLength(TEXT_OPTION_COUNT);
  });

  it('題目物件只帶選項與正解 id，不會有可以直接看出答案的欄位', () => {
    const q = makeTextQuestion(WORDS[0], 'hear', seededRng(3), TEXT_ITEMS);
    expect(Object.keys(q).sort()).toEqual(['answerId', 'itemId', 'kind', 'mode', 'options']);
    expect(q.options.every((o) => Object.keys(o).sort().join() === 'id,label')).toBe(true);
  });

  it('正解位置會隨機，不會永遠在同一格', () => {
    const positions = new Set<number>();
    for (let seed = 1; seed <= 40; seed++) {
      const q = makeTextQuestion(WORDS[0], 'hear', seededRng(seed), TEXT_ITEMS);
      positions.add(q.options.findIndex((o) => o.id === q.answerId));
    }
    expect(positions.size).toBeGreaterThan(1);
  });

  it('同樣的亂數種子出同樣的題目', () => {
    const a = makeTextQuestion(WORDS[1], 'sound', seededRng(9), TEXT_ITEMS);
    const b = makeTextQuestion(WORDS[1], 'sound', seededRng(9), TEXT_ITEMS);
    expect(a).toEqual(b);
  });

  it('以 the 為例：干擾項優先是長得像的字', () => {
    const the = WORDS.find((w) => w.word === 'the') as WordItem;
    const q = makeTextQuestion(the, 'hear', seededRng(5), TEXT_ITEMS);
    const wrong = q.options.map((o) => o.id).filter((id) => id !== 'the');
    expect(wrong.some((w) => ['then', 'they', 'this', 'she'].includes(w))).toBe(true);
  });

  it('預設題型：特殊字輪流 hear／sound，短句固定填空', () => {
    expect(defaultTextMode(WORDS[0], 0)).toBe('hear');
    expect(defaultTextMode(WORDS[0], 1)).toBe('sound');
    expect(defaultTextMode(SENTENCES[0], 1)).toBe('cloze');
  });

  it('重考換題型：hear ↔ sound', () => {
    const q = makeTextQuestion(WORDS[0], 'hear', seededRng(1), TEXT_ITEMS);
    expect(retryTextQuestion(WORDS[0], q, seededRng(2), TEXT_ITEMS).mode).toBe('sound');
    const s = makeTextQuestion(WORDS[0], 'sound', seededRng(1), TEXT_ITEMS);
    expect(retryTextQuestion(WORDS[0], s, seededRng(2), TEXT_ITEMS).mode).toBe('hear');
  });
});

describe('短句填空題', () => {
  it('每一句、每個種子：4 個互不重複的選項，正解是句子裡被挖掉的字', () => {
    for (const s of SENTENCES) {
      for (let seed = 1; seed <= 30; seed++) {
        const q = makeTextQuestion(s, 'cloze', seededRng(seed), TEXT_ITEMS);
        expect(q.mode).toBe('cloze');
        expect(q.options).toHaveLength(TEXT_OPTION_COUNT);
        expect(new Set(q.options.map((o) => o.id)).size).toBe(TEXT_OPTION_COUNT);
        const blank = q.blankIndex as number;
        expect(q.answerId).toBe(s.words[blank].toLowerCase());
        expect(q.options.filter((o) => o.id === q.answerId)).toHaveLength(1);
      }
    }
  });

  it('干擾字不會是句子裡本來就有的字（不會出現第二個說得通的答案）', () => {
    for (const s of SENTENCES) {
      const inSentence = new Set(s.words.map((w) => w.toLowerCase()));
      for (let seed = 1; seed <= 30; seed++) {
        const q = makeTextQuestion(s, 'cloze', seededRng(seed), TEXT_ITEMS);
        for (const o of q.options) {
          if (o.id !== q.answerId) expect(inSentence.has(o.id), `${s.id}:${o.id}`).toBe(false);
        }
      }
    }
  });

  it('挖空偏好 3 個字母以上的字；句首的字選項會大寫', () => {
    const s = SENTENCES.find((x) => x.text === 'Fun in the sun.') as SentenceItem;
    const blanks = new Set<number>();
    for (let seed = 1; seed <= 40; seed++) {
      const q = makeTextQuestion(s, 'cloze', seededRng(seed), TEXT_ITEMS);
      blanks.add(q.blankIndex as number);
      expect(s.words[q.blankIndex as number].length).toBeGreaterThanOrEqual(3);
      if (q.blankIndex === 0) expect(q.options.every((o) => /^[A-Z]/.test(o.label))).toBe(true);
    }
    expect(blanks.size).toBeGreaterThan(1);
  });

  it('重考換一個空格', () => {
    const s = SENTENCES.find((x) => x.text === 'Fun in the sun.') as SentenceItem;
    for (let seed = 1; seed <= 20; seed++) {
      const q = makeTextQuestion(s, 'cloze', seededRng(seed), TEXT_ITEMS);
      const again = retryTextQuestion(s, q, seededRng(seed + 100), TEXT_ITEMS);
      expect(again.blankIndex).not.toBe(q.blankIndex);
      expect(again.mode).toBe('cloze');
    }
  });

  it('沒給選項池也能出題', () => {
    const q = makeTextQuestion(SENTENCES[0], 'cloze', seededRng(1));
    expect(q.options).toHaveLength(TEXT_OPTION_COUNT);
  });
});
