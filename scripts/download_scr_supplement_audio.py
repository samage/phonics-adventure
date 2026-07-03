"""
下載 Wikimedia Commons IPA 音檔，補足 SCR 缺少或音不對應的字素檔。
輸出至 public/audio/soundcity/（與 SCR .mp3 同目錄，副檔名 .ogg）。
執行：py -3 scripts/download_scr_supplement_audio.py

依 source.md B/C 節：同一維基音檔可複製為多個字素同名檔。
"""
from __future__ import annotations

import json
import shutil
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "soundcity"
MANIFEST_PATH = ROOT / "data" / "scrSupplementPhonemeManifest.json"
ATTRIBUTION_PATH = OUT_DIR / "SUPPLEMENT_ATTRIBUTION.md"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

COMMONS_FALLBACK_URL: dict[str, str] = {
    "Near-close near-back rounded vowel.ogg": "https://upload.wikimedia.org/wikipedia/commons/9/91/Near-close_near-back_rounded_vowel.ogg",
    "Close-mid back rounded vowel.ogg": "https://upload.wikimedia.org/wikipedia/commons/1/1d/Close-mid_back_rounded_vowel.ogg",
    "Close back rounded vowel.ogg": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Close_back_rounded_vowel.ogg",
    "Close front unrounded vowel.ogg": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Close_front_unrounded_vowel.ogg",
    "En-us-a.ogg": "https://upload.wikimedia.org/wikipedia/commons/5/52/En-us-a.ogg",
    "En-us-i.ogg": "https://upload.wikimedia.org/wikipedia/commons/e/e9/En-us-i.ogg",
    "Voiceless palato-alveolar sibilant.ogg": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Voiceless_palato-alveolar_sibilant.ogg",
    "Voiceless palato-alveolar affricate.ogg": "https://upload.wikimedia.org/wikipedia/commons/9/97/Voiceless_palato-alveolar_affricate.ogg",
    "Voiced palato-alveolar affricate.ogg": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Voiced_palato-alveolar_affricate.ogg",
    "Velar nasal.ogg": "https://upload.wikimedia.org/wikipedia/commons/a/af/Velar_nasal.ogg",
    "Voiceless dental fricative.ogg": "https://upload.wikimedia.org/wikipedia/commons/8/80/Voiceless_dental_fricative.ogg",
    "Voiced dental fricative.ogg": "https://upload.wikimedia.org/wikipedia/commons/6/6a/Voiced_dental_fricative.ogg",
    "Voiceless velar plosive.ogg": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Voiceless_velar_plosive.ogg",
}

# commonsTitle, localFiles（不含副檔名）, IPA, 作者, 授權, 說明
SCR_SUPPLEMENT_GROUPS: list[dict] = [
    {
        "commonsTitle": "Near-close near-back rounded vowel.ogg",
        "localFiles": ["oo_short"],
        "ipa": "ʊ",
        "author": "Denelson83",
        "license": "GFDL / CC BY-SA",
        "note": "短 oo（look），取代錯用短 u /ʌ/",
    },
    {
        "commonsTitle": "Close-mid back rounded vowel.ogg",
        "localFiles": ["ow_long", "oa", "o-e"],
        "ipa": "oʊ",
        "author": "Denelson83",
        "license": "GFDL / CC BY-SA",
        "note": "長 ow / boat（與 /aʊ/ house 分開）",
    },
    {
        "commonsTitle": "Close back rounded vowel.ogg",
        "localFiles": ["ou_long", "oo", "ew", "ue", "u-e"],
        "ipa": "uː",
        "author": "Denelson83",
        "license": "GFDL / CC BY-SA",
        "note": "長 oo / soup（與 /aʊ/ house 分開）",
    },
    {
        "commonsTitle": "Close front unrounded vowel.ogg",
        "localFiles": ["ee", "ea", "ie", "ey"],
        "ipa": "iː",
        "author": "Denelson83",
        "license": "GFDL / CC BY-SA",
        "note": "長母音 ee / ea / ie / ey",
    },
    {
        "commonsTitle": "En-us-a.ogg",
        "localFiles": ["ai", "ay", "a-e"],
        "ipa": "eɪ",
        "author": "Dvortygirl",
        "license": "CC BY-SA 3.0",
        "note": "ai / ay / magic-e a",
    },
    {
        "commonsTitle": "En-us-i.ogg",
        "localFiles": ["igh", "i-e", "y_vowel"],
        "ipa": "aɪ",
        "author": "Dvortygirl",
        "license": "CC BY-SA 3.0",
        "note": "igh / i-e / 母音 y（sky）；檔名 y_vowel 避免覆蓋字母 y",
    },
    {
        "commonsTitle": "Voiceless palato-alveolar sibilant.ogg",
        "localFiles": ["sh", "ti", "ci"],
        "ipa": "ʃ",
        "author": "Peter Isotalo",
        "license": "CC BY-SA 4.0",
        "note": "sh / ti / ci",
    },
    {
        "commonsTitle": "Voiceless palato-alveolar affricate.ogg",
        "localFiles": ["ch", "tch"],
        "ipa": "tʃ",
        "author": "Peter Isotalo",
        "license": "CC BY-SA 4.0",
        "note": "ch / tch",
    },
    {
        "commonsTitle": "Voiced palato-alveolar affricate.ogg",
        "localFiles": ["ge", "dge"],
        "ipa": "dʒ",
        "author": "Peter Isotalo",
        "license": "CC BY-SA 4.0",
        "note": "ge / dge",
    },
    {
        "commonsTitle": "Velar nasal.ogg",
        "localFiles": ["ng", "ngue"],
        "ipa": "ŋ",
        "author": "Peter Isotalo",
        "license": "CC BY-SA 4.0",
        "note": "ng / ngue",
    },
    {
        "commonsTitle": "Voiceless dental fricative.ogg",
        "localFiles": ["th_voiceless"],
        "ipa": "θ",
        "author": "Peter Isotalo",
        "license": "CC BY-SA 4.0",
        "note": "清 th（think）",
    },
    {
        "commonsTitle": "Voiced dental fricative.ogg",
        "localFiles": ["th_voiced"],
        "ipa": "ð",
        "author": "Peter Isotalo",
        "license": "CC BY-SA 4.0",
        "note": "濁 th（this）",
    },
    {
        "commonsTitle": "Voiceless velar plosive.ogg",
        "localFiles": ["q"],
        "ipa": "k",
        "author": "Peter Isotalo",
        "license": "CC BY-SA 4.0",
        "note": "單獨 q 發 /k/",
    },
]


