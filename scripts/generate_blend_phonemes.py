"""
產生混音拼讀音檔（拉長子音 / 母音，塞音短促）。
對照：data/blendPhonemeManifest.json

執行：py -3 scripts/generate_blend_phonemes.py
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = ROOT / "data" / "blendPhonemeManifest.json"
OUT_DIR = ROOT / "public" / "audio" / "blend-phonemes"
VOICE = "en-US-AnaNeural"


async def generate_one(key: str, spoken: str, rate: str) -> None:
    out = OUT_DIR / f"{key}.mp3"
    communicate = edge_tts.Communicate(spoken, VOICE, rate=rate)
    await communicate.save(str(out))
    print(f"  {key}.mp3  <-  {spoken!r} ({rate})")


async def main() -> None:
    manifest: dict[str, dict] = json.loads(
        MANIFEST_PATH.read_text(encoding="utf-8")
    )
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"輸出：{OUT_DIR}")
    for key, meta in manifest.items():
        await generate_one(key, meta["spoken"], meta["rate"])
    print("完成！")


if __name__ == "__main__":
    asyncio.run(main())
