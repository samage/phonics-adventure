'use client';

import type { WordOrderMode } from '@/types/curriculum';
import SoundAlchemist from '@/components/games/SoundAlchemist/SoundAlchemist';

interface BlendIntroLessonProps {
  words: string[];
  wordOrder?: WordOrderMode;
  lessonId: string;
  onComplete: () => void;
  onWordComplete?: (word: string) => void;
}

export default function BlendIntroLesson({
  words,
  wordOrder = 'sequential',
  lessonId,
  onComplete,
  onWordComplete,
}: BlendIntroLessonProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="max-w-xl text-center text-xl text-amber-800">
        把學過的發音組合在一起，拖積木進煉金爐拼出單字！
      </p>
      <SoundAlchemist
        words={words}
        wordOrder={wordOrder}
        lessonId={lessonId}
        onWordComplete={onWordComplete}
        onLessonComplete={onComplete}
        requireAllWords
      />
    </div>
  );
}
