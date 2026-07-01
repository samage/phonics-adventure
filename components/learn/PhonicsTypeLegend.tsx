import type { PhonicsType } from '@/types/phonics';
import { THEME_COLORS } from '@/constants/themeColors';

/** 階段一會用到的發音類型圖例 */
const STAGE1_LEGEND_TYPES: PhonicsType[] = ['consonant', 'short_vowel'];

export default function PhonicsTypeLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {STAGE1_LEGEND_TYPES.map((type) => {
        const color = THEME_COLORS[type];
        return (
          <div
            key={type}
            className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-base shadow-sm"
          >
            <span
              className="inline-block h-4 w-4 rounded-full"
              style={{ backgroundColor: color.bg, border: `2px solid ${color.border}` }}
            />
            <span className="font-medium text-amber-900">{color.label}</span>
          </div>
        );
      })}
      <div className="flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-base text-amber-700/70">
        長母音、複合音 → 階段四以後
      </div>
    </div>
  );
}
