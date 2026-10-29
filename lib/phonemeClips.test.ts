import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import clipSpecs from '@/data/phonemeClips.json';
import audioManifest from '@/data/audioManifest.json';
import speechTexts from '@/data/speechTexts.json';
import { PHONICS_LESSONS } from '@/data/curriculum';
import { HOP_ENGLISH_PATTERNS } from '@/data/hopEnglishPatterns';
import { RECALL_ITEMS } from '@/data/recall/items';
import type { PhonicsBlock } from '@/types/phonics';
import { parseWordToBlocks } from '@/utils/phonicsEngine';
import {
  CLIP_IDS,
  HOP_CLIP_KEYS,
  clipUrl,
  clipsForBlock,
  clipsForIpa,
  clipsForKey,
  resolveHopClips,
  tokenizeIpa,
} from '@/lib/phonemeClips';
import { collectSpeechTexts } from '@/lib/speechTexts';
import { speechFileSlug } from '@/lib/speechFiles';
import { isSilentBlock } from '@/lib/phonicsAudio';

const publicFile = (url: string) => join(process.cwd(), 'public', url);

/** 目前沒有（也不用 TTS 硬切）的音：ʒ（television 的 s） */
const KNOWN_GAPS = new Set(['ʒ']);

/** 取出某個字裡、拼法為 text 的積木所對應的 clip */
function clipOf(word: string, text: string): string[] {
  const block = parseWordToBlocks(word).find((b) => b.text === text);
  expect(block, `${word} 裡沒有積木 ${text}`).toBeTruthy();
  const r = clipsForBlock(block as PhonicsBlock);
  expect(r.missing, `${word}/${text}`).toEqual([]);
  return r.clips;
}

describe('音檔與清單一致', () => {
  it('每個 clip 都有檔案，資料夾裡沒有多餘的檔案', () => {
    for (const id of CLIP_IDS) {
      expect(existsSync(publicFile(clipUrl(id))), id).toBe(true);
    }
    const onDisk = readdirSync(join(process.cwd(), 'public/audio/phonemes'))
      .filter((f) => f.endsWith('.mp3'))
      .map((f) => f.replace(/\.mp3$/, ''))
      .sort();
    expect(onDisk).toEqual([...CLIP_IDS].sort());
    expect((audioManifest as { phonemes: string[] }).phonemes.slice().sort()).toEqual(onDisk);
  });

  it('SCR 來源檔都在 audio-src/scr/，且不再有男聲／ogg 檔', () => {
    for (const c of clipSpecs as { source: string; file?: string }[]) {
      if (c.source === 'scr') {
        expect(existsSync(join(process.cwd(), 'audio-src/scr', c.file as string)), c.file).toBe(true);
      }
    }
    expect(existsSync(join(process.cwd(), 'public/audio/ipa'))).toBe(false);
    expect(existsSync(join(process.cwd(), 'public/audio/soundcity'))).toBe(false);
  });

  it('整字／整句清單與課程同步，每一個都有預錄檔', () => {
    const fresh = collectSpeechTexts();
    expect(speechTexts, '課程文字變了：請跑 npm run export:speech-texts 與 npm run build:audio').toEqual(fresh);
    const m = audioManifest as { words: string[]; sentences: string[] };
    expect(m.words).toEqual(fresh.words);
    expect(m.sentences).toEqual(fresh.sentences);
    for (const t of [...fresh.words, ...fresh.sentences]) {
      expect(existsSync(publicFile(`/audio/speech/${speechFileSlug(t)}.mp3`)), t).toBe(true);
    }
  });
});

