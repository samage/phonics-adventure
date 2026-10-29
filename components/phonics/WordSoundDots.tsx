'use client';

import { motion } from 'framer-motion';
import type { PhonicsBlock } from '@/types/phonics';

interface WordSoundDotsProps {
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

export default function WordSoundDots({
  blocks,
  word,
  activeIndex = null,
  splitDigraphIndices = null,
}: WordSoundDotsProps) {
  const letters = word.split('');
  // 每個積木對應到單字裡的哪幾個字母（靜音 e 不佔位置）
  const slices: string[] = [];
  let letterOffset = 0;
  for (const b of blocks) {
    if (b.type === 'silent_e') {
      slices.push('');
      continue;
    }
    slices.push(letters.slice(letterOffset, letterOffset + b.text.length).join(''));
    letterOffset += b.text.length;
  }

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
                    activeIndex === blockIndex ? 'text-pink-600' : 'text-sky-300',
                  ].join(' ')}
                >
                  e
                </span>
                <span className="mt-1 text-[10px] text-sky-300">靜音</span>
              </div>
            );
          }

          const slice = slices[blockIndex];
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
                  active ? 'text-pink-600 scale-110' : 'text-sky-950',
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
                      active ? 'bg-pink-400 w-full min-w-[2rem]' : 'bg-sky-300 w-full min-w-[1.5rem]',
                    ].join(' ')}
                  />
                ) : (
                  <motion.div
                    layout
                    className={[
                      'h-2.5 w-2.5 rounded-full',
                      active ? 'bg-pink-400 scale-125' : 'bg-sky-400',
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
