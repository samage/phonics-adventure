'use client';

import { useProgress } from '@/lib/progress';
import LessonPath from './LessonPath';

export default function LearningMap() {
  const { hydrated, getOverallProgress } = useProgress();
  const overall = getOverallProgress();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="rounded-3xl bg-white/90 p-6 text-center shadow-md">
        <p className="text-4xl font-bold text-sky-600">
          {hydrated ? `${overall.completed} / ${overall.total}` : '— / —'}
          <span className="ml-2 text-xl font-normal text-sky-800/70">堂</span>
        </p>
        <div className="mx-auto mt-3 h-3 max-w-md overflow-hidden rounded-full bg-sky-100">
          <div
            className="h-full rounded-full bg-sky-400 transition-all duration-500"
            style={{
              width:
                hydrated && overall.total > 0
                  ? `${(overall.completed / overall.total) * 100}%`
                  : '0%',
            }}
          />
        </div>
      </div>

      <LessonPath />
    </div>
  );
}
