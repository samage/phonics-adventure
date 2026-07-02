/** L42 平滑混音示範音（s a t 連在一起） */
export const SMOOTH_BLEND_WORDS: Record<string, { spaced: string; rate: string }> = {
  sat: { spaced: 's a t', rate: '-32%' },
  pin: { spaced: 'p i n', rate: '-32%' },
  bed: { spaced: 'b e d', rate: '-32%' },
  dog: { spaced: 'd o g', rate: '-32%' },
  sun: { spaced: 's u n', rate: '-32%' },
  mat: { spaced: 'm a t', rate: '-32%' },
  pig: { spaced: 'p i g', rate: '-32%' },
  cup: { spaced: 'c u p', rate: '-32%' },
};

export function smoothWordAudioPath(word: string): string {
  return `/audio/blend-smooth/${word.toLowerCase()}.mp3`;
}
