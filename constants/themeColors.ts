import type { PhonicsType } from '@/types/phonics';

export interface ThemeColor {
  /** 積木背景色（粉彩糖果色） */
  bg: string;
  /** 積木邊框/陰影色（較深） */
  border: string;
  /** 文字色（高對比） */
  text: string;
  /** 中文標籤，給家長/老師參考 */
  label: string;
}

/**
 * 發音類型 → 專屬粉彩糖果配色。
 * 讓 8 歲孩子單看顏色就能預期發音結構：
 * 子音、短母音、長母音、複合子音、混合子音、Magic-E 各有專屬色。
 */
export const THEME_COLORS: Record<PhonicsType, ThemeColor> = {
  consonant: {
    bg: '#8FD3F8', // 天空藍
    border: '#4AA8E0',
    text: '#0F3C5E',
    label: '子音',
  },
  short_vowel: {
    bg: '#FFE59A', // 奶油黃
    border: '#F2C14E',
    text: '#5A4300',
    label: '短母音',
  },
  long_vowel: {
    bg: '#FFBFA8', // 蜜桃粉
    border: '#EE8F78',
    text: '#5A2112',
    label: '長母音',
  },
  digraph: {
    bg: '#CDBCFF', // 薰衣草
    border: '#9A82EA',
    text: '#2F2160',
    label: '複合子母音',
  },
  blend: {
    bg: '#B5ECC8', // 薄荷綠
    border: '#6BC58E',
    text: '#134D2B',
    label: '混合子音',
  },
  silent_e: {
    bg: '#E8EEF5', // 雲朵灰
    border: '#AEBCCD',
    text: '#6B7B8F',
    label: '魔法 e（不發聲）',
  },
  r_controlled: {
    bg: '#FFC2DC', // 草莓粉
    border: '#EE8DB8',
    text: '#6B1B44',
    label: 'Bossy R',
  },
  diphthong: {
    bg: '#E3C2F7', // 葡萄奶昔
    border: '#B988DF',
    text: '#3E1D5C',
    label: '雙母音',
  },
  silent_letter: {
    bg: '#D5E0EA', // 霧灰藍
    border: '#8EA3B8',
    text: '#2C3E50',
    label: '不發音字母',
  },
};

export function getThemeColor(type: PhonicsType): ThemeColor {
  return THEME_COLORS[type];
}
