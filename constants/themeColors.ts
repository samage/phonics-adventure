import type { PhonicsType } from '@/types/phonics';

export interface ThemeColor {
  /** 積木背景色（糖果色） */
  bg: string;
  /** 積木邊框/陰影色（較深） */
  border: string;
  /** 文字色（高對比） */
  text: string;
  /** 中文標籤，給家長/老師參考 */
  label: string;
}

/**
 * 發音類型 → 專屬糖果配色。
 * 讓 8 歲孩子單看顏色就能預期發音結構：
 * 子音、短母音、長母音、複合子音、混合子音、Magic-E 各有專屬色。
 */
export const THEME_COLORS: Record<PhonicsType, ThemeColor> = {
  consonant: {
    bg: '#4FC3F7', // 天空藍
    border: '#0288D1',
    text: '#06384f',
    label: '子音',
  },
  short_vowel: {
    bg: '#FFD54F', // 檸檬黃
    border: '#FFA000',
    text: '#5a3d00',
    label: '短母音',
  },
  long_vowel: {
    bg: '#FF8A65', // 蜜桃橘
    border: '#E64A19',
    text: '#5a1500',
    label: '長母音',
  },
  digraph: {
    bg: '#BA68C8', // 葡萄紫
    border: '#7B1FA2',
    text: '#ffffff',
    label: '複合子母音',
  },
  blend: {
    bg: '#81C784', // 蘋果綠
    border: '#388E3C',
    text: '#0c3b16',
    label: '混合子音',
  },
  silent_e: {
    bg: '#E0E0E0', // 安靜灰（不發聲）
    border: '#9E9E9E',
    text: '#616161',
    label: '魔法 e（不發聲）',
  },
};

export function getThemeColor(type: PhonicsType): ThemeColor {
  return THEME_COLORS[type];
}
