'use client';

import Link from 'next/link';
import PhonicsTypeLegend from '@/components/learn/PhonicsTypeLegend';

interface CourseIntroProps {
  lessonId: string;
  onComplete: () => void;
}

export default function CourseIntro({ lessonId, onComplete }: CourseIntroProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      <PhonicsTypeLegend />
      <div className="rounded-3xl bg-white/90 p-8 text-center shadow-sm">
        <h2 className="text-3xl font-bold text-amber-900">歡迎來到自然發音課程！</h2>
        <p className="mt-4 text-lg text-amber-800/80">
          共 60 堂課，從子音、母音開始，一步一步學會拼讀。
        </p>
        <ul className="mt-6 space-y-2 text-left text-lg text-amber-700">
          <li>1. 先學子音（藍色積木）</li>
          <li>2. 再學短母音（黃色積木）</li>
          <li>3. 練習混音拼字</li>
          <li>4. 學習字母組合（ai, ch, oo…）</li>
        </ul>
        <p className="mt-4 text-base text-amber-600/70">
          聽的是字母音，不是 ABC 名字
        </p>
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="rounded-full bg-amber-400 px-8 py-3 text-2xl text-amber-900 shadow-[0_6px_0_0_#f57f17]"
      >
        開始第一課 →
      </button>
      <Link href="/" className="text-lg text-amber-600">
        返回課程路徑
      </Link>
    </div>
  );
}
