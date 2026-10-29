/**
 * 課程（lesson）和「看字母說音」項目（recall item）之間的對照。
 *
 * 整個 App 只有一份「記憶」：每個複習項目在 Leitner 複習表裡的盒子。
 * 複習項目有三種：字母／字母組合（recall item）、特殊字、短句（後兩者見 data/recall/textItems.ts）。
 * 課程負責「教」，這裡負責回答：
 * - 這一課教了哪些項目？（學完後要馬上練看字說音）
 * - 這個項目是哪一課教的？（自由練習只出學過的）
 * - 這一課的小測驗，干擾選項該從哪些「學過」的項目挑？
 */

import { RECALL_ITEMS, type RecallItem } from '@/data/recall/items';
import { TEXT_ITEMS, type TextItem } from '@/data/recall/textItems';
import type { ReviewItem } from '@/lib/recall/reviewQuiz';
import { PHONICS_LESSONS } from '@/data/curriculum';
import type { Lesson } from '@/types/curriculum';
import { isDue, type ReviewMap } from '@/lib/review/scheduler';
import type { UserProgress } from '@/types/progress';

/** 小測驗干擾選項池至少要有幾個項目（含該課本身） */
export const MIN_QUIZ_POOL = 8;

function graphemeContent(lesson: Lesson) {
  const c = lesson.activities[0]?.content;
  return c && c.kind === 'grapheme' ? c : null;
}

/** 這一課教的 recall 項目（句子課、特殊字課、沒有對應項目的拼法課回傳空陣列） */
export function recallItemsForLesson(lesson: Lesson): RecallItem[] {
  const content = graphemeContent(lesson);
  if (!content) return [];
  if (lesson.unitId === 'blends') {
    const blends = new Set(content.graphemes);
    return RECALL_ITEMS.filter((it) => it.category === 'blends' && blends.has(it.id));
  }
  return RECALL_ITEMS.filter((it) => it.patternKey === content.patternKey);
}

/** 這一課教的特殊字／短句項目（字母課回傳空陣列） */
export function textItemsForLesson(lesson: Lesson): TextItem[] {
  return TEXT_ITEMS.filter((t) => t.lessonId === lesson.id);
}

/** 這一課所有的複習項目（字母、特殊字、短句） */
export function reviewItemsForLesson(lesson: Lesson): ReviewItem[] {
  return [...recallItemsForLesson(lesson), ...textItemsForLesson(lesson)];
}

const ITEM_TO_LESSON: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const t of TEXT_ITEMS) map.set(t.id, t.lessonId);
  for (const lesson of PHONICS_LESSONS) {
    for (const it of recallItemsForLesson(lesson)) {
      if (!map.has(it.id)) map.set(it.id, lesson.id);
    }
  }
  return map;
})();

/** 教這個項目（字母、特殊字或短句）的課次 ID；沒有專屬課的項目（如 x）回傳 null */
export function lessonIdForRecallItem(itemId: string): string | null {
  return ITEM_TO_LESSON.get(itemId) ?? null;
}

const LESSON_ORDER: Map<string, number> = new Map(
  PHONICS_LESSONS.map((l) => [l.id, l.order]),
);

/**
 * 目前可以拿來「自由練習／分辨」的項目：
 * 已做過分班測驗 → 全部；否則 = 已完成課程教過的項目 + 複習表裡已經有紀錄的項目。
 */
export function learnedItems(progress: UserProgress): RecallItem[] {
  if (progress.placement) return RECALL_ITEMS;
  const done = new Set(progress.completedLessons);
  return RECALL_ITEMS.filter((it) => {
    if (progress.review[it.id]) return true;
    const lessonId = lessonIdForRecallItem(it.id);
    return lessonId !== null && done.has(lessonId);
  });
}

/**
 * 目前可以拿來「多練一輪」的特殊字／短句：已完成課程教過的 + 複習表裡已經有紀錄的。
 * （分班測驗只測字母，所以不會讓特殊字和短句「全部解鎖」。）
 */
export function learnedTextItems(progress: UserProgress): TextItem[] {
  const done = new Set(progress.completedLessons);
  return TEXT_ITEMS.filter((t) => progress.review[t.id] || done.has(t.lessonId));
}

/**
 * 某一課（特殊字／短句課）小測驗的干擾選項池：
 * 這一課以前（含這一課）教過的特殊字與短句 + 複習表已有的項目。
 */
export function quizTextPoolForLesson(lesson: Lesson, review: ReviewMap): TextItem[] {
  return TEXT_ITEMS.filter((t) => {
    if (t.lessonId === lesson.id || review[t.id]) return true;
    const order = LESSON_ORDER.get(t.lessonId);
    return order !== undefined && order < lesson.order;
  });
}

/**
 * 某一課小測驗的干擾選項池：
 * 這一課以前（含這一課）教過的項目 + 複習表已有的項目；
 * 若還不到 MIN_QUIZ_POOL 個，用最基本的字母音補滿，避免用到還沒教的字母。
 */
export function quizPoolForLesson(lesson: Lesson, review: ReviewMap): RecallItem[] {
  const own = recallItemsForLesson(lesson);
  const pool = RECALL_ITEMS.filter((it) => {
    if (own.some((o) => o.id === it.id)) return true;
    if (review[it.id]) return true;
    const lessonId = lessonIdForRecallItem(it.id);
    const order = lessonId ? LESSON_ORDER.get(lessonId) : undefined;
    return order !== undefined && order < lesson.order;
  });
  const ids = new Set(pool.map((p) => p.id));
  for (const it of RECALL_ITEMS) {
    if (pool.length >= MIN_QUIZ_POOL) break;
    if (!ids.has(it.id)) {
      ids.add(it.id);
      pool.push(it);
    }
  }
  return pool;
}

/** 這一課教的項目（字母、特殊字、短句）裡，今天到期要複習的有幾個（學習地圖上的小提醒用） */
export function lessonDueCount(lesson: Lesson, review: ReviewMap, today: string): number {
  return reviewItemsForLesson(lesson).filter((it) => isDue(review[it.id], today)).length;
}
