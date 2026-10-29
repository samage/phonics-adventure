'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fireConfetti } from '@/components/ConfettiBurst';
import PhonicsBlockCard from '@/components/PhonicsBlockCard';
import PhonicsTypeLegend from '@/components/learn/PhonicsTypeLegend';
import WordPhonicsLab from '@/components/phonics/WordPhonicsLab';
import SoundAlchemist from '@/components/games/SoundAlchemist/SoundAlchemist';
import { getGraphemePhonics, graphemeToBlock } from '@/data/graphemePhonics';
import { getLetterPhonics } from '@/data/letterPhonics';
import { getBlendLesson } from '@/data/blends';
import Mascot from '@/components/mascot/Mascot';
import RecallSoundButtons from '@/components/recall/SoundButtons';
import { letterToBlock, speakGrapheme } from '@/lib/letterSound';
import { speakWord } from '@/lib/speech';
import type { WordOrderMode } from '@/types/curriculum';
import type { PhonicsBlock } from '@/types/phonics';
import type { WordStat } from '@/types/progress';
import { prioritizeWeakWords } from '@/lib/progress/wordStats';

type Phase = 'intro' | 'wordLab' | 'spelling' | 'done';

interface GraphemeLessonProps {
  patternKey: string;
  graphemes: string[];
  words: string[];
  wordOrder?: WordOrderMode;
  ruleHint?: string;
  lessonId: string;
  /** 過去的作答紀錄：拼不好的字會先出現 */
  wordStats?: Record<string, WordStat>;
  onComplete: () => void;
  /** 拼字練習每完成一個字就回報；correct = 沒有任何拼錯 */
  onWordComplete?: (word: string, correct: boolean) => void;
  /** 拼字時選錯積木，回報該格對應的「看字說音」項目 id（進今天複習） */
  onSpellingMistake?: (itemId: string) => void;
}

function resolveIntroBlock(key: string): PhonicsBlock {
  if (getGraphemePhonics(key)) return graphemeToBlock(key);
  if (getLetterPhonics(key)) return letterToBlock(key);
  return letterToBlock(key);
}

export default function GraphemeLesson({
  patternKey,
  graphemes,
  words,
  wordOrder = 'sequential',
  ruleHint,
  lessonId,
  wordStats,
  onComplete,
  onWordComplete,
  onSpellingMistake,
}: GraphemeLessonProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [wordIndex, setWordIndex] = useState(0);
  const [spellingWords] = useState(() =>
    wordStats ? prioritizeWeakWords(words, wordStats) : words,
  );

  const key = patternKey || graphemes[0];
  const blendLesson = getBlendLesson(key);
  const meta = getGraphemePhonics(key);
  const letterMeta = getLetterPhonics(key);
  const block = resolveIntroBlock(key);
  const introNote = ruleHint ?? meta?.ruleDetail ?? blendLesson?.hint;
  const hint =
    meta?.hint ??
    letterMeta?.hint ??
    (blendLesson ? '兩個（或三個）子音要一個一個唸出來，再快快連在一起' : `聽聽「${key}」的發音`);
  const exampleWords = meta?.exampleWords ?? words.slice(0, 4);
  const labWords = words.length > 0 ? words : exampleWords;
  const currentLabWord = labWords[wordIndex] ?? labWords[0] ?? '';

  const finishLesson = () => {
    fireConfetti();
    setPhase('done');
    onComplete();
  };

  const handleIntroNext = () => {
    if (labWords.length > 0) setPhase('wordLab');
    else finishLesson();
  };

  // 例字練習（Sound buttons）只是示範，不算「答題」；真正的作答成績來自拼字練習
  const handleWordLabComplete = () => {
    if (wordIndex < labWords.length - 1) {
      setWordIndex((i) => i + 1);
    } else if (words.length > 0) {
      setPhase('spelling');
    } else {
      finishLesson();
    }
  };

  const handleComplete = finishLesson;

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 animate-pop-in">
        <Mascot mood="wow" size={150} />
        <p className="text-4xl font-bold text-emerald-600">太棒了！課程完成！</p>
        <Link
          href="/"
          className="rounded-full bg-sky-400 px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_#2f8fd0]"
        >
          回到課程路徑 →
        </Link>
      </div>
    );
  }

  if (phase === 'wordLab' && currentLabWord) {
    return (
      <div className="flex w-full flex-col items-center gap-6">
        <p className="text-lg text-purple-800">
          例字練習 {wordIndex + 1} / {labWords.length}
        </p>
        <WordPhonicsLab
          key={currentLabWord}
          word={currentLabWord}
          onComplete={handleWordLabComplete}
        />
        <button
          type="button"
          onClick={() => setPhase('spelling')}
          className="text-sm text-amber-700 underline"
        >
          跳過例字，直接拼字練習
        </button>
      </div>
    );
  }

  if (phase === 'spelling') {
    return (
      <SoundAlchemist
        words={spellingWords}
        wordOrder={wordOrder}
        practiceMode="spelling"
        lessonId={lessonId}
        onWordComplete={onWordComplete}
        onSpellingMistake={onSpellingMistake}
        onLessonComplete={handleComplete}
        requireAllWords
      />
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      <PhonicsTypeLegend />
      <p className="text-sm font-medium text-purple-700">① 聽音素 → ② 看字素 → ③ 例字</p>
      {introNote && (
        <div className="w-full rounded-2xl bg-purple-100 px-6 py-4 text-left text-base leading-relaxed text-purple-900 whitespace-pre-line">
          {introNote}
        </div>
      )}
      {blendLesson ? (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex flex-wrap items-start justify-center gap-5">
            {blendLesson.blends.map((b) => (
              <div key={b} className="flex flex-col items-center gap-2">
                <PhonicsBlockCard
                  block={{ text: b, type: 'blend', soundRule: 'Blend', phoneme: '' }}
                  size="lg"
                />
                <RecallSoundButtons audio={`blend:${b}`} size="md" label={false} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <motion.button
          type="button"
          key={key}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => speakGrapheme(key)}
          className="cursor-pointer"
        >
          <PhonicsBlockCard block={block} size="xl" highlighted showLabel multiSpelling={!!meta} />
        </motion.button>
      )}
      <div className="w-full text-center">
        <p className="text-xl font-medium text-amber-900">{hint}</p>
        <p className="mt-3 text-lg text-amber-800">例字：</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {exampleWords.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => speakWord(word)}
              className="rounded-full bg-amber-100 px-4 py-2 text-lg font-semibold text-amber-800 hover:bg-amber-200"
            >
              {word}
              {meta?.exampleNotes?.[word] && (
                <span className="ml-1 text-sm font-normal text-amber-600">
                  （{meta.exampleNotes[word]}）
                </span>
              )}
            </button>
          ))}
        </div>
        {meta && (
          <p className="mt-4 text-sm text-amber-600/80">
            拼法：
            {meta.spellings.map((s, i) => (
              <span key={s}>
                {i > 0 && <span className="mx-1 text-amber-400">/</span>}
                <span className="font-bold">{s}</span>
              </span>
            ))}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleIntroNext}
        className="rounded-full bg-sky-400 px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_#2f8fd0]"
      >
        {labWords.length > 0 ? '開始例字練習（Sound buttons）→' : '完成 →'}
      </button>
    </div>
  );
}
