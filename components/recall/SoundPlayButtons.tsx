'use client';

import { useCallback, useState } from 'react';
import { playRecallSound } from '@/lib/recall/audio';
import { speakGrapheme } from '@/lib/letterSound';

interface SoundPlayButtonsProps {
  audio: string;
  /** 沒有預錄音時的後備：用字母本身念 */
  fallbackKey?: string;
  onPlayed?: () => void;
  size?: 'md' | 'lg';
  label?: boolean;
}

/** 🔊 正常速度＋ 🐢 慢速，播放的是真正的音素錄音（不是字母名稱） */
export default function SoundPlayButtons({
  audio,
  fallbackKey,
  onPlayed,
  size = 'lg',
  label = true,
}: SoundPlayButtonsProps) {
  const [playing, setPlaying] = useState<'normal' | 'slow' | null>(null);

  const play = useCallback(
    async (slow: boolean) => {
      setPlaying(slow ? 'slow' : 'normal');
      onPlayed?.();
      try {
        const ok = await playRecallSound(audio, { slow });
        if (!ok && fallbackKey) await speakGrapheme(fallbackKey);
      } finally {
        setPlaying(null);
      }
    },
    [audio, fallbackKey, onPlayed],
  );

  const base =
    size === 'lg'
      ? 'px-6 py-3 text-2xl'
      : 'px-4 py-2 text-lg';

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => void play(false)}
        aria-label="聽聲音"
        className={`rounded-full bg-sky-400 text-white shadow-[0_5px_0_0_#2f8fd0] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#2f8fd0] ${base} ${
          playing === 'normal' ? 'animate-pulse' : ''
        }`}
      >
        🔊{label ? ' 聽' : ''}
      </button>
      <button
        type="button"
        onClick={() => void play(true)}
        aria-label="慢慢聽"
        className={`rounded-full bg-pink-300 text-white shadow-[0_5px_0_0_#e58aa9] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#e58aa9] ${base} ${
          playing === 'slow' ? 'animate-pulse' : ''
        }`}
      >
        🐢{label ? ' 慢慢聽' : ''}
      </button>
    </div>
  );
}
