'use client';

import Link from 'next/link';
import type { Lesson } from '@/types/curriculum';
import { useProgress } from '@/lib/progress';

interface LessonNodeProps {
  lesson: Lesson;
  isCurrent?: boolean;
}

export default function LessonNode({
  lesson,
  isCurrent = false,
}: LessonNodeProps) {
  const { isLessonCompleted, isLessonUnlocked } = useProgress();
  const completed = isLessonCompleted(lesson.id);
  const unlocked = isLessonUnlocked(lesson.id);

  const baseClasses =
    'flex w-full items-center gap-3 rounded-2xl border-4 px-4 py-3 transition-transform';

  if (!unlocked) {
    return (
      <div
        className={`${baseClasses} cursor-not-allowed border-gray-300 bg-gray-100/80 opacity-60`}
      >
        <span className="shrink-0 text-lg font-bold text-gray-400">
          {lesson.id}
        </span>
        <div className="flex-1 text-left">
          <p className="font-bold text-gray-500">{lesson.title}</p>
          {!lesson.implemented && (
            <p className="text-sm text-gray-400">即將推出</p>
          )}
        </div>
        <span className="text-2xl">🔒</span>
      </div>
    );
  }

  const stateClasses = completed
    ? 'border-green-400 bg-green-50 hover:-translate-y-0.5'
    : isCurrent
      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 hover:-translate-y-0.5'
      : 'border-white bg-white/90 hover:-translate-y-0.5';

  const inner = (
    <div className={`${baseClasses} ${stateClasses}`}>
      <span className="shrink-0 rounded-full bg-amber-200 px-2 py-0.5 text-sm font-bold text-amber-900">
        {lesson.id}
      </span>
      <div className="flex-1 text-left">
        <p className="font-bold text-amber-900">{lesson.title}</p>
        {lesson.subtitle && (
          <p className="text-sm text-amber-700/70">{lesson.subtitle}</p>
        )}
      </div>
      <span className="text-2xl">{completed ? '✅' : '▶'}</span>
    </div>
  );

  if (!lesson.implemented) return inner;

  return (
    <Link href={`/learn/${lesson.id}`} className="block w-full">
      {inner}
    </Link>
  );
}
