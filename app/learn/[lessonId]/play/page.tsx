'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { findLesson } from '@/types/curriculum';
import type {
  BlendIntroContent,
  GraphemeContent,
} from '@/types/curriculum';
import { CURRICULUM } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';
import BlendIntroLesson from '@/components/activities/BlendIntroLesson';
import GraphemeLesson from '@/components/activities/GraphemeLesson';

export default function LessonPlayPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params.lessonId;
  const lesson = findLesson(CURRICULUM, lessonId);
  const { hydrated, isLessonUnlocked, completeLesson, recordWordAttempt, setCurrentLesson } =
    useProgress();

  useEffect(() => {
    if (lesson) setCurrentLesson(lesson.id);
  }, [lesson, setCurrentLesson]);

  if (!lesson) notFound();

  if (!hydrated) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <p className="text-xl text-amber-700">載入中…</p>
      </main>
    );
  }

  if (!isLessonUnlocked(lesson.id)) {
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

  if (!lesson.implemented) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <p className="text-2xl text-gray-500">此課程即將推出</p>
        <Link href="/" className="text-xl text-amber-600">
          ← 返回課程路徑
        </Link>
      </main>
    );
  }

  const activity = lesson.activities[0];
  const handleComplete = () => completeLesson(lesson.id);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="flex w-full max-w-5xl items-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-white/80 px-4 py-2 text-lg text-amber-800 shadow-sm hover:bg-white"
        >
          ← 課程路徑
        </Link>
        <h1 className="text-xl font-bold text-amber-900">{lesson.title}</h1>
      </div>

      {activity.type === 'blend_intro' && (
        <BlendIntroLesson
          words={(activity.content as BlendIntroContent).words}
          wordOrder={(activity.content as BlendIntroContent).wordOrder}
          lessonId={lessonId}
          onComplete={handleComplete}
          onWordComplete={(w) => recordWordAttempt(w, true)}
        />
      )}

      {activity.type === 'grapheme' && (
        <GraphemeLesson
          patternKey={(activity.content as GraphemeContent).patternKey}
          graphemes={(activity.content as GraphemeContent).graphemes}
          words={(activity.content as GraphemeContent).words}
          wordOrder={(activity.content as GraphemeContent).wordOrder}
          ruleHint={(activity.content as GraphemeContent).ruleHint}
          lessonId={lessonId}
          onComplete={handleComplete}
          onWordComplete={(w) => recordWordAttempt(w, true)}
        />
      )}
    </main>
  );
}
