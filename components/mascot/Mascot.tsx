import type { CSSProperties } from 'react';

/**
 * 雲寶：原創吉祥物（純 SVG，沒有使用任何外部素材）。
 * 白色毛茸茸的小狗，長長的垂耳、藍眼睛、粉紅臉頰，尾巴像一捲肉桂捲。
 *
 * 表情：
 * - idle   平常
 * - happy  開心（答對、完成）
 * - cheer  加油（答錯或不會時給鼓勵，沒有任何紅色叉叉）
 * - think  思考（題目出現時）
 * - wow    驚喜（全部答對、升級）
 * - sleepy 想睡（今天沒有要複習的）
 */
export type MascotMood = 'idle' | 'happy' | 'cheer' | 'think' | 'wow' | 'sleepy';

export const MASCOT_MOODS: MascotMood[] = [
  'idle',
  'happy',
  'cheer',
  'think',
  'wow',
  'sleepy',
];

export const MASCOT_MOOD_LABEL: Record<MascotMood, string> = {
  idle: '平常',
  happy: '開心',
  cheer: '加油',
  think: '思考',
  wow: '哇！',
  sleepy: '想睡',
};

const OUTLINE = '#b9d6f2';
const FUR = '#ffffff';
const FUR_SHADE = '#eaf4ff';
const EYE = '#3d8fe0';
const INK = '#35507a';
const BLUSH = '#ffb4c8';

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  /** 是否讓耳朵、尾巴輕輕擺動 */
  animated?: boolean;
  title?: string;
}

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === 'happy') {
    return (
      <g fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
        <path d="M66 96 Q76 82 86 96" />
        <path d="M114 96 Q124 82 134 96" />
      </g>
    );
  }
  if (mood === 'sleepy') {
    return (
      <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round">
        <path d="M67 92 Q76 99 85 92" />
        <path d="M115 92 Q124 99 133 92" />
      </g>
    );
  }
  const big = mood === 'wow';
  const ry = big ? 11.5 : 9;
  const rx = big ? 9.5 : 7.5;
  const look = mood === 'think' ? { x: 2.5, y: -2.5 } : { x: 0, y: 0 };
  return (
    <g>
      {[76, 124].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={92} rx={rx} ry={ry} fill={EYE} />
          <ellipse cx={cx + look.x} cy={93 + look.y} rx={rx * 0.55} ry={ry * 0.6} fill="#2a5fa8" />
          <circle cx={cx - 2.5 + look.x} cy={87 + look.y} r={3} fill="#fff" />
          <circle cx={cx + 3 + look.x} cy={96 + look.y} r={1.5} fill="#fff" />
        </g>
      ))}
      {mood === 'cheer' && (
        <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round">
          <path d="M66 77 Q74 72 84 76" />
          <path d="M116 76 Q126 72 134 77" />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case 'happy':
      return (
        <g>
          <path d="M88 108 Q100 128 112 108 Z" fill="#ff8fa8" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M94 116 Q100 121 106 116" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".7" />
        </g>
      );
    case 'wow':
      return <ellipse cx="100" cy="114" rx="6" ry="7.5" fill="#ff8fa8" stroke={INK} strokeWidth="3" />;
    case 'think':
      return <path d="M94 112 Q100 110 106 113" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />;
    case 'sleepy':
      return <path d="M95 112 Q100 116 105 112" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />;
    case 'cheer':
    case 'idle':
    default:
      return (
        <path
          d="M90 108 Q95 116 100 109 Q105 116 110 108"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
  }
}

export default function Mascot({
  mood = 'idle',
  size = 160,
  className = '',
  animated = true,
  title = '雲寶',
}: MascotProps) {
  const earLift = mood === 'happy' || mood === 'wow' ? -14 : mood === 'sleepy' ? 6 : 0;
  const armsUp = mood === 'cheer' || mood === 'wow' || mood === 'happy';
  const earStyleL: CSSProperties = {
    transformOrigin: '64px 78px',
    transform: `rotate(${earLift}deg)`,
    transition: 'transform .3s',
  };
  const earStyleR: CSSProperties = {
    transformOrigin: '136px 78px',
    transform: `rotate(${-earLift}deg)`,
    transition: 'transform .3s',
  };
  const tiltBody = mood === 'think' ? 'rotate(-4 100 100)' : undefined;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      {/* 地面陰影 */}
      <ellipse cx="100" cy="188" rx="52" ry="7" fill="#9cc7ee" opacity=".35" />

      <g transform={tiltBody}>
        {/* 尾巴：肉桂捲 */}
        <g className={animated ? 'mascot-tail' : undefined} style={{ transformOrigin: '154px 146px' }}>
          <circle cx="156" cy="146" r="19" fill={FUR} stroke={OUTLINE} strokeWidth="3" />
          <path
            d="M156 146 m0 0 a3 3 0 1 1 3 3 a7 7 0 1 1 -7 -7 a11 11 0 1 1 11 11"
            fill="none"
            stroke="#d6e8fb"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </g>

        {/* 身體 */}
        <ellipse cx="100" cy="152" rx="40" ry="33" fill={FUR} stroke={OUTLINE} strokeWidth="3" />
        <ellipse cx="100" cy="160" rx="22" ry="20" fill={FUR_SHADE} />
        {/* 小腳 */}
        <ellipse cx="80" cy="182" rx="14" ry="8" fill={FUR} stroke={OUTLINE} strokeWidth="3" />
        <ellipse cx="120" cy="182" rx="14" ry="8" fill={FUR} stroke={OUTLINE} strokeWidth="3" />
        {/* 小手 */}
        {armsUp ? (
          <g fill={FUR} stroke={OUTLINE} strokeWidth="3">
            <ellipse cx="60" cy="136" rx="9" ry="13" transform="rotate(28 60 136)" />
            <ellipse cx="140" cy="136" rx="9" ry="13" transform="rotate(-28 140 136)" />
          </g>
        ) : (
          <g fill={FUR} stroke={OUTLINE} strokeWidth="3">
            <ellipse cx="66" cy="152" rx="8" ry="14" transform="rotate(10 66 152)" />
            <ellipse cx="134" cy="152" rx="8" ry="14" transform="rotate(-10 134 152)" />
          </g>
        )}
        {/* 天空藍小領結 */}
        <g>
          <path d="M100 128 L84 120 L84 136 Z" fill="#7cc3f5" stroke="#4aa3e6" strokeWidth="2" strokeLinejoin="round" />
          <path d="M100 128 L116 120 L116 136 Z" fill="#7cc3f5" stroke="#4aa3e6" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="100" cy="128" r="4.5" fill="#a9dcff" stroke="#4aa3e6" strokeWidth="2" />
        </g>

        {/* 長耳朵（在頭的後面） */}
        <g style={earStyleL}>
          <g className={animated ? 'mascot-ear-l' : undefined} style={{ transformOrigin: '64px 78px' }}>
            <path
              d="M70 70 C40 58 14 80 14 122 C14 150 22 168 38 164 C54 160 58 136 62 114 C64 100 68 86 76 80 Z"
              fill={FUR}
              stroke={OUTLINE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M36 92 C28 108 26 130 32 148" fill="none" stroke={FUR_SHADE} strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>
        <g style={earStyleR}>
          <g className={animated ? 'mascot-ear-r' : undefined} style={{ transformOrigin: '136px 78px' }}>
            <path
              d="M130 70 C160 58 186 80 186 122 C186 150 178 168 162 164 C146 160 142 136 138 114 C136 100 132 86 124 80 Z"
              fill={FUR}
              stroke={OUTLINE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M164 92 C172 108 174 130 168 148" fill="none" stroke={FUR_SHADE} strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>

        {/* 頭 */}
        <ellipse cx="100" cy="92" rx="56" ry="46" fill={FUR} stroke={OUTLINE} strokeWidth="3" />
        {/* 頭頂的小絨毛 */}
        <path
          d="M86 48 Q92 36 100 46 Q108 34 114 48"
          fill={FUR}
          stroke={OUTLINE}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="100" cy="112" rx="26" ry="18" fill={FUR_SHADE} opacity=".7" />

        <Eyes mood={mood} />

        {/* 腮紅 */}
        <ellipse cx="58" cy="108" rx="10" ry="6.5" fill={BLUSH} opacity=".85" />
        <ellipse cx="142" cy="108" rx="10" ry="6.5" fill={BLUSH} opacity=".85" />

        {/* 鼻子與嘴 */}
        <ellipse cx="100" cy="101" rx="5.5" ry="4" fill={INK} />
        <Mouth mood={mood} />
      </g>

      {/* 表情附加物 */}
      {(mood === 'happy' || mood === 'wow') && (
        <g fill="#ffd96b" stroke="#f4b93a" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M28 40 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4z" />
          <path d="M172 34 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
        </g>
      )}
      {mood === 'cheer' && (
        <g fill="#ffd96b" stroke="#f4b93a" strokeWidth="1.5" strokeLinejoin="round">
          <path d="M170 40 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
        </g>
      )}
      {mood === 'think' && (
        <g fill="#fff" stroke={OUTLINE} strokeWidth="2.5">
          <circle cx="160" cy="46" r="4" />
          <circle cx="172" cy="32" r="6" />
          <ellipse cx="184" cy="14" rx="12" ry="9" />
        </g>
      )}
      {mood === 'sleepy' && (
        <g fill={EYE} fontFamily="sans-serif" fontWeight="700">
          <text x="150" y="42" fontSize="20">z</text>
          <text x="166" y="28" fontSize="15">z</text>
          <text x="178" y="16" fontSize="11">z</text>
        </g>
      )}
    </svg>
  );
}
