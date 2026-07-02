'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fireConfetti } from '@/components/ConfettiBurst';
import PhonicsBlockCard from '@/components/PhonicsBlockCard';
import PhonicsTypeLegend from '@/components/learn/PhonicsTypeLegend';
import { ALL_LETTERS } from '@/data/curriculum';
import { getLetterPhonics } from '@/data/letterPhonics';
import { letterToBlock, speakLetterSound } from '@/lib/letterSound';
import { cancelSpeech } from '@/lib/speech';

type Phase = 'intro' | 'quiz' | 'done';

interface LetterGroupLessonProps {
  letters: string[];
  quizCount?: number;
  lessonId: string;
  onComplete: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function LetterGroupLesson({
  letters,
  quizCount = 4,
  lessonId,
  onComplete,
}: LetterGroupLessonProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [introIndex, setIntroIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<string[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const didInitQuiz = useRef(false);

  const currentLetter = letters[introIndex];
  const currentQuestion = quizQuestions[quizIndex];

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    const pool = ALL_LETTERS.filter((l) => l !== currentQuestion);
    return shuffle([currentQuestion, ...shuffle(pool).slice(0, 3)]);
  }, [currentQuestion]);

  const handleIntroNext = useCallback(() => {
    if (introIndex < letters.length - 1) {
      setIntroIndex((i) => i + 1);
    } else {
      setPhase('quiz');
    }
  }, [introIndex, letters.length]);

  useEffect(() => {
    if (phase === 'quiz' && !didInitQuiz.current) {
      didInitQuiz.current = true;
      setQuizQuestions(
        shuffle(letters).slice(0, Math.min(quizCount, letters.length)),
      );
    }
  }, [phase, letters, quizCount]);

  useEffect(() => {
    if (phase === 'quiz' && currentQuestion) {
      const t = window.setTimeout(() => speakLetterSound(currentQuestion), 400);
      return () => window.clearTimeout(t);
    }
  }, [phase, currentQuestion]);

  useEffect(() => () => cancelSpeech(), []);

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
    const block = letterToBlock(currentLetter);
    const meta = getLetterPhonics(currentLetter);
    return (
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        <PhonicsTypeLegend types={['consonant', 'short_vowel']} />
        <p className="text-2xl text-amber-800">
          {introIndex + 1} / {letters.length}
        </p>
        <motion.button
          type="button"
          key={currentLetter}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => speakLetterSound(currentLetter)}
          className="cursor-pointer"
        >
          <PhonicsBlockCard block={block} size="xl" highlighted showLabel />
        </motion.button>
        {meta && (
          <p className="text-xl text-amber-900">{meta.hint}</p>
        )}
        <button
          type="button"
          onClick={handleIntroNext}
          className="rounded-full bg-amber-400 px-8 py-3 text-2xl text-amber-900 shadow-[0_6px_0_0_#f57f17]"
        >
          {introIndex < letters.length - 1 ? '下一個 →' : '開始小測驗 →'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      <p className="text-2xl text-amber-800">
        聽音選字母 {quizIndex + 1} / {quizQuestions.length}
      </p>
      <button
        type="button"
        onClick={() => speakLetterSound(currentQuestion)}
        className="rounded-full bg-purple-100 px-6 py-3 text-xl text-purple-800"
      >
        🔊 再聽一次
      </button>
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((letter) => (
          <button
            key={letter}
            type="button"
            disabled={!!feedback}
            onClick={() => {
              if (feedback) return;
              setSelected(letter);
              const correct = letter === currentQuestion;
              setFeedback(correct ? 'correct' : 'wrong');
              if (correct) {
                window.setTimeout(() => {
                  if (quizIndex < quizQuestions.length - 1) {
                    setQuizIndex((i) => i + 1);
                    setSelected(null);
                    setFeedback(null);
                  } else {
                    fireConfetti();
                    setPhase('done');
                    onComplete();
                  }
                }, 800);
              } else {
                window.setTimeout(() => {
                  setSelected(null);
                  setFeedback(null);
                  void speakLetterSound(currentQuestion);
                }, 900);
              }
            }}
            className={[
              feedback && letter === currentQuestion ? 'ring-4 ring-green-400 rounded-2xl' : '',
              feedback === 'wrong' && selected === letter ? 'animate-wiggle' : '',
            ].join(' ')}
          >
            <PhonicsBlockCard block={letterToBlock(letter)} size="lg" showLabel />
          </button>
        ))}
      </div>
    </div>
  );
}
