'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { findLesson } from '@/types/curriculum';
import { CURRICULUM, resolveLessonId } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';
import LessonFlow from '@/components/learn/LessonFlow';
import TextLessonFlow from '@/components/learn/TextLessonFlow';
import Mascot from '@/components/mascot/Mascot';
import PageHeader, { BTN_PRIMARY } from '@/components/ui/PageHeader';

function Notice({ mood, children }: { mood: 'sleepy' | 'think'; children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
      <Mascot mood={mood} size={140} />
      <p className="text-2xl text-sky-900">{children}</p>
      <Link href="/" className={BTN_PRIMARY}>
        ← 返回課程地圖
      </Link>
    </main>
  );
}

/** 一堂課的唯一入口（舊的課程 ID 會自動對應到新的）。 */
export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = resolveLessonId(params.lessonId);
  const lesson = findLesson(CURRICULUM, lessonId);
  const { hydrated, isLessonUnlocked, setCurrentLesson } = useProgress();

  useEffect(() => {
    if (lesson) setCurrentLesson(lesson.id);
  }, [lesson, setCurrentLesson]);

  if (!lesson) notFound();

  if (!hydrated) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <p className="text-xl text-sky-700">載入中…</p>
      </main>
    );
  }

  if (!isLessonUnlocked(lesson.id)) {
    return (
      <Notice mood="think">
        🔒 這一課還沒解鎖，先完成前面的課，或去做「快速分班測驗」吧！
      </Notice>
    );
  }

  if (!lesson.implemented) return <Notice mood="sleepy">這一課即將推出</Notice>;

  const content = lesson.activities[0].content;

  return (
    <main className="flex flex-1 flex-col items-center gap-5 p-5">
      <PageHeader title={lesson.title} backLabel="← 課程地圖" />
      {content.kind === 'grapheme' && (
        <LessonFlow key={lesson.id} lesson={lesson} content={content} />
      )}
      {(content.kind === 'sight_word' || content.kind === 'decodable_sentences') && (
        <TextLessonFlow key={lesson.id} lesson={lesson} content={content} />
      )}
    </main>
  );
}
