'use client';

import Link from 'next/link';
import type { Lesson } from '@/types/curriculum';
import { useProgress } from '@/lib/progress';
import { lessonDueCount } from '@/lib/learn/lessonItems';
import { todayString } from '@/lib/review/scheduler';

interface LessonNodeProps {
  lesson: Lesson;
  isCurrent?: boolean;
}

export default function LessonNode({ lesson, isCurrent = false }: LessonNodeProps) {
  const { hydrated, progress, isLessonCompleted, isLessonUnlocked, setCurrentLesson } =
    useProgress();

  if (!hydrated) {
    return (
      <div className="flex w-full items-center gap-3 rounded-2xl border-4 border-sky-100 bg-white/60 px-4 py-3 opacity-70">
        <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-sm font-bold text-sky-500">
          {lesson.id}
        </span>
        <p className="flex-1 text-left font-bold text-sky-300">{lesson.title}</p>
      </div>
    );
  }

  const completed = isLessonCompleted(lesson.id);
  const unlocked = isLessonUnlocked(lesson.id);

  const baseClasses =
    'flex w-full items-center gap-3 rounded-2xl border-4 px-4 py-3 transition-transform';

  if (!unlocked) {
    return (
      <div className={`${baseClasses} cursor-not-allowed border-sky-100 bg-white/50 opacity-60`}>
        <span className="shrink-0 text-lg font-bold text-sky-300">{lesson.id}</span>
        <div className="flex-1 text-left">
          <p className="font-bold text-sky-400">{lesson.title}</p>
          {!lesson.implemented && <p className="text-sm text-sky-300">即將推出</p>}
        </div>
        <span className="text-2xl">🔒</span>
      </div>
    );
  }

  // 這一課教過的項目（字母、特殊字、短句），今天有幾個到期 → 小鈴鐺提醒
  const due = completed ? lessonDueCount(lesson, progress.review, todayString()) : 0;

  const stateClasses = completed
    ? 'border-pink-200 bg-pink-50 hover:-translate-y-0.5'
    : isCurrent
      ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-200 hover:-translate-y-0.5'
      : 'border-white bg-white/90 hover:-translate-y-0.5';

  const inner = (
    <div className={`${baseClasses} ${stateClasses}`}>
      <span className="shrink-0 rounded-full bg-sky-200 px-2 py-0.5 text-sm font-bold text-sky-900">
        {lesson.id}
      </span>
      <div className="flex-1 text-left">
        <p className="font-bold text-sky-900">{lesson.title}</p>
        {lesson.subtitle && <p className="text-sm text-sky-700/70">{lesson.subtitle}</p>}
      </div>
      {due > 0 && (
        <span
          title={`${due} 個項目今天要複習`}
          className="rounded-full bg-pink-300 px-2 py-0.5 text-sm text-white"
        >
          🔔 {due}
        </span>
      )}
      <span className="text-2xl">{completed ? '✅' : '▶'}</span>
    </div>
  );

  if (!lesson.implemented) return inner;

  return (
    <Link
      href={`/learn/${lesson.id}`}
      className="block w-full"
      onClick={() => setCurrentLesson(lesson.id)}
    >
      {inner}
    </Link>
  );
}
