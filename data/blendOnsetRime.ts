import manifest from '@/data/blendDemoManifest.json';
import { blendWordAudioPath } from '@/data/blendClipSources';
import { hopEnglishLocalPath } from '@/data/hopEnglishPhonics';

export interface OnsetRimeSplit {
  onset: string;
  rime: string;
}

export type DemoClipMode = 'file' | 'wordClip' | 'hopClip';

export interface DemoClip {
  mode?: DemoClipMode;
  /** wordClip：例字音檔 */
  word?: string;
  /** hopClip：希平方規則音檔 key，如 hop_s_ss_ce_se_c_sc */
  hopKey?: string;
  startMs?: number;
  clipMs?: number;
  spoken?: string;
  rate?: string;
}

export interface WordDemoConfig {
  onset: DemoClip;
  rime: DemoClip;
  blend: DemoClip;
}

const DEMO_MANIFEST = manifest as Record<string, WordDemoConfig>;

export function getBlendDemoConfig(word: string): WordDemoConfig | null {
  return DEMO_MANIFEST[word.toLowerCase()] ?? null;
}

export function splitCvcOnsetRime(word: string): OnsetRimeSplit | null {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length !== 3) return null;
  return { onset: w[0], rime: w.slice(1) };
}

function clipMode(clip: DemoClip): DemoClipMode {
  return clip.mode ?? 'file';
}

export function resolveDemoClipPath(word: string, part: 'onset' | 'rime' | 'blend'): string {
  const clip = getBlendDemoConfig(word)?.[part];
  if (!clip) {
    return `/audio/blend-demo/${word.toLowerCase()}-${part}.mp3`;
  }

  const mode = clipMode(clip);
  if (mode === 'hopClip' && clip.hopKey) {
    return hopEnglishLocalPath(clip.hopKey);
  }
  if (mode === 'wordClip' && clip.word) {
    return blendWordAudioPath(clip.word);
  }
  return `/audio/blend-demo/${word.toLowerCase()}-${part}.mp3`;
}

export function blendDemoOnsetPath(word: string): string {
  return resolveDemoClipPath(word, 'onset');
}

export function blendDemoRimePath(word: string): string {
  return resolveDemoClipPath(word, 'rime');
}

export function blendDemoBlendPath(word: string): string {
  return resolveDemoClipPath(word, 'blend');
}

export function getDemoClipTiming(
  word: string,
  part: 'onset' | 'rime' | 'blend',
): { startMs: number; clipMs?: number } {
  const clip = getBlendDemoConfig(word)?.[part];
  if (!clip) return { startMs: 0 };

  const mode = clipMode(clip);
  if (mode === 'wordClip' || mode === 'hopClip') {
    return {
      startMs: clip.startMs ?? 0,
      clipMs: clip.clipMs,
    };
  }

  return {
    startMs: 0,
    clipMs: part === 'onset' ? clip.clipMs : undefined,
  };
}

export const BLEND_DEMO_WORDS = Object.keys(DEMO_MANIFEST);
