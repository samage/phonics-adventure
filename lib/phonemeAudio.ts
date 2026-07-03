import type { PhonicsBlock } from '@/types/phonics';
import manifest from '@/data/soundcityPhonemeManifest.json';
import {
  hasScrSupplementKey,
  playScrSupplementKey,
} from '@/lib/scrSupplementAudio';
import { playAudioFile } from '@/lib/speech';

interface SoundcityEntry {
  key: string;
  variant: string;
  localFile: string;
}

const SOUNDCITY = manifest as SoundcityEntry[];

const SOUNDCITY_BY_NAME = new Map(
  SOUNDCITY.map((e) => [e.localFile.replace(/\.mp3$/, ''), e]),
);

function normPhoneme(phoneme: string): string {
  return phoneme.replace(/\s/g, '').toLowerCase();
}

function isPhoneme(phoneme: string, ...targets: string[]): boolean {
  const p = normPhoneme(phoneme);
  return targets.some((t) => p === t || p.includes(t));
}

const UNAMBIGUOUS_SUPPLEMENT = new Set([
  'ee',
  'ai',
  'ay',
  'oa',
  'sh',
  'ch',
  'tch',
  'ng',
  'ngue',
  'ge',
  'dge',
  'ti',
  'ci',
  'ey',
  'ue',
  'q',
  'igh',
  'a-e',
  'i-e',
  'o-e',
  'u-e',
]);

/**
 * 依積木的拼法、類型與音素，解析應播放的檔名（不含副檔名）。
 * supplement .ogg 優先於 SCR .mp3。
 */
export function resolveSoundcityFileName(block: PhonicsBlock): string | null {
  const text = block.text.toLowerCase();
  const phoneme = normPhoneme(block.phoneme);

  if (block.type === 'silent_e') return null;

  if (text === 'th') {
    if (isPhoneme(phoneme, 'ð')) {
      return hasScrSupplementKey('th_voiced') ? 'th_voiced' : 'th_voiced';
    }
    return hasScrSupplementKey('th_voiceless') ? 'th_voiceless' : 'th_voiceless';
  }

  if (text === 'ea' && block.type === 'short_vowel') {
    return SOUNDCITY_BY_NAME.has('e_short') ? 'e_short' : 'e_short';
  }

  if (text === 'oo') {
    if (isPhoneme(phoneme, 'ʊ') || block.type === 'short_vowel') {
      return hasScrSupplementKey('oo_short') ? 'oo_short' : null;
    }
    if (isPhoneme(phoneme, 'uː', 'u:') || block.type === 'long_vowel') {
      return hasScrSupplementKey('oo') ? 'oo' : null;
    }
  }

  if (text === 'ow') {
    if (isPhoneme(phoneme, 'oʊ', 'o:') || block.type === 'long_vowel') {
      return hasScrSupplementKey('ow_long') ? 'ow_long' : null;
    }
    if (isPhoneme(phoneme, 'aʊ', 'au') || block.type === 'diphthong') {
      return SOUNDCITY_BY_NAME.has('ow') ? 'ow' : null;
    }
  }

  if (text === 'ou') {
    if (isPhoneme(phoneme, 'uː', 'u:')) {
      return hasScrSupplementKey('ou_long') ? 'ou_long' : null;
    }
    if (isPhoneme(phoneme, 'ʊ')) {
      return hasScrSupplementKey('oo_short') ? 'oo_short' : null;
    }
    if (isPhoneme(phoneme, 'aʊ', 'au') || block.type === 'diphthong') {
      return SOUNDCITY_BY_NAME.has('ou') ? 'ou' : null;
    }
    if (isPhoneme(phoneme, 'ʌ')) {
      return SOUNDCITY_BY_NAME.has('u_short') ? 'u_short' : null;
    }
  }

  if (text === 'ew') {
    if (isPhoneme(phoneme, 'juː', 'ju:', 'j')) {
      return SOUNDCITY_BY_NAME.has('u_long') ? 'u_long' : null;
    }
    if (isPhoneme(phoneme, 'uː', 'u:')) {
      return hasScrSupplementKey('ew') ? 'ew' : null;
    }
  }

  if (text === 'ie') {
    if (isPhoneme(phoneme, 'aɪ', 'ai')) {
      return hasScrSupplementKey('igh') ? 'igh' : null;
    }
    if (isPhoneme(phoneme, 'iː', 'i:')) {
      return hasScrSupplementKey('ie') ? 'ie' : null;
    }
  }

  if (text === 'y') {
    if (block.type === 'long_vowel' && hasScrSupplementKey('y_vowel')) {
      return 'y_vowel';
    }
    if (block.type === 'short_vowel') {
      return SOUNDCITY_BY_NAME.has('i_short') ? 'i_short' : null;
    }
    if (block.type === 'consonant' && SOUNDCITY_BY_NAME.has('y')) {
      return 'y';
    }
  }

  if (text === 'oe' && isPhoneme(phoneme, 'uː', 'u:')) {
    return hasScrSupplementKey('oo') ? 'oo' : null;
  }

  if (block.type === 'long_vowel' && text.length === 1 && 'aeiou'.includes(text)) {
    if (text === 'u' && isPhoneme(phoneme, 'juː', 'ju:', 'j')) {
      return SOUNDCITY_BY_NAME.has('u_long') ? 'u_long' : null;
    }
    const magicKey = `${text}-e`;
    if (hasScrSupplementKey(magicKey)) return magicKey;
    const scrLong = `${text}_long`;
    if (SOUNDCITY_BY_NAME.has(scrLong)) return scrLong;
    return null;
  }

  if (UNAMBIGUOUS_SUPPLEMENT.has(text) && hasScrSupplementKey(text)) {
    return text;
  }

  if (text === 'ea' && hasScrSupplementKey('ea')) {
    return 'ea';
  }

  const magic = text.match(/^([aeiou])-e$/);
  if (magic && hasScrSupplementKey(`${magic[1]}-e`)) {
    return `${magic[1]}-e`;
  }

  if (block.type === 'short_vowel' && text.length === 1) {
    const name = `${text}_short`;
    if (SOUNDCITY_BY_NAME.has(name)) return name;
    return name;
  }

  if (block.type === 'digraph' || text.length >= 2) {
    if (SOUNDCITY_BY_NAME.has(text)) return text;
  }

  if (text.length === 1 && SOUNDCITY_BY_NAME.has(text)) return text;

  return null;
}

