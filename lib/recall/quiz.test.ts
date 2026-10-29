import { describe, expect, it } from 'vitest';
import {
  CONFUSION_GROUPS,
  RECALL_ITEMS,
  RECALL_ITEM_MAP,
} from '@/data/recall/items';
import {
  OPTION_COUNT,
  buildQuiz,
  makeQuestion,
  pickDistractors,
  seededRng,
  wordContainsGrapheme,
  wordHasSoundOf,
  type QuizMode,
} from './quiz';

const MODES: QuizMode[] = ['sound', 'word', 'hear'];

describe('資料完整性', () => {
  it('項目 id 唯一，且都有音檔與例字', () => {
    const ids = RECALL_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const it of RECALL_ITEMS) {
      expect(it.audio.length).toBeGreaterThan(0);
      expect(it.words.length).toBeGreaterThanOrEqual(2);
      for (const w of it.words) {
        expect(wordContainsGrapheme(w, it.display), `${it.id}: ${w}`).toBe(true);
      }
    }
  });

  it('混淆組只引用存在的項目', () => {
    for (const group of CONFUSION_GROUPS) {
      for (const id of group) expect(RECALL_ITEM_MAP[id], id).toBeDefined();
    }
  });
});

describe('wordContainsGrapheme', () => {
  it('Magic E 以「母音 + 子音 + e」判斷', () => {
    expect(wordContainsGrapheme('cake', 'a-e')).toBe(true);
    expect(wordContainsGrapheme('cat', 'a-e')).toBe(false);
    expect(wordContainsGrapheme('apple', 'a-e')).toBe(false);
  });
  it('一般字母組合以子字串判斷', () => {
    expect(wordContainsGrapheme('ship', 'sh')).toBe(true);
    expect(wordContainsGrapheme('sit', 'sh')).toBe(false);
  });
});

describe('題目不洩題、答案唯一', () => {
  it('每個項目 × 每種題型 × 多組亂數：4 個選項、soundId 互異、含正解', () => {
    for (const target of RECALL_ITEMS) {
      for (const mode of MODES) {
        for (let seed = 1; seed <= 25; seed++) {
          const q = makeQuestion(target, mode, seededRng(seed * 7919 + target.id.length));
          const tag = `${target.id}/${mode}/${seed}`;
          expect(q.options, tag).toHaveLength(OPTION_COUNT);
          expect(q.answerId).toBe(target.id);
          const ids = q.options.map((o) => o.id);
          expect(new Set(ids).size, tag).toBe(OPTION_COUNT);
          expect(ids, tag).toContain(target.id);

          const sounds = ids.map((id) => RECALL_ITEM_MAP[id]!.soundId);
          expect(new Set(sounds).size, `${tag} 同音選項`).toBe(OPTION_COUNT);
        }
      }
    }
  });

  it('選例字：干擾例字不含題目聲音的任何拼法，正解例字一定含', () => {
    for (const target of RECALL_ITEMS) {
      for (let seed = 1; seed <= 25; seed++) {
        const q = makeQuestion(target, 'word', seededRng(seed * 31 + 5));
        for (const o of q.options) {
          const has = wordHasSoundOf(o.label as string, target);
          if (o.id === target.id) {
            expect(wordContainsGrapheme(o.label as string, target.display)).toBe(true);
          } else {
            expect(has, `${target.id} vs ${o.label}`).toBe(false);
          }
        }
      }
    }
  });

  it('聽音選字：不會出現兩個相同字形（th 清濁只出現一個）', () => {
    for (const target of RECALL_ITEMS) {
      for (let seed = 1; seed <= 25; seed++) {
        const q = makeQuestion(target, 'hear', seededRng(seed * 13 + 1));
        const displays = q.options.map((o) => RECALL_ITEM_MAP[o.id]!.display);
        expect(new Set(displays).size, target.id).toBe(OPTION_COUNT);
      }
    }
  });

  it('選項物件不帶「是否正確」之類的欄位；sound 題不顯示任何文字', () => {
    const q = makeQuestion(RECALL_ITEM_MAP['sh']!, 'sound', seededRng(1));
    for (const o of q.options) {
      expect(Object.keys(o).sort()).toEqual(['audio', 'id', 'label']);
      expect(o.label).toBeNull();
      expect(o.audio).toBeTruthy();
    }
  });

  it('正解位置大致平均分布在四個位置（不固定在某格）', () => {
    const counts = [0, 0, 0, 0];
    const target = RECALL_ITEM_MAP['a']!;
    for (let seed = 1; seed <= 400; seed++) {
      const q = makeQuestion(target, 'sound', seededRng(seed));
      counts[q.options.findIndex((o) => o.id === q.answerId)]!++;
    }
    for (const c of counts) {
      expect(c).toBeGreaterThan(60);
      expect(c).toBeLessThan(140);
    }
  });
});

describe('干擾選項來自容易混淆的組別', () => {
  it('b 的干擾項至少一個是 d 或 p（多數亂數下）', () => {
    let hit = 0;
    for (let seed = 1; seed <= 50; seed++) {
      const d = pickDistractors(RECALL_ITEM_MAP['b']!, 'sound', 3, seededRng(seed));
      if (d.some((x) => x.id === 'd' || x.id === 'p')) hit++;
    }
    expect(hit).toBe(50);
  });

  it('sh 的干擾項一定包含 ch；ai 不會出現同音的 ay／a-e', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const d = pickDistractors(RECALL_ITEM_MAP['sh']!, 'sound', 3, seededRng(seed));
      expect(d.map((x) => x.id)).toContain('ch');
      const d2 = pickDistractors(RECALL_ITEM_MAP['ai']!, 'sound', 3, seededRng(seed));
      const ids = d2.map((x) => x.id);
      expect(ids).not.toContain('ay');
      expect(ids).not.toContain('a-e');
    }
  });

  it('th 清音的題目不會出現 th 濁音以外的同字形重複（hear 模式）', () => {
    const d = pickDistractors(RECALL_ITEM_MAP['th_voiceless']!, 'hear', 3, seededRng(3));
    expect(d.map((x) => x.id)).not.toContain('th_voiced');
  });

  it('ck 的選例字題不會出現含 /k/ 的 skip／kit 之類', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const q = makeQuestion(RECALL_ITEM_MAP['ck']!, 'word', seededRng(seed));
      for (const o of q.options) {
        if (o.id === 'ck') continue;
        expect(/[ck]/.test(o.label as string), o.label as string).toBe(false);
      }
    }
  });
});

describe('buildQuiz', () => {
  it('每個目標一題，題型輪流', () => {
    const targets = RECALL_ITEMS.slice(0, 9);
    const quiz = buildQuiz(targets, seededRng(9));
    expect(quiz).toHaveLength(9);
    expect(quiz.map((q) => q.itemId)).toEqual(targets.map((t) => t.id));
    expect(new Set(quiz.map((q) => q.mode)).size).toBe(3);
  });
});
