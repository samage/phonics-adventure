import fs from 'node:fs';
import path from 'node:path';
import { it } from 'vitest';
import { collectSpeechTexts } from '@/lib/speechTexts';

/** 把課程裡會念的字與句寫到 data/speechTexts.json，給 scripts/build_audio.py 用 */
it('export speech texts', () => {
  const out = path.resolve(__dirname, '..', 'data', 'speechTexts.json');
  fs.writeFileSync(out, JSON.stringify(collectSpeechTexts(), null, 1) + '\n', 'utf-8');
});
