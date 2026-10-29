import type { ReactNode } from 'react';
import Mascot, { type MascotMood } from './Mascot';

interface MascotSaysProps {
  mood?: MascotMood;
  size?: number;
  children: ReactNode;
  className?: string;
}

/** 雲寶＋對話框：用來在畫面上給孩子溫柔的回饋 */
export default function MascotSays({
  mood = 'idle',
  size = 96,
  children,
  className = '',
}: MascotSaysProps) {
  return (
    <div className={`flex w-full items-center gap-3 ${className}`}>
      <Mascot mood={mood} size={size} className="shrink-0" />
      <div className="relative flex-1 rounded-3xl border-2 border-sky-200 bg-white px-4 py-3 text-left text-lg text-sky-900 shadow-md">
        <span
          aria-hidden
          className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-sky-200 bg-white"
        />
        {children}
      </div>
    </div>
  );
}
