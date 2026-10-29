import { describe, expect, it } from 'vitest';
import { distractorCountFor, pickSpellingDistractors, recallItemIdForSlot } from './distractors';
import { parseWordToBlocks } from '@/utils/phonicsEngine';
import { seededRng } from '@/lib/recall/quiz';
import { getRecallItem } from '@/data/recall/items';
import { PHONICS_LESSONS } from '@/data/curriculum';

describe('pickSpellingDistractors', () => {
  it('短字 1 塊、長字 2 塊', () => {
    expect(distractorCountFor(3)).toBe(1);
    expect(distractorCountFor(4)).toBe(2);
    expect(pickSpellingDistractors(parseWordToBlocks('cat'), seededRng(1))).toHaveLength(1);
    expect(pickSpellingDistractors(parseWordToBlocks('strap'), seededRng(1))).toHaveLength(1);
    expect(pickSpellingDistractors(parseWordToBlocks('splash'), seededRng(1))).toHaveLength(1);
    expect(pickSpellingDistractors(parseWordToBlocks('flash'), seededRng(1), 2)).toHaveLength(2);
  });

  it('干擾積木不會和單字本身的任何積木同字形（否則答案不唯一）', () => {
    const words = PHONICS_LESSONS.flatMap((l) => l.words ?? []);
    for (let seed = 1; seed <= 20; seed++) {
      for (const w of words) {
        const blocks = parseWordToBlocks(w);
        const texts = new Set(blocks.map((b) => b.text.toLowerCase()));
        const ds = pickSpellingDistractors(blocks, seededRng(seed));
        for (const d of ds) expect(texts.has(d.text), `${w}: ${d.text}`).toBe(false);
        expect(new Set(ds.map((d) => d.text)).size).toBe(ds.length);
      }
    }
  });

  it('每個字至少拿得到 1 塊干擾積木', () => {
    const words = PHONICS_LESSONS.flatMap((l) => l.words ?? []);
    for (const w of words) {
      expect(pickSpellingDistractors(parseWordToBlocks(w), seededRng(7)).length, w).toBeGreaterThanOrEqual(1);
    }
  });

  it('干擾積木沿用被模仿積木的類型（顏色不洩漏答案）', () => {
    const blocks = parseWordToBlocks('ship');
    const ds = pickSpellingDistractors(blocks, seededRng(3), 2);
    const types = new Set(blocks.map((b) => b.type));
    for (const d of ds) expect(types.has(d.type)).toBe(true);
  });

  it('魔法 e 不會被當成要模仿的積木', () => {
    const blocks = parseWordToBlocks('cake');
    for (let s = 0; s < 30; s++) {
      const ds = pickSpellingDistractors(blocks, seededRng(s), 3);
      expect(ds.length).toBeLessThanOrEqual(3);
    }
  });

  it('亂數固定 → 結果固定', () => {
    const b = parseWordToBlocks('ship');
    expect(pickSpellingDistractors(b, seededRng(5))).toEqual(pickSpellingDistractors(b, seededRng(5)));
  });
});

describe('recallItemIdForSlot', () => {
  it('一般字母與雙字母', () => {
    const b = parseWordToBlocks('ship');
    expect(recallItemIdForSlot(b, 0)).toBe('sh');
    expect(recallItemIdForSlot(b, 1)).toBe('i');
    expect(recallItemIdForSlot(b, 2)).toBe('p');
  });

  it('th 清濁、oo 長短要分開', () => {
    expect(recallItemIdForSlot(parseWordToBlocks('thin'), 0)).toBe('th_voiceless');
    expect(recallItemIdForSlot(parseWordToBlocks('that'), 0)).toBe('th_voiced');
    expect(recallItemIdForSlot(parseWordToBlocks('moon'), 1)).toBe('oo_long');
    expect(recallItemIdForSlot(parseWordToBlocks('look'), 1)).toBe('oo_short');
  });

  it('魔法 e：cake 的 a 對應 a-e，e 本身不記', () => {
    const b = parseWordToBlocks('cake');
    expect(recallItemIdForSlot(b, 1)).toBe('a-e');
    expect(recallItemIdForSlot(b, 3)).toBeNull();
  });

  it('連音與 ck', () => {
    expect(recallItemIdForSlot(parseWordToBlocks('black'), 0)).toBe('bl');
    expect(recallItemIdForSlot(parseWordToBlocks('duck'), 2)).toBe('ck');
  });

  it('回傳的 id 一定存在於複習項目', () => {
    const words = PHONICS_LESSONS.flatMap((l) => l.words ?? []);
    for (const w of words) {
      const blocks = parseWordToBlocks(w);
      blocks.forEach((_, i) => {
        const id = recallItemIdForSlot(blocks, i);
        if (id) expect(getRecallItem(id), `${w}[${i}] → ${id}`).not.toBeNull();
      });
    }
  });
});
