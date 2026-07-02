'use client';

import Link from 'next/link';

interface CourseIntroProps {
  lessonId: string;
  onComplete: () => void;
}

export default function CourseIntro({ onComplete }: CourseIntroProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      <button
        type="button"
        onClick={onComplete}
        className="rounded-full bg-amber-400 px-10 py-4 text-3xl text-amber-900 shadow-[0_6px_0_0_#f57f17]"
      >
        開始學習 →
      </button>
      <Link href="/" className="text-lg text-amber-600">
        返回課程路徑
      </Link>
    </div>
  );
}
