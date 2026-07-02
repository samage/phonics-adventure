'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fireConfetti } from '@/components/ConfettiBurst';
import PhonicsBlockCard from '@/components/PhonicsBlockCard';
import PhonicsTypeLegend from '@/components/learn/PhonicsTypeLegend';
import SoundAlchemist from '@/components/games/SoundAlchemist/SoundAlchemist';
import { getGraphemePhonics, graphemeToBlock } from '@/data/graphemePhonics';
import { speakGrapheme } from '@/lib/letterSound';
import { speakWord } from '@/lib/speech';
import type { WordOrderMode } from '@/types/curriculum';

type Phase = 'intro' | 'blend' | 'done';

interface GraphemeLessonProps {
  patternKey: string;
  graphemes: string[];
  words: string[];
  wordOrder?: WordOrderMode;
  ruleHint?: string;
  lessonId: string;
  onComplete: () => void;
  onWordComplete?: (word: string) => void;
}

export default function GraphemeLesson({
  patternKey,
  graphemes,
  words,
  wordOrder = 'sequential',
  ruleHint,
  lessonId,
  onComplete,
  onWordComplete,
}: GraphemeLessonProps) {
  const [phase, setPhase] = useState<Phase>('intro');

  const key = patternKey || graphemes[0];
  const meta = getGraphemePhonics(key);
  const block = graphemeToBlock(key);
  const introNote = ruleHint ?? meta?.ruleDetail;

  const handleIntroNext = useCallback(() => {
    if (words.length > 0) {
      setPhase('blend');
    } else {
      fireConfetti();
      setPhase('done');
      onComplete();
    }
  }, [words.length, onComplete]);

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
        <PhonicsTypeLegend />
        {introNote && (
          <div className="w-full rounded-2xl bg-purple-100 px-6 py-4 text-left text-base leading-relaxed text-purple-900 whitespace-pre-line">
            {introNote}
          </div>
        )}
        <motion.button
          type="button"
          key={key}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => speakGrapheme(key)}
          className="cursor-pointer"
        >
          <PhonicsBlockCard block={block} size="xl" highlighted showLabel multiSpelling />
        </motion.button>
        {meta && (
          <div className="w-full text-center">
            <p className="text-xl font-medium text-amber-900">{meta.hint}</p>
            <p className="mt-3 text-lg text-amber-800">例字：</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {meta.exampleWords.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => speakWord(word)}
                  className="rounded-full bg-amber-100 px-4 py-2 text-lg font-semibold text-amber-800 hover:bg-amber-200"
                >
                  {word}
                  {meta.exampleNotes?.[word] && (
                    <span className="ml-1 text-sm font-normal text-amber-600">
                      （{meta.exampleNotes[word]}）
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-amber-600/80">
              拼法：
              {meta.spellings.map((s, i) => (
                <span key={s}>
                  {i > 0 && <span className="mx-1 text-amber-400">/</span>}
                  <span className="font-bold">{s}</span>
                </span>
              ))}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleIntroNext}
          className="rounded-full bg-purple-500 px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_#7B1FA2]"
        >
          {words.length > 0 ? '開始拼字練習 →' : '完成 →'}
        </button>
      </div>
    );
  }

  return (
    <SoundAlchemist
      words={words}
      wordOrder={wordOrder}
      practiceMode="spelling"
      lessonId={lessonId}
      onWordComplete={onWordComplete}
      onLessonComplete={handleComplete}
      requireAllWords
    />
  );
}
