import { describe, expect, it } from 'vitest';
import { loadProgress, sanitizeProgress } from './migrate';
import {
  LEGACY_PROGRESS_STORAGE_KEY,
  LEGACY_PROGRESS_V4_KEY,
  LEGACY_PROGRESS_V6_KEY,
  PROGRESS_STORAGE_KEY,
} from '@/types/progress';
import { PHONICS_LESSONS } from '@/data/curriculum';
import { isLessonUnlockedFor } from './ProgressStore';
import { createDefaultProgress } from '@/types/progress';

function reader(store: Record<string, unknown>) {
  return (key: string) => (key in store ? JSON.stringify(store[key]) : null);
}

const V6 = {
  completedLessons: ['L01', 'L02', 'L03'],
  currentLessonId: 'L03',
  wordStats: { cat: { correct: 3, attempts: 3 } },
  lastPlayedAt: '2026-10-01T00:00:00.000Z',
};

describe('loadProgress：遷移', () => {
  it('沒有任何資料 → 預設進度', () => {
    const r = loadProgress(() => null);
    expect(r.source).toBe('none');
    expect(r.needsPersist).toBe(false);
    expect(r.progress.completedLessons).toEqual([]);
    expect(r.progress.review).toEqual({});
    expect(r.progress.placement).toBeNull();
  });

  it('v6 → v7：課次與單字統計原封不動，補上 review／placement', () => {
    const r = loadProgress(reader({ [LEGACY_PROGRESS_V6_KEY]: V6 }));
    expect(r.source).toBe('v6');
    expect(r.needsPersist).toBe(true);
    expect(r.progress.completedLessons).toEqual(['L01', 'L02', 'L03']);
    expect(r.progress.currentLessonId).toBe('L03');
    expect(r.progress.wordStats.cat).toEqual({ correct: 3, attempts: 3 });
    expect(r.progress.review).toEqual({});
    expect(r.progress.placement).toBeNull();
  });

  it('v7 優先於 v6', () => {
    const r = loadProgress(
      reader({
        [PROGRESS_STORAGE_KEY]: { ...V6, completedLessons: ['L01'], review: {}, placement: null },
        [LEGACY_PROGRESS_V6_KEY]: V6,
      }),
    );
    expect(r.source).toBe('v7');
    expect(r.needsPersist).toBe(false);
    expect(r.progress.completedLessons).toEqual(['L01']);
  });

  it('v5 → v7：課次 ID 轉成現行 ID，且結果都是現行課程裡存在的 ID', () => {
    const ids = PHONICS_LESSONS.map((l) => l.id);
    const r = loadProgress(
      reader({ [LEGACY_PROGRESS_STORAGE_KEY]: { ...V6, completedLessons: ['E01', 'E02', 'C01'] } }),
    );
    expect(r.source).toBe('v5');
    expect(r.progress.completedLessons.length).toBeGreaterThan(0);
    for (const id of r.progress.completedLessons) expect(ids).toContain(id);
  });

  it('v4 → v7：舊的 Hop 編號 L01–L41 強制對照，不會與現行編號混淆', () => {
    const ids = PHONICS_LESSONS.map((l) => l.id);
    const r = loadProgress(
      reader({ [LEGACY_PROGRESS_V4_KEY]: { ...V6, completedLessons: ['L01', 'L05'], currentLessonId: 'L05' } }),
    );
    expect(r.source).toBe('v4');
    for (const id of r.progress.completedLessons) expect(ids).toContain(id);
    expect(ids).toContain(r.progress.currentLessonId);
  });

  it('壞掉的 JSON 會略過，往下一個版本找', () => {
    const r = loadProgress((key) =>
      key === PROGRESS_STORAGE_KEY ? '{壞掉' : key === LEGACY_PROGRESS_V6_KEY ? JSON.stringify(V6) : null,
    );
    expect(r.source).toBe('v6');
    expect(r.progress.completedLessons).toEqual(['L01', 'L02', 'L03']);
  });

  it('完全不是物件的內容 → 預設進度，不會丟例外', () => {
    expect(sanitizeProgress('abc').completedLessons).toEqual([]);
    expect(sanitizeProgress(null).review).toEqual({});
    expect(sanitizeProgress({ completedLessons: 'x', wordStats: 5, review: 7 }).wordStats).toEqual({});
  });

  it('review 中格式不對的項目會被丟掉，合法的保留', () => {
    const p = sanitizeProgress({
      review: {
        s: { box: 3, due: '2026-11-01', seen: 2, right: 2, wrong: 0 },
        bad: { box: 3, due: 'tomorrow' },
        worse: 5,
      },
    });
    expect(Object.keys(p.review)).toEqual(['s']);
  });
});

