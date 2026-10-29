'use client';

import { isTextQuestion, type ReviewQuestion } from '@/lib/recall/reviewQuiz';
import QuizPlayer from './QuizPlayer';
import TextQuizPlayer from './TextQuizPlayer';

interface QuestionPlayerProps {
  question: ReviewQuestion;
  index: number;
  total: number;
  feedback?: 'instant' | 'silent';
  retry?: boolean;
  onAnswered: (chosenId: string, correct: boolean) => void;
  onNext: () => void;
}

/** 依題目種類（字母／特殊字／短句）選擇對應的題目畫面；回饋與流程完全一樣。 */
export default function QuestionPlayer({ question, ...rest }: QuestionPlayerProps) {
  return isTextQuestion(question) ? (
    <TextQuizPlayer question={question} {...rest} />
  ) : (
    <QuizPlayer question={question} {...rest} />
  );
}