describe('IPA 切音（ʊ 與 aʊ 不能混在一起）', () => {
  it('雙音素要整個吃掉', () => {
    expect(tokenizeIpa('aʊ')).toEqual(['aʊ']);
    expect(tokenizeIpa('ʊ')).toEqual(['ʊ']);
    expect(tokenizeIpa('ɔɪ')).toEqual(['ɔɪ']);
    expect(tokenizeIpa('tʃ')).toEqual(['tʃ']);
    expect(tokenizeIpa('dʒ')).toEqual(['dʒ']);
    expect(tokenizeIpa('ŋk')).toEqual(['ŋ', 'k']);
    expect(tokenizeIpa('str')).toEqual(['s', 't', 'r']);
    expect(tokenizeIpa('ɑːr')).toEqual(['ɑːr']);
  });

  it('ʊ → oo_short，aʊ → ou，uː → oo_long，juː → u_long', () => {
    expect(clipsForIpa('ʊ').clips).toEqual(['oo_short']);
    expect(clipsForIpa('aʊ').clips).toEqual(['ou']);
    expect(clipsForIpa('uː').clips).toEqual(['oo_long']);
    expect(clipsForIpa('juː').clips).toEqual(['u_long']);
  });

  it('ʒ 沒有檔案：回報 missing，不會偷偷用別的音代替', () => {
    expect(clipsForIpa('ʒ')).toEqual({ clips: [], missing: ['ʒ'] });
  });
});

describe('已知的對應錯誤都修好了', () => {
  it('ou：soup／you 是 /uː/，house 是 /aʊ/，would 是 /ʊ/，tough 是 /ʌ/', () => {
    expect(clipOf('soup', 'ou')).toEqual(['oo_long']);
    expect(clipOf('you', 'ou')).toEqual(['oo_long']);
    expect(clipOf('house', 'ou')).toEqual(['ou']);
    expect(clipOf('would', 'ou')).toEqual(['oo_short']);
    expect(clipOf('tough', 'ou')).toEqual(['u_short']);
  });
  it('o：come／money 是 /ʌ/，watch 的 a 是 /ɒ/', () => {
    expect(clipOf('come', 'o')).toEqual(['u_short']);
    expect(clipOf('money', 'o')).toEqual(['u_short']);
    expect(clipOf('watch', 'a')).toEqual(['o_short']);
  });
  it('g：gym 是 /dʒ/；y：jelly 結尾是 /i/，my／sky 是 /aɪ/，gym 是 /ɪ/', () => {
    expect(clipOf('gym', 'g')).toEqual(['j']);
    expect(clipOf('jelly', 'y')).toEqual(['e_long']);
    expect(clipOf('sky', 'y')).toEqual(['i_long']);
    expect(clipOf('gym', 'y')).toEqual(['i_short']);
  });
  it('u：cute 是 /juː/（u_long）', () => {
    expect(clipOf('cute', 'u')).toEqual(['u_long']);
  });
  it('doubled letters、-se、-dge、tch、wh、q、ph', () => {
    expect(clipOf('glass', 'ss')).toEqual(['s']);
    expect(clipOf('bell', 'll')).toEqual(['l']);
    expect(clipOf('add', 'dd')).toEqual(['d']);
    expect(clipOf('egg', 'gg')).toEqual(['g']);
    expect(clipOf('house', 'se')).toEqual(['s']);
    expect(clipOf('bridge', 'dge')).toEqual(['j']);
    expect(clipOf('watch', 'tch')).toEqual(['ch']);
    expect(clipOf('what', 'wh')).toEqual(['w']);
    expect(clipOf('queen', 'qu')).toEqual(['qu']);
    expect(clipOf('photo', 'ph')).toEqual(['f']);
  });
  it('ew、ue、ai、ay、ei', () => {
    expect(clipOf('few', 'ew')).toEqual(['u_long']);
    expect(clipOf('stew', 'ew')).toEqual(['oo_long']);
    expect(clipOf('rain', 'ai')).toEqual(['a_long']);
    expect(clipOf('day', 'ay')).toEqual(['a_long']);
    expect(clipOf('vein', 'ei')).toEqual(['a_long']);
  });
  it('queen／quit／quiz 的 qu 是一塊，tongue 的 ue 不發音', () => {
    for (const w of ['queen', 'quit', 'quiz']) {
      expect(parseWordToBlocks(w)[0]?.text, w).toBe('qu');
    }
    const tongue = parseWordToBlocks('tongue');
    expect(tongue.map((b) => b.text).join('')).toBe('tongue');
    expect(tongue.filter((b) => !isSilentBlock(b)).map((b) => b.text.length).every((n) => n >= 1)).toBe(true);
    expect(isSilentBlock(tongue[tongue.length - 1] as PhonicsBlock)).toBe(true);
  });
  it('blend 與 x', () => {
    expect(clipsForKey('blend:str').clips).toEqual(['s', 't', 'r']);
    expect(clipsForKey('x').clips).toEqual(['x']);
    expect(clipsForKey('ck').clips).toEqual(['k']);
  });
});

