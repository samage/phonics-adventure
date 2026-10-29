import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RECALL_ITEMS } from '@/data/recall/items';
import { blendLetterKeys, resolveRecallAudioUrl } from './audio';

const publicFile = (url: string) => join(process.cwd(), 'public', url);

describe('每個字素項目都有可播放的預錄音檔', () => {
  for (const item of RECALL_ITEMS) {
    it(`${item.id} (${item.audio})`, () => {
      if (item.audio.startsWith('blend:')) {
        const letters = blendLetterKeys(item.audio);
        expect(letters.join('')).toBe(item.display);
        for (const l of letters) {
          const url = resolveRecallAudioUrl(l);
          expect(url, `blend 字母 ${l}`).not.toBeNull();
          expect(existsSync(publicFile(url as string))).toBe(true);
        }
      } else {
        const url = resolveRecallAudioUrl(item.audio);
        expect(url).not.toBeNull();
        expect(existsSync(publicFile(url as string)), url as string).toBe(true);
      }
    });
  }

  it('ck 借用 k 的音檔', () => {
    expect(resolveRecallAudioUrl('ck')).toBe(resolveRecallAudioUrl('k'));
  });
});