def commons_download_url(title: str) -> str:
    try:
        params = urllib.parse.urlencode(
            {
                "action": "query",
                "titles": f"File:{title}",
                "prop": "imageinfo",
                "iiprop": "url",
                "format": "json",
            }
        )
        req = urllib.request.Request(
            f"{COMMONS_API}?{params}",
            headers={"User-Agent": "PhonicsAdventure/1.0 (educational; local dev)"},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        time.sleep(0.3)
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            info = page.get("imageinfo")
            if info and info[0].get("url"):
                return info[0]["url"]
    except Exception:
        pass
    fallback = COMMONS_FALLBACK_URL.get(title)
    if fallback:
        return fallback
    safe = title.replace(" ", "_")
    return f"https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/{urllib.parse.quote(safe)}"


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "PhonicsAdventure/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        dest.write_bytes(resp.read())
    time.sleep(0.8)


def manifest_meta(local_name: str) -> dict[str, str]:
    if "_" in local_name and local_name.split("_", 1)[1] in (
        "short",
        "long",
        "voiceless",
        "voiced",
        "vowel",
    ):
        key, variant = local_name.split("_", 1)
    elif local_name.endswith("-e"):
        key, variant = local_name.split("-", 1)[0], "magic_e"
    else:
        key, variant = local_name, "default"
    return {"key": key, "variant": variant, "localFile": f"{local_name}.ogg"}


def write_attribution(manifest: list[dict]) -> None:
    lines = [
        "# SCR 補充音檔署名（Wikimedia Commons）",
        "",
        "補足 Sound City Reading 缺少或音不對應的字素，依各檔授權條款使用（多為 CC BY-SA）。",
        "播放時請保留本署名檔。",
        "",
    ]
    for entry in manifest:
        lines.extend(
            [
                f"## `{entry['localFile']}`",
                f"- IPA：/{entry['ipa']}/",
                f"- 來源：[{entry['commonsTitle']}]({entry['sourceUrl']})",
                f"- 作者：{entry['author']}",
                f"- 授權：{entry['license']}",
                f"- 說明：{entry['note']}",
                "",
            ]
        )
    ATTRIBUTION_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest_out: list[dict] = []
    ok, skip, fail = 0, 0, 0
    cache_dir = OUT_DIR / "_cache"
    cache_dir.mkdir(parents=True, exist_ok=True)

    for group in SCR_SUPPLEMENT_GROUPS:
        title = group["commonsTitle"]
        cache_path = cache_dir / title.replace(" ", "_")

        try:
            url = commons_download_url(title)
        except Exception as exc:
            print(f"  FAIL resolve {title!r}: {exc}")
            fail += len(group["localFiles"])
            continue

        if not cache_path.exists() or cache_path.stat().st_size < 500:
            try:
                download(url, cache_path)
                print(f"  cached {title}")
            except Exception as exc:
                print(f"  FAIL download {title!r}: {exc}")
                fail += len(group["localFiles"])
                continue

        for local_name in group["localFiles"]:
            dest = OUT_DIR / f"{local_name}.ogg"
            record = {
                **manifest_meta(local_name),
                "commonsTitle": title,
                "ipa": group["ipa"],
                "author": group["author"],
                "license": group["license"],
                "note": group["note"],
                "sourceUrl": url,
            }

            if dest.exists() and dest.stat().st_size > 500:
                skip += 1
                manifest_out.append(record)
                print(f"  skip {local_name}.ogg")
                continue

            try:
                shutil.copy2(cache_path, dest)
                print(f"  {local_name}.ogg <- {title}")
                manifest_out.append(record)
                ok += 1
            except Exception as exc:
                print(f"  FAIL copy {local_name}.ogg: {exc}")
                fail += 1

    MANIFEST_PATH.write_text(
        json.dumps(manifest_out, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    if manifest_out:
        write_attribution(manifest_out)
    print(f"Done: {ok} copied, {skip} skipped, {fail} failed")


if __name__ == "__main__":
    main()
