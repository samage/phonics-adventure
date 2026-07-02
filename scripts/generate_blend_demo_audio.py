"""
產生 L42 混音示範音（onset 拉長 → rime → 整字連讀）。
對照：data/blendDemoManifest.json

執行：py -3 scripts/generate_blend_demo_audio.py
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "blend-demo"
MANIFEST_PATH = ROOT / "data" / "blendDemoManifest.json"
VOICE = "en-US-AnaNeural"


async def save(text: str, rate: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text, VOICE, rate=rate).save(str(dest))


async def main() -> None:
    manifest: dict[str, dict] = json.loads(
        MANIFEST_PATH.read_text(encoding="utf-8")
    )
    print(f"輸出：{OUT_DIR}")

    for word, parts in manifest.items():
        for part_name in ("onset", "rime", "blend"):
            clip = parts[part_name]
            mode = clip.get("mode", "file")
            if mode in ("wordClip", "hopClip"):
                src = clip.get("hopKey") or clip.get("word", word)
                print(f"  {word}-{part_name}.mp3 <- ({mode} {src!r})")
                continue
            spoken = clip["spoken"]
            rate = clip["rate"]
            await save(spoken, rate, OUT_DIR / f"{word}-{part_name}.mp3")
            extra = ""
            if part_name == "onset" and clip.get("clipMs"):
                extra = f" (runtime clip {clip['clipMs']}ms)"
            print(f"  {word}-{part_name}.mp3 <- {spoken!r}{extra}")

    (OUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print("完成！")


if __name__ == "__main__":
    asyncio.run(main())
