import type { PhonicsBlock } from '@/types/phonics';

/**
 * 語音控制模組（MVP 免付費 API 作法）。
 *
 * 使用瀏覽器原生 Web Speech API（window.speechSynthesis）。
 * - lang 固定為 'en-US'
 * - rate 預設 0.75（標準語速對剛學拼讀的孩子太快，調慢才能聽清混音細節）
 *
 * 架構預留：單一音素若原生 TTS 發不準，可改接預錄 Audio Snippets，
 * 只需替換 speakSnippet 的實作即可，呼叫端不必更動。
 */

const DEFAULT_LANG = 'en-US';
const DEFAULT_RATE = 0.75;

function isSpeechAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
}

/**
 * 以原生 TTS 唸出一段文字。回傳 Promise，於語音結束時 resolve。
 * 若環境不支援，會靜默 resolve（不丟錯，方便 SSR 與測試）。
 */
export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechAvailable() || !text) {
      resolve();
      return;
    }

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang ?? DEFAULT_LANG;
    utterance.rate = options.rate ?? DEFAULT_RATE;
    utterance.pitch = options.pitch ?? 1.1; // 略高音調更親切

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    synth.speak(utterance);
  });
}

/** 立即停止所有正在播放或排隊的語音。 */
export function cancelSpeech(): void {
  if (isSpeechAvailable()) {
    window.speechSynthesis.cancel();
  }
}

/** 唸出完整單字（流暢、稍慢）。 */
export function speakWord(word: string): Promise<void> {
  cancelSpeech();
  return speak(word, { rate: DEFAULT_RATE });
}

/**
 * 預錄音檔介面（目前未啟用）。
 * 之後可在此載入 /public/audio/<key>.mp3 取代原生 TTS，呼叫端無需改動。
 */
function speakSnippet(key: string): Promise<void> | null {
  // TODO: 接入預錄 Audio Snippets 時實作（依 key 載入 /public/audio/<key>.mp3）。
  // 回傳 null 代表尚未提供預錄音檔，呼叫端會自動 fallback 到原生 TTS。
  void key;
  return null;
}

/**
 * 唸出單一發音積木的音素。
 *
 * 原生 TTS 難以發出孤立音素（如純 /k/），因此：
 * - 若該積木對應有預錄音檔，優先使用。
 * - 否則以積木文字（去除 Magic-E 的底線）近似發音，語速更慢、音調略高。
 */
export function speakBlock(block: PhonicsBlock): Promise<void> {
  cancelSpeech();

  const snippet = speakSnippet(block.phoneme || block.text);
  if (snippet) return snippet;

  // a_e 這類 Magic-E 標記，朗讀時取其母音字母即可。
  const spoken = block.text.replace('_e', '').replace('_', '');
  return speak(spoken, { rate: 0.6, pitch: 1.15 });
}

/**
 * 依序播放多個積木的混音（Blending）。
 * 例如 [c][a][t] 會一個接一個慢慢唸出，模擬大腦混音過程。
 */
export async function speakBlend(
  blocks: PhonicsBlock[],
  gapMs = 120,
): Promise<void> {
  cancelSpeech();
  for (const block of blocks) {
    if (block.type === 'silent_e') continue; // silent e 不發聲
    await speakBlock(block);
    if (gapMs > 0) {
      await new Promise((r) => setTimeout(r, gapMs));
    }
  }
}
