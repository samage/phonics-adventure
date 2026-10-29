'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import type { PhonicsBlock } from '@/types/phonics';
import { parseWordToBlocks } from '@/utils/phonicsEngine';
import { speakBlockPhoneme } from '@/lib/letterSound';
import { cancelSpeech, speakWord } from '@/lib/speech';
import { fireConfetti } from '@/components/ConfettiBurst';
import PhonicsBlockCard from '@/components/PhonicsBlockCard';
import MascotSays from '@/components/mascot/MascotSays';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/ui/PageHeader';
import { shuffled } from '@/lib/recall/quiz';
import { pickSpellingDistractors, recallItemIdForSlot } from '@/lib/spelling/distractors';

interface Tile {
  id: string;
  block: PhonicsBlock;
}

interface SpellingGameProps {
  words: string[];
  /**
   * 拼錯時回報該格對應的「看字說音」項目 id。
   * 呼叫端把它記成 Leitner 複習的「還不會」（拼對不加分：拼字有干擾積木可以靠猜，不能當作「會」的證據）。
   */
  onMistake: (itemId: string) => void;
  onComplete: () => void;
}

/** 聽整字 → 依發音規則把拼法積木拼成單字（點一下或拖進格子；有多餘的混淆積木） */
export default function SpellingGame({ words, onMistake, onComplete }: SpellingGameProps) {
  const [index, setIndex] = useState(0);
  const word = words[index] ?? '';
  if (!word) return <p className="text-xl text-sky-700">沒有可練習的單字</p>;

  return (
    <SpellingWord
      key={`${index}-${word}`}
      word={word}
      index={index}
      total={words.length}
      onMistake={onMistake}
      onNext={() => {
        if (index + 1 < words.length) setIndex(index + 1);
        else {
          fireConfetti();
          onComplete();
        }
      }}
    />
  );
}

function isInside(point: { x: number; y: number }, rect: DOMRect, padding = 32): boolean {
  return (
    point.x >= rect.left - padding &&
    point.x <= rect.right + padding &&
    point.y >= rect.top - padding &&
    point.y <= rect.bottom + padding
  );
}

