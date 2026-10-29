'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fireConfetti } from '@/components/ConfettiBurst';
import PhonicsBlockCard from '@/components/PhonicsBlockCard';
import PhonicsTypeLegend from '@/components/learn/PhonicsTypeLegend';
import SpellingGame from '@/components/learn/SpellingGame';
import WordPhonicsLab from '@/components/phonics/WordPhonicsLab';
import Mascot from '@/components/mascot/Mascot';
import MascotSays from '@/components/mascot/MascotSays';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/ui/PageHeader';
import RecallRound, { type RoundResult } from '@/components/recall/RecallRound';
import SoundPlayButtons from '@/components/recall/SoundPlayButtons';
import { getBlendLesson } from '@/data/blends';
import { getGraphemePhonics, graphemeToBlock } from '@/data/graphemePhonics';
import { getLetterPhonics } from '@/data/letterPhonics';
import { letterToBlock, speakGrapheme } from '@/lib/letterSound';
import { quizPoolForLesson, recallItemsForLesson } from '@/lib/learn/lessonItems';
import { useProgress } from '@/lib/progress';
import { speakWord } from '@/lib/speech';
import type { GraphemeContent, Lesson } from '@/types/curriculum';
import type { PhonicsBlock } from '@/types/phonics';

type Phase = 'intro' | 'recall' | 'lab' | 'spelling' | 'done';

/** 例字示範（切音→混音）最多看幾個；每個字的完整練習在拼字裡 */
const LAB_WORD_COUNT = 3;

const PHASE_LABEL: Record<Exclude<Phase, 'done'>, string> = {
  intro: '學新的',
  recall: '看字說音',
  lab: '例字',
  spelling: '拼字',
};

function resolveIntroBlock(key: string): PhonicsBlock {
  if (getGraphemePhonics(key)) return graphemeToBlock(key);
  return letterToBlock(key);
}

interface LessonFlowProps {
  lesson: Lesson;
  content: GraphemeContent;
}

/**
 * 一堂拼讀課 = 學 → 看字說音（含小測驗）→ 例字示範 → 拼字 → 完成。
 * 「看字說音」寫進 Leitner 複習表，所以學完的字母明天會自動出現在「今天複習」。
 */
export default function LessonFlow({ lesson, content }: LessonFlowProps) {
  const { progress, completeLesson, recordOutcome } = useProgress();
  const items = useMemo(() => recallItemsForLesson(lesson), [lesson]);
  const [pool] = useState(() => quizPoolForLesson(lesson, progress.review));
  const words = content.words;
  const labWords = useMemo(() => words.slice(0, LAB_WORD_COUNT), [words]);

  const steps = useMemo<Array<Exclude<Phase, 'done'>>>(() => {
    const s: Array<Exclude<Phase, 'done'>> = ['intro'];
    if (items.length > 0) s.push('recall');
    if (labWords.length > 0) s.push('lab');
    if (words.length > 0) s.push('spelling');
    return s;
  }, [items.length, labWords.length, words.length]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [labIndex, setLabIndex] = useState(0);
  const [recallResult, setRecallResult] = useState<RoundResult | null>(null);

  const goAfter = (current: Exclude<Phase, 'done'>) => {
    const next = steps[steps.indexOf(current) + 1];
    if (next) {
      setPhase(next);
      return;
    }
    completeLesson(lesson.id);
    fireConfetti();
    setPhase('done');
  };

  if (phase === 'done') {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5 animate-pop-in">
        <Mascot mood="wow" size={150} />
        <p className="text-4xl font-bold text-sky-700">太棒了！課程完成！</p>
        {recallResult && (
          <p className="text-xl text-sky-900">
            看字說音答對 {recallResult.right} / {recallResult.total}
          </p>
        )}
        <MascotSays mood="happy">
          {items.length > 0
            ? '今天學的字母已經放進複習本，隔幾天會自動出現在「今天複習」，幫你記得更牢！'
            : '這一課完成囉！繼續往下一課前進吧～'}
        </MascotSays>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className={BTN_PRIMARY}>
            回到課程地圖 →
          </Link>
          <Link href="/review" className={BTN_SECONDARY}>
            去今天複習
          </Link>
        </div>
      </div>
    );
  }

  const stepper = (
    <ol className="flex flex-wrap justify-center gap-2 text-sm">
      {steps.map((s, i) => (
        <li
          key={s}
          className={[
            'rounded-full px-3 py-1',
            s === phase ? 'bg-sky-500 text-white' : 'bg-white/80 text-sky-800',
          ].join(' ')}
        >
          {i + 1} {PHASE_LABEL[s]}
        </li>
      ))}
    </ol>
  );

  if (phase === 'recall') {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        {stepper}
        <RecallRound
          items={items}
          pools={{ grapheme: pool }}
          onDone={(r) => {
            setRecallResult(r);
            goAfter('recall');
          }}
        />
      </div>
    );
  }

  if (phase === 'lab') {
    const word = labWords[labIndex];
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {stepper}
        <p className="text-lg text-sky-800">
          例字示範 {labIndex + 1} / {labWords.length}
        </p>
        <WordPhonicsLab
          key={word}
          word={word}
          onComplete={() => {
            if (labIndex + 1 < labWords.length) setLabIndex(labIndex + 1);
            else goAfter('lab');
          }}
        />
        <button
          type="button"
          onClick={() => goAfter('lab')}
          className="text-sm text-sky-700 underline"
        >
          跳過例字
        </button>
      </div>
    );
  }

  if (phase === 'spelling') {
    return (
      <div className="flex w-full flex-col items-center gap-5">
        {stepper}
        <SpellingGame
          words={words}
          onMistake={(id) => recordOutcome(id, 'wrong')}
          onComplete={() => goAfter('spelling')}
        />
      </div>
    );
  }

  return (
    <IntroPhase
      content={content}
      stepper={stepper}
      onNext={() => goAfter('intro')}
      hasNext={steps.length > 1}
    />
  );
}

