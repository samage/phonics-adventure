import type { PhonicsBlock } from '@/types/phonics';
import {
  getHopPattern,
  HOP_PATTERN_MAP,
  type HopEnglishPattern,
} from '@/data/hopEnglishPatterns';

export type { HopEnglishPattern };

export interface GraphemePhonicsMeta {
  key: string;
  display: string;
  spellings: string[];
  phonicsType: PhonicsBlock['type'];
  soundRule: string;
  exampleWords: string[];
  hint: string;
  ruleDetail?: string;
  exampleNotes?: Record<string, string>;
}

function toMeta(p: HopEnglishPattern): GraphemePhonicsMeta {
  return {
    key: p.key,
    display: p.display,
    spellings: p.spellings,
    phonicsType: p.phonicsType,
    soundRule: p.soundRule,
    exampleWords: p.exampleWords,
    hint: p.hint,
    ruleDetail: p.ruleDetail,
    exampleNotes: p.exampleNotes,
  };
}

export const GRAPHEME_PHONICS: Record<string, GraphemePhonicsMeta> =
  Object.fromEntries(
    Object.values(HOP_PATTERN_MAP).map((p) => [p.key, toMeta(p)]),
  );

export function getGraphemePhonics(key: string): GraphemePhonicsMeta | null {
  return GRAPHEME_PHONICS[key.toLowerCase()] ?? null;
}

export function graphemeToBlock(key: string): PhonicsBlock {
  const meta = getGraphemePhonics(key);
  if (meta) {
    return {
      text: meta.display,
      type: meta.phonicsType,
      soundRule: meta.soundRule,
      phoneme: meta.spellings[0] ?? key,
    };
  }
  return {
    text: key,
    type: 'digraph',
    soundRule: 'Grapheme',
    phoneme: key,
  };
}
