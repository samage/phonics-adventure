"""
產生混音拼讀用的例字音檔（L42 從例字開頭截取音素）。
需要：pip install edge-tts

執行：py -3 scripts/generate_blend_words.py
"""
from __future__ import annotations

import asyncio
from pathlib import Path

import edge_tts

VOICE = "en-US-AnaNeural"
RATE = "-15%"
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "blend-words"

# 與 data/blendClipSources.ts getAllBlendWords() 同步
BLEND_WORDS = sorted(
    {
        "apple",
        "bed",
        "cup",
        "cat",
        "dog",
        "egg",
        "fish",
        "goat",
        "hat",
        "igloo",
        "jam",
        "kite",
        "leg",
        "map",
        "net",
        "octopus",
        "pig",
        "pot",
        "queen",
        "rat",
        "sat",
        "pin",
        "mat",
        "sun",
        "top",
        "umbrella",
        "van",
        "web",
        "box",
        "yes",
        "zip",
    }
)


async def generate_one(word: str) -> None:
    out = OUT_DIR / f"{word}.mp3"
    communicate = edge_tts.Communicate(word, VOICE, rate=RATE)
    await communicate.save(str(out))
    print(f"  {word}.mp3")


async def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"輸出：{OUT_DIR}")
    for word in BLEND_WORDS:
        await generate_one(word)
    print("完成！")


if __name__ == "__main__":
    asyncio.run(main())
