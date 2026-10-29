'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { fireConfetti } from '@/components/ConfettiBurst';
import DecodableSentenceLesson from '@/components/learn/DecodableSentenceLesson';
import SightWordLesson from '@/components/learn/SightWordLesson';
import Mascot from '@/components/mascot/Mascot';
import MascotSays from '@/components/mascot/MascotSays';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/ui/PageHeader';
import RecallRound, { type RoundResult } from '@/components/recall/RecallRound';
import { quizTextPoolForLesson, textItemsForLesson } from '@/lib/learn/lessonItems';
import { useProgress } from '@/lib/progress';
import type {
  DecodableSentenceContent,
  Lesson,
  SightWordContent,
} from '@/types/curriculum';

type Phase = 'learn' | 'recall' | 'done';

interface TextLessonFlowProps {
  lesson: Lesson;
  content: SightWordContent | DecodableSentenceContent;
}

/**
 * 特殊字課／短句課 = 學（整字記、逐字讀句子）→ 看字說說看（含小測驗）→ 完成。
 * 後兩步和字母課用同一個 RecallRound、寫進同一份 Leitner 複習表，
 * 所以學完的特殊字和句子明天會自動出現在「今天複習」。
 */
export default function TextLessonFlow({ lesson, content }: TextLessonFlowProps) {
  const { progress, completeLesson } = useProgress();
  const items = useMemo(() => textItemsForLesson(lesson), [lesson]);
  const [pool] = useState(() => quizTextPoolForLesson(lesson, progress.review));
  const [phase, setPhase] = useState<Phase>('learn');
  const [result, setResult] = useState<RoundResult | null>(null);

  const finish = () => {
    completeLesson(lesson.id);
    fireConfetti();
    setPhase('done');
  };

  if (phase === 'done') {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5 animate-pop-in">
        <Mascot mood="wow" size={150} />
        <p className="text-4xl font-bold text-sky-700">太棒了！課程完成！</p>
        {result && (
          <p className="text-xl text-sky-900">
            看字說說看答對 {result.right} / {result.total}
          </p>
        )}
        <MascotSays mood="happy">
          {items.length > 0
            ? content.kind === 'sight_word'
              ? '今天學的特殊字已經放進複習本，隔幾天會自動出現在「今天複習」，幫你記得更牢！'
              : '今天讀的句子已經放進複習本，隔幾天會自動出現在「今天複習」，幫你記得更牢！'
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

  const steps: Array<{ id: Exclude<Phase, 'done'>; label: string }> = [
    { id: 'learn', label: content.kind === 'sight_word' ? '整字記' : '讀短句' },
    ...(items.length > 0 ? [{ id: 'recall' as const, label: '看字說說看' }] : []),
  ];

  const stepper = (
    <ol className="flex flex-wrap justify-center gap-2 text-sm">
      {steps.map((s, i) => (
        <li
          key={s.id}
          className={[
            'rounded-full px-3 py-1',
            s.id === phase ? 'bg-sky-500 text-white' : 'bg-white/80 text-sky-800',
          ].join(' ')}
        >
          {i + 1} {s.label}
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
          pools={{ text: pool }}
          onDone={(r) => {
            setResult(r);
            finish();
          }}
        />
      </div>
    );
  }

  const afterLearn = () => (items.length > 0 ? setPhase('recall') : finish());
  return (
    <div className="flex w-full flex-col items-center gap-4">
      {stepper}
      {content.kind === 'sight_word' ? (
        <SightWordLesson words={content.words} onComplete={afterLearn} />
      ) : (
        <DecodableSentenceLesson sentences={content.sentences} onComplete={afterLearn} />
      )}
    </div>
  );
}
