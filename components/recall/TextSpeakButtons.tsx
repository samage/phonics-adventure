'use client';

import { useCallback, useState } from 'react';
import { speakText } from '@/lib/speech';

/** 整個字／整句的 🔊 正常速度＋ 🐢 慢速（預錄女聲；沒有預錄檔才用裝置 TTS） */

interface TextSpeakButtonsProps {
  /** 要唸的文字（整個字或整句） */
  text: string;
  onPlayed?: () => void;
  label?: boolean;
}

export default function TextSpeakButtons({ text, onPlayed, label = true }: TextSpeakButtonsProps) {
  const [playing, setPlaying] = useState<'normal' | 'slow' | null>(null);

  const play = useCallback(
    async (slow: boolean) => {
      setPlaying(slow ? 'slow' : 'normal');
      onPlayed?.();
      try {
        await speakText(text, { slow });
      } finally {
        setPlaying(null);
      }
    },
    [text, onPlayed],
  );

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => void play(false)}
        aria-label="聽"
        className={`rounded-full bg-sky-400 px-6 py-3 text-2xl text-white shadow-[0_5px_0_0_#2f8fd0] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#2f8fd0] ${
          playing === 'normal' ? 'animate-pulse' : ''
        }`}
      >
        🔊{label ? ' 聽' : ''}
      </button>
      <button
        type="button"
        onClick={() => void play(true)}
        aria-label="慢慢聽"
        className={`rounded-full bg-pink-300 px-6 py-3 text-2xl text-white shadow-[0_5px_0_0_#e58aa9] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#e58aa9] ${
          playing === 'slow' ? 'animate-pulse' : ''
        }`}
      >
        🐢{label ? ' 慢慢聽' : ''}
      </button>
    </div>
  );
}
