/**
 * 預錄「整字／整句」音檔的檔名規則（與 scripts/build_audio.py 的 slug 一致）。
 * 這個檔案不能 import 課程資料，client 端播放會用到。
 */

/** 小寫、去標點（保留字母與撇號）、空白壓成一個 */
export function normalizeSpeechText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 音檔檔名（不含副檔名）：空白→底線、撇號→連字號 */
export function speechFileSlug(text: string): string {
  return normalizeSpeechText(text).replace(/ /g, '_').replace(/'/g, '-');
}

export function speechAudioPath(text: string): string {
  return `/audio/speech/${speechFileSlug(text)}.mp3`;
}

/** 🐢 慢速版整字／整句（Kokoro 以較慢速度重新合成，不是把檔案拉慢） */
export function speechSlowAudioPath(text: string): string {
  return `/audio/speech_slow/${speechFileSlug(text)}.mp3`;
}
