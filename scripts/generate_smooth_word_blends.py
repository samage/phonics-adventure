"""
產生 L42 平滑混音示範音（s a t 連讀，類似均一 L7 影片）。
對照：data/smoothBlendWords.ts

執行：py -3 scripts/generate_smooth_word_blends.py
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "blend-smooth"
VOICE = "en-US-AnaNeural"

# 與 data/smoothBlendWords.ts 同步
WORDS: dict[str, dict[str, str]] = {
    "sat": {"spaced": "s a t", "rate": "-32%"},
    "pin": {"spaced": "p i n", "rate": "-32%"},
    "bed": {"spaced": "b e d", "rate": "-32%"},
    "dog": {"spaced": "d o g", "rate": "-32%"},
    "sun": {"spaced": "s u n", "rate": "-32%"},
    "mat": {"spaced": "m a t", "rate": "-32%"},
    "pig": {"spaced": "p i g", "rate": "-32%"},
    "cup": {"spaced": "c u p", "rate": "-32%"},
}


async def generate_one(word: str, spaced: str, rate: str) -> None:
    out = OUT_DIR / f"{word}.mp3"
    communicate = edge_tts.Communicate(spaced, VOICE, rate=rate)
    await communicate.save(str(out))
    print(f"  {word}.mp3  <-  {spaced!r} ({rate})")


async def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"輸出：{OUT_DIR}")
    for word, meta in WORDS.items():
        await generate_one(word, meta["spaced"], meta["rate"])
    (OUT_DIR / "manifest.json").write_text(
        json.dumps(WORDS, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print("完成！")


if __name__ == "__main__":
    asyncio.run(main())