describe('所有課程單字的每一個積木都有預錄音（不會掉到裝置 TTS）', () => {
  it('整份單字清單', () => {
    const problems: string[] = [];
    for (const w of collectSpeechTexts().words) {
      for (const b of parseWordToBlocks(w)) {
        if (isSilentBlock(b)) continue;
        const r = clipsForBlock(b);
        const real = r.missing.filter((m) => !KNOWN_GAPS.has(m));
        if (real.length > 0 || (r.clips.length === 0 && r.missing.length === 0)) {
          problems.push(`${w}: ${b.text}|${b.type}|${b.phoneme} → ${JSON.stringify(r)}`);
        }
        for (const id of r.clips) {
          if (!existsSync(publicFile(clipUrl(id)))) problems.push(`${w}: ${b.text} 缺檔 ${id}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('課程、Hop、複習題的音都解析得到', () => {
  it('每個 Hop 課次都有人工對應；只有 hop_s_si_z（ʒ）沒有檔案', () => {
    const noClip: string[] = [];
    for (const p of HOP_ENGLISH_PATTERNS) {
      expect(HOP_CLIP_KEYS, p.key).toContain(p.key);
      if (resolveHopClips(p.key).length === 0) noClip.push(p.key);
    }
    expect(noClip).toEqual(['hop_s_si_z']);
  });

  it('每一課的字素 key（patternKey 或字母）都解析得到', () => {
    const problems: string[] = [];
    for (const l of PHONICS_LESSONS) {
      for (const a of l.activities) {
        const c = a.content;
        if (c.kind !== 'grapheme') continue;
        const key = c.patternKey || c.graphemes[0] || '';
        if (key === 'hop_s_si_z') continue;
        if (key.startsWith('blend') || c.graphemes.some((g) => g.length > 1 && !key.startsWith('hop_'))) {
          for (const g of c.graphemes) {
            const r = clipsForKey(`blend:${g}`);
            if (r.missing.length || !r.clips.length) problems.push(`${l.id} blend:${g}`);
          }
          continue;
        }
        const r = clipsForKey(key);
        if (r.missing.length || !r.clips.length) problems.push(`${l.id} ${key}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('每個複習題的 audio 都有對應檔案', () => {
    for (const item of RECALL_ITEMS) {
      const keys = item.audio.startsWith('blend:')
        ? item.audio.slice(6).split('')
        : [item.audio];
      for (const k of keys) {
        const r = clipsForKey(k);
        expect(r.missing, `${item.id}/${k}`).toEqual([]);
        expect(r.clips.length, `${item.id}/${k}`).toBeGreaterThan(0);
        for (const id of r.clips) expect(existsSync(publicFile(clipUrl(id))), id).toBe(true);
      }
    }
  });

  it('複習題的 ow 是 /aʊ/、oo 是長 /uː/、oo_short 是 /ʊ/', () => {
    expect(clipsForKey('ow').clips).toEqual(['ou']);
    expect(clipsForKey('oo').clips).toEqual(['oo_long']);
    expect(clipsForKey('oo_short').clips).toEqual(['oo_short']);
  });
});
