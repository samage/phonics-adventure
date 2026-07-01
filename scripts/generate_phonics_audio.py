"""
產生字母與字母組合的預錄音檔。
需要：pip install edge-tts

執行：python scripts/generate_phonics_audio.py
"""
from __future__ import annotations

import asyncio
from pathlib import Path

import edge_tts

VOICE = "en-US-AnaNeural"
RATE = "-25%"
ROOT = Path(__file__).resolve().parent.parent
LETTER_DIR = ROOT / "public" / "audio" / "letter-sounds"
GRAPHEME_DIR = ROOT / "public" / "audio" / "graphemes"

LETTER_SOUND_SPOKEN: dict[str, str] = {
    "a": "ah", "e": "eh", "i": "ih", "o": "aw", "u": "uh",
    "f": "fff", "h": "hhh", "l": "lll", "m": "mmm", "n": "nnn",
    "r": "rrr", "s": "sss", "v": "vvv", "z": "zzz",
    "b": "buh", "c": "kuh", "d": "duh", "g": "guh", "j": "juh",
    "k": "kuh", "p": "puh", "t": "tuh", "q": "kw", "w": "wuh",
    "x": "ks", "y": "yuh",
}

GRAPHEME_SOUND_SPOKEN: dict[str, str] = {
    "magic_e": "ay ee eye oh you",
    "ai": "ay", "ay": "ay", "au": "aw", "aw": "aw", "ee": "ee",
    "ch": "ch", "ck": "k", "gh": "f", "ei": "ay", "eu": "you",
    "ou": "ow", "ew": "oo",
}


async def save(text: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(str(path))
    print(f"  {path.name}  <-  {text!r}")


async def main() -> None:
    print("字母音...")
    for letter, text in LETTER_SOUND_SPOKEN.items():
        await save(text, LETTER_DIR / f"{letter}.mp3")

    print("字母組合...")
    for key, text in GRAPHEME_SOUND_SPOKEN.items():
        await save(text, GRAPHEME_DIR / f"{key}.mp3")

    print("完成！")


if __name__ == "__main__":
    asyncio.run(main())
