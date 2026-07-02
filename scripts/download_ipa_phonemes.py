"""
下載 IPA 音素音檔（Wikimedia Commons）至 public/audio/ipa/
來源對照：data/ipaAudioManifest.json

執行：py -3 scripts/download_ipa_phonemes.py
"""
from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = ROOT / "data" / "ipaAudioManifest.json"
OUT_DIR = ROOT / "public" / "audio" / "ipa"
USER_AGENT = "phonics-adventure/1.0 (educational; local dev)"
COMMONS_BASE = "https://commons.wikimedia.org/wiki/Special:FilePath/"


def download_commons(filename: str, dest: Path) -> None:
    url = COMMONS_BASE + filename
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)


def main() -> None:
    manifest: dict[str, dict] = json.loads(
        MANIFEST_PATH.read_text(encoding="utf-8")
    )
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ok, skip, fail = 0, 0, 0

    for key, meta in manifest.items():
        dest = OUT_DIR / f"{key}.ogg"
        if dest.exists() and dest.stat().st_size > 500:
            skip += 1
            continue

        filename = meta["commons"]
        try:
            download_commons(filename, dest)
            print(f"  {key}.ogg <- {filename} ({meta['ipa']})")
            ok += 1
            time.sleep(1.2)
        except Exception as exc:
            print(f"  FAIL {key} ({filename}): {exc}")
            fail += 1
            time.sleep(2.0)

    copied = OUT_DIR / "manifest.json"
    copied.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Done: {ok} downloaded, {skip} skipped, {fail} failed")


if __name__ == "__main__":
    main()
