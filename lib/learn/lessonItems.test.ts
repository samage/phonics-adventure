import { describe, expect, it } from 'vitest';
import { PHONICS_LESSONS } from '@/data/curriculum';
import { RECALL_ITEMS } from '@/data/recall/items';
import { TEXT_ITEMS } from '@/data/recall/textItems';
import { createDefaultProgress } from '@/types/progress';
import {
  MIN_QUIZ_POOL,
  learnedItems,
  learnedTextItems,
  lessonDueCount,
  lessonIdForRecallItem,
  quizPoolForLesson,
  quizTextPoolForLesson,
  recallItemsForLesson,
  reviewItemsForLesson,
  textItemsForLesson,
} from './lessonItems';

const lesson = (id: string) => PHONICS_LESSONS.find((l) => l.id === id)!;
const ids = (items: { id: string }[]) => items.map((i) => i.id);

describe('recallItemsForLesson', () => {
  it('字母課 → 該字母', () => {
    expect(ids(recallItemsForLesson(lesson('L01')))).toEqual(['s']);
    expect(ids(recallItemsForLesson(lesson('L02')))).toEqual(['a']);
  });

  it('雙字母、-ck 課', () => {
    expect(ids(recallItemsForLesson(lesson('L22')))).toEqual(['sh']);
    expect(ids(recallItemsForLesson(lesson('CK1')))).toEqual(['ck']);
  });

  it('一課教多個拼法 → 全部都列出（ai／ay／a-e）', () => {
    const got = ids(recallItemsForLesson(lesson('L27')));
    expect(got).toEqual(expect.arrayContaining(['ai', 'ay', 'a-e']));
  });

  it('連音課 → 該課的連音項目，且每個連音項目都歸屬某一課', () => {
    const bl1 = recallItemsForLesson(lesson('BL1'));
    expect(bl1.length).toBeGreaterThan(0);
    expect(bl1.every((i) => i.category === 'blends')).toBe(true);
    for (const it of RECALL_ITEMS.filter((i) => i.category === 'blends')) {
      expect(lessonIdForRecallItem(it.id), it.id).toMatch(/^BL\d$/);
    }
  });

  it('句子課、特殊字課沒有項目', () => {
    for (const l of PHONICS_LESSONS) {
      const type = l.activities[0]?.type;
      if (type === 'sight_word' || type === 'decodable_sentences') {
        expect(recallItemsForLesson(l)).toEqual([]);
      }
    }
  });
});

describe('lessonIdForRecallItem', () => {
  it('反查課次；沒有專屬課的項目回傳 null', () => {
    expect(lessonIdForRecallItem('s')).toBe('L01');
    expect(lessonIdForRecallItem('sh')).toBe('L22');
    expect(lessonIdForRecallItem('x')).toBeNull();
  });

  it('除了 x 之外，每個項目都能對到一個存在的課', () => {
    const lessonIds = new Set(PHONICS_LESSONS.map((l) => l.id));
    for (const it of RECALL_ITEMS) {
      if (it.id === 'x') continue;
      const id = lessonIdForRecallItem(it.id);
      expect(id, it.id).not.toBeNull();
      expect(lessonIds.has(id as string)).toBe(true);
    }
  });
});

describe('learnedItems', () => {
  it('全新使用者：沒有學過的項目', () => {
    expect(learnedItems(createDefaultProgress())).toEqual([]);
  });

  it('完成課 + 複習表已有紀錄的項目', () => {
    const p = {
      ...createDefaultProgress(),
      completedLessons: ['L01'],
      review: { m: { box: 1 as const, due: '2026-10-29', seen: 1, right: 0, wrong: 1 } },
    };
    expect(ids(learnedItems(p)).sort()).toEqual(['m', 's']);
  });

  it('做過分班測驗 → 全部項目', () => {
    const p = {
      ...createDefaultProgress(),
      placement: { takenAt: '2026-10-29T00:00:00.000Z', knownIds: [], missedIds: [], startTier: null },
    };
    expect(learnedItems(p).length).toBe(RECALL_ITEMS.length);
  });
});

