'use client';

import { useState } from 'react';
import { getRecallItem } from '@/data/recall/items';
import type { QuizQuestion } from '@/lib/recall/quiz';
import { playRecallSound } from '@/lib/recall/audio';
import { speakWord } from '@/lib/speech';
import Mascot from '@/components/mascot/Mascot';
import RecallSoundButtons from './SoundButtons';

/** 選項用小甜點／雲朵／星星當記號，避免用 A B C D 或紅綠叉叉 */
const OPTION_ICONS = ['☁️', '⭐', '🧁', '🍮'];

interface QuizPlayerProps {
  question: QuizQuestion;
  index: number;
  total: number;
  /** instant：選完立刻給溫柔回饋；silent：不揭曉答案（分班測驗） */
  feedback?: 'instant' | 'silent';
  /** 重考題（複習時答錯再問一次）的提示字樣 */
  retry?: boolean;
  onAnswered: (chosenId: string, correct: boolean) => void;
  onNext: () => void;
}

const PROMPT: Record<QuizQuestion['mode'], string> = {
  sound: '哪一個是它的聲音？',
  word: '哪一個字有這個聲音？',
  hear: '聽聲音，是哪一個字母？',
};

/**
 * 一題四選一。呼叫端用 key={題號} 換題，狀態就會自動重置。
 * 題目物件只含選項，不含「哪個是對的」之外的線索（答案另存 answerId，作答後才用來比對）。
 */
export default function QuizPlayer({
  question,
  index,
  total,
  feedback = 'instant',
  retry = false,
  onAnswered,
  onNext,
}: QuizPlayerProps) {
  const item = getRecallItem(question.itemId);
  const [chosen, setChosen] = useState<string | null>(null);
  if (!item) return null;

  const answered = chosen !== null;
  const correct = chosen === question.answerId;
  const showFeedback = answered && feedback === 'instant';

  const choose = (id: string) => {
    if (answered) return;
    setChosen(id);
    const ok = id === question.answerId;
    onAnswered(id, ok);
    if (feedback === 'silent') {
      onNext();
      return;
    }
    // 答錯時順便把正確的聲音念給孩子聽（點擊後播放，iPad 也允許）
    if (!ok) void playRecallSound(item.audio);
  };

  const optionClass = (id: string) => {
    if (!showFeedback) {
      return 'border-white bg-white/95 hover:border-sky-300';
    }
    if (id === question.answerId) return 'border-emerald-300 bg-emerald-50 ring-4 ring-emerald-100';
    if (id === chosen) return 'border-amber-200 bg-amber-50 opacity-80';
    return 'border-white bg-white/60 opacity-60';
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <p className="rounded-full bg-white/90 px-4 py-1 text-base text-sky-700 shadow-sm">
        {retry ? '再試一次 · ' : ''}
        {index + 1} / {total}
      </p>

      <div className="flex w-full flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-white/90 px-6 py-6 shadow-lg">
        <p className="text-base text-sky-700">{PROMPT[question.mode]}</p>
        {question.mode === 'hear' ? (
          <RecallSoundButtons audio={item.audio} fallbackKey={item.patternKey ?? item.display} />
        ) : (
          <p className="text-8xl font-bold leading-none text-sky-900">{item.display}</p>
        )}
        {question.mode !== 'hear' && item.tag && (
          <span className="rounded-full bg-pink-100 px-3 py-0.5 text-sm text-pink-700">
            {item.tag}
          </span>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {question.options.map((opt, i) => (
          <div
            key={opt.id}
            className={`flex flex-col items-center gap-2 rounded-3xl border-4 p-3 shadow-md transition-all ${optionClass(opt.id)}`}
          >
            {question.mode === 'sound' && opt.audio ? (
              <>
                <span className="text-3xl" aria-hidden>
                  {OPTION_ICONS[i]}
                </span>
                <button
                  type="button"
                  onClick={() => void playRecallSound(opt.audio as string)}
                  aria-label={`聽第 ${i + 1} 個聲音`}
                  className="rounded-full bg-sky-100 px-6 py-2 text-3xl text-sky-800 active:scale-95"
                >
                  🔊
                </button>
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => choose(opt.id)}
                  className="w-full rounded-full bg-sky-400 px-3 py-2 text-lg text-white disabled:bg-sky-200"
                >
                  是這個
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={answered}
                onClick={() => choose(opt.id)}
                className="flex min-h-24 w-full flex-col items-center justify-center gap-1 text-4xl font-bold text-sky-900"
              >
                <span className="text-2xl" aria-hidden>
                  {OPTION_ICONS[i]}
                </span>
                {opt.label}
              </button>
            )}
            {question.mode === 'word' && showFeedback && opt.label && (
              <button
                type="button"
                onClick={() => void speakWord(opt.label as string)}
                className="text-sm text-sky-600 underline"
              >
                🔊 唸唸看
              </button>
            )}
          </div>
        ))}
      </div>

      {showFeedback && (
        <div className="flex w-full flex-col items-center gap-3 animate-pop-in">
          <div className="flex w-full items-center gap-3 rounded-3xl bg-white/95 p-3 shadow-md">
            <Mascot mood={correct ? 'happy' : 'cheer'} size={84} className="shrink-0" />
            <div className="flex-1 text-left text-lg text-sky-900">
              {correct ? (
                <p>答對了！好棒 ✨</p>
              ) : (
                <>
                  <p>差一點點，沒關係！</p>
                  <p className="text-base text-sky-700">
                    正確答案是 <span className="font-bold">{item.display}</span>
                    ，等一下再遇到它就會了。
                  </p>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-sky-400 px-8 py-3 text-xl text-white shadow-[0_5px_0_0_#2f8fd0] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#2f8fd0]"
          >
            下一題 →
          </button>
        </div>
      )}
    </div>
  );
}
