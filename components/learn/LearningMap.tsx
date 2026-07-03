'use client';

import { useProgress } from '@/lib/progress';
import LessonPath from './LessonPath';

export default function LearningMap() {
  const { hydrated, getOverallProgress } = useProgress();
  const overall = getOverallProgress();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="rounded-3xl bg-white/80 p-6 text-center shadow-sm">
        <p className="text-4xl font-bold text-amber-600">
          {hydrated ? `${overall.completed} / ${overall.total}` : '— / —'}
          <span className="ml-2 text-xl font-normal text-amber-800/70">堂</span>
        </p>
        <div className="mx-auto mt-3 h-3 max-w-md overflow-hidden rounded-full bg-amber-100">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
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

      <a
        href="/play/decode"
        className="rounded-2xl border-2 border-purple-200 bg-purple-50 px-6 py-4 text-center text-lg font-semibold text-purple-900 hover:bg-purple-100"
      >
        試唸生字 → Sound buttons · 切音 · 混音
      </a>
    </div>
  );
}
