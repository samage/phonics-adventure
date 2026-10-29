/** 原創的小裝飾：雲朵、星星、杯子蛋糕、布丁（純 SVG） */

interface DecorProps {
  size?: number;
  className?: string;
}

export function Cloud({ size = 80, className = '' }: DecorProps) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={(size * 60) / 100} className={className} aria-hidden>
      <path
        d="M24 52 C8 52 4 36 18 31 C16 16 36 10 44 22 C50 8 76 12 76 30 C92 28 98 52 78 52 Z"
        fill="#fff"
        stroke="#cfe4f8"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Star({ size = 24, className = '' }: DecorProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <path
        d="M12 2 L14.8 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.4 L5.8 21 L7.4 14 L2 9.3 L9.2 8.6 Z"
        fill="#ffe08a"
        stroke="#f6c85a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Cupcake({ size = 48, className = '' }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      <path d="M14 34 L18 56 H46 L50 34 Z" fill="#9fd4f7" stroke="#5fb0ea" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M24 36 V54 M32 36 V54 M40 36 V54" stroke="#cdeafc" strokeWidth="2" />
      <path
        d="M12 34 C6 24 18 18 22 20 C22 10 40 10 42 20 C48 18 58 26 52 34 Z"
        fill="#ffd3e0"
        stroke="#f59ab8"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="10" r="4.5" fill="#ff8fa8" stroke="#e8708f" strokeWidth="2" />
    </svg>
  );
}

export function Pudding({ size = 48, className = '' }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      <ellipse cx="32" cy="54" rx="26" ry="6" fill="#fff" stroke="#cfe4f8" strokeWidth="2.5" />
      <path d="M12 52 C10 36 16 24 32 24 C48 24 54 36 52 52 Z" fill="#ffe9a8" stroke="#f1c75e" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 34 C14 24 22 20 32 20 C42 20 50 24 52 34 C46 38 40 32 32 36 C24 40 18 36 12 34 Z" fill="#c9926a" stroke="#a8724a" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="16" r="4.5" fill="#ff8fa8" stroke="#e8708f" strokeWidth="2" />
    </svg>
  );
}
