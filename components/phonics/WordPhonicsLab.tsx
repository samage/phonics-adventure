'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SoundButtons, { getSplitDigraphIndices } from '@/components/phonics/SoundButtons';
import type { PhonicsBlock } from '@/types/phonics';
import { parseWordToBlocks } from '@/utils/phonicsEngine';
import { speakBlockPhoneme } from '@/lib/letterSound';
import { playBlendDemo } from '@/lib/blendDemoAudio';
import { speakWord, cancelSpeech } from '@/lib/speech';

type LabStep = 'buttons' | 'sound_talk' | 'blend' | 'done';

interface WordPhonicsLabProps {
  word: string;
  onComplete?: () => void;
  autoAdvance?: boolean;
}

function playableBlocks(blocks: PhonicsBlock[]): PhonicsBlock[] {
  return blocks.filter((b) => b.type !== 'silent_e');
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export default function WordPhonicsLab({
  word,
  onComplete,
  autoAdvance = false,
}: WordPhonicsLabProps) {
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
      .filter(({ b }) => b.type !== 'silent_e');

    for (const { b, i } of playable) {
      setActiveIndex(i);
      await speakBlockPhoneme(b);
      await delay(400);
    }
    setActiveIndex(null);
    setPlaying(false);
    if (autoAdvance) setStep('blend');
  }, [blocks, autoAdvance]);

  const runBlend = useCallback(async () => {
    cancelSpeech();
    setPlaying(true);
    setStep('blend');
    const playable = blocks.filter((b) => b.type !== 'silent_e');
    if (playable.length >= 2) {
      await playBlendDemo(word, (h) => {
        if (h === 'onset') setActiveIndex(blocks.indexOf(playable[0]));
        else if (h === 'rime') setActiveIndex(blocks.indexOf(playable[1]));
        else if (h === 'word') setActiveIndex(null);
      });
    } else {
      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].type === 'silent_e') continue;
        setActiveIndex(i);
        await speakBlockPhoneme(blocks[i]);
        await delay(280);
      }
      setActiveIndex(null);
      await speakWord(word);
    }
    setPlaying(false);
    setStep('done');
    onComplete?.();
  }, [word, blocks, onComplete]);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <p className="text-center text-lg font-semibold text-purple-900">{stepLabel[step]}</p>

      <motion.p
        key={word}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-5xl font-bold tracking-wider text-amber-950"
      >
        {word}
      </motion.p>

      <SoundButtons
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
                ? 'bg-purple-500 text-white'
                : 'bg-purple-100 text-purple-800',
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
            className="rounded-full bg-purple-500 px-8 py-3 text-xl text-white shadow-[0_4px_0_#6a1b9a] disabled:opacity-50"
          >
            開始切音 →
          </button>
        )}
        {step === 'sound_talk' && !playing && (
          <button
            type="button"
            onClick={() => void runSoundTalk()}
            className="rounded-full bg-amber-100 px-6 py-2 text-amber-900"
          >
            🔊 再聽切音
          </button>
        )}
        {(step === 'sound_talk' || step === 'buttons') && !playing && step !== 'buttons' && (
          <button
            type="button"
            onClick={() => void runBlend()}
            className="rounded-full bg-green-500 px-8 py-3 text-xl text-white shadow-[0_4px_0_#2e7d32]"
          >
            混音 →
          </button>
        )}
        {step === 'sound_talk' && !playing && (
          <button
            type="button"
            onClick={() => void runBlend()}
            className="rounded-full bg-green-500 px-8 py-3 text-xl text-white"
          >
            跳過切音，直接混音
          </button>
        )}
        {step === 'blend' && playing && (
          <p className="text-amber-700">播放中…</p>
        )}
        {step === 'done' && (
          <>
            <button
              type="button"
              onClick={() => {
                setStep('buttons');
                void runBlend();
              }}
              className="rounded-full bg-amber-100 px-6 py-2 text-amber-900"
            >
              🔊 再聽一次
            </button>
            {onComplete && (
              <button
                type="button"
                onClick={onComplete}
                className="rounded-full bg-green-500 px-8 py-3 text-xl text-white"
              >
                下一個 →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
