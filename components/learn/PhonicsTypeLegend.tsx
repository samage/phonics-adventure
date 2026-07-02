import type { PhonicsType } from '@/types/phonics';
import { THEME_COLORS } from '@/constants/themeColors';

/** 希平方入門班課程會出現的發音類型（對應積木顏色） */
export const HOP_CURRICULUM_LEGEND_TYPES: PhonicsType[] = [
  'consonant',
  'short_vowel',
  'long_vowel',
  'digraph',
  'r_controlled',
  'diphthong',
];

interface PhonicsTypeLegendProps {
  /** 未指定時顯示入門班完整圖例 */
  types?: PhonicsType[];
}

export default function PhonicsTypeLegend({
  types = HOP_CURRICULUM_LEGEND_TYPES,
}: PhonicsTypeLegendProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {types.map((type) => {
        const color = THEME_COLORS[type];
        return (
          <div
            key={type}
            className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm shadow-sm sm:px-4 sm:py-2 sm:text-base"
          >
            <span
              className="inline-block h-3.5 w-3.5 shrink-0 rounded-full sm:h-4 sm:w-4"
              style={{
                backgroundColor: color.bg,
                border: `2px solid ${color.border}`,
              }}
            />
            <span className="font-medium text-amber-900">{color.label}</span>
          </div>
        );
      })}
    </div>
  );
}
