import { describe, expect, it } from 'vitest';
import { isWeakWord, prioritizeWeakWords } from './wordStats';

describe('wordStats', () => {
  it('沒紀錄、全對的字不算弱', () => {
    expect(isWeakWord(undefined)).toBe(false);
    expect(isWeakWord({ attempts: 3, correct: 3 })).toBe(false);
  });
  it('正確率低於 70% 算弱', () => {
    expect(isWeakWord({ attempts: 2, correct: 1 })).toBe(true);
    expect(isWeakWord({ attempts: 1, correct: 0 })).toBe(true);
  });
  it('弱的字排前面，其餘維持原順序', () => {
    const stats = { cat: { attempts: 2, correct: 2 }, hat: { attempts: 2, correct: 0 } };
    expect(prioritizeWeakWords(['bat', 'cat', 'hat', 'mat'], stats)).toEqual([
      'hat',
      'bat',
      'cat',
      'mat',
    ]);
  });
});
