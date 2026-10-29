'use client';

import { useState } from 'react';
import type { RecallItem } from '@/data/recall/items';
import { useProgress } from '@/lib/progress';
import { buildQuiz } from '@/lib/recall/quiz';
import RecallCard from './RecallCard';
import QuizPlayer from './QuizPlayer';

export interface RoundResult {
  right: number;
  total: number;
  /** 自評「還不會」的項目 */
  weakIds: string[];
}

interface RecallRoundProps {
  items: RecallItem[];
  /** 小測驗干擾選項的來源（預設全部項目；課程裡只給「學過」的） */
  pool?: readonly RecallItem[];
  onDone: (result: RoundResult) => void;
}

/**
 * 一輪「看字母說音」：① 逐張卡片先自己說、再聽答案、自評會不會 → ② 四選一小測驗。
 * 課程的「學完馬上練」和「多練一輪」共用這一個元件，結果都寫進同一份 Leitner 複習表：
 * 自評「還不會」→ 立刻進今天複習；「我會」要等小測驗確認（答對才升盒子）。
 */
export default function RecallRound({ items, pool, onDone }: RecallRoundProps) {
  const { recordGraphemeOutcome } = useProgress();
  const [questions] = useState(() => buildQuiz(items, Math.random, pool));
  const [phase, setPhase] = useState<'cards' | 'quiz'>('cards');
  const [index, setIndex] = useState(0);
  const [said, setSaid] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState({ right: 0, total: 0 });

  if (phase === 'cards') {
    const item = items[index] as RecallItem;
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <StepLabel step="看字說音" />
        <RecallCard
          key={item.id}
          item={item}
          index={index}
          total={items.length}
          onRate={(known) => {
            setSaid((s) => ({ ...s, [item.id]: known }));
            if (!known) recordGraphemeOutcome(item.id, 'wrong');
            if (index + 1 < items.length) setIndex(index + 1);
            else {
              setIndex(0);
              setPhase('quiz');
            }
          }}
        />
      </div>
    );
  }

  const q = questions[index];
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <StepLabel step="小測驗" />
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
          if (index + 1 < questions.length) {
            setIndex(index + 1);
            return;
          }
          const finalScore = score;
          onDone({
            right: finalScore.right,
            total: finalScore.total,
            weakIds: items.filter((it) => said[it.id] === false).map((it) => it.id),
          });
        }}
      />
    </div>
  );
}

function StepLabel({ step }: { step: string }) {
  return (
    <p className="rounded-full bg-sky-100 px-4 py-1 text-sm text-sky-800">
      {step === '看字說音' ? '① 看字說音 → 小測驗' : '看字說音 → ② 小測驗'}
    </p>
  );
}