describe('既有課次 ID 不會變（舊進度才不會失效）', () => {
  it('L01–L59 全部還在，且順序與原本一致（新課只是插進去）', () => {
    for (let n = 1; n <= 59; n++) {
      const id = `L${String(n).padStart(2, '0')}`;
      expect(PHONICS_LESSONS.map((l) => l.id)).toContain(id);
    }
    const old = PHONICS_LESSONS.filter((l) => /^L\d\d$/.test(l.id)).map((l) => l.id);
    expect(old).toEqual([...old].sort());
  });

  it('order 連續、不重複', () => {
    const orders = PHONICS_LESSONS.map((l) => l.order);
    expect(orders).toEqual(orders.map((_, i) => i + 1));
  });
});

describe('解鎖規則', () => {
  const lessons = PHONICS_LESSONS;
  const progress = (completed: string[], placement = false) => ({
    ...createDefaultProgress(),
    completedLessons: completed,
    placement: placement
      ? { takenAt: '2026-10-29T00:00:00.000Z', knownIds: [], missedIds: [], startTier: null }
      : null,
  });

  it('全新使用者：只有第一課可進（線性解鎖維持）', () => {
    const p = progress([]);
    expect(isLessonUnlockedFor(p, lessons, lessons[0].id)).toBe(true);
    expect(isLessonUnlockedFor(p, lessons, lessons[1].id)).toBe(false);
    expect(isLessonUnlockedFor(p, lessons, lessons[20].id)).toBe(false);
  });

  it('完成前一課 → 下一課解鎖', () => {
    const p = progress([lessons[0].id]);
    expect(isLessonUnlockedFor(p, lessons, lessons[1].id)).toBe(true);
    expect(isLessonUnlockedFor(p, lessons, lessons[2].id)).toBe(false);
  });

  it('舊使用者已經學到進階單元：新插進來的連音課與 -ck 課不會把他擋在外面', () => {
    const advancedFirst = lessons.find((l) => l.unitId === 'advanced')!;
    const lastOld = lessons.filter((l) => l.order < advancedFirst.order && l.unitId === 'cvc').at(-1)!;
    // 舊版：完成到 cvc 結尾 + 進階單元前幾課，但沒有連音課
    const doneOld = lessons
      .filter((l) => !/^(BL|CK)/.test(l.id) && l.order <= advancedFirst.order + 3)
      .map((l) => l.id);
    const p = progress(doneOld);
    expect(isLessonUnlockedFor(p, lessons, 'BL1')).toBe(true);
    expect(isLessonUnlockedFor(p, lessons, 'BL9')).toBe(true);
    expect(isLessonUnlockedFor(p, lessons, 'CK1')).toBe(true);
    expect(isLessonUnlockedFor(p, lessons, advancedFirst.id)).toBe(true);
    expect(lastOld).toBeTruthy();
  });

  it('做過分班測驗：全部可進，不必從 L01 開始', () => {
    const p = progress([], true);
    for (const l of lessons) expect(isLessonUnlockedFor(p, lessons, l.id)).toBe(true);
  });

  it('不存在的課不可進；dev 全開只在明確傳入時成立', () => {
    expect(isLessonUnlockedFor(progress([]), lessons, 'ZZZ')).toBe(false);
    expect(isLessonUnlockedFor(progress([]), lessons, lessons[10].id, true)).toBe(true);
  });
});
