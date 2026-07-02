'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import type { PhonicsBlock } from '@/types/phonics';
import type { WordOrderMode } from '@/types/curriculum';
import { parseWordToBlocks } from '@/utils/phonicsEngine';
import { speakBlock, speakWord, cancelSpeech } from '@/lib/speech';
import { playBlendDemo, playBlendPartial } from '@/lib/blendDemoAudio';
import { fireConfetti } from '@/components/ConfettiBurst';
import PhonicsBlockCard from '@/components/PhonicsBlockCard';

interface BlockItem {
  id: string;
  order: number;
  block: PhonicsBlock;
}

export type PracticeMode = 'phonics' | 'spelling';

export interface SoundAlchemistProps {
  words: string[];
  wordOrder?: WordOrderMode;
  /** spelling：依發音規則拼積木、只聽整字；phonics：混音積木、逐步混音示範 */
  practiceMode?: PracticeMode;
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

function buildWordItems(word: string): BlockItem[] {
  return parseWordToBlocks(word).map((block, index) => ({
    id: `${word}-slot${index}-${block.text}`,
    order: index,
    block,
  }));
}

function buildItems(word: string): BlockItem[] {
  return buildWordItems(word);
}

function buildWordQueue(words: string[], order: WordOrderMode): string[] {
  if (order === 'random') return shuffle(words);
  return [...words];
}

function blocksMatch(a: PhonicsBlock, b: PhonicsBlock): boolean {
  return a.text.toLowerCase() === b.text.toLowerCase();
}

function isInsideCauldron(
  point: { x: number; y: number },
  rect: DOMRect,
  padding = 32,
): boolean {
  return (
    point.x >= rect.left - padding &&
    point.x <= rect.right + padding &&
    point.y >= rect.top - padding &&
    point.y <= rect.bottom + padding
  );
}

export default function SoundAlchemist({
  words,
  wordOrder = 'sequential',
  practiceMode = 'phonics',
  lessonId,
  stageId,
  onWordComplete,
  onLessonComplete,
  requireAllWords = true,
}: SoundAlchemistProps) {
  const initialWord = words[0] ?? '';
  const isSpelling = practiceMode === 'spelling';

  const [wordQueue] = useState<string[]>(() => buildWordQueue(words, wordOrder));
  const [wordIndex, setWordIndex] = useState(0);
  const [word, setWord] = useState<string>(() => initialWord);
  const [items, setItems] = useState<BlockItem[]>(() =>
    buildItems(initialWord),
  );
  const [filledSlots, setFilledSlots] = useState<BlockItem[]>([]);
  const [usedIds, setUsedIds] = useState<Set<string>>(() => new Set());
  const [poolOrder, setPoolOrder] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [lessonDone, setLessonDone] = useState(false);

  const cauldronRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);
  const itemsRef = useRef(items);
  const filledRef = useRef(filledSlots);
  const usedIdsRef = useRef(usedIds);
  const wordRef = useRef(word);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    filledRef.current = filledSlots;
  }, [filledSlots]);
  useEffect(() => {
    usedIdsRef.current = usedIds;
  }, [usedIds]);
  useEffect(() => {
    wordRef.current = word;
  }, [word]);

  const placedCount = filledSlots.length;

  const poolItems = useMemo(() => {
    const remaining = items.filter((i) => !usedIds.has(i.id));
    return poolOrder
      .map((id) => remaining.find((i) => i.id === id))
      .filter((i): i is BlockItem => Boolean(i));
  }, [items, usedIds, poolOrder]);

  const completeWord = useCallback(
    (finalFilled: BlockItem[]) => {
      setWon(true);
      fireConfetti();
      onWordComplete?.(wordRef.current);
      const placedBlocks = finalFilled.map((i) => i.block);
      if (isSpelling) {
        void speakWord(wordRef.current);
      } else {
        void playBlendDemo(wordRef.current);
      }
    },
    [isSpelling, onWordComplete],
  );

  const tryPlaceItem = useCallback(
    (item: BlockItem) => {
      if (usedIdsRef.current.has(item.id)) return;

      const slotIndex = filledRef.current.length;
      const expected = itemsRef.current[slotIndex];
      if (!expected) return;

      if (!blocksMatch(item.block, expected.block)) {
        setRejectingId(item.id);
        void speakBlock(item.block);
        window.setTimeout(() => setRejectingId(null), 450);
        return;
      }

      const newFilled = [...filledRef.current, item];
      const newUsed = new Set(usedIdsRef.current);
      newUsed.add(item.id);

      filledRef.current = newFilled;
      usedIdsRef.current = newUsed;
      setFilledSlots(newFilled);
      setUsedIds(newUsed);

      if (newFilled.length === itemsRef.current.length) {
        completeWord(newFilled);
      } else if (!isSpelling) {
        void playBlendPartial(wordRef.current, newFilled.length);
      }
    },
    [isSpelling, completeWord],
  );

  const loadWord = useCallback(
    (nextWord: string) => {
      cancelSpeech();
      const nextItems = buildItems(nextWord);
      const emptyUsed = new Set<string>();

      setWord(nextWord);
      setItems(nextItems);
      setFilledSlots([]);
      setUsedIds(emptyUsed);
      setPoolOrder(shuffle(nextItems.map((i) => i.id)));
      setWon(false);
      setRejectingId(null);

      itemsRef.current = nextItems;
      filledRef.current = [];
      usedIdsRef.current = emptyUsed;
      wordRef.current = nextWord;

      if (practiceMode === 'spelling') {
        window.setTimeout(() => speakWord(nextWord), 400);
      }
    },
    [practiceMode],
  );

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
    setReady(true);
  }, [initialWord, wordQueue, loadWord]);

  const handleDragEnd = useCallback(
    (item: BlockItem, info: PanInfo) => {
      const cauldron = cauldronRef.current;
      if (!cauldron) return;

      const inside = isInsideCauldron(info.point, cauldron.getBoundingClientRect());
      if (!inside) {
        if (!isSpelling) void speakBlock(item.block);
        return;
      }

      tryPlaceItem(item);
    },
    [isSpelling, tryPlaceItem],
  );

  const progress = items.length === 0 ? 0 : placedCount / items.length;
  const isLastWord = wordIndex >= wordQueue.length - 1;

  if (lessonDone) {
    return (
      <div className="flex flex-col items-center gap-6 animate-pop-in">
        <p className="text-4xl font-bold text-green-700">太棒了！關卡完成！</p>
        <p className="text-xl text-amber-700">
          你完成了 {wordQueue.length} 個單字的{isSpelling ? '拼字' : '混音'}練習
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

  if (!ready) {
    return (
      <div className="flex w-full max-w-5xl flex-col items-center gap-8 py-12">
        <p className="text-xl text-amber-700">準備拼字練習…</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-8">
      <div className="flex flex-wrap items-center justify-center gap-3 text-2xl text-amber-800">
        <span>{isSpelling ? '聽音後，把拼法積木拖進煉金爐' : '把積木拖進煉金爐，聽音素連在一起'}</span>
        <span className="rounded-full bg-amber-200 px-4 py-1 text-amber-900">
          單字 {wordIndex + 1} / {wordQueue.length}
        </span>
        <span className="rounded-full bg-purple-200 px-4 py-1 text-purple-900">
          {placedCount} / {items.length}
        </span>
      </div>

      {!isSpelling && !won && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => void playBlendDemo(word)}
            className="rounded-full bg-purple-100 px-6 py-3 text-xl text-purple-900 hover:bg-purple-200"
          >
            🔊 聽示範（s + at → sat）
          </button>
          <p className="text-sm text-purple-700/80">
            拉長第一個音，再接韻尾，一口氣念出來
          </p>
        </div>
      )}

      {isSpelling && !won && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => speakWord(word)}
            className="rounded-full bg-amber-100 px-6 py-3 text-xl text-amber-900 hover:bg-amber-200"
          >
            🔊 聽聽看
          </button>
          <p className="text-sm text-amber-600/80">
            共 {items.length} 塊拼法，請聽整字後依規則組合
          </p>
        </div>
      )}

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
          className="pointer-events-none absolute inset-0 rounded-[2.5rem] transition-opacity duration-500"
          style={{
            opacity: won ? 1 : 0,
            background:
              'radial-gradient(circle at 50% 60%, rgba(255,213,79,0.55), transparent 70%)',
          }}
        />

        {isSpelling && !won ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {items.map((slot, i) => (
              <div
                key={slot.id}
                className="flex h-20 min-w-[5.5rem] items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-white/50 px-1"
                style={{
                  minWidth: slot.block.text.length > 2 ? '7.5rem' : undefined,
                }}
              >
                {filledSlots[i] ? (
                  <PhonicsBlockCard
                    block={filledSlots[i].block}
                    size="lg"
                    showBlendHint={false}
                  />
                ) : (
                  <span className="text-3xl text-purple-200">＿</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {filledSlots.length === 0 && (
              <span className="pointer-events-none text-3xl text-purple-300">煉金爐</span>
            )}
            <AnimatePresence>
              {filledSlots.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="pointer-events-none flex items-center"
                >
                  {index > 0 && (
                    <span
                      className="mx-1 text-2xl font-bold text-purple-400"
                      aria-hidden
                    >
                      —
                    </span>
                  )}
                  <PhonicsBlockCard
                    block={item.block}
                    size="xl"
                    highlighted={won}
                    showBlendHint={false}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
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
                  onDragEnd={(_, info) => handleDragEnd(item, info)}
                  onClick={() => {
                    if (isSpelling) tryPlaceItem(item);
                  }}
                  onKeyDown={(e) => {
                    if (isSpelling && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      tryPlaceItem(item);
                    }
                  }}
                  role={isSpelling ? 'button' : undefined}
                  tabIndex={isSpelling ? 0 : undefined}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: rejectingId === item.id ? 0 : (index % 2 ? 1 : -1) * 3,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={[
                    isSpelling
                      ? 'cursor-pointer touch-manipulation'
                      : 'cursor-grab touch-none active:cursor-grabbing',
                    rejectingId === item.id ? 'animate-wiggle' : '',
                  ].join(' ')}
                >
                  <PhonicsBlockCard
                    block={item.block}
                    size="lg"
                    showBlendHint={false}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-lg text-amber-700/70">
            {isSpelling
              ? '點一下積木放進格子，或拖進煉金爐；相同拼法可任意選擇'
              : '點一下積木聽聲音，拖進煉金爐拼單字'}
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
