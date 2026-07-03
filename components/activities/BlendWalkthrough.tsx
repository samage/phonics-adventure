'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { fireConfetti } from '@/components/ConfettiBurst';
import WordPhonicsLab from '@/components/phonics/WordPhonicsLab';
import SoundAlchemist from '@/components/games/SoundAlchemist/SoundAlchemist';
import type { WordOrderMode } from '@/types/curriculum';

type Phase = 'intro' | 'demo' | 'practice' | 'done';

interface BlendWalkthroughProps {
  words: string[];
  demoWords?: string[];
  wordOrder?: WordOrderMode;
  lessonId: string;
  onComplete: () => void;
  onWordComplete?: (word: string) => void;
}

export default function BlendWalkthrough({
  words,
  demoWords,
  wordOrder = 'sequential',
  lessonId,
  onComplete,
  onWordComplete,
}: BlendWalkthroughProps) {
  const demos = demoWords ?? words.slice(0, Math.min(4, words.length));
  const [phase, setPhase] = useState<Phase>('intro');
  const [demoIndex, setDemoIndex] = useState(0);

  const currentWord = demos[demoIndex] ?? '';

  const handleDemoNext = useCallback(() => {
    onWordComplete?.(currentWord);
    if (demoIndex < demos.length - 1) {
      setDemoIndex((i) => i + 1);
    } else {
      setPhase('practice');
    }
  }, [currentWord, demoIndex, demos.length, onWordComplete]);

  const handlePracticeComplete = () => {
    fireConfetti();
    setPhase('done');
    onComplete();
  };

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 animate-pop-in">
        <p className="text-4xl font-bold text-green-700">太棒了！混音拼讀完成！</p>
        <Link
          href="/"
          className="rounded-full bg-green-500 px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_#2e7d32]"
        >
          回到課程路徑 →
        </Link>
      </div>
    );
  }

  if (phase === 'practice') {
    return (
      <div className="flex w-full flex-col items-center gap-6">
        <p className="max-w-xl text-center text-2xl font-semibold text-purple-900">
          輪到你囉！用 Sound buttons → 切音 → 混音的方式練習。
        </p>
        <SoundAlchemist
          words={words}
          wordOrder={wordOrder}
          lessonId={lessonId}
          onWordComplete={onWordComplete}
          onLessonComplete={handlePracticeComplete}
          requireAllWords
        />
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="w-full rounded-3xl bg-amber-50 px-8 py-6 text-left leading-relaxed text-amber-950 shadow-inner">
          <p className="mb-4 text-2xl font-bold text-amber-900">
            發音組合在一起怎麼念？
          </p>
          <ol className="list-decimal space-y-2 pl-6 text-lg">
            <li>
              <strong>Sound buttons</strong> — 看每個音在字裡的位置
            </li>
            <li>
              <strong>Sound-talk</strong> — 一個一個音唸出來
            </li>
            <li>
              <strong>Blend</strong> — 把音混成整字
            </li>
          </ol>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setPhase('demo')}
            className="rounded-full bg-amber-400 px-10 py-4 text-2xl text-amber-950 shadow-[0_6px_0_0_#f57f17]"
          >
            看示範 →
          </button>
          <button
            type="button"
            onClick={() => setPhase('practice')}
            className="rounded-full bg-purple-100 px-6 py-3 text-lg text-purple-900"
          >
            跳過示範，直接練習
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <p className="text-sm text-amber-700">
        示範 {demoIndex + 1} / {demos.length}
      </p>
      {currentWord && (
        <WordPhonicsLab
          key={currentWord}
          word={currentWord}
          onComplete={handleDemoNext}
        />
      )}
      <button
        type="button"
        onClick={() => setPhase('practice')}
        className="text-sm text-amber-700 underline"
      >
        跳過剩餘示範
      </button>
    </div>
  );
}
