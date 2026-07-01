import type { PhonicsBlock } from '@/types/phonics';

/**
 * 語音控制模組（MVP 免付費 API 作法）。
 *
 * 使用瀏覽器原生 Web Speech API（window.speechSynthesis）。
 * 字母音（Letter Sound）優先使用預錄音檔，因原生 TTS 會把單字母唸成字母名。
 */

const DEFAULT_LANG = 'en-US';
const DEFAULT_RATE = 0.75;

let activeAudio: HTMLAudioElement | null = null;

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

function stopActiveAudio(): void {
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

/**
 * 播放預錄音檔。回傳 true 代表成功播放；false 代表檔案不存在或播放失敗。
 */
export function playAudioFile(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    stopActiveAudio();
    if (isSpeechAvailable()) {
      window.speechSynthesis.cancel();
    }

    const audio = new Audio(src);
    activeAudio = audio;

    const finish = (ok: boolean) => {
      if (activeAudio === audio) activeAudio = null;
      resolve(ok);
    };

    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);

    void audio.play().then(() => {}).catch(() => finish(false));
  });
}

/**
 * 以原生 TTS 唸出一段文字。回傳 Promise，於語音結束時 resolve。
 */
export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechAvailable() || !text) {
      resolve();
      return;
    }

    stopActiveAudio();
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang ?? DEFAULT_LANG;
    utterance.rate = options.rate ?? DEFAULT_RATE;
    utterance.pitch = options.pitch ?? 1.1;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    synth.speak(utterance);
  });
}

/** 立即停止所有正在播放或排隊的語音與音檔。 */
export function cancelSpeech(): void {
  stopActiveAudio();
  if (isSpeechAvailable()) {
    window.speechSynthesis.cancel();
  }
}

/** 唸出完整單字（流暢、稍慢）。 */
export function speakWord(word: string): Promise<void> {
  cancelSpeech();
  return speak(word, { rate: DEFAULT_RATE });
}

function speakSnippet(key: string): Promise<boolean> {
  const safe = key.replace(/[^a-z0-9_-]/gi, '');
  if (!safe) return Promise.resolve(false);
  return playAudioFile(`/audio/snippets/${safe}.mp3`);
}

/** 唸出單一發音積木的音素。 */
export async function speakBlock(block: PhonicsBlock): Promise<void> {
  cancelSpeech();

  const played = await speakSnippet(block.phoneme || block.text);
  if (played) return;

  const spoken = block.text.replace('_e', '').replace('_', '');
  return speak(spoken, { rate: 0.6, pitch: 1.15 });
}

/** 依序播放多個積木的混音（Blending）。 */
export async function speakBlend(
  blocks: PhonicsBlock[],
  gapMs = 120,
): Promise<void> {
  cancelSpeech();
  for (const block of blocks) {
    if (block.type === 'silent_e') continue;
    await speakBlock(block);
    if (gapMs > 0) {
      await new Promise((r) => setTimeout(r, gapMs));
    }
  }
}