export function soundcityAudioPath(fileName: string): string {
  return `/audio/soundcity/${fileName}.mp3`;
}

export function resolveSoundcityKey(key: string): string | null {
  const k = key.toLowerCase();
  if (hasScrSupplementKey(k)) return k;
  if (SOUNDCITY_BY_NAME.has(k)) return k;
  if (k.startsWith('long_')) {
    const name = `${k.slice(5)}_long`;
    if (SOUNDCITY_BY_NAME.has(name)) return name;
    const supplement = k.slice(5);
    if (hasScrSupplementKey(supplement)) return supplement;
  }
  if (/^[a-z]$/.test(k) && SOUNDCITY_BY_NAME.has(`${k}_short`)) return `${k}_short`;
  if (/^[a-z]$/.test(k) && SOUNDCITY_BY_NAME.has(k)) return k;
  return null;
}

export function hasSoundcityKey(key: string): boolean {
  return resolveSoundcityKey(key) !== null;
}

async function playResolvedSoundcityName(name: string): Promise<boolean> {
  if (hasScrSupplementKey(name)) return playScrSupplementKey(name);
  if (SOUNDCITY_BY_NAME.has(name)) return playAudioFile(soundcityAudioPath(name));
  return false;
}

export async function playSoundcityForBlock(block: PhonicsBlock): Promise<boolean> {
  const name = resolveSoundcityFileName(block);
  if (!name) return false;
  return playResolvedSoundcityName(name);
}

export async function playSoundcityKey(key: string): Promise<boolean> {
  const name = resolveSoundcityKey(key);
  if (!name) return false;
  return playResolvedSoundcityName(name);
}
