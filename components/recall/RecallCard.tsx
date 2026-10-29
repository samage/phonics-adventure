'use client';

import { useState } from 'react';
import type { RecallItem } from '@/data/recall/items';
import { speakWord } from '@/lib/speech';
import Mascot from '@/components/mascot/Mascot';
import SoundPlayButtons from './SoundPlayButtons';

interface RecallCardProps {
  item: RecallItem;
  index: number;
  total: number;
  /** known = 孩子說「我會」 */
  onRate: (known: boolean) => void;
}

/**
 * 看字母說音：先看到字、自己大聲說，再按 🔊 對答案，最後自評「會／不會」。
 * 呼叫端用 key={item.id} 換卡，狀態就會自動重置。
 */
export default function RecallCard({ item, index, total, onRate }: RecallCardProps) {
  const [heard, setHeard] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5">
      <p className="rounded-full bg-white/90 px-4 py-1 text-base text-sky-700 shadow-sm">
        {index + 1} / {total}
      </p>

      <div className="relative flex w-full flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-white/90 px-6 py-8 shadow-lg">
        <div className="absolute -top-10 right-3">
          <Mascot mood={heard ? 'happy' : 'think'} size={84} />
        </div>
        <p className="text-base text-sky-700">看到它，大聲說出聲音！</p>
        <p
          className="text-8xl font-bold leading-none text-sky-900"
          aria-label={`字母 ${item.display}`}
        >
          {item.display}
        </p>
        {item.tag && (
          <span className="rounded-full bg-pink-100 px-3 py-0.5 text-sm text-pink-700">
            {item.tag}
          </span>
        )}

        <SoundPlayButtons
          audio={item.audio}
          fallbackKey={item.patternKey ?? item.display}
          onPlayed={() => setHeard(true)}
        />

        {heard ? (
          <div className="flex w-full flex-col items-center gap-3 animate-pop-in">
            <p className="text-center text-lg text-sky-900">{item.hint}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {item.words.slice(0, 3).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => void speakWord(w)}
                  className="rounded-full bg-sky-100 px-4 py-1.5 text-lg text-sky-800 hover:bg-sky-200"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-sky-600/80">先試著說說看，再按 🔊 對答案</p>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onRate(false)}
          className="rounded-3xl bg-pink-100 px-4 py-4 text-xl text-pink-700 shadow-[0_5px_0_0_#f3b6ca] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#f3b6ca]"
        >
          🌱 還不會
        </button>
        <button
          type="button"
          onClick={() => onRate(true)}
          className="rounded-3xl bg-sky-400 px-4 py-4 text-xl text-white shadow-[0_5px_0_0_#2f8fd0] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#2f8fd0]"
        >
          ✋ 我會！
        </button>
      </div>
    </div>
  );
}
