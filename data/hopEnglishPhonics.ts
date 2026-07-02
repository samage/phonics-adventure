/**
 * HOPE English 希平方音檔對應
 * @see data/hopEnglishPatterns.ts
 */
import { HOP_PATTERN_MAP } from '@/data/hopEnglishPatterns';

export const HOP_ENGLISH_S3_BASE =
  'https://s3-ap-northeast-1.amazonaws.com/hopenglish/wp/wp-content/uploads/2018/09';

export const HOP_ENGLISH_ATTRIBUTION =
  '發音音檔參考 HOPE English 希平方「自然發音入門班」';

/** pattern key → Hop English 音檔編號 */
export const HOP_PHONEME_AUDIO_ID: Record<string, string> = Object.fromEntries(
  Object.values(HOP_PATTERN_MAP).map((p) => [p.key, p.audioId]),
);

export function hopEnglishRemoteUrl(key: string): string | null {
  const id = HOP_PHONEME_AUDIO_ID[key.toLowerCase()];
  if (!id) return null;
  return `${HOP_ENGLISH_S3_BASE}/${id}.mp3`;
}

export function hopEnglishLocalPath(key: string): string {
  return `/audio/hopenglish/${key.toLowerCase()}.mp3`;
}

export function getHopEnglishAudioId(key: string): string | null {
  return HOP_PHONEME_AUDIO_ID[key.toLowerCase()] ?? null;
}
