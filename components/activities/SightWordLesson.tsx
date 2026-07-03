'use client';

import { useState } from 'react';
import Link from 'next/link';
import { fireConfetti } from '@/components/ConfettiBurst';
import WordPhonicsLab from '@/components/phonics/WordPhonicsLab';
import { getTrickyWord } from '@/data/trickyWords';
import { speakWord } from '@/lib/speech';

interface SightWordLessonProps {
  words: string[];
  onComplete: () => void;
}

export default function SightWordLesson({ words, onComplete }: SightWordLessonProps) {
  const [index, setIndex] = useState(0);
  const word = words[index] ?? '';
  const meta = getTrickyWord(word);

  const handleNext = () => {
    if (index < words.length - 1) {
      setIndex((i) => i + 1);
    } else {
      fireConfetti();
      onComplete();
    }
  };

  if (!word) {
    return (
      <p className="text-amber-700">此階段尚無特殊字。</p>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6">
      <div className="w-full rounded-2xl bg-rose-50 px-6 py-4 text-center">
        <p className="text-lg font-bold text-rose-900">這個字不能硬拆！</p>
        <p className="mt-2 text-rose-800">請整字記憶，反覆聽、反覆唸。</p>
      </div>
      <p className="text-6xl font-bold text-amber-950">{word}</p>
      {meta && <p className="text-lg text-amber-800">{meta.hintZh}</p>}
      <button
        type="button"
        onClick={() => speakWord(word)}
        className="rounded-full bg-amber-200 px-8 py-3 text-xl text-amber-900"
      >
        🔊 聽整字
      </button>
      <p className="text-sm text-amber-600">
        {index + 1} / {words.length}
      </p>
      <button
        type="button"
        onClick={handleNext}
        className="rounded-full bg-green-500 px-8 py-3 text-xl text-white"
      >
        {index < words.length - 1 ? '下一個 →' : '完成 →'}
      </button>
    </div>
  );
}
