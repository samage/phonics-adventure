"""
產生 26 個字母的 Letter Sound 預錄音檔。
需要：pip install edge-tts

執行：python scripts/generate_letter_sounds.py
"""
from __future__ import annotations

import asyncio
from pathlib import Path

import edge_tts

VOICE = "en-US-AnaNeural"
RATE = "-25%"
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "audio" / "letter-sounds"

LETTER_SOUND_SPOKEN: dict[str, str] = {
    "a": "ah",
    "e": "eh",
    "i": "ih",
    "o": "aw",
    "u": "uh",
    "f": "fff",
    "h": "hhh",
    "l": "lll",
    "m": "mmm",
    "n": "nnn",
    "r": "rrr",
    "s": "sss",
    "v": "vvv",
    "z": "zzz",
    "b": "buh",
    "c": "kuh",
    "d": "duh",
    "g": "guh",
    "j": "juh",
    "k": "kuh",
    "p": "puh",
    "t": "tuh",
    "q": "kw",
    "w": "wuh",
    "x": "ks",
    "y": "yuh",
}


async def generate_one(letter: str, text: str) -> None:
    out = OUT_DIR / f"{letter}.mp3"
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(str(out))
    print(f"  {letter}.mp3  <-  {text!r}")


async def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"輸出目錄: {OUT_DIR}")
    for letter, text in LETTER_SOUND_SPOKEN.items():
        await generate_one(letter, text)
    print("完成！")


if __name__ == "__main__":
    asyncio.run(main())
