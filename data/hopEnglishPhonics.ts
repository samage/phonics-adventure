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

/** 單字母備援（混音拼字 CVC 用） */
const LETTER_AUDIO: Record<string, string> = {
  a: '13', b: '17', c: '34', d: '18', e: '21', f: '32', g: '19',
  h: '33', i: '31', j: '20', k: '34', l: '211', m: '22', n: '23',
  o: '41', p: '35', q: '34', r: '24', s: '36', t: '37', u: '51',
  v: '25', w: '26', y: '311', z: '27',
};

export function hopEnglishRemoteUrl(key: string): string | null {
  const id = HOP_PHONEME_AUDIO_ID[key.toLowerCase()] ?? LETTER_AUDIO[key.toLowerCase()];
  if (!id) return null;
  return `${HOP_ENGLISH_S3_BASE}/${id}.mp3`;
}

export function hopEnglishLocalPath(key: string): string {
  return `/audio/hopenglish/${key.toLowerCase()}.mp3`;
}

export function getHopEnglishAudioId(key: string): string | null {
  return (
    HOP_PHONEME_AUDIO_ID[key.toLowerCase()] ??
    LETTER_AUDIO[key.toLowerCase()] ??
    null
  );
}
