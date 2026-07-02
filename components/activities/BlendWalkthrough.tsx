'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fireConfetti } from '@/components/ConfettiBurst';
import PhonicsBlockCard from '@/components/PhonicsBlockCard';
import SoundAlchemist from '@/components/games/SoundAlchemist/SoundAlchemist';
import type { WordOrderMode } from '@/types/curriculum';
import type { PhonicsBlock } from '@/types/phonics';
import { splitCvcOnsetRime } from '@/data/blendOnsetRime';
import { playBlendDemo, type BlendHighlight } from '@/lib/blendDemoAudio';
import { parseWordToBlocks } from '@/utils/phonicsEngine';
import { cancelSpeech } from '@/lib/speech';

type Phase = 'intro' | 'demo' | 'practice' | 'done';

interface BlendWalkthroughProps {
  words: string[];
  demoWords?: string[];
  wordOrder?: WordOrderMode;
  lessonId: string;
  onComplete: () => void;
  onWordComplete?: (word: string) => void;
}

function isRimeLetter(index: number, highlight: BlendHighlight): boolean {
  return highlight === 'rime' && index >= 1;
}

function isOnsetLetter(index: number, highlight: BlendHighlight): boolean {
  return highlight === 'onset' && index === 0;
}

function isWordHighlight(highlight: BlendHighlight): boolean {
  return highlight === 'word';
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
  const [highlight, setHighlight] = useState<BlendHighlight>(null);
  const [narration, setNarration] = useState('');
  const [playing, setPlaying] = useState(false);
  const abortRef = useRef(false);

  const currentWord = demos[demoIndex] ?? '';
  const blocks: PhonicsBlock[] = currentWord
    ? parseWordToBlocks(currentWord)
    : [];
  const split = currentWord ? splitCvcOnsetRime(currentWord) : null;

  const stopDemo = useCallback(() => {
    abortRef.current = true;
    setPlaying(false);
    setHighlight(null);
    cancelSpeech();
  }, []);

  const runWordDemo = useCallback(async (word: string) => {
    abortRef.current = false;
    setPlaying(true);
    const parts = splitCvcOnsetRime(word);
    if (!parts) {
      setPlaying(false);
      return;
    }

    setNarration(`我們來看看「${word}」怎麼念：`);
    await new Promise((r) => setTimeout(r, 400));
    if (abortRef.current) return;

    setNarration(`第一步：拉長第一個音「${parts.onset}」…`);
    const ok = await playBlendDemo(word, (step) => {
      if (abortRef.current) return;
      setHighlight(step);
      if (step === 'onset') {
        setNarration(`第一步：拉長第一個音「${parts.onset}」…`);
      } else if (step === 'rime') {
        setNarration(`第二步：讀出後面的音「${parts.rime}」`);
      } else if (step === 'word') {
        setNarration(`第三步：一口氣連起來，不要停 → ${word}！`);
      }
    });

    if (!ok && !abortRef.current) {
      setNarration('示範音檔載入失敗，請執行 npm run generate:blend-demo');
    }

    setHighlight(null);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (phase !== 'demo' || !currentWord) return;
    void runWordDemo(currentWord);
    return () => {
      abortRef.current = true;
      cancelSpeech();
    };
  }, [phase, demoIndex, currentWord, runWordDemo]);

  useEffect(() => () => cancelSpeech(), []);

  const handleDemoNext = () => {
    stopDemo();
    if (demoIndex < demos.length - 1) {
      setDemoIndex((i) => i + 1);
    } else {
      setPhase('practice');
    }
  };

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
          輪到你囉！記得：先拉長第一個音，再接後面的韻尾，一口氣念出來。
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
              <strong>拉長第一個音</strong>（例如 sat 的 s…）
            </li>
            <li>
              <strong>讀出後面的韻尾</strong>（例如 at）
            </li>
            <li>
              <strong>一口氣連起來</strong>，不要停 → sat
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
    <div className="flex w-full max-w-3xl flex-col items-center gap-8">
      <p className="min-h-[4rem] text-center text-xl leading-relaxed text-amber-900">
        {narration || '準備示範…'}
      </p>

      <p className="text-sm text-amber-700">
        示範 {demoIndex + 1} / {demos.length}
        {split ? (
          <span className="ml-2 text-purple-700">
            （{split.onset} + {split.rime}）
          </span>
        ) : null}
      </p>

      <div className="relative flex min-h-[10rem] items-end justify-center gap-2 px-4">
        {blocks.map((block, i) => {
          const active =
            isOnsetLetter(i, highlight) ||
            isRimeLetter(i, highlight) ||
            isWordHighlight(highlight);
          const dimmed = highlight !== null && !active;
          const showRimeBracket =
            highlight === 'rime' && i === 1 && blocks.length >= 2;

          return (
            <div key={`${currentWord}-${i}`} className="flex items-end gap-1">
              {showRimeBracket && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0.8 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  className="absolute -top-2 left-[28%] right-[8%] h-24 rounded-2xl border-4 border-dashed border-purple-400/70"
                  aria-hidden
                />
              )}
              <motion.div layout className="relative flex flex-col items-center">
                {active && (
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 text-3xl"
                    aria-hidden
                  >
                    👆
                  </motion.span>
                )}
                <PhonicsBlockCard
                  block={block}
                  size="xl"
                  highlighted={active}
                  dimmed={dimmed}
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      {highlight === null && !playing && currentWord && (
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-bold tracking-wide text-green-700"
        >
          {currentWord}
        </motion.p>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          disabled={playing}
          onClick={() => void runWordDemo(currentWord)}
          className="rounded-full bg-amber-100 px-6 py-3 text-lg text-amber-900 disabled:opacity-50"
        >
          🔊 再聽一次
        </button>
        <button
          type="button"
          disabled={playing}
          onClick={handleDemoNext}
          className="rounded-full bg-purple-500 px-8 py-3 text-xl text-white shadow-[0_6px_0_0_#6a1b9a] disabled:opacity-50"
        >
          {demoIndex < demos.length - 1 ? '下一個單字 →' : '輪到我試試看 →'}
        </button>
        <button
          type="button"
          onClick={() => {
            stopDemo();
            setPhase('practice');
          }}
          className="rounded-full px-4 py-2 text-amber-700 underline"
        >
          跳過示範
        </button>
      </div>
    </div>
  );
}