describe('quizPoolForLesson', () => {
  it('第一課：自己 + 用基本字母音補滿到最低數量', () => {
    const pool = quizPoolForLesson(lesson('L01'), {});
    expect(ids(pool)).toContain('s');
    expect(pool.length).toBe(MIN_QUIZ_POOL);
  });

  it('後面的課：只包含這一課以前教過的項目（不會出現還沒教的進階字母）', () => {
    const pool = quizPoolForLesson(lesson('L22'), {});
    const order = lesson('L22').order;
    for (const it of pool) {
      const lid = lessonIdForRecallItem(it.id);
      const o = PHONICS_LESSONS.find((l) => l.id === lid)?.order ?? 0;
      expect(o, it.id).toBeLessThanOrEqual(order);
    }
    expect(ids(pool)).toContain('sh');
    expect(ids(pool)).not.toContain('oi');
  });

  it('複習表裡已有紀錄的項目（例如分班測驗已會）也能當干擾選項', () => {
    const pool = quizPoolForLesson(lesson('L01'), {
      oi: { box: 3, due: '2026-11-01', seen: 1, right: 1, wrong: 0 },
    });
    expect(ids(pool)).toContain('oi');
  });
});

describe('lessonDueCount', () => {
  it('只算這一課教的項目、且今天到期的', () => {
    const review = {
      s: { box: 1 as const, due: '2026-10-29', seen: 1, right: 0, wrong: 1 },
      a: { box: 3 as const, due: '2026-11-05', seen: 1, right: 1, wrong: 0 },
    };
    expect(lessonDueCount(lesson('L01'), review, '2026-10-29')).toBe(1);
    expect(lessonDueCount(lesson('L02'), review, '2026-10-29')).toBe(0);
  });
});

describe('特殊字／短句課的複習項目', () => {
  it('特殊字課 → 該課的字；短句課 → 該課的每一句；字母課 → 沒有', () => {
    expect(ids(textItemsForLesson(lesson('L21')))).toEqual(['w:the', 'w:said', 'w:was']);
    expect(ids(textItemsForLesson(lesson('L20')))).toEqual(['s:L20:0', 's:L20:1', 's:L20:2']);
    expect(textItemsForLesson(lesson('L01'))).toEqual([]);
    expect(ids(reviewItemsForLesson(lesson('L01')))).toEqual(['s']);
    expect(ids(reviewItemsForLesson(lesson('L21')))).toEqual(['w:the', 'w:said', 'w:was']);
  });

  it('每個特殊字課、短句課都至少有一個項目，且每個項目都能反查到課', () => {
    for (const l of PHONICS_LESSONS) {
      const type = l.activities[0]?.type;
      if (type === 'sight_word' || type === 'decodable_sentences') {
        expect(textItemsForLesson(l).length, l.id).toBeGreaterThan(0);
      }
    }
    for (const t of TEXT_ITEMS) expect(lessonIdForRecallItem(t.id)).toBe(t.lessonId);
  });

  it('learnedTextItems：完成的課教的項目 + 複習表已有紀錄的；分班測驗不會讓它們全部解鎖', () => {
    expect(learnedTextItems(createDefaultProgress())).toEqual([]);
    const p = {
      ...createDefaultProgress(),
      completedLessons: ['L21'],
      review: { 's:L20:0': { box: 1 as const, due: '2026-10-29', seen: 1, right: 0, wrong: 1 } },
      placement: { takenAt: '2026-10-29T00:00:00.000Z', knownIds: [], missedIds: [], startTier: null },
    };
    expect(ids(learnedTextItems(p)).sort()).toEqual(['s:L20:0', 'w:said', 'w:the', 'w:was']);
  });

  it('quizTextPoolForLesson：這一課以前（含這一課）教的 + 複習表已有的，不含還沒教的', () => {
    const pool = ids(quizTextPoolForLesson(lesson('L21'), {}));
    expect(pool).toEqual(expect.arrayContaining(['w:the', 'w:said', 'w:was', 's:L20:0']));
    expect(pool).not.toContain('w:they');
    expect(pool).not.toContain('s:L60:0');
    const withReview = ids(
      quizTextPoolForLesson(lesson('L21'), {
        'w:they': { box: 3, due: '2026-11-01', seen: 1, right: 1, wrong: 0 },
      }),
    );
    expect(withReview).toContain('w:they');
  });

  it('lessonDueCount 也會算特殊字課、短句課的項目', () => {
    const review = {
      'w:the': { box: 1 as const, due: '2026-10-29', seen: 1, right: 0, wrong: 1 },
      'w:said': { box: 3 as const, due: '2026-11-05', seen: 1, right: 1, wrong: 0 },
      's:L20:2': { box: 2 as const, due: '2026-10-28', seen: 1, right: 1, wrong: 0 },
    };
    expect(lessonDueCount(lesson('L21'), review, '2026-10-29')).toBe(1);
    expect(lessonDueCount(lesson('L20'), review, '2026-10-29')).toBe(1);
  });
});
