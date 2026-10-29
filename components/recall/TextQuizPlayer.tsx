'use client';

import { useState } from 'react';
import { getTextItem } from '@/data/recall/textItems';
import type { TextQuestion } from '@/lib/recall/textQuiz';
import { speak, speakWord } from '@/lib/speech';
import Mascot from '@/components/mascot/Mascot';
import TextSpeakButtons from './TextSpeakButtons';

/** 選項用小甜點／雲朵／星星當記號，避免用 A B C D 或紅綠叉叉 */
const OPTION_ICONS = ['☁️', '⭐', '🧁', '🍮'];

interface TextQuizPlayerProps {
  question: TextQuestion;
  index: number;
  total: number;
  /** instant：選完立刻給溫柔回饋；silent：不揭曉答案 */
  feedback?: 'instant' | 'silent';
  /** 重考題（複習時答錯再問一次）的提示字樣 */
  retry?: boolean;
  onAnswered: (chosenId: string, correct: boolean) => void;
  onNext: () => void;
}

const PROMPT: Record<TextQuestion['mode'], string> = {
  hear: '聽聲音，是哪一個字？',
  sound: '哪一個是它的唸法？',
  cloze: '聽整句，空格裡是哪個字？',
};

/** 把短句裡被挖掉的字換成空格（或補回答案） */
function sentenceWithBlank(words: string[], blankIndex: number, fill: string | null): string {
  return words.map((w, i) => (i === blankIndex ? (fill ?? '＿＿＿') : w)).join(' ');
}

/**
 * 特殊字／短句的一題四選一（和字母的 QuizPlayer 同樣的版型與回饋）。
 * 呼叫端用 key 換題，狀態就會自動重置。
 */
export default function TextQuizPlayer({
  question,
  index,
  total,
  feedback = 'instant',
  retry = false,
  onAnswered,
  onNext,
}: TextQuizPlayerProps) {
  const item = getTextItem(question.itemId);
  const [chosen, setChosen] = useState<string | null>(null);
  if (!item) return null;

  const answered = chosen !== null;
  const correct = chosen === question.answerId;
  const showFeedback = answered && feedback === 'instant';
  const spoken = item.kind === 'word' ? item.word : item.text.replace(/[.!?,]/g, '');

  const choose = (id: string) => {
    if (answered) return;
    setChosen(id);
    const ok = id === question.answerId;
    onAnswered(id, ok);
    if (feedback === 'silent') {
      onNext();
      return;
    }
    // 答錯時順便把正確的唸法念給孩子聽（點擊後播放，iPad 也允許）
    if (!ok) void speak(spoken);
  };

  const optionClass = (id: string) => {
    if (!showFeedback) return 'border-white bg-white/95 hover:border-sky-300';
    if (id === question.answerId) return 'border-sky-300 bg-sky-50 ring-4 ring-sky-200';
    if (id === chosen) return 'border-pink-200 bg-pink-50 opacity-80';
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
        {question.mode === 'sound' && item.kind === 'word' && (
          <p className="text-7xl font-bold leading-none text-sky-900">{item.word}</p>
        )}
        {question.mode === 'hear' && <TextSpeakButtons text={spoken} />}
        {question.mode === 'cloze' && item.kind === 'sentence' && (
          <>
            <p
              className="text-center text-4xl font-bold leading-snug text-sky-900"
              aria-label="少一個字的句子"
            >
              {sentenceWithBlank(item.words, question.blankIndex ?? 0, null)}
            </p>
            <TextSpeakButtons text={spoken} />
          </>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {question.options.map((opt, i) => (
          <div
            key={opt.id}
            className={`flex flex-col items-center gap-2 rounded-3xl border-4 p-3 shadow-md transition-all ${optionClass(opt.id)}`}
          >
            {question.mode === 'sound' ? (
              <>
                <span className="text-3xl" aria-hidden>
                  {OPTION_ICONS[i]}
                </span>
                <button
                  type="button"
                  onClick={() => void speakWord(opt.id)}
                  aria-label={`聽第 ${i + 1} 個唸法`}
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
            {question.mode === 'sound' && showFeedback && (
              <span className="text-lg text-sky-700">{opt.label}</span>
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
                    正確答案是{' '}
                    <span className="font-bold">
                      {item.kind === 'sentence'
                        ? sentenceWithBlank(item.words, question.blankIndex ?? 0, item.words[question.blankIndex ?? 0] ?? null)
                        : item.word}
                    </span>
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
