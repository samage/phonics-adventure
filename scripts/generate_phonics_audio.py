"""
以 SSML IPA 音素產生字母組合 / 長母音音檔（不含 26 字母—混音請用 generate_blend_words.py）。
注意：edge-tts 已不支援自訂 SSML phoneme，請勿用此腳本產生 a-z 單字母音檔。

需要：pip install edge-tts
執行：py -3 scripts/generate_phonics_audio.py
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path

import edge_tts

VOICE = "en-US-AnaNeural"
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "phonemes"

# 字母組合與長母音（26 字母混音請用 generate_blend_words.py）
PHONEMES: dict[str, str] = {
    "long_a": "eɪ", "long_e": "iː", "long_i": "aɪ", "long_o": "oʊ", "long_u": "juː",
    "ai": "eɪ", "ay": "eɪ", "au": "ɔ", "aw": "ɔ", "ee": "iː",
    "ch": "tʃ", "ck": "k", "gh": "f", "ei": "eɪ", "eu": "juː",
    "ou": "aʊ", "ew": "juː", "sh": "ʃ", "th": "θ", "ng": "ŋ",
    "oa": "oʊ", "oo": "uː", "ow": "oʊ", "oi": "ɔɪ", "ar": "ɑɹ",
    "or": "ɔɹ", "er": "ɚ", "ph": "f", "wh": "w", "igh": "aɪ",
}

# Magic E 規則說明（自然語句，非 IPA）
RULE_TEXT: dict[str, str] = {
    "magic_e_rule": "The e at the end is silent, and makes the vowel say its name.",
}


def ssml_ipa(ipa: str) -> str:
    return f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="{VOICE}">
    <prosody rate="-20%" pitch="-5%">
      <phoneme alphabet="ipa" ph="{ipa}">sound</phoneme>
    </prosody>
  </voice>
</speak>"""


def ssml_text(text: str) -> str:
    return f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="{VOICE}">
    <prosody rate="-15%">{text}</prosody>
  </voice>
</speak>"""


async def save_ssml(ssml: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(ssml, VOICE)
    await communicate.save(str(path))


async def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"輸出：{OUT_DIR}")

    for key, ipa in PHONEMES.items():
        path = OUT_DIR / f"{key}.mp3"
        await save_ssml(ssml_ipa(ipa), path)
        print(f"  {key}.mp3")

    for key, text in RULE_TEXT.items():
        path = OUT_DIR / f"{key}.mp3"
        await save_ssml(ssml_text(text), path)
        print(f"  {key}.mp3  rule")

    # 寫 manifest 供除錯
    manifest = {**PHONEMES, **{k: v for k, v in RULE_TEXT.items()}}
    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("完成！")


if __name__ == "__main__":
    asyncio.run(main())
