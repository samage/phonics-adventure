import manifest from '@/data/scrSupplementPhonemeManifest.json';
import { playAudioFile } from '@/lib/speech';

export interface ScrSupplementEntry {
  key: string;
  variant: string;
  localFile: string;
  commonsTitle: string;
  ipa: string;
  sourceUrl: string;
  author: string;
  license: string;
  note: string;
}

const SUPPLEMENT = manifest as ScrSupplementEntry[];

const BY_LOCAL_NAME = new Map(
  SUPPLEMENT.map((e) => [e.localFile.replace(/\.ogg$/, ''), e]),
);

/** SCR 補充音檔（Wikimedia Commons）是否已有此 key */
export function hasScrSupplementKey(key: string): boolean {
  return BY_LOCAL_NAME.has(key.toLowerCase());
}

export function scrSupplementAudioPath(fileName: string): string {
  return `/audio/soundcity/${fileName}.ogg`;
}

export async function playScrSupplementKey(key: string): Promise<boolean> {
  const name = key.toLowerCase();
  if (!BY_LOCAL_NAME.has(name)) return false;
  return playAudioFile(scrSupplementAudioPath(name));
}

export function getScrSupplementEntries(): ScrSupplementEntry[] {
  return [...SUPPLEMENT];
}
