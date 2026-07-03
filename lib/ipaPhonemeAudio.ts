import manifest from '@/data/ipaPhonemeManifest.json';
import { playAudioFile } from '@/lib/speech';

export interface IpaPhonemeEntry {
  hopKey: string;
  ipa: string;
  localFile: string;
  commonsTitle: string;
  sourceUrl: string;
  author: string;
  license: string;
  note: string;
}

const IPA_MANIFEST = manifest as IpaPhonemeEntry[];

const IPA_BY_HOP_KEY = new Map(IPA_MANIFEST.map((e) => [e.hopKey, e]));

/** 五堂核心 Hop 課是否已有 Wikimedia IPA 預錄音 */
export function hasIpaHopPhoneme(hopKey: string): boolean {
  return IPA_BY_HOP_KEY.has(hopKey);
}

export function ipaAudioPath(hopKey: string): string | null {
  const entry = IPA_BY_HOP_KEY.get(hopKey);
  if (!entry) return null;
  return `/audio/ipa/${entry.localFile}`;
}

export async function playIpaHopPhoneme(hopKey: string): Promise<boolean> {
  const path = ipaAudioPath(hopKey);
  if (!path) return false;
  return playAudioFile(path);
}

export function getIpaHopEntries(): IpaPhonemeEntry[] {
  return [...IPA_MANIFEST];
}
