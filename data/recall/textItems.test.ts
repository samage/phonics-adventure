import { describe, expect, it } from 'vitest';
import { PHONICS_LESSONS } from '@/data/curriculum';
import { RECALL_ITEMS } from '@/data/recall/items';
import { TEXT_ITEMS, getTextItem, isTextItem, sentenceWords } from './textItems';

describe('特殊字／短句複習項目', () => {
  it('有項目，id 全部唯一，且不會和字母項目的 id 撞在一起', () => {
    expect(TEXT_ITEMS.length).toBeGreaterThan(0);
    const ids = TEXT_ITEMS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    const recallIds = new Set(RECALL_ITEMS.map((r) => r.id));
    for (const id of ids) expect(recallIds.has(id), id).toBe(false);
  });

  it('id 格式：特殊字 w:單字、短句 s:課次:第幾句', () => {
    for (const t of TEXT_ITEMS) {
      if (t.kind === 'word') expect(t.id).toBe(`w:${t.word}`);
      else expect(t.id).toMatch(/^s:[A-Z0-9]+:\d+$/);
    }
  });

  it('每個特殊字課的字、每個短句課的句子都有對應項目（同一個字只算一次）', () => {
    for (const lesson of PHONICS_LESSONS) {
      const c = lesson.activities[0]?.content;
      if (c?.kind === 'sight_word') {
        for (const w of c.words) expect(getTextItem(`w:${w.toLowerCase()}`), w).not.toBeNull();
      } else if (c?.kind === 'decodable_sentences') {
        c.sentences.forEach((s, i) => {
          const item = getTextItem(`s:${lesson.id}:${i}`);
          expect(item?.kind).toBe('sentence');
          expect(item && item.kind === 'sentence' && item.text).toBe(s);
        });
      }
    }
  });

  it('每個項目的 lessonId 都是存在的課', () => {
    const ids = new Set(PHONICS_LESSONS.map((l) => l.id));
    for (const t of TEXT_ITEMS) expect(ids.has(t.lessonId), t.id).toBe(true);
  });

  it('sentenceWords 去掉標點、保留大小寫', () => {
    expect(sentenceWords('Fun in the sun.')).toEqual(['Fun', 'in', 'the', 'sun']);
    expect(sentenceWords('Hi, you!')).toEqual(['Hi', 'you']);
  });

  it('isTextItem 分得出字母項目和文字項目；找不到的 id 回傳 null', () => {
    expect(isTextItem(TEXT_ITEMS[0])).toBe(true);
    expect(isTextItem(RECALL_ITEMS[0])).toBe(false);
    expect(getTextItem('nope')).toBeNull();
  });
});
