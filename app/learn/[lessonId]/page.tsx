'use client';

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { findLesson } from '@/types/curriculum';
import { CURRICULUM } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params.lessonId;
  const lesson = findLesson(CURRICULUM, lessonId);
  const { isLessonUnlocked, isLessonCompleted, setCurrentLesson } =
    useProgress();

  if (!lesson) notFound();

  const unlocked = isLessonUnlocked(lesson.id);
  const completed = isLessonCompleted(lesson.id);
  const unit = CURRICULUM.units.find((u) => u.id === lesson.unitId);
  const activity = lesson.activities[0];

  if (!unlocked) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <span className="text-6xl">🔒</span>
        <p className="text-2xl text-gray-600">此課程尚未解鎖</p>
        <Link href="/" className="text-xl text-amber-600">
          ← 返回課程路徑
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-6">
      <div className="flex w-full max-w-2xl items-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-white/80 px-4 py-2 text-lg text-amber-800 shadow-sm hover:bg-white"
        >
          ← 課程路徑
        </Link>
      </div>

      <header className="flex flex-col items-center gap-2 text-center">
        {completed && <span className="text-3xl">✅ 已完成</span>}
        <span
          className="rounded-full px-4 py-1 text-sm text-white"
          style={{ backgroundColor: unit?.accent ?? '#FFA000' }}
        >
          {lesson.id} · {unit?.title}
        </span>
        <h1 className="text-3xl font-bold text-amber-900">{lesson.title}</h1>
      </header>

      <div
        className="w-full max-w-md rounded-3xl border-4 bg-white/90 p-8 text-center"
        style={{ borderColor: unit?.accent ?? '#FFA000' }}
      >
        <h2 className="text-2xl font-bold text-amber-900">{activity.title}</h2>

        {lesson.implemented ? (
          <Link
            href={`/learn/${lessonId}/play`}
            onClick={() => setCurrentLesson(lesson.id)}
            className="mt-6 inline-block rounded-full px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_rgba(0,0,0,0.15)]"
            style={{ backgroundColor: unit?.accent ?? '#FFA000' }}
          >
            {completed ? '再練一次' : '開始學習'}
          </Link>
        ) : (
          <p className="mt-6 text-xl text-gray-400">即將推出</p>
        )}
      </div>
    </main>
  );
}
