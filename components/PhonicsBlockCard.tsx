'use client';

import type { PhonicsBlock } from '@/types/phonics';
import { getThemeColor } from '@/constants/themeColors';

interface PhonicsBlockCardProps {
  block: PhonicsBlock;
  /** 額外的 className */
  className?: string;
  /** 是否處於高亮（變大發亮）狀態 */
  highlighted?: boolean;
  /** 是否變暗（X 光等情境用，本關卡未使用） */
  dimmed?: boolean;
  /** 是否在積木下方顯示發音類型標籤（子音 / 短母音） */
  showLabel?: boolean;
  /** 多拼法顯示（d / dd）時縮小字級 */
  multiSpelling?: boolean;
  size?: 'md' | 'lg' | 'xl';
}

const SIZE_CLASS: Record<NonNullable<PhonicsBlockCardProps['size']>, string> = {
  md: 'text-5xl px-5 py-3 min-w-[4.5rem]',
  lg: 'text-6xl px-6 py-4 min-w-[5.5rem]',
  xl: 'text-7xl px-8 py-5 min-w-[7rem]',
};

const MULTI_SIZE_CLASS: Record<NonNullable<PhonicsBlockCardProps['size']>, string> = {
  md: 'text-2xl px-4 py-3 min-w-[8rem]',
  lg: 'text-3xl px-5 py-4 min-w-[10rem]',
  xl: 'text-4xl px-6 py-5 min-w-[12rem]',
};

/**
 * 依發音類型上色的「聲音積木」。
 * 字體圓潤粗體、不小於 text-5xl，符合兒童友善 UI 規格。
 */
export default function PhonicsBlockCard({
  block,
  className = '',
  highlighted = false,
  dimmed = false,
  showLabel = false,
  multiSpelling = false,
  size = 'lg',
}: PhonicsBlockCardProps) {
  const color = getThemeColor(block.type);
  const sizeClass = multiSpelling && block.text.includes('/')
    ? MULTI_SIZE_CLASS[size]
    : SIZE_CLASS[size];

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className={[
          'inline-flex select-none items-center justify-center rounded-3xl font-bold tracking-wide',
          'transition-all duration-200 ease-out',
          sizeClass,
          highlighted ? 'scale-110 animate-glow z-10' : '',
          dimmed ? 'opacity-30 saturate-50' : '',
          className,
        ].join(' ')}
        style={{
          backgroundColor: color.bg,
          color: color.text,
          border: `4px solid ${color.border}`,
          boxShadow: highlighted ? undefined : `0 6px 0 0 ${color.border}`,
        }}
        aria-label={`${block.text}，${color.label}`}
      >
        {block.text.includes('_e') ? (
          <span>
            {block.text[0]}
            <span className="opacity-50">_</span>e
          </span>
        ) : (
          block.text
        )}
      </div>
      {showLabel && (
        <span
          className="rounded-full px-3 py-0.5 text-sm font-medium"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {color.label}
        </span>
      )}
    </div>
  );
}
