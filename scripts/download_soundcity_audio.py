"""
下載 Sound City Reading 音檔至 public/audio/soundcity/
執行：py -3 scripts/download_soundcity_audio.py
"""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "soundcity"
MANIFEST_PATH = ROOT / "data" / "soundcityPhonemeManifest.json"
SCR_BASE = "https://www.soundcityreading.net/uploads/3/7/6/1/37611941"

# localFile (without .mp3) -> SCR remote filename
EXPLICIT_FILES: dict[str, str] = {
    "b": "alphasounds-b.mp3",
    "c": "alphasounds-c.mp3",
    "d": "alphasounds-d.mp3",
    "f": "alphasounds-f.mp3",
    "g": "alphasounds-g.mp3",
    "h": "alphasounds-h.mp3",
    "j": "alphasounds-j.mp3",
    "k": "alphasounds-k.mp3",
    "l": "alphasounds-l.mp3",
    "m": "alphasounds-m.mp3",
    "n": "alphasounds-n.mp3",
    "p": "alphasounds-p-2.mp3",
    "qu": "alphasounds-q.mp3",
    "r": "alphasounds-r.mp3",
    "s": "alphasounds-s.mp3",
    "t": "alphasounds-t.mp3",
    "v": "alphasounds-v.mp3",
    "w": "alphasounds-w.mp3",
    "x": "alphasounds-x.mp3",
    "y": "alphasounds-y.mp3",
    "z": "alphasounds-z.mp3",
    "a_short": "alphasounds-a.mp3",
    "a_long": "btalpha-7-a-long.mp3",
    "e_short": "alphasounds-e.mp3",
    "e_long": "btalpha-2-e-long.mp3",
    "i_short": "alphasounds-i.mp3",
    "i_long": "btalpha-i-long.mp3",
    "o_short": "alphasounds-o-sh.mp3",
    "o_long": "btalpha-3-o-long.mp3",
    "u_short": "alphasounds-u-sh.mp3",
    "u_long": "btalpha-10-u-long.mp3",
    "sh": "btalpha-1-sh.mp3",
    "th_voiceless": "btalpha-4-th-soft.mp3",
    "th_voiced": "btalpha-5-th-hard.mp3",
    "ch": "btalpha-8-ch.mp3",
    "ng": "btalpha-9-ng.mp3",
    "oi": "btalpha-11-oy.mp3",
    "oy": "btalpha-11-oy.mp3",
    "ou": "btalpha-12-ow.mp3",
    "ow": "btalpha-12-ow.mp3",
}


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    data = urllib.request.urlopen(req, timeout=30).read()
    dest.write_bytes(data)


def manifest_meta(local_name: str) -> dict:
    if "_" in local_name and local_name.split("_", 1)[1] in (
        "short", "long", "voiceless", "voiced",
    ):
        key, variant = local_name.split("_", 1)
    else:
        key, variant = local_name, "default"
    return {"key": key, "variant": variant, "localFile": f"{local_name}.mp3"}


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest_out: list[dict] = []
    ok, skip, fail = 0, 0, 0

    for local_name, remote in EXPLICIT_FILES.items():
        dest = OUT_DIR / f"{local_name}.mp3"
        url = f"{SCR_BASE}/{remote}"

        if dest.exists() and dest.stat().st_size > 500:
            skip += 1
            manifest_out.append({**manifest_meta(local_name), "sourceUrl": url})
            continue

        try:
            download(url, dest)
            print(f"  {local_name}.mp3 <- {remote}")
            manifest_out.append({**manifest_meta(local_name), "sourceUrl": url})
            ok += 1
        except Exception as exc:
            print(f"  FAIL {local_name}: {exc}")
            fail += 1

    MANIFEST_PATH.write_text(
        json.dumps(manifest_out, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Done: {ok} downloaded, {skip} skipped, {fail} failed")


if __name__ == "__main__":
    main()
