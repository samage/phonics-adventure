'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fireConfetti } from '@/components/ConfettiBurst';
import PhonicsBlockCard from '@/components/PhonicsBlockCard';
import SoundAlchemist from '@/components/games/SoundAlchemist/SoundAlchemist';
import { getGraphemePhonics, graphemeToBlock } from '@/data/graphemePhonics';
import { speakGrapheme } from '@/lib/letterSound';
import { speakWord } from '@/lib/speech';
import type { WordOrderMode } from '@/types/curriculum';

type Phase = 'intro' | 'blend' | 'done';

interface GraphemeLessonProps {
  graphemes: string[];
  words: string[];
  wordOrder?: WordOrderMode;
  ruleHint?: string;
  lessonId: string;
  onComplete: () => void;
  onWordComplete?: (word: string) => void;
}

export default function GraphemeLesson({
  graphemes,
  words,
  wordOrder = 'sequential',
  ruleHint,
  lessonId,
  onComplete,
  onWordComplete,
}: GraphemeLessonProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [graphemeIndex, setGraphemeIndex] = useState(0);

  const key = graphemes[graphemeIndex] ?? graphemes[0];
  const meta = getGraphemePhonics(key);
  const block = graphemeToBlock(key);

  const handleIntroNext = useCallback(() => {
    if (graphemeIndex < graphemes.length - 1) {
      setGraphemeIndex((i) => i + 1);
    } else {
      setPhase('blend');
    }
  }, [graphemeIndex, graphemes.length]);

  const handleComplete = () => {
    fireConfetti();
    setPhase('done');
    onComplete();
  };

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 animate-pop-in">
        <p className="text-4xl font-bold text-green-700">太棒了！課程完成！</p>
        <Link
          href="/"
          className="rounded-full bg-green-500 px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_#2e7d32]"
        >
          回到課程路徑 →
        </Link>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        {ruleHint && (
          <p className="rounded-2xl bg-purple-100 px-6 py-3 text-lg text-purple-900">
            {ruleHint}
          </p>
        )}
        <motion.button
          type="button"
          key={key}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => speakGrapheme(key)}
          className="cursor-pointer"
        >
          <PhonicsBlockCard block={block} size="xl" highlighted showLabel />
        </motion.button>
        {meta && (
          <div className="text-center">
            <p className="text-xl font-medium text-amber-900">{meta.hint}</p>
            <p className="text-lg text-amber-700">
              範例：
              <button
                type="button"
                onClick={() => speakWord(meta.exampleWord)}
                className="ml-1 font-bold text-amber-600 underline"
              >
                {meta.exampleWord}
              </button>
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleIntroNext}
          className="rounded-full bg-purple-500 px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_#7B1FA2]"
        >
          {graphemeIndex < graphemes.length - 1 ? '下一個 →' : '開始拼字練習 →'}
        </button>
      </div>
    );
  }

  return (
    <SoundAlchemist
      words={words}
      wordOrder={wordOrder}
      lessonId={lessonId}
      onWordComplete={onWordComplete}
      onLessonComplete={handleComplete}
      requireAllWords
    />
  );
}
