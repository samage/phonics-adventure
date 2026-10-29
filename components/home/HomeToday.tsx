'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CURRICULUM } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';
import { Cloud, Cupcake, Pudding } from '@/components/mascot/Decor';

/**
 * 首頁最上面的「今天」區：
 * ① 今天要複習幾個（有的話最優先）→ 沒有就接著上下一課
 * ② 快速分班測驗  ③ 試唸生字小工具
 */
export default function HomeToday() {
  const { hydrated, dueToday, progress, isLessonUnlocked, isLessonCompleted } = useProgress();
  const hasLearned = hydrated && progress.completedLessons.length > 0;
  const placed = hydrated && progress.placement !== null;

  const nextLesson = useMemo(() => {
    if (!hydrated) return null;
    return (
      CURRICULUM.lessons.find(
        (l) => l.implemented && !isLessonCompleted(l.id) && isLessonUnlocked(l.id),
      ) ?? null
    );
  }, [hydrated, isLessonCompleted, isLessonUnlocked]);

  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      {hydrated && dueToday > 0 ? (
        <Link
          href="/review"
          className="flex items-center gap-3 rounded-3xl bg-sky-400 px-5 py-4 text-white shadow-[0_6px_0_0_#2f8fd0] transition-transform active:translate-y-1 active:shadow-[0_2px_0_0_#2f8fd0] sm:col-span-2"
        >
          <Pudding size={56} className="shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-2xl">今天複習</p>
            <p className="text-sm text-white/90">有 {dueToday} 個字、句子要再看一次，馬上說說看 🔊</p>
          </div>
          <span
            aria-label={`${dueToday} 個待複習`}
            className="flex h-10 min-w-10 items-center justify-center rounded-full bg-pink-300 px-2 text-xl text-white shadow-sm"
          >
            {dueToday}
          </span>
        </Link>
      ) : (
        <Link
          href={nextLesson ? `/learn/${nextLesson.id}` : '/review'}
          className="flex items-center gap-3 rounded-3xl bg-sky-400 px-5 py-4 text-white shadow-[0_6px_0_0_#2f8fd0] transition-transform active:translate-y-1 active:shadow-[0_2px_0_0_#2f8fd0] sm:col-span-2"
        >
          <Cloud size={56} className="shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-2xl">{!nextLesson ? '多練一輪' : hasLearned ? '繼續上課' : '開始第一課'}</p>
            <p className="text-sm text-white/90">
              {!hydrated
                ? '載入中…'
                : nextLesson
                  ? hasLearned
                    ? `今天的複習都完成了！下一課：${nextLesson.title}`
                    : `從第一堂開始：${nextLesson.title}`
                  : '所有課程都上完了，來多練幾輪看字說音'}
            </p>
          </div>
          <span className="text-3xl">→</span>
        </Link>
      )}

      <Link
        href="/placement"
        className="flex items-center gap-3 rounded-3xl bg-white/95 px-4 py-3 shadow-md transition-transform active:scale-[0.98]"
      >
        <Cupcake size={44} className="shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-lg text-sky-900">快速分班測驗</p>
          <p className="text-sm text-sky-700">
            {placed ? '已測過 · 課程全部開放' : '會的先跳過，課程全部開放'}
          </p>
        </div>
      </Link>

      <Link
        href="/decode"
        className="flex items-center gap-3 rounded-3xl bg-white/95 px-4 py-3 shadow-md transition-transform active:scale-[0.98]"
      >
        <span className="text-4xl" aria-hidden>
          🔎
        </span>
        <div className="flex-1 text-left">
          <p className="text-lg text-sky-900">試唸生字</p>
          <p className="text-sm text-sky-700">輸入任何單字：切音、混音</p>
        </div>
      </Link>
    </div>
  );
}
