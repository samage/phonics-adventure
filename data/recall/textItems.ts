/**
 * 特殊字與短句的複習項目（和 data/recall/items.ts 的字母項目放進同一份 Leitner 複習表）。
 *
 * - 特殊字（sight word）：一個字 = 一個項目，id 為「w:單字」，例如 w:the。
 *   同一個字出現在哪一課都只算一個項目。
 * - 短句：一句 = 一個項目，id 為「s:課次:第幾句」，例如 s:L10:0。
 *   課次 ID 和句子順序都不會變動，所以舊的複習紀錄不會失效。
 *
 * 項目是從課程資料推出來的，課程裡新增特殊字或句子就會自動多出複習項目。
 */

import { PHONICS_LESSONS } from '@/data/curriculum';
import { getTrickyWord } from '@/data/trickyWords';

export interface WordItem {
  kind: 'word';
  /** w:單字 */
  id: string;
  word: string;
  /** 一句中文提示 */
  hint: string;
  lessonId: string;
}

export interface SentenceItem {
  kind: 'sentence';
  /** s:課次:第幾句 */
  id: string;
  text: string;
  /** 句子裡的字（去掉標點，保留原本大小寫） */
  words: string[];
  lessonId: string;
}

export type TextItem = WordItem | SentenceItem;

/** 把句子拆成字（去掉標點） */
export function sentenceWords(text: string): string[] {
  return text
    .replace(/[.!?,]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function build(): TextItem[] {
  const out: TextItem[] = [];
  const seenWords = new Set<string>();
  for (const lesson of PHONICS_LESSONS) {
    const c = lesson.activities[0]?.content;
    if (!c) continue;
    if (c.kind === 'sight_word') {
      for (const raw of c.words) {
        const word = raw.toLowerCase();
        if (seenWords.has(word)) continue;
        seenWords.add(word);
        out.push({
          kind: 'word',
          id: `w:${word}`,
          word,
          hint: getTrickyWord(word)?.hintZh ?? '整字記，不要拆開唸',
          lessonId: lesson.id,
        });
      }
    } else if (c.kind === 'decodable_sentences') {
      c.sentences.forEach((text, i) => {
        out.push({
          kind: 'sentence',
          id: `s:${lesson.id}:${i}`,
          text,
          words: sentenceWords(text),
          lessonId: lesson.id,
        });
      });
    }
  }
  return out;
}

export const TEXT_ITEMS: TextItem[] = build();

const TEXT_ITEM_MAP: Map<string, TextItem> = new Map(TEXT_ITEMS.map((t) => [t.id, t]));

export function getTextItem(id: string): TextItem | null {
  return TEXT_ITEM_MAP.get(id) ?? null;
}

export function isTextItem(item: { id: string }): item is TextItem {
  return 'kind' in item;
}
