"""
下載 Wikimedia Commons IPA 音檔（CC BY-SA）至 public/audio/ipa/
執行：py -3 scripts/download_ipa_audio.py

五堂 SCR 無法涵蓋的 Hop 課專用獨立音標檔。
"""
from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "ipa"
MANIFEST_PATH = ROOT / "data" / "ipaPhonemeManifest.json"
ATTRIBUTION_PATH = OUT_DIR / "ATTRIBUTION.md"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

# API 限流時的已知直連備援
COMMONS_FALLBACK_URL: dict[str, str] = {
    "Palatal approximant.ogg": "https://upload.wikimedia.org/wikipedia/commons/e/e8/Palatal_approximant.ogg",
    "Voiced palato-alveolar sibilant.ogg": "https://upload.wikimedia.org/wikipedia/commons/3/30/Voiced_palato-alveolar_sibilant.ogg",
    "En-us-er.ogg": "https://upload.wikimedia.org/wikipedia/commons/e/e1/En-us-er.ogg",
    "Mid-central vowel.ogg": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Mid-central_vowel.ogg",
    "Open-mid back rounded vowel.ogg": "https://upload.wikimedia.org/wikipedia/commons/0/02/Open-mid_back_rounded_vowel.ogg",
}

# hopKey, Commons 檔名, 本地同名檔, IPA, 作者（供署名）
IPA_ENTRIES: list[dict[str, str]] = [
    {
        "hopKey": "hop_s_si_z",
        "commonsTitle": "Voiced palato-alveolar sibilant.ogg",
        "localFile": "voiced_palato-alveolar_sibilant.ogg",
        "ipa": "ʒ",
        "author": "Peter Isotalo",
        "license": "CC BY-SA 4.0",
        "note": "乾淨 /ʒ/ 摩擦音（treasure）",
    },
    {
        "hopKey": "hop_ir_er_ur_or",
        "commonsTitle": "En-us-er.ogg",
        "localFile": "en-us-er.ogg",
        "ipa": "ɚ",
        "author": "Dvortygirl",
        "license": "CC BY-SA 3.0",
        "note": "美式兒化音（bird、runner）",
    },
    {
        "hopKey": "hop_schwa",
        "commonsTitle": "Mid-central vowel.ogg",
        "localFile": "mid-central_vowel.ogg",
        "ipa": "ə",
        "author": "Denelson83",
        "license": "GFDL / CC BY-SA",
        "note": "弱讀中央母音（about）",
    },
    {
        "hopKey": "hop_a_o_oa_ough",
        "commonsTitle": "Open-mid back rounded vowel.ogg",
        "localFile": "open-mid_back_rounded_vowel.ogg",
        "ipa": "ɔ",
        "author": "Denelson83",
        "license": "GFDL / CC BY-SA",
        "note": "後中圓唇母音（dog、all 近似）",
    },
    {
        "hopKey": "hop_y_i_u",
        "commonsTitle": "Palatal approximant.ogg",
        "localFile": "palatal_approximant.ogg",
        "ipa": "j",
        "author": "Denelson83",
        "license": "GFDL / CC BY-SA",
        "note": "半母音滑音（you）",
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
    raise RuntimeError(f"Cannot resolve Commons URL for {title}")


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "PhonicsAdventure/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        dest.write_bytes(resp.read())


def write_attribution(manifest: list[dict]) -> None:
    lines = [
        "# IPA 音檔署名（Wikimedia Commons）",
        "",
        "以下音檔用於 SCR 無涵蓋的五堂 Hop 課，依各檔授權條款使用（多為 CC BY-SA）。",
        "播放時請保留本署名檔。",
        "",
    ]
    for entry in manifest:
        lines.extend(
            [
                f"## `{entry['localFile']}`",
                f"- Hop 課：`{entry['hopKey']}`",
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

    for entry in IPA_ENTRIES:
        dest = OUT_DIR / entry["localFile"]
        try:
            url = commons_download_url(entry["commonsTitle"])
        except Exception as exc:
            print(f"  FAIL resolve {entry['commonsTitle']}: {exc}")
            fail += 1
            continue

        record = {**entry, "sourceUrl": url}

        if dest.exists() and dest.stat().st_size > 500:
            skip += 1
            manifest_out.append(record)
            print(f"  skip {entry['localFile']}")
            continue

        try:
            download(url, dest)
            print(f"  {entry['localFile']} <- {entry['commonsTitle']}")
            manifest_out.append(record)
            ok += 1
        except Exception as exc:
            print(f"  FAIL {entry['localFile']}: {exc}")
            fail += 1

    MANIFEST_PATH.write_text(
        json.dumps(manifest_out, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    if manifest_out:
        write_attribution(manifest_out)
    print(f"Done: {ok} downloaded, {skip} skipped, {fail} failed")


if __name__ == "__main__":
    main()
