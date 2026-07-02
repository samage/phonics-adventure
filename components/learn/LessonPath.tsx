'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { CURRICULUM } from '@/data/curriculum';
import type { Unit, UnitId } from '@/types/curriculum';
import { useProgress } from '@/lib/progress';
import LessonNode from './LessonNode';

const SWIPE_THRESHOLD = 56;

function lessonsForUnit(unitId: UnitId) {
  return CURRICULUM.lessons.filter((l) => l.unitId === unitId);
}

export default function LessonPath() {
  const units = CURRICULUM.units;
  const { progress, hydrated, getUnitProgress } = useProgress();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeUnit = units[activeIndex];
  const activeLessons = useMemo(
    () => (activeUnit ? lessonsForUnit(activeUnit.id) : []),
    [activeUnit],
  );

  useEffect(() => {
    if (!hydrated || !progress.currentLessonId) return;
    const lesson = CURRICULUM.lessons.find((l) => l.id === progress.currentLessonId);
    if (!lesson) return;
    const idx = units.findIndex((u) => u.id === lesson.unitId);
    if (idx >= 0) setActiveIndex(idx);
  }, [hydrated, progress.currentLessonId, units]);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(index, units.length - 1)));
    },
    [units.length],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x <= -SWIPE_THRESHOLD) goTo(activeIndex + 1);
      else if (info.offset.x >= SWIPE_THRESHOLD) goTo(activeIndex - 1);
    },
    [activeIndex, goTo],
  );

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="課程單元"
      >
        {units.map((unit, index) => (
          <UnitTab
            key={unit.id}
            unit={unit}
            active={index === activeIndex}
            progress={getUnitProgress(unit.id)}
            hydrated={hydrated}
            onSelect={() => goTo(index)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-1 text-sm text-amber-700/70">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={() => goTo(activeIndex - 1)}
          className="rounded-full px-3 py-1 disabled:opacity-30"
          aria-label="上一個單元"
        >
          ← 上一單元
        </button>
        <span>
          {activeIndex + 1} / {units.length}
        </span>
        <button
          type="button"
          disabled={activeIndex === units.length - 1}
          onClick={() => goTo(activeIndex + 1)}
          className="rounded-full px-3 py-1 disabled:opacity-30"
          aria-label="下一個單元"
        >
          下一單元 →
        </button>
      </div>

      {activeUnit && (
        <motion.div
          key={activeUnit.id}
          role="tabpanel"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="touch-pan-y rounded-2xl border-2 border-amber-100 bg-white/50 p-3"
          style={{ borderColor: `${activeUnit.accent}55` }}
        >
          <div
            className="mb-3 rounded-xl px-4 py-2"
            style={{ backgroundColor: `${activeUnit.accent}22` }}
          >
            <p className="font-bold text-amber-900">{activeUnit.title}</p>
            <p className="text-sm text-amber-800/70">{activeUnit.description}</p>
          </div>

          <div className="flex max-h-[min(58vh,520px)] flex-col gap-2 overflow-y-auto pr-1">
            {activeLessons.map((lesson) => (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                isCurrent={progress.currentLessonId === lesson.id}
              />
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-amber-700/50">
            左右滑動可切換單元
          </p>
        </motion.div>
      )}
    </div>
  );
}

function UnitTab({
  unit,
  active,
  progress,
  hydrated,
  onSelect,
}: {
  unit: Unit;
  active: boolean;
  progress: { completed: number; total: number };
  hydrated: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className="shrink-0 rounded-2xl border-2 px-4 py-2 text-left transition-transform active:scale-95"
      style={{
        borderColor: active ? unit.accent : `${unit.accent}44`,
        backgroundColor: active ? `${unit.accent}33` : 'rgba(255,255,255,0.85)',
      }}
    >
      <p className="text-sm font-bold text-amber-900">{unit.title}</p>
      <p className="text-xs text-amber-800/60">
        {hydrated ? `${progress.completed}/${progress.total} 堂` : '—'}
      </p>
    </button>
  );
}
