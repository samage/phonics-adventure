/**
 * App 裡「會被念出來」的所有文字（單字與句子）。
 * 離線音檔管線（scripts/build_audio.py）用這份清單，用同一個女聲預錄成 mp3；
 * app 播放時依 normalizeSpeechText() 找檔，找不到才退回裝置 TTS。
 */
import { PHONICS_LESSONS } from '@/data/curriculum';
import { HOP_ENGLISH_PATTERNS } from '@/data/hopEnglishPatterns';
import { BLEND_LESSONS } from '@/data/blends';
import { CURATED_WORDS } from '@/data/curatedWords';
import { CURATED_BLEND_WORDS } from '@/data/curatedBlendWords';
import { TRICKY_WORDS } from '@/data/trickyWords';
import { RECALL_ITEMS } from '@/data/recall/items';
import { TEXT_ITEMS } from '@/data/recall/textItems';
import { normalizeSpeechText, speechFileSlug } from '@/lib/speechFiles';

export { normalizeSpeechText, speechFileSlug };

/** 課程與複習會念的所有單字（已正規化、去重、排序） */
export function collectSpeechWords(): string[] {
  const words = new Set<string>();
  const add = (w: string) => {
    const n = normalizeSpeechText(w);
    if (n && !n.includes(' ')) words.add(n);
  };
  for (const l of PHONICS_LESSONS) {
    (l.words ?? []).forEach(add);
    for (const a of l.activities) {
      const c = a.content;
      if (c.kind === 'grapheme' || c.kind === 'sight_word') c.words.forEach(add);
      else c.sentences.forEach((s) => s.split(/\s+/).forEach(add));
    }
  }
  HOP_ENGLISH_PATTERNS.forEach((p) => p.exampleWords.forEach(add));
  BLEND_LESSONS.forEach((b) => b.words.forEach(add));
  Object.keys(CURATED_WORDS).forEach(add);
  Object.keys(CURATED_BLEND_WORDS).forEach(add);
  TRICKY_WORDS.forEach((t) => add(t.word));
  RECALL_ITEMS.forEach((r) => r.words.forEach(add));
  for (const t of TEXT_ITEMS) {
    if (t.kind === 'word') add(t.word);
    else t.words.forEach(add);
  }
  return [...words].sort();
}

/** 課程裡的所有句子（已正規化、去重、排序） */
export function collectSpeechSentences(): string[] {
  const sentences = new Set<string>();
  for (const t of TEXT_ITEMS) {
    if (t.kind === 'sentence') sentences.add(normalizeSpeechText(t.text));
  }
  for (const l of PHONICS_LESSONS) {
    for (const a of l.activities) {
      if (a.content.kind === 'decodable_sentences') {
        a.content.sentences.forEach((s) => sentences.add(normalizeSpeechText(s)));
      }
    }
  }
  return [...sentences].filter(Boolean).sort();
}

export interface SpeechTexts {
  words: string[];
  sentences: string[];
}

export function collectSpeechTexts(): SpeechTexts {
  return { words: collectSpeechWords(), sentences: collectSpeechSentences() };
}
