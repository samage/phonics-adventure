'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import type { PhonicsBlock } from '@/types/phonics';
import type { WordOrderMode } from '@/types/curriculum';
import { parseWordToBlocks } from '@/utils/phonicsEngine';
import { speakBlock, speakBlend, speakWord, cancelSpeech } from '@/lib/speech';
import { fireConfetti } from '@/components/ConfettiBurst';
import PhonicsBlockCard from '@/components/PhonicsBlockCard';

interface BlockItem {
  id: string;
  order: number;
  block: PhonicsBlock;
}

export interface SoundAlchemistProps {
  words: string[];
  wordOrder?: WordOrderMode;
  lessonId?: string;
  stageId?: string;
  onWordComplete?: (word: string) => void;
  onLessonComplete?: () => void;
  requireAllWords?: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildItems(word: string): BlockItem[] {
  return parseWordToBlocks(word).map((block, index) => ({
    id: `${index}-${block.text}`,
    order: index,
    block,
  }));
}

function buildWordQueue(words: string[], order: WordOrderMode): string[] {
  if (order === 'random') return shuffle(words);
  return [...words];
}

export default function SoundAlchemist({
  words,
  wordOrder = 'sequential',
  lessonId,
  stageId,
  onWordComplete,
  onLessonComplete,
  requireAllWords = true,
}: SoundAlchemistProps) {
  const initialWord = words[0] ?? '';

  const [wordQueue] = useState<string[]>(() => buildWordQueue(words, wordOrder));
  const [wordIndex, setWordIndex] = useState(0);
  const [word, setWord] = useState<string>(() => initialWord);
  const [items, setItems] = useState<BlockItem[]>(() => buildItems(initialWord));
  const [placedCount, setPlacedCount] = useState(0);
  const [poolOrder, setPoolOrder] = useState<string[]>(() =>
    buildItems(initialWord).map((i) => i.id),
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [lessonDone, setLessonDone] = useState(false);

  const cauldronRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  const placedItems = useMemo(
    () =>
      items
        .filter((i) => i.order < placedCount)
        .sort((a, b) => a.order - b.order),
    [items, placedCount],
  );

  const poolItems = useMemo(() => {
    const remaining = items.filter((i) => i.order >= placedCount);
    return poolOrder
      .map((id) => remaining.find((i) => i.id === id))
      .filter((i): i is BlockItem => Boolean(i));
  }, [items, placedCount, poolOrder]);

  const loadWord = useCallback((nextWord: string) => {
    cancelSpeech();
    const nextItems = buildItems(nextWord);
    setWord(nextWord);
    setItems(nextItems);
    setPlacedCount(0);
    setPoolOrder(shuffle(nextItems.map((i) => i.id)));
    setWon(false);
    setRejectingId(null);
  }, []);

  const startNextWord = useCallback(() => {
    const nextIndex = wordIndex + 1;
    if (nextIndex < wordQueue.length) {
      setWordIndex(nextIndex);
      loadWord(wordQueue[nextIndex]);
    } else if (requireAllWords) {
      setLessonDone(true);
      onLessonComplete?.();
      fireConfetti();
    }
  }, [wordIndex, wordQueue, loadWord, requireAllWords, onLessonComplete]);

  useEffect(() => {
    if (didInit.current || !initialWord) return;
    didInit.current = true;
    loadWord(wordQueue[0] ?? initialWord);
  }, [initialWord, wordQueue, loadWord]);

  const handleDrop = useCallback(
    (item: BlockItem, info: PanInfo) => {
      const cauldron = cauldronRef.current;
      if (!cauldron) return;

      const rect = cauldron.getBoundingClientRect();
      const { x, y } = info.point;
      const insideCauldron =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (!insideCauldron) {
        void speakBlock(item.block);
        return;
      }

      if (item.order === placedCount) {
        const newCount = placedCount + 1;
        setPlacedCount(newCount);

        const placedNow = items
          .filter((i) => i.order < newCount)
          .sort((a, b) => a.order - b.order)
          .map((i) => i.block);

        if (newCount === items.length) {
          setWon(true);
          fireConfetti();
          onWordComplete?.(word);
          void speakBlend(placedNow, 100).then(() => speakWord(word));
        } else {
          void speakBlend(placedNow, 120);
        }
      } else {
        setRejectingId(item.id);
        void speakBlock(item.block);
        window.setTimeout(() => setRejectingId(null), 450);
      }
    },
    [items, placedCount, word, onWordComplete],
  );

  const progress = items.length === 0 ? 0 : placedCount / items.length;
  const isLastWord = wordIndex >= wordQueue.length - 1;

  if (lessonDone) {
    return (
      <div className="flex flex-col items-center gap-6 animate-pop-in">
        <p className="text-4xl font-bold text-green-700">太棒了！關卡完成！</p>
        <p className="text-xl text-amber-700">
          你完成了 {wordQueue.length} 個單字的混音練習
        </p>
        {lessonId || stageId ? (
          <Link
            href={lessonId ? '/' : `/learn/${stageId}`}
            className="rounded-full bg-green-500 px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_#2e7d32]"
          >
            回到課程路徑 →
          </Link>
        ) : null}
      </div>
    );
  }

  if (!initialWord) {
    return <p className="text-xl text-gray-500">沒有可練習的單字</p>;
  }

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-8">
      <div className="flex items-center gap-3 text-2xl text-amber-800">
        <span>把積木依順序拖進煉金爐</span>
        <span className="rounded-full bg-amber-200 px-4 py-1 text-amber-900">
          單字 {wordIndex + 1} / {wordQueue.length}
        </span>
        <span className="rounded-full bg-purple-200 px-4 py-1 text-purple-900">
          {placedCount} / {items.length}
        </span>
      </div>

      <div
        ref={cauldronRef}
        className={[
          'relative flex min-h-[10rem] w-full items-center justify-center gap-3 rounded-[2.5rem] border-8 border-dashed p-6 transition-colors duration-300',
          won
            ? 'border-amber-400 bg-amber-100 animate-glow'
            : 'border-purple-300 bg-white/70',
        ].join(' ')}
      >
        <div
          className={[
            'pointer-events-none absolute inset-0 rounded-[2.5rem] transition-opacity duration-500',
            won ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          style={{
            background:
              'radial-gradient(circle at 50% 60%, rgba(255,213,79,0.55), transparent 70%)',
          }}
        />

        {placedItems.length === 0 && (
          <span className="text-3xl text-purple-300">煉金爐</span>
        )}

        <AnimatePresence>
          {placedItems.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              layout
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              onClick={() => speakBlock(item.block)}
              className="cursor-pointer"
            >
              <PhonicsBlockCard
                block={item.block}
                size="xl"
                highlighted={won}
              />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {won ? (
        <div className="flex flex-col items-center gap-4 animate-pop-in">
          <button
            type="button"
            onClick={() => speakWord(word)}
            className="text-7xl font-bold tracking-wide text-amber-600 drop-shadow-sm"
          >
            {word}
          </button>
          <p className="text-2xl text-green-700">太厲害了，拼出來了！</p>
          <button
            type="button"
            onClick={startNextWord}
            className="rounded-full bg-green-500 px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_#2e7d32] transition-transform active:translate-y-1 active:shadow-[0_2px_0_0_#2e7d32]"
          >
            {isLastWord ? '完成關卡 →' : '下一個單字 →'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex min-h-[8rem] flex-wrap items-center justify-center gap-5 rounded-3xl bg-white/40 p-6">
            <AnimatePresence>
              {poolItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  drag
                  dragSnapToOrigin
                  dragMomentum={false}
                  whileDrag={{ scale: 1.15, zIndex: 50 }}
                  onDragEnd={(_, info) => handleDrop(item, info)}
                  onTap={() => speakBlock(item.block)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: rejectingId === item.id ? 0 : (index % 2 ? 1 : -1) * 3,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={[
                    'cursor-grab touch-none active:cursor-grabbing',
                    rejectingId === item.id ? 'animate-wiggle' : '',
                  ].join(' ')}
                >
                  <PhonicsBlockCard block={item.block} size="lg" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-lg text-amber-700/70">
            點一下積木聽聲音，拖進煉金爐拼單字
          </p>
        </>
      )}

      <div className="h-3 w-full max-w-md overflow-hidden rounded-full bg-white/50">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
