'use client';

import { CURRICULUM } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';
import LessonNode from './LessonNode';

export default function LessonPath60() {
  const { progress } = useProgress();
  let lastUnitId = '';

  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      {CURRICULUM.lessons.map((lesson) => {
        const unit = CURRICULUM.units.find((u) => u.id === lesson.unitId);
        const showHeader = lesson.unitId !== lastUnitId;
        lastUnitId = lesson.unitId;

        return (
          <div key={lesson.id} className="flex flex-col gap-2">
            {showHeader && unit && (
              <div
                className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2 first:mt-0"
                style={{ backgroundColor: `${unit.accent}33` }}
              >
                <span
                  className="rounded-full px-3 py-0.5 text-sm font-bold text-white"
                  style={{ backgroundColor: unit.accent }}
                >
                  {unit.title}
                </span>
                <span className="text-sm text-amber-800/70">{unit.description}</span>
              </div>
            )}
            <LessonNode
              lesson={lesson}
              isCurrent={progress.currentLessonId === lesson.id}
            />
          </div>
        );
      })}
    </div>
  );
}
