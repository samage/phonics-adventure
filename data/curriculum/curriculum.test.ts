import { describe, expect, it } from 'vitest';
import { PHONICS_LESSONS, UNITS } from './phonicsCurriculum';
import { BLEND_LESSONS } from '@/data/blends';
import { parseWordToBlocks } from '@/utils/phonicsEngine';
import { getGraphemePhonics } from '@/data/graphemePhonics';
import { RECALL_ITEMS } from '@/data/recall/items';
import { resolveHopClips } from '@/lib/phonemeClips';

describe('課程結構', () => {
  it('課次 id 不重複', () => {
    const ids = PHONICS_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每一課的單元都存在，且單元內的課連續', () => {
    const unitIds = new Set(UNITS.map((u) => u.id));
    for (const l of PHONICS_LESSONS) expect(unitIds.has(l.unitId)).toBe(true);
    for (const u of UNITS) {
      const orders = PHONICS_LESSONS.filter((l) => l.unitId === u.id).map((l) => l.order);
      expect(orders.length).toBeGreaterThan(0);
      expect(orders[orders.length - 1] - orders[0]).toBe(orders.length - 1);
    }
  });

  it('單元順序：入門 → 讀字 → 連音 → 進階 → 替代拼法', () => {
    expect(UNITS.map((u) => u.id)).toEqual(['start', 'cvc', 'blends', 'advanced', 'alt_spellings']);
  });
});

describe('連音單元', () => {
  const blendLessons = PHONICS_LESSONS.filter((l) => l.unitId === 'blends');

  it('有 9 課，ID 固定為 BL1–BL9', () => {
    expect(blendLessons.map((l) => l.id)).toEqual(BLEND_LESSONS.map((b) => b.id));
    expect(blendLessons).toHaveLength(9);
  });

  it('每個例字都以該課的某個連音出現，且拆出的積木接起來等於原字', () => {
    for (const def of BLEND_LESSONS) {
      for (const w of def.words) {
        const blocks = parseWordToBlocks(w);
        expect(blocks.map((b) => b.text).join(''), w).toBe(w);
        expect(
          def.blends.some((b) => w.includes(b)),
          `${w} 應含 ${def.blends.join('/')}`,
        ).toBe(true);
      }
    }
  });

  it('三字母連音當成單一積木', () => {
    expect(parseWordToBlocks('strap').map((b) => b.text)).toEqual(['str', 'a', 'p']);
    expect(parseWordToBlocks('split')[0].text).toBe('spl');
  });

  it('連音例字都是規則字：只有短母音（不含長母音組、不規則字）', () => {
    for (const def of BLEND_LESSONS) {
      for (const w of def.words) {
        const types = parseWordToBlocks(w).map((b) => b.type);
        expect(types, w).not.toContain('long_vowel');
        expect(types, w).not.toContain('r_controlled');
      }
    }
  });
});

describe('進階單元一開始用規則字', () => {
  const wordsOf = (id: string) => PHONICS_LESSONS.find((l) => l.id === id)!.words ?? [];

  it('sh／ch／ng 的例字都是規則字', () => {
    const adv = PHONICS_LESSONS.filter((l) => l.unitId === 'advanced').slice(0, 5);
    const patternKeys = adv.map((l) => {
      const c = l.activities[0].content;
      return c.kind === 'grapheme' ? c.patternKey : '';
    });
    expect(patternKeys.slice(0, 2)).toEqual(['hop_sh_ch_ti', 'hop_ch_tch_ture']);
    for (const l of adv.slice(0, 2)) {
      for (const w of l.words ?? []) {
        expect(['machine', 'station', 'future', 'watch']).not.toContain(w);
      }
    }
  });

  it('-ck 是獨立一課，緊接在 ch 之後', () => {
    const ck = PHONICS_LESSONS.find((l) => l.id === 'CK1')!;
    expect(ck).toBeTruthy();
    const ch = PHONICS_LESSONS.find((l) => {
      const c = l.activities[0].content;
      return c.kind === 'grapheme' && c.patternKey === 'hop_ch_tch_ture';
    })!;
    expect(ck.order).toBe(ch.order + 1);
    expect(wordsOf('CK1').every((w) => w.endsWith('ck'))).toBe(true);
    expect(getGraphemePhonics('hop_ck')).not.toBeNull();
    expect(resolveHopClips('hop_ck')).toEqual(['k']);
  });
});

describe('每一課的例字都拆得回原字', () => {
  it('所有課程單字', () => {
    for (const l of PHONICS_LESSONS) {
      for (const w of l.words ?? []) {
        const joined = parseWordToBlocks(w).map((b) => b.text).join('');
        expect(joined, `${l.id} ${w}`).toBe(w.toLowerCase().replace(/[^a-z]/g, ''));
      }
    }
  });
});

describe('複習項目與課程', () => {
  it('連音複習項目都有對應的連音課', () => {
    const lessonBlends = new Set(BLEND_LESSONS.flatMap((b) => b.blends));
    for (const it of RECALL_ITEMS.filter((i) => i.category === 'blends')) {
      expect(lessonBlends.has(it.id), it.id).toBe(true);
    }
  });
});
