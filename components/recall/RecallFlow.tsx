'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RECALL_TIERS, TIER_LABEL, type RecallItem, type RecallTier } from '@/data/recall/items';
import { useProgress } from '@/lib/progress';
import { buildQuiz } from '@/lib/recall/quiz';
import { pickRecallSession, tierSummary } from '@/lib/recall/session';
import { todayString } from '@/lib/review/scheduler';
import Mascot from '@/components/mascot/Mascot';
import MascotSays from '@/components/mascot/MascotSays';
import PageHeader, { BTN_PRIMARY, BTN_SECONDARY } from '@/components/ui/PageHeader';
import { fireConfetti } from '@/components/ConfettiBurst';
import RecallCard from './RecallCard';
import QuizPlayer from './QuizPlayer';

type Choice = RecallTier | 'all';

export default function RecallFlow() {
  const { hydrated } = useProgress();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [round, setRound] = useState(0);

  if (!hydrated) {
    return <p className="p-6 text-xl text-sky-700">載入中…</p>;
  }

  if (choice === null) {
    return <TierPicker onPick={setChoice} />;
  }

  return (
    <RecallRun
      key={`${choice}-${round}`}
      tier={choice === 'all' ? null : choice}
      onAgain={() => setRound((n) => n + 1)}
      onExit={() => setChoice(null)}
    />
  );
}

function TierPicker({ onPick }: { onPick: (c: Choice) => void }) {
  const { progress } = useProgress();
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5">
      <PageHeader title="看字母說音" />
      <MascotSays mood="idle">
        看到字母，馬上說出它的聲音！每一輪 8 個，先說說看，再聽聲音對答案。
      </MascotSays>
      <button type="button" onClick={() => onPick('all')} className={`${BTN_PRIMARY} w-full`}>
        ☁️ 全部一起練（推薦）
      </button>
      <div className="grid w-full gap-3">
        {RECALL_TIERS.map((tier) => {
          const s = tierSummary(progress.review, tier);
          return (
            <button
              key={tier}
              type="button"
              onClick={() => onPick(tier)}
              className="flex items-center gap-3 rounded-3xl bg-white/90 px-4 py-3 text-left shadow-md transition-transform active:scale-[0.98]"
            >
              <div className="flex-1">
                <p className="text-lg text-sky-900">{TIER_LABEL[tier]}</p>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-sky-100">
                  <div
                    className="h-full rounded-full bg-sky-400"
                    style={{ width: `${s.total ? (s.strong / s.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-sky-700">
                會 {s.strong} / {s.total}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Phase = 'cards' | 'quiz' | 'done';

function RecallRun({
  tier,
  onAgain,
  onExit,
}: {
  tier: RecallTier | null;
  onAgain: () => void;
  onExit: () => void;
}) {
  const { progress, recordGraphemeOutcome } = useProgress();
  const [items] = useState<RecallItem[]>(() =>
    pickRecallSession(progress.review, tier, todayString()),
  );
  const [questions] = useState(() => buildQuiz(items));
  const [phase, setPhase] = useState<Phase>(items.length === 0 ? 'done' : 'cards');
  const [index, setIndex] = useState(0);
  const [said, setSaid] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState({ right: 0, total: 0 });

  const finish = () => {
    setPhase('done');
    fireConfetti();
  };

  if (phase === 'cards') {
    const item = items[index] as RecallItem;
    return (
      <Shell title="看字母說音" onExit={onExit}>
        <RecallCard
          key={item.id}
          item={item}
          index={index}
          total={items.length}
          onRate={(known) => {
            setSaid((s) => ({ ...s, [item.id]: known }));
            // 「還不會」立刻進今天複習；「我會」要等小測驗確認
            if (!known) recordGraphemeOutcome(item.id, 'wrong');
            if (index + 1 < items.length) setIndex(index + 1);
            else {
              setIndex(0);
              setPhase('quiz');
            }
          }}
        />
      </Shell>
    );
  }

  if (phase === 'quiz') {
    const q = questions[index];
    return (
      <Shell title="小測驗" onExit={onExit}>
        <QuizPlayer
          key={q.itemId}
          question={q}
          index={index}
          total={questions.length}
          onAnswered={(_, correct) => {
            setScore((s) => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }));
            // 說「還不會」的已經在今天複習裡了，不要因為剛看過答案答對就升級
            if (said[q.itemId] === false) return;
            recordGraphemeOutcome(q.itemId, correct ? 'right' : 'wrong');
          }}
          onNext={() => {
            if (index + 1 < questions.length) setIndex(index + 1);
            else finish();
          }}
        />
      </Shell>
    );
  }

  const weak = items.filter((it) => said[it.id] === false).length;
  const empty = items.length === 0;
  return (
    <Shell title="完成！" onExit={onExit}>
      <div className="flex w-full max-w-md flex-col items-center gap-5 animate-pop-in">
        <Mascot mood={empty ? 'sleepy' : score.right === score.total ? 'wow' : 'happy'} size={150} />
        {empty ? (
          <p className="text-xl text-sky-900">這一層全部都學穩了，太厲害了！</p>
        ) : (
          <>
            <p className="text-3xl text-sky-900">
              答對 {score.right} / {score.total}
            </p>
            <p className="text-center text-lg text-sky-800">
              {weak > 0
                ? `有 ${weak} 個「還不會」的字母已經放進今天複習，多聽幾次就會了！`
                : '每個都很熟，明天再來看看有沒有忘記～'}
            </p>
          </>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {!empty && (
            <button type="button" onClick={onAgain} className={BTN_PRIMARY}>
              再練一輪
            </button>
          )}
          <Link href="/review" className={BTN_SECONDARY}>
            去今天複習
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function Shell({
  title,
  onExit,
  children,
}: {
  title: string;
  onExit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex w-full max-w-2xl items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-full bg-white/90 px-4 py-2 text-base text-sky-800 shadow-md"
        >
          ← 換一組
        </button>
        <h1 className="flex-1 text-xl font-bold text-sky-900">{title}</h1>
      </div>
      {children}
    </div>
  );
}

