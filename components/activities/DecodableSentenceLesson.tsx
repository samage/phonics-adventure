'use client';

import { useState } from 'react';
import Link from 'next/link';
import { fireConfetti } from '@/components/ConfettiBurst';
import WordPhonicsLab from '@/components/phonics/WordPhonicsLab';
import { speakWord } from '@/lib/speech';

interface DecodableSentenceLessonProps {
  sentences: string[];
  onComplete: () => void;
}

export default function DecodableSentenceLesson({
  sentences,
  onComplete,
}: DecodableSentenceLessonProps) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  const sentence = sentences[sentenceIndex] ?? '';
  const words = sentence
    .replace(/[.!?]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const currentWord = words[wordIndex] ?? '';

  const handleWordDone = () => {
    if (wordIndex < words.length - 1) {
      setWordIndex((i) => i + 1);
    } else if (sentenceIndex < sentences.length - 1) {
      setSentenceIndex((i) => i + 1);
      setWordIndex(0);
    } else {
      fireConfetti();
      onComplete();
    }
  };

  if (!sentence) {
    return <p className="text-amber-700">尚無短句資料。</p>;
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <p className="text-lg font-semibold text-purple-900">讀短句</p>
      <p className="text-center text-3xl font-bold leading-relaxed text-amber-950">
        {sentence}
      </p>
      <button
        type="button"
        onClick={() => speakWord(sentence.replace(/[.!?]/g, ''))}
        className="rounded-full bg-amber-100 px-6 py-2 text-amber-900"
      >
        🔊 聽整句
      </button>
      <p className="text-sm text-amber-700">
        句 {sentenceIndex + 1}/{sentences.length} · 字 {wordIndex + 1}/{words.length}
      </p>
      {currentWord && (
        <WordPhonicsLab key={`${sentenceIndex}-${wordIndex}-${currentWord}`} word={currentWord.toLowerCase()} onComplete={handleWordDone} />
      )}
    </div>
  );
}
