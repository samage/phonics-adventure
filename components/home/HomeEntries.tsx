'use client';

import Link from 'next/link';
import { useProgress } from '@/lib/progress';
import { Cupcake, Pudding, Cloud } from '@/components/mascot/Decor';

/** 首頁的三個入口：看字母說音、今天複習（含到期數）、快速分班測驗 */
export default function HomeEntries() {
  const { hydrated, dueToday, progress } = useProgress();
  const placed = hydrated && progress.placement !== null;

  return (
    <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      <Link
        href="/recall"
        className="relative flex items-center gap-3 rounded-3xl bg-sky-400 px-5 py-4 text-white shadow-[0_6px_0_0_#2f8fd0] transition-transform active:translate-y-1 active:shadow-[0_2px_0_0_#2f8fd0] sm:col-span-2"
      >
        <Cloud size={56} className="shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-2xl">看字母說音</p>
          <p className="text-sm text-white/90">看到字母，馬上說出聲音 🔊</p>
        </div>
        <span className="text-3xl">→</span>
      </Link>

      <Link
        href="/review"
        className="relative flex items-center gap-3 rounded-3xl bg-white/95 px-4 py-4 shadow-md transition-transform active:scale-[0.98]"
      >
        <Pudding size={48} className="shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-xl text-sky-900">今天複習</p>
          <p className="text-sm text-sky-700">
            {hydrated
              ? dueToday > 0
                ? `有 ${dueToday} 個要複習`
                : '今天都複習完了'
              : '載入中…'}
          </p>
        </div>
        {hydrated && dueToday > 0 && (
          <span
            aria-label={`${dueToday} 個待複習`}
            className="flex h-9 min-w-9 items-center justify-center rounded-full bg-pink-300 px-2 text-lg text-white shadow-sm"
          >
            {dueToday}
          </span>
        )}
      </Link>

      <Link
        href="/placement"
        className="flex items-center gap-3 rounded-3xl bg-white/95 px-4 py-4 shadow-md transition-transform active:scale-[0.98]"
      >
        <Cupcake size={48} className="shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-xl text-sky-900">快速分班測驗</p>
          <p className="text-sm text-sky-700">
            {placed ? '已測過 · 課程全部開放' : '會的先跳過，課程全部開放'}
          </p>
        </div>
      </Link>
    </div>
  );
}
