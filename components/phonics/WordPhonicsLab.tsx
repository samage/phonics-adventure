'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import WordSoundDots, { getSplitDigraphIndices } from '@/components/phonics/WordSoundDots';
import { BTN_PRIMARY, BTN_PINK, BTN_SECONDARY } from '@/components/ui/PageHeader';
import { parseWordToBlocks } from '@/utils/phonicsEngine';
import { isSilentBlock, speakBlockPhoneme } from '@/lib/letterSound';
import { AUDIO_PACING } from '@/lib/audioPacing';
import { playBlendDemo } from '@/lib/blendDemoAudio';
import { speakWord, cancelSpeech } from '@/lib/speech';

type LabStep = 'buttons' | 'sound_talk' | 'blend' | 'done';

interface WordPhonicsLabProps {
  word: string;
  /** 混音聽完後按「下一個」才會呼叫（沒給就不顯示按鈕，例如單獨試唸） */
  onComplete?: () => void;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export default function WordPhonicsLab({ word, onComplete }: WordPhonicsLabProps) {
  const blocks = useMemo(() => parseWordToBlocks(word), [word]);
  const splitIndices = useMemo(() => getSplitDigraphIndices(blocks), [blocks]);
  const [step, setStep] = useState<LabStep>('buttons');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const stepLabel: Record<LabStep, string> = {
    buttons: 'Sound buttons — 看每個音的位置',
    sound_talk: 'Sound-talk — 一個一個音唸出來',
    blend: 'Blend — 把音混在一起',
    done: '完成！',
  };

  const runSoundTalk = useCallback(async () => {
    cancelSpeech();
    setPlaying(true);
    setStep('sound_talk');
    const playable = blocks
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => !isSilentBlock(b));

    for (const { b, i } of playable) {
      setActiveIndex(i);
      await speakBlockPhoneme(b);
      await delay(AUDIO_PACING.soundTalkGapMs);
    }
    setActiveIndex(null);
    setPlaying(false);
  }, [blocks]);

  const runBlend = useCallback(async () => {
    cancelSpeech();
    setPlaying(true);
    setStep('blend');
    const playable = blocks.filter((b) => !isSilentBlock(b));
    if (playable.length >= 2) {
      await playBlendDemo(word, (h) => {
        if (h === 'onset') setActiveIndex(blocks.indexOf(playable[0]));
        else if (h === 'rime') setActiveIndex(blocks.indexOf(playable[1]));
        else if (h === 'word') setActiveIndex(null);
      });
    } else {
      for (let i = 0; i < blocks.length; i++) {
        if (isSilentBlock(blocks[i])) continue;
        setActiveIndex(i);
        await speakBlockPhoneme(blocks[i]);
        await delay(AUDIO_PACING.soundTalkGapMs);
      }
      setActiveIndex(null);
      await speakWord(word);
    }
    setPlaying(false);
    setStep('done');
  }, [word, blocks]);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <p className="text-center text-lg font-semibold text-sky-900">{stepLabel[step]}</p>

      <motion.p
        key={word}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-5xl font-bold tracking-wider text-sky-950"
      >
        {word}
      </motion.p>

      <WordSoundDots
        blocks={blocks}
        word={word}
        activeIndex={activeIndex}
        splitDigraphIndices={splitIndices}
      />

      <div className="flex flex-wrap justify-center gap-2">
        {(['buttons', 'sound_talk', 'blend'] as const).map((s) => (
          <span
            key={s}
            className={[
              'rounded-full px-3 py-1 text-sm',
              step === s || (step === 'done' && s === 'blend')
                ? 'bg-sky-500 text-white'
                : 'bg-white/80 text-sky-800',
            ].join(' ')}
          >
            {s === 'buttons' ? '① 看音' : s === 'sound_talk' ? '② 切音' : '③ 混音'}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {step === 'buttons' && (
          <button
            type="button"
            disabled={playing}
            onClick={() => void runSoundTalk()}
            className={`${BTN_PRIMARY} disabled:opacity-50`}
          >
            開始切音 →
          </button>
        )}
        {step === 'sound_talk' && !playing && (
          <>
            <button type="button" onClick={() => void runSoundTalk()} className={BTN_SECONDARY}>
              🔊 再聽切音
            </button>
            <button type="button" onClick={() => void runBlend()} className={BTN_PINK}>
              混音 →
            </button>
          </>
        )}
        {step === 'blend' && playing && <p className="text-sky-700">播放中…</p>}
        {step === 'done' && (
          <>
            <button type="button" onClick={() => void runBlend()} className={BTN_SECONDARY}>
              🔊 再聽一次
            </button>
            {onComplete && (
              <button type="button" onClick={onComplete} className={BTN_PRIMARY}>
                下一個 →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
