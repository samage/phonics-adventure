import manifest from '@/data/ipaAudioManifest.json';

export interface IpaAudioEntry {
  ipa: string;
  commons: string;
  clipMs: number;
}

const IPA_MANIFEST = manifest as Record<string, IpaAudioEntry>;

export function getIpaAudioEntry(key: string): IpaAudioEntry | null {
  return IPA_MANIFEST[key.toLowerCase()] ?? null;
}

export function ipaAudioPath(key: string): string {
  return `/audio/ipa/${key.toLowerCase()}.ogg`;
}

export function getIpaClipMs(key: string): number | null {
  return getIpaAudioEntry(key)?.clipMs ?? null;
}

export function getAllIpaAudioKeys(): string[] {
  return Object.keys(IPA_MANIFEST);
}
