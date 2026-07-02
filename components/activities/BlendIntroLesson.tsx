'use client';

import type { WordOrderMode } from '@/types/curriculum';
import BlendWalkthrough from '@/components/activities/BlendWalkthrough';

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
    <BlendWalkthrough
      words={words}
      demoWords={words.slice(0, 4)}
      wordOrder={wordOrder}
      lessonId={lessonId}
      onComplete={onComplete}
      onWordComplete={onWordComplete}
    />
  );
}
