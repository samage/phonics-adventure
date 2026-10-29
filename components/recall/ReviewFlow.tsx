'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getRecallItem } from '@/data/recall/items';
import { useProgress } from '@/lib/progress';
import { buildQuiz, makeQuestion, type QuizMode, type QuizQuestion } from '@/lib/recall/quiz';
import Mascot from '@/components/mascot/Mascot';
import MascotSays from '@/components/mascot/MascotSays';
import PageHeader, { BTN_PRIMARY, BTN_SECONDARY } from '@/components/ui/PageHeader';
import QuizPlayer from './QuizPlayer';

/** 一次複習最多幾個，避免孩子累了 */
export const REVIEW_LIMIT = 10;

interface Entry {
  question: QuizQuestion;
  retry: boolean;
}

export default function ReviewFlow() {
  const { hydrated } = useProgress();
  const [round, setRound] = useState(0);
  if (!hydrated) return <p className="p-6 text-xl text-sky-700">載入中…</p>;
  return <ReviewRun key={round} onAgain={() => setRound((n) => n + 1)} />;
}

function ReviewRun({ onAgain }: { onAgain: () => void }) {
  const { dueTodayIds, recordGraphemeOutcome } = useProgress();
  const [queue, setQueue] = useState<Entry[]>(() => {
    const items = dueTodayIds(REVIEW_LIMIT)
      .map((id) => getRecallItem(id))
      .filter((it): it is NonNullable<typeof it> => it !== null);
    return buildQuiz(items).map((question) => ({ question, retry: false }));
  });
  const [index, setIndex] = useState(0);
  const [started] = useState(queue.length);
  const [firstTry, setFirstTry] = useState({ right: 0, wrong: 0 });
  const [fixed, setFixed] = useState(0);

  if (started === 0) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5">
        <PageHeader title="今天複習" />
        <Mascot mood="sleepy" size={150} />
        <MascotSays mood="happy">今天沒有要複習的了！去練新的字母，或明天再來吧～</MascotSays>
        <div className="flex gap-3">
          <Link href="/recall" className={BTN_PRIMARY}>
            看字母說音
          </Link>
          <Link href="/" className={BTN_SECONDARY}>
            回首頁
          </Link>
        </div>
      </div>
    );
  }

  if (index >= queue.length) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5 animate-pop-in">
        <PageHeader title="複習完成" />
        <Mascot mood={firstTry.wrong === 0 ? 'wow' : 'happy'} size={150} />
        <p className="text-3xl text-sky-900">
          一次就對 {firstTry.right} / {started}
        </p>
        <p className="text-center text-lg text-sky-800">
          {firstTry.wrong === 0
            ? '全部都記得，太厲害了！'
            : `有 ${firstTry.wrong} 個還要再多聽幾次${fixed > 0 ? `（其中 ${fixed} 個重考答對了）` : ''}，它們會留在複習裡，下次再來就會了！`}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onAgain} className={BTN_PRIMARY}>
            再看看還有沒有
          </button>
          <Link href="/" className={BTN_SECONDARY}>
            回首頁
          </Link>
        </div>
      </div>
    );
  }

  const entry = queue[index];
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <PageHeader title="今天複習" />
      <QuizPlayer
        key={`${entry.question.itemId}-${entry.retry ? 'r' : 'n'}`}
        question={entry.question}
        index={index}
        total={queue.length}
        retry={entry.retry}
        onAnswered={(_, correct) => {
          if (entry.retry) {
            // 同一輪錯後重考：不升級，只是給孩子再成功一次的機會
            if (correct) setFixed((n) => n + 1);
            recordGraphemeOutcome(entry.question.itemId, 'keep');
            return;
          }
          recordGraphemeOutcome(entry.question.itemId, correct ? 'right' : 'wrong');
          setFirstTry((s) => ({
            right: s.right + (correct ? 1 : 0),
            wrong: s.wrong + (correct ? 0 : 1),
          }));
          if (!correct) {
            const item = getRecallItem(entry.question.itemId);
            if (item) {
              // 換一種題型再問一次
              const otherMode: QuizMode = entry.question.mode === 'sound' ? 'word' : 'sound';
              setQueue((q) => [...q, { question: makeQuestion(item, otherMode), retry: true }]);
            }
          }
        }}
        onNext={() => setIndex((i) => i + 1)}
      />
    </div>
  );
}

