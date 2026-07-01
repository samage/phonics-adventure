export type PhonicsType =
  | 'consonant'
  | 'short_vowel'
  | 'long_vowel'
  | 'digraph'
  | 'blend'
  | 'silent_e'
  | 'r_controlled'
  | 'diphthong'
  | 'silent_letter';

export interface PhonicsBlock {
  text: string; // 顯示的字母組合，例如 "sh", "ai", "t"
  type: PhonicsType; // 發音類型
  soundRule: string; // 對應的發音規則名稱，例如 "Digraphs"
  phoneme: string; // 音素標記，供 TTS 或語音引導使用
}
