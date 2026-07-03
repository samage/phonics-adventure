'use client';

import { motion } from 'framer-motion';
import type { PhonicsBlock } from '@/types/phonics';

interface SoundButtonsProps {
  blocks: PhonicsBlock[];
  word: string;
  activeIndex?: number | null;
  /** 高亮 split digraph 的 a…e 連線 */
  splitDigraphIndices?: [number, number] | null;
}

function isMultiLetterBlock(block: PhonicsBlock): boolean {
  if (block.type === 'silent_e') return false;
  if (block.type === 'digraph' || block.type === 'blend') return true;
  return block.text.length > 1;
}

function isSplitDigraph(
  blocks: PhonicsBlock[],
  index: number,
): boolean {
  const b = blocks[index];
  if (b.type !== 'long_vowel' || b.text.length !== 1) return false;
  const last = blocks[blocks.length - 1];
  return last?.type === 'silent_e';
}

export default function SoundButtons({
  blocks,
  word,
  activeIndex = null,
  splitDigraphIndices = null,
}: SoundButtonsProps) {
  const letters = word.split('');
  let letterOffset = 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-end justify-center gap-1">
        {blocks.map((block, blockIndex) => {
          if (block.type === 'silent_e') {
            return (
              <div key={`${word}-silent`} className="flex flex-col items-center px-0.5">
                <span
                  className={[
                    'text-4xl font-bold tracking-wide',
                    activeIndex === blockIndex ? 'text-purple-700' : 'text-gray-400',
                  ].join(' ')}
                >
                  e
                </span>
                <span className="mt-1 text-[10px] text-gray-400">靜音</span>
              </div>
            );
          }

          const span = block.text.length;
          const slice = letters.slice(letterOffset, letterOffset + span).join('');
          letterOffset += span;
          const active = activeIndex === blockIndex;
          const multi = isMultiLetterBlock(block);
          const split =
            splitDigraphIndices?.[0] === blockIndex ||
            isSplitDigraph(blocks, blockIndex);

          return (
            <div key={`${word}-block-${blockIndex}`} className="flex flex-col items-center px-1">
              <span
                className={[
                  'text-4xl font-bold tracking-wide',
                  active ? 'text-purple-700 scale-110' : 'text-amber-950',
                  'transition-transform',
                ].join(' ')}
              >
                {slice || block.text}
              </span>
              <div className="mt-2 flex h-3 items-center justify-center">
                {multi || split ? (
                  <motion.div
                    layout
                    className={[
                      'h-1 rounded-full',
                      active ? 'bg-purple-500 w-full min-w-[2rem]' : 'bg-amber-400 w-full min-w-[1.5rem]',
                    ].join(' ')}
                  />
                ) : (
                  <motion.div
                    layout
                    className={[
                      'h-2.5 w-2.5 rounded-full',
                      active ? 'bg-purple-500 scale-125' : 'bg-amber-500',
                    ].join(' ')}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function getSplitDigraphIndices(blocks: PhonicsBlock[]): [number, number] | null {
  const vowelIdx = blocks.findIndex(
    (b, i) => b.type === 'long_vowel' && blocks[blocks.length - 1]?.type === 'silent_e' && i < blocks.length - 1,
  );
  if (vowelIdx < 0) return null;
  return [vowelIdx, blocks.length - 1];
}
