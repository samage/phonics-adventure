'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RECALL_TIERS, TIER_LABEL } from '@/data/recall/items';
import { useProgress } from '@/lib/progress';
import {
  buildPlacementTest,
  evaluatePlacement,
  placementTotal,
  type PlacementAnswer,
  type PlacementResult,
} from '@/lib/placement/placement';
import Mascot from '@/components/mascot/Mascot';
import MascotSays from '@/components/mascot/MascotSays';
import PageHeader, { BTN_PRIMARY, BTN_SECONDARY } from '@/components/ui/PageHeader';
import { fireConfetti } from '@/components/ConfettiBurst';
import QuizPlayer from './QuizPlayer';

export default function PlacementFlow() {
  const { hydrated } = useProgress();
  const [round, setRound] = useState(0);
  if (!hydrated) return <p className="p-6 text-xl text-sky-700">載入中…</p>;
  return <PlacementRun key={round} onRetake={() => setRound((n) => n + 1)} />;
}

function PlacementRun({ onRetake }: { onRetake: () => void }) {
  const { progress, applyPlacementResult } = useProgress();
  const [started, setStarted] = useState(false);
  const [questions] = useState(() => buildPlacementTest());
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PlacementAnswer[]>([]);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);

  if (!started) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-5">
        <PageHeader title="快速分班測驗" />
        <Mascot mood="idle" size={150} />
        <MascotSays mood="idle">
          一共 {placementTotal()} 題，看字母選聲音。不用緊張，答錯也沒關係！
          會的字母會直接記起來，不會的放進「今天複習」。
        </MascotSays>
        {progress.placement && (
          <p className="text-center text-base text-sky-700">
            你已經測過一次了；再測一次會更新結果，已經學會的不會被降級。
          </p>
        )}
        <button type="button" onClick={() => setStarted(true)} className={BTN_PRIMARY}>
          開始測驗
        </button>
        <p className="text-center text-sm text-sky-600/80">
          完成後所有課程都會開放，不用從第一課慢慢解鎖。
        </p>
      </div>
    );
  }

  if (result === null) {
    const q = questions[index];
    return (
      <div className="flex w-full flex-col items-center gap-5">
        <PageHeader title="快速分班測驗" />
        <QuizPlayer
          key={q.itemId}
          question={q}
          index={index}
          total={questions.length}
          feedback="silent"
          onAnswered={(chosenId) => {
            const next = [...answers, { itemId: q.itemId, chosenId }];
            setAnswers(next);
            if (index + 1 >= questions.length) {
              setResult(evaluatePlacement(questions, next));
            }
          }}
          onNext={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}
        />
      </div>
    );
  }

  const knownCount = result.knownIds.length;
  const total = questions.length;
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5 animate-pop-in">
      <PageHeader title="測驗結果" />
      <Mascot mood={knownCount >= total * 0.75 ? 'wow' : 'happy'} size={140} />
      <p className="text-3xl text-sky-900">
        會 {knownCount} / {total}
      </p>
      <div className="w-full rounded-3xl bg-white/90 p-4 shadow-md">
        {RECALL_TIERS.map((tier) => {
          const s = result.tierScores[tier];
          return (
            <div key={tier} className="flex items-center gap-3 py-1.5">
              <span className="w-40 shrink-0 text-sm text-sky-800">{TIER_LABEL[tier]}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-sky-400"
                  style={{ width: `${s.total ? (s.right / s.total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm text-sky-700">
                {s.right}/{s.total}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-lg text-sky-800">
        {result.startTier
          ? `建議從「${TIER_LABEL[result.startTier]}」開始練。`
          : '每一層都很熟！可以直接挑戰最後的單元。'}
      </p>
      {!saved ? (
        <button
          type="button"
          onClick={() => {
            applyPlacementResult(result);
            setSaved(true);
            fireConfetti();
          }}
          className={BTN_PRIMARY}
        >
          記起來，開放所有課程
        </button>
      ) : (
        <div className="flex w-full flex-col items-center gap-3">
          <p className="text-lg text-emerald-700">已記好了！所有課程都開放囉 ☁️</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/review" className={BTN_PRIMARY}>
              今天複習
            </Link>
            <Link href="/" className={BTN_SECONDARY}>
              回首頁
            </Link>
          </div>
        </div>
      )}
      {!saved && (
        <button type="button" onClick={onRetake} className="text-sm text-sky-600 underline">
          重新測一次
        </button>
      )}
    </div>
  );
}
