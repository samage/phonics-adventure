'use client';

import { useState } from 'react';
import Link from 'next/link';
import WordPhonicsLab from '@/components/phonics/WordPhonicsLab';
import { getTrickyWord, isTrickyWord } from '@/data/trickyWords';
import { decodeWordAnalysis } from '@/utils/phonicsEngine';
import { speakWord } from '@/lib/speech';

export default function DecodeWordActivity() {
  const [input, setInput] = useState('');
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = input.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return;

    if (isTrickyWord(clean)) {
      const tw = getTrickyWord(clean);
      setMessage(tw?.hintZh ?? '這是特殊字，請整字記憶，不要硬拆。');
      setActiveWord(null);
      return;
    }

    const result = decodeWordAnalysis(clean);
    if (!result.decodable || result.blocks.length === 0) {
      setMessage('無法拆音，這個字可能不規則，建議查特殊字單元。');
      setActiveWord(null);
      return;
    }

    if (!result.fromCurated) {
      setMessage('提示：此字依規則自動拆音，若唸法不對可能是多音字或不規則字。');
    } else {
      setMessage('');
    }
    setActiveWord(clean);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <p className="text-center text-lg text-purple-900">
        輸入任意英文單字，試著拆音、混音唸出來
      </p>
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如 mop、ship、cake"
          className="flex-1 rounded-2xl border-2 border-purple-200 px-4 py-3 text-xl text-amber-950"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="rounded-2xl bg-purple-500 px-6 py-3 text-lg text-white"
        >
          試唸
        </button>
      </form>
      {message && (
        <div className="w-full rounded-xl bg-rose-50 px-4 py-3 text-rose-900">
          {message}
          {isTrickyWord(input.trim().toLowerCase()) && (
            <button
              type="button"
              className="ml-3 underline"
              onClick={() => speakWord(input.trim().toLowerCase())}
            >
              聽整字
            </button>
          )}
        </div>
      )}
      {activeWord && (
        <WordPhonicsLab key={activeWord} word={activeWord} />
      )}
      <Link href="/" className="text-amber-700 underline">
        ← 回到課程路徑
      </Link>
    </div>
  );
}
