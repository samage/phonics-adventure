import type { PhonicsBlock } from '@/types/phonics';
import { speakBlockPhoneme } from '@/lib/phonicsAudio';
import {
  speakSmoothPhonemeBlend,
  speakSmoothWordDemo,
} from '@/lib/smoothBlend';

/**
 * 語音控制模組。
 * 音素：Sound City Reading 預錄音檔；整字與備援：Web Speech API。
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

/** 播放音檔前段（混音拼讀從例字截取音素用） */
export function playAudioFileSegment(src: string, durationMs: number): Promise<boolean> {
  return playAudioFileRange(src, 0, durationMs);
}

/** 播放音檔指定區段（從例字截取首音／韻尾用） */
export function playAudioFileRange(
  src: string,
  startMs: number,
  durationMs?: number,
): Promise<boolean> {
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
    let timer: ReturnType<typeof setTimeout> | null = null;

    const finish = (ok: boolean) => {
      if (timer) clearTimeout(timer);
      audio.pause();
      if (activeAudio === audio) activeAudio = null;
      resolve(ok);
    };

    audio.onerror = () => finish(false);
    audio.onended = () => {
      if (!durationMs) finish(true);
    };

    const begin = () => {
      if (startMs > 0) {
        audio.currentTime = startMs / 1000;
      }
      void audio
        .play()
        .then(() => {
          if (durationMs && durationMs > 0) {
            timer = setTimeout(() => finish(true), durationMs);
          }
        })
        .catch(() => finish(false));
    };

    if (audio.readyState >= 1) begin();
    else audio.addEventListener('loadedmetadata', begin, { once: true });
  });
}

/**
 * 以原生 TTS 唸出一段文字（主要用於完整單字，不用於單字母）。
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

/** 唸出單一發音積木的音素。 */
export async function speakBlock(block: PhonicsBlock): Promise<void> {
  return speakBlockPhoneme(block);
}

/** 平滑混音：音素緊密相接，完成後可接整字。 */
export async function speakBlend(blocks: PhonicsBlock[]): Promise<void> {
  return speakSmoothPhonemeBlend(blocks);
}

export { speakSmoothWordDemo };
