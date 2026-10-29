'use client';

interface RateButtonsProps {
  /** known = 孩子說「我會」 */
  onRate: (known: boolean) => void;
}

/** 看字之後的自評：🌱 還不會／✋ 我會！（字母卡、特殊字卡、短句卡共用） */
export default function RateButtons({ onRate }: RateButtonsProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onRate(false)}
        className="rounded-3xl bg-pink-100 px-4 py-4 text-xl text-pink-700 shadow-[0_5px_0_0_#f3b6ca] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#f3b6ca]"
      >
        🌱 還不會
      </button>
      <button
        type="button"
        onClick={() => onRate(true)}
        className="rounded-3xl bg-sky-400 px-4 py-4 text-xl text-white shadow-[0_5px_0_0_#2f8fd0] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#2f8fd0]"
      >
        ✋ 我會！
      </button>
    </div>
  );
}