function SpellingWord({
  word,
  index,
  total,
  onMistake,
  onNext,
}: {
  word: string;
  index: number;
  total: number;
  onMistake: (itemId: string) => void;
  onNext: () => void;
}) {
  // 這個字的答案積木、干擾積木、發牌順序（換字時整個元件重建，所以只算一次）
  const [setup] = useState(() => {
    const blocks = parseWordToBlocks(word);
    const answer: Tile[] = blocks.map((block, i) => ({ id: `a${i}`, block }));
    const extras: Tile[] = pickSpellingDistractors(blocks).map((block, i) => ({
      id: `x${i}`,
      block,
    }));
    return { blocks, answer, extras, order: shuffled([...answer, ...extras].map((t) => t.id)) };
  });
  const { blocks, answer, extras } = setup;

  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const reported = useRef<Set<number>>(new Set());
  const slotsRef = useRef<HTMLDivElement>(null);

  const placed = usedIds.length;
  const won = placed === answer.length;

  const pool = useMemo(() => {
    const all = [...answer, ...extras];
    return setup.order
      .map((id) => all.find((t) => t.id === id))
      .filter((t): t is Tile => !!t && !usedIds.includes(t.id));
  }, [answer, extras, setup.order, usedIds]);

  useEffect(() => {
    const t = window.setTimeout(() => void speakWord(word), 400);
    return () => {
      window.clearTimeout(t);
      cancelSpeech();
    };
  }, [word]);

  useEffect(() => {
    if (won) void speakWord(word);
  }, [won, word]);

  const tryPlace = (tile: Tile) => {
    if (won || usedIds.includes(tile.id)) return;
    const expected = answer[placed];
    if (!expected) return;
    if (tile.block.text.toLowerCase() === expected.block.text.toLowerCase()) {
      setUsedIds((ids) => [...ids, tile.id]);
      return;
    }
    setRejectingId(tile.id);
    setMistakes((n) => n + 1);
    if (!reported.current.has(placed)) {
      reported.current.add(placed);
      const itemId = recallItemIdForSlot(blocks, placed);
      if (itemId) onMistake(itemId);
    }
    // 讓孩子聽到「剛剛選的那一塊」是什麼音，自己發現哪裡不一樣
    void speakBlockPhoneme(tile.block);
    window.setTimeout(() => setRejectingId(null), 450);
  };

  const onDragEnd = (tile: Tile, info: PanInfo) => {
    const el = slotsRef.current;
    if (el && isInside(info.point, el.getBoundingClientRect())) tryPlace(tile);
  };

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3 text-lg text-sky-800">
        <span>聽音後，把拼法積木放進格子</span>
        <span className="rounded-full bg-white px-4 py-1 text-sky-900 shadow-sm">
          單字 {index + 1} / {total}
        </span>
      </div>

      {!won && (
        <div className="flex flex-col items-center gap-2">
          <button type="button" onClick={() => void speakWord(word)} className={BTN_SECONDARY}>
            🔊 聽聽看
          </button>
          <p className="text-sm text-sky-700/80">
            要放 {answer.length} 塊，另外有 {extras.length} 塊是長得很像的混淆積木
          </p>
          {mistakes > 0 && (
            <MascotSays mood="cheer" size={72} className="max-w-md">
              差一點點！再聽一次「🔊 聽聽看」，換一塊試試～
            </MascotSays>
          )}
        </div>
      )}

      <div
        ref={slotsRef}
        className={[
          'flex min-h-[8rem] w-full flex-wrap items-center justify-center gap-2 rounded-[2.5rem] border-4 border-dashed p-5 transition-colors duration-300',
          won ? 'border-pink-300 bg-pink-50 animate-glow' : 'border-sky-300 bg-white/70',
        ].join(' ')}
      >
        {answer.map((slot, i) => {
          const filled = i < placed;
          return (
            <div
              key={slot.id}
              className="flex h-20 min-w-[5.5rem] items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-white/50 px-1"
              style={{ minWidth: slot.block.text.length > 2 ? '7.5rem' : undefined }}
            >
              {filled ? (
                <PhonicsBlockCard block={slot.block} size="lg" highlighted={won} />
              ) : (
                <span className="text-3xl text-sky-200">＿</span>
              )}
            </div>
          );
        })}
      </div>

      {won ? (
        <div className="flex flex-col items-center gap-4 animate-pop-in">
          <button
            type="button"
            onClick={() => void speakWord(word)}
            className="text-7xl font-bold tracking-wide text-sky-600 drop-shadow-sm"
          >
            {word}
          </button>
          <MascotSays mood={mistakes === 0 ? 'wow' : 'happy'} size={96} className="max-w-md">
            {mistakes === 0 ? '太厲害了，一次就拼對！' : '拼出來了！下次會更順喔～'}
          </MascotSays>
          <button type="button" onClick={onNext} className={BTN_PRIMARY}>
            {index + 1 < total ? '下一個單字 →' : '完成拼字 →'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex min-h-[8rem] flex-wrap items-center justify-center gap-5 rounded-3xl bg-white/40 p-6">
            <AnimatePresence>
              {pool.map((tile, i) => (
                <motion.div
                  key={tile.id}
                  layout
                  drag
                  dragSnapToOrigin
                  dragMomentum={false}
                  whileDrag={{ scale: 1.15, zIndex: 50 }}
                  onDragEnd={(_, info) => onDragEnd(tile, info)}
                  onClick={() => tryPlace(tile)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      tryPlace(tile);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: rejectingId === tile.id ? 0 : (i % 2 ? 1 : -1) * 3,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={[
                    'cursor-pointer touch-manipulation',
                    rejectingId === tile.id ? 'animate-wiggle' : '',
                  ].join(' ')}
                >
                  <PhonicsBlockCard block={tile.block} size="lg" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p className="text-base text-sky-700/80">
            點一下積木放進格子（也可以拖進去）；小心，有些是多出來的混淆積木喔
          </p>
        </>
      )}

      <div className="h-3 w-full max-w-md overflow-hidden rounded-full bg-white/60">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-500"
          style={{ width: `${answer.length === 0 ? 0 : (placed / answer.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
