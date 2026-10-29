'use client';

import { useState } from 'react';
import type { TextItem } from '@/data/recall/textItems';
import { speakWord } from '@/lib/speech';
import Mascot from '@/components/mascot/Mascot';
import RateButtons from './RateButtons';
import TextSpeakButtons from './TextSpeakButtons';

interface TextRecallCardProps {
  item: TextItem;
  index: number;
  total: number;
  /** known = 孩子說「我會」 */
  onRate: (known: boolean) => void;
}

/**
 * 特殊字／短句的「看字說說看」卡片（和字母的 RecallCard 同一個流程）：
 * 先看到字（句）、自己大聲唸，再按 🔊 對答案，最後自評「會／不會」。
 * 呼叫端用 key={item.id} 換卡，狀態就會自動重置。
 */
export default function TextRecallCard({ item, index, total, onRate }: TextRecallCardProps) {
  const [heard, setHeard] = useState(false);
  const isWord = item.kind === 'word';
  const spoken = isWord ? item.word : item.text.replace(/[.!?,]/g, '');

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5">
      <p className="rounded-full bg-white/90 px-4 py-1 text-base text-sky-700 shadow-sm">
        {index + 1} / {total}
      </p>

      <div className="relative flex w-full flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-white/90 px-6 py-8 shadow-lg">
        <div className="absolute -top-10 right-3">
          <Mascot mood={heard ? 'happy' : 'think'} size={84} />
        </div>
        <p className="text-base text-sky-700">
          {isWord ? '看到它，大聲唸出來！' : '把整句大聲唸出來！'}
        </p>
        <p
          className={
            isWord
              ? 'text-7xl font-bold leading-none text-sky-900'
              : 'text-center text-4xl font-bold leading-snug text-sky-900'
          }
          aria-label={isWord ? `特殊字 ${item.word}` : `句子 ${item.text}`}
        >
          {isWord ? item.word : item.text}
        </p>
        {isWord && (
          <span className="rounded-full bg-pink-100 px-3 py-0.5 text-sm text-pink-700">
            特殊字・整字記
          </span>
        )}

        <TextSpeakButtons text={spoken} onPlayed={() => setHeard(true)} />

        {heard ? (
          <div className="flex w-full flex-col items-center gap-3 animate-pop-in">
            {isWord ? (
              <p className="text-center text-lg text-sky-900">{item.hint}</p>
            ) : (
              <>
                <p className="text-center text-base text-sky-800">不會的字，點一下聽聽看</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {item.words.map((w, i) => (
                    <button
                      key={`${w}-${i}`}
                      type="button"
                      onClick={() => void speakWord(w.toLowerCase())}
                      className="rounded-full bg-sky-100 px-4 py-1.5 text-lg text-sky-800 hover:bg-sky-200"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-sky-600/80">先試著唸唸看，再按 🔊 對答案</p>
        )}
      </div>

      <RateButtons onRate={onRate} />
    </div>
  );
}
