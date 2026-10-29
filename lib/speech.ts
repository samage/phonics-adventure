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
 * rate < 1 為慢速播放（保持音高）。
 */
export function playAudioFile(src: string, rate = 1): Promise<boolean> {
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
    if (rate !== 1) {
      // 🐢 慢速：降低播放速度但保持音高
      audio.playbackRate = rate;
      audio.preservesPitch = true;
    }
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
