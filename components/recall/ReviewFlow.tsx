'use client';

import { useState } from 'react';
import Link from 'next/link';
import { learnedItems, learnedTextItems } from '@/lib/learn/lessonItems';
import { useProgress } from '@/lib/progress';
import {
  buildReviewQuiz,
  getReviewItem,
  retryQuestion,
  type QuizPools,
  type ReviewItem,
  type ReviewQuestion,
} from '@/lib/recall/reviewQuiz';
import { pickRecallSession } from '@/lib/recall/session';
import { todayString } from '@/lib/review/scheduler';
import Mascot from '@/components/mascot/Mascot';
import MascotSays from '@/components/mascot/MascotSays';
import PageHeader, { BTN_PRIMARY, BTN_SECONDARY } from '@/components/ui/PageHeader';
import { fireConfetti } from '@/components/ConfettiBurst';
import QuestionPlayer from './QuestionPlayer';
import RecallRound, { type RoundResult } from './RecallRound';

/** 一次複習最多幾個，避免孩子累了 */
const REVIEW_LIMIT = 10;

interface Entry {
  question: ReviewQuestion;
  retry: boolean;
}

/**
 * 今天複習：先把到期的項目（字母、特殊字、短句）一題一題複習完（答錯會換題型重考），
 * 之後（或今天沒有到期項目時）可以「多練一輪看字說說看」——從學過的項目裡挑，
 * 兩者都寫進同一份 Leitner 複習表。
 */
export default function ReviewFlow() {
  const { hydrated } = useProgress();
  const [stage, setStage] = useState<'due' | 'extra'>('due');
  const [round, setRound] = useState(0);
  if (!hydrated) return <p className="p-6 text-xl text-sky-700">載入中…</p>;
  if (stage === 'extra') {
    return (
      <ExtraRound
        key={round}
        onAgain={() => setRound((n) => n + 1)}
        onBack={() => {
          setRound((n) => n + 1);
          setStage('due');
        }}
      />
    );
  }
  return (
    <DueQueue
      key={round}
      onAgain={() => setRound((n) => n + 1)}
      onPractice={() => {
        setRound((n) => n + 1);
        setStage('extra');
      }}
    />
  );
}

function DueQueue({ onAgain, onPractice }: { onAgain: () => void; onPractice: () => void }) {
  const { progress, dueTodayIds, recordOutcome } = useProgress();
  // 特殊字／短句題的干擾選項只用學過的；字母題維持原本的做法（全部字母）
  const [pools] = useState<QuizPools>(() => ({ text: learnedTextItems(progress) }));
  const [queue, setQueue] = useState<Entry[]>(() => {
    const items = dueTodayIds(REVIEW_LIMIT)
      .map((id) => getReviewItem(id))
      .filter((it): it is ReviewItem => it !== null);
    return buildReviewQuiz(items, Math.random, pools).map((question) => ({
      question,
      retry: false,
    }));
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
        <MascotSays mood="happy">今天沒有到期要複習的了！想多練的話，可以再多唸一輪～</MascotSays>
        <div className="flex gap-3">
          <button type="button" onClick={onPractice} className={BTN_PRIMARY}>
            多練一輪
          </button>
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
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onAgain} className={BTN_PRIMARY}>
            再看看還有沒有
          </button>
          <button type="button" onClick={onPractice} className={BTN_SECONDARY}>
            多練一輪
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
      <QuestionPlayer
        key={`${entry.question.itemId}-${entry.retry ? 'r' : 'n'}`}
        question={entry.question}
        index={index}
        total={queue.length}
        retry={entry.retry}
        onAnswered={(_, correct) => {
          if (entry.retry) {
            // 同一輪錯後重考：不升級，只是給孩子再成功一次的機會
            if (correct) setFixed((n) => n + 1);
            recordOutcome(entry.question.itemId, 'keep');
            return;
          }
          recordOutcome(entry.question.itemId, correct ? 'right' : 'wrong');
          setFirstTry((s) => ({
            right: s.right + (correct ? 1 : 0),
            wrong: s.wrong + (correct ? 0 : 1),
          }));
          if (!correct) {
            const item = getReviewItem(entry.question.itemId);
            if (item) {
              // 換一種題型（短句換一個空格）再問一次
              setQueue((q) => [
                ...q,
                { question: retryQuestion(item, entry.question, Math.random, pools), retry: true },
              ]);
            }
          }
        }}
        onNext={() => setIndex((i) => i + 1)}
      />
    </div>
  );
}

function ExtraRound({ onAgain, onBack }: { onAgain: () => void; onBack: () => void }) {
  const { progress } = useProgress();
  const [items] = useState<ReviewItem[]>(() =>
    pickRecallSession(
      progress.review,
      [...learnedItems(progress), ...learnedTextItems(progress)],
      todayString(),
    ),
  );
  const [result, setResult] = useState<RoundResult | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5">
        <PageHeader title="多練一輪" backHref="/review" backLabel="← 今天複習" />
        <Mascot mood="sleepy" size={150} />
        <MascotSays mood="happy">還沒有學過的字、句子可以練。先去首頁上第一課吧！</MascotSays>
        <Link href="/" className={BTN_PRIMARY}>
          去上課
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5 animate-pop-in">
        <PageHeader title="練習完成" />
        <Mascot mood={result.right === result.total ? 'wow' : 'happy'} size={150} />
        <p className="text-3xl text-sky-900">
          答對 {result.right} / {result.total}
        </p>
        <p className="text-center text-lg text-sky-800">
          {result.weakIds.length > 0
            ? `有 ${result.weakIds.length} 個「還不會」的項目已經放進今天複習，多聽幾次就會了！`
            : '每個都很熟，明天再來看看有沒有忘記～'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onAgain} className={BTN_PRIMARY}>
            再練一輪
          </button>
          <button type="button" onClick={onBack} className={BTN_SECONDARY}>
            回到複習
          </button>
          <Link href="/" className={BTN_SECONDARY}>
            回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <PageHeader title="多練一輪：看字說說看" backHref="/review" backLabel="← 今天複習" />
      <RecallRound
        items={items}
        pools={{ grapheme: learnedItems(progress), text: learnedTextItems(progress) }}
        onDone={(r) => {
          setResult(r);
          fireConfetti();
        }}
      />
    </div>
  );
}