function IntroPhase({
  content,
  stepper,
  onNext,
  hasNext,
}: {
  content: GraphemeContent;
  stepper: React.ReactNode;
  onNext: () => void;
  hasNext: boolean;
}) {
  const key = content.patternKey || content.graphemes[0];
  const blendLesson = getBlendLesson(key);
  const meta = getGraphemePhonics(key);
  const letterMeta = getLetterPhonics(key);
  const block = resolveIntroBlock(key);
  const introNote = content.ruleHint ?? meta?.ruleDetail ?? blendLesson?.hint;
  const hint =
    meta?.hint ??
    letterMeta?.hint ??
    (blendLesson ? '兩個（或三個）子音要一個一個唸出來，再快快連在一起' : `聽聽「${key}」的發音`);
  const exampleWords = meta?.exampleWords ?? content.words.slice(0, 4);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5">
      {stepper}
      <PhonicsTypeLegend />
      {introNote && (
        <div className="w-full whitespace-pre-line rounded-2xl bg-white/90 px-6 py-4 text-left text-base leading-relaxed text-sky-900 shadow-md">
          {introNote}
        </div>
      )}
      {blendLesson ? (
        <div className="flex flex-wrap items-start justify-center gap-5">
          {blendLesson.blends.map((b) => (
            <div key={b} className="flex flex-col items-center gap-2">
              <PhonicsBlockCard
                block={{ text: b, type: 'blend', soundRule: 'Blend', phoneme: '' }}
                size="lg"
              />
              <SoundPlayButtons audio={`blend:${b}`} size="md" label={false} />
            </div>
          ))}
        </div>
      ) : (
        <motion.button
          type="button"
          key={key}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => void speakGrapheme(key)}
          className="cursor-pointer"
        >
          <PhonicsBlockCard block={block} size="xl" highlighted showLabel multiSpelling={!!meta} />
        </motion.button>
      )}
      <div className="w-full text-center">
        <p className="text-xl font-medium text-sky-900">{hint}</p>
        <p className="mt-3 text-lg text-sky-800">例字：</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {exampleWords.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => void speakWord(word)}
              className="rounded-full bg-white px-4 py-2 text-lg font-semibold text-sky-800 shadow-sm hover:bg-sky-50"
            >
              {word}
              {meta?.exampleNotes?.[word] && (
                <span className="ml-1 text-sm font-normal text-sky-600">
                  （{meta.exampleNotes[word]}）
                </span>
              )}
            </button>
          ))}
        </div>
        {meta && (
          <p className="mt-4 text-sm text-sky-700/80">
            拼法：
            {meta.spellings.map((s, i) => (
              <span key={s}>
                {i > 0 && <span className="mx-1 text-sky-300">/</span>}
                <span className="font-bold">{s}</span>
              </span>
            ))}
          </p>
        )}
      </div>
      <button type="button" onClick={onNext} className={BTN_PRIMARY}>
        {hasNext ? '我學會了，來練習 →' : '完成 →'}
      </button>
    </div>
  );
}
