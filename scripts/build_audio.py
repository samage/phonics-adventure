"""
音檔建置管線：把「原始素材」處理成 app 實際播放的檔案。

  原始素材  audio-src/scr/*.mp3      Sound City Reading 真人女聲錄音（scripts/download_soundcity_audio.py 下載）
            Kokoro 女聲 TTS         只用來補 SCR 沒有的「母音」，以及整個單字／句子
  輸出      public/audio/phonemes/<id>.mp3   孤立音素
            public/audio/speech/<slug>.mp3   整字、整句（混音後的完整唸法）
            data/audioManifest.json          app 用來知道有哪些檔（有檔才播，沒檔才退回裝置 TTS）

處理步驟（所有 clip 一視同仁）：
  1. SCR 錄音裡有前後各約 1 秒的靜音／房間雜音／雜訊點擊 → 找出「主要聲音事件」，只留聲音本身前後各約 30 ms。
  2. 爆破音（b d g j k p t c）：SCR 錄的是「buh」，把後面的母音尾巴（schwa）切掉，只留爆破＋極短過渡。
     切點依「寬頻能量跳升（爆破）」與「高頻能量比」偵測，不靠人工。
  3. 不拉長任何音（摩擦音 s、sh、f… 維持原錄音時長）。
  4. 響度正規化：用 K-weighting（ITU-R BS.1770）、50 ms 區塊 + 閘控量測，全部調到同一個目標 LUFS；
     峰值用軟限幅壓在 -1 dBFS 以下。
  5. 編成 24 kHz 單聲道 mp3。

用法：
  python3 -m venv .venv && . .venv/bin/activate
  pip install -r scripts/requirements-audio.txt     # 另需 ffmpeg 在 PATH
  npm run export:speech-texts                       # 產生 data/speechTexts.json（課程裡會念的字與句）
  python3 scripts/build_audio.py                    # 全部重建
  python3 scripts/build_audio.py --only phonemes    # 只重建孤立音素
  python3 scripts/build_audio.py --only speech      # 只重建整字／整句

Kokoro 模型（Apache-2.0）會自動下載到 .cache/kokoro/（不進版控）。
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import scipy.signal as ss

ROOT = Path(__file__).resolve().parent.parent
SCR_DIR = ROOT / "audio-src" / "scr"
OUT_PHONEMES = ROOT / "public" / "audio" / "phonemes"
OUT_SPEECH = ROOT / "public" / "audio" / "speech"
OUT_SPEECH_SLOW = ROOT / "public" / "audio" / "speech_slow"
CLIPS_JSON = ROOT / "data" / "phonemeClips.json"
TEXTS_JSON = ROOT / "data" / "speechTexts.json"
MANIFEST_JSON = ROOT / "data" / "audioManifest.json"
KOKORO_DIR = ROOT / ".cache" / "kokoro"
KOKORO_BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"

SR = 24000
#: 選聲音的依據：所有 af_* 女聲中，F0 中位數與 SCR 錄音（約 179 Hz）最接近者（見 README）
VOICE = "af_nova"
SPEED_VOWEL = 0.8
SPEED_WORD = 0.8  # 一般整字：孩子聽得清楚的速度
SPEED_SENTENCE = 0.8
SPEED_WORD_SLOW = 0.6  # 🐢 慢速版（重新合成，不是把檔案拉慢）
SPEED_SENTENCE_SLOW = 0.6

TARGET_LUFS = -20.0
PEAK_CEIL_DB = -1.0
PAD_S = 0.030  # 一般聲音前後各留 30 ms（整字／整句）
# 孤立音素（慢速版）：前面留較長的自然起音、尾巴自然淡出，不要切得太趕
STOP_LEAD_S = 0.100  # 爆破音前的靜音／起音空間
CONT_LEAD_S = 0.060  # 母音、持續音前
TAIL_PAD_S = 0.060  # 尾端靜音
TAIL_FADE_S = 0.060  # 母音／持續音自然淡出
TAIL_EXTRA_S = 0.060  # 主體結束後，原錄音若還有自然衰減，再多留這麼多
LOUDNESS_BLOCK_S = 0.050

# 爆破音切尾參數（秒）
STOP_PRE_VOICED = 0.04  # 濁爆破音：爆破前保留的 prevoicing（讓人聽得出是濁音）
# 濁爆破音：爆破後再多留就是母音（schwa），所以只能到這裡；清爆破音沒有母音，整段釋放／送氣都保留
STOP_KEEP = {"voiced_stop": 0.060, "voiceless_stop": 0.300}
STOP_FADE_S = 0.040
AFFRICATE_EXTRA = 0.020  # j：摩擦段結束後再留的時間

# 整字／整句：特例（G2P 唸不準或會唸成字母名時，直接給 IPA）
WORD_IPA = {"a": "ɐ", "i": "ˈaɪ"}


# ---------------------------------------------------------------- 基礎工具
def decode(path: Path) -> np.ndarray:
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(out, dtype="<f4").astype(np.float64)


def env_db(x: np.ndarray, hop: float = 0.005, win: float = 0.015):
    h, w = int(hop * SR), int(win * SR)
    n = max(0, (len(x) - w) // h)
    return np.array([10 * np.log10(np.mean(x[i * h : i * h + w] ** 2) + 1e-12) for i in range(n)]), h


def main_event(x: np.ndarray, rel_db: float = 30.0, bridge_s: float = 0.06) -> tuple[int, int]:
    """從最響的地方往左右長，直到低於峰值 -rel_db（可跨過 bridge_s 的小空隙）。回傳 (start, end) 樣本位置。"""
    db, h = env_db(x)
    pk = int(np.argmax(db))
    thr = db[pk] - rel_db
    gap_max = int(bridge_s / 0.005)

    def walk(step: int) -> int:
        best, gap, i = pk, 0, pk
        while 0 < i + step < len(db):
            i += step
            if db[i] > thr:
                best, gap = i, 0
            else:
                gap += 1
                if gap > gap_max:
                    break
        return best

    return walk(-1) * h, min(len(x), (walk(1) + 3) * h)


def band_env(x: np.ndarray, lo: float, hi: float | None, hop: float = 0.005, win: float = 0.010) -> np.ndarray:
    if hi is None:
        sos = ss.butter(4, lo, "hp", fs=SR, output="sos")
    else:
        sos = ss.butter(4, [lo, hi], "bp", fs=SR, output="sos")
    y = ss.sosfilt(sos, x)
    h, w = int(hop * SR), int(win * SR)
    n = max(0, (len(x) - w) // h)
    return np.array([np.mean(y[i * h : i * h + w] ** 2) + 1e-14 for i in range(n)])


def find_burst(seg: np.ndarray) -> int:
    """爆破點：1 kHz 以上寬頻能量跳升最大的那一格（樣本位置）。"""
    e = 10 * np.log10(band_env(seg, 1000, None))
    jump = np.diff(e)
    return int((int(np.argmax(jump)) + 1) * 0.005 * SR)


def fade(x: np.ndarray, fin_s: float, fout_s: float) -> np.ndarray:
    y = x.copy()
    fi, fo = min(len(y), int(fin_s * SR)), min(len(y), int(fout_s * SR))
    if fi > 0:
        y[:fi] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, fi))
    if fo > 0:
        y[-fo:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, fo))
    return y


def trim_scr(x: np.ndarray, kind: str | None) -> np.ndarray:
    a, b = main_event(x)
    pad_tail = np.zeros(int(TAIL_PAD_S * SR))
    if kind in ("voiced_stop", "voiceless_stop", "voiced_affricate"):
        seg = x[a:b]
        burst = find_burst(seg)
        if kind == "voiced_affricate":
            # 摩擦段（高頻能量占比高）結束處
            hp = band_env(seg, 3000, None)
            tot = band_env(seg, 80, None)
            ratio = hp / tot
            i = int(burst / (0.005 * SR))
            while i < len(ratio) and ratio[i] > 0.3:
                i += 1
            end = int(i * 0.005 * SR + AFFRICATE_EXTRA * SR)
            start = max(0, burst - int(0.02 * SR))
        else:
            end = burst + int(STOP_KEEP[kind] * SR)
            pre = STOP_PRE_VOICED if kind == "voiced_stop" else 0.0
            start = max(0, burst - int((pre + 0.005) * SR))
        seg = seg[start : min(len(seg), end)]
        return np.concatenate([np.zeros(int(STOP_LEAD_S * SR)), fade(seg, 0.003, STOP_FADE_S), pad_tail])
    # 母音／持續音：保留原錄音主體結束後的自然衰減，再慢慢淡出
    b2 = min(len(x), b + int(TAIL_EXTRA_S * SR))
    seg = x[a:b2]
    return np.concatenate([np.zeros(int(CONT_LEAD_S * SR)), fade(seg, 0.010, TAIL_FADE_S), pad_tail])


def trim_silence(
    x: np.ndarray, thresh_db: float = -38.0, pad_s: float = PAD_S, fade_out_s: float = 0.030, tail_pad_s: float | None = None
) -> np.ndarray:
    """Kokoro 輸出：切掉首尾靜音，只留聲音前後 pad_s。"""
    db, h = env_db(x, hop=0.005, win=0.010)
    above = np.where(db > db.max() + thresh_db)[0] if len(db) else []
    if len(above) == 0:
        return x
    a = max(0, above[0] * h - int(pad_s * SR))
    b = min(len(x), (above[-1] + 2) * h + int((pad_s if tail_pad_s is None else tail_pad_s) * SR))
    return fade(x[a:b], 0.005, fade_out_s)


def loudness(x: np.ndarray) -> float:
    meter = pyln.Meter(SR, block_size=LOUDNESS_BLOCK_S)
    y = x if len(x) >= int(LOUDNESS_BLOCK_S * SR) * 2 else np.concatenate([x, np.zeros(int(LOUDNESS_BLOCK_S * SR) * 2)])
    try:
        return float(meter.integrated_loudness(y))
    except ValueError:
        return float("-inf")


def normalise(x: np.ndarray) -> np.ndarray:
    lu = loudness(x)
    if not np.isfinite(lu):
        return x
    y = x * 10 ** ((TARGET_LUFS - lu) / 20)
    # 軟限幅：-6 dBFS 以上用 tanh 壓進去，再整體縮到 PEAK_CEIL_DB
    t = 0.5
    ax = np.abs(y)
    over = ax > t
    y[over] = np.sign(y[over]) * (t + (1 - t) * np.tanh((ax[over] - t) / (1 - t)))
    peak = np.max(np.abs(y)) + 1e-12
    ceil = 10 ** (PEAK_CEIL_DB / 20)
    if peak > ceil:
        y *= ceil / peak
    return y


def write_mp3(x: np.ndarray, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-codec:a", "libmp3lame", "-b:a", "56k", "-ar", str(SR), str(path)],
        input=pcm,
        check=True,
    )


# ---------------------------------------------------------------- Kokoro
_kokoro = None


def kokoro():
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro

        KOKORO_DIR.mkdir(parents=True, exist_ok=True)
        for name in ("kokoro-v1.0.onnx", "voices-v1.0.bin"):
            dest = KOKORO_DIR / name
            if not dest.exists():
                print(f"  下載 {name} …")
                urllib.request.urlretrieve(f"{KOKORO_BASE}/{name}", dest)
        _kokoro = Kokoro(str(KOKORO_DIR / "kokoro-v1.0.onnx"), str(KOKORO_DIR / "voices-v1.0.bin"))
    return _kokoro


def resample(x: np.ndarray, sr: int) -> np.ndarray:
    if sr == SR:
        return x.astype(np.float64)
    return ss.resample_poly(x, SR, sr).astype(np.float64)


def tts_ipa(ipa: str, speed: float) -> np.ndarray:
    s, sr = kokoro().create(ipa, voice=VOICE, speed=speed, lang="en-us", is_phonemes=True)
    return resample(np.asarray(s), sr)


def tts_text(text: str, speed: float) -> np.ndarray:
    s, sr = kokoro().create(text, voice=VOICE, speed=speed, lang="en-us")
    return resample(np.asarray(s), sr)


# ---------------------------------------------------------------- 建置
def build_phonemes() -> list[str]:
    clips = json.loads(CLIPS_JSON.read_text(encoding="utf-8"))
    ids: list[str] = []
    for c in clips:
        if c["source"] == "scr":
            x = trim_scr(decode(SCR_DIR / c["file"]), c.get("kind"))
        else:
            x = trim_silence(tts_ipa(c["tts"], SPEED_VOWEL), pad_s=CONT_LEAD_S, fade_out_s=TAIL_FADE_S, tail_pad_s=TAIL_PAD_S)
        write_mp3(normalise(x), OUT_PHONEMES / f"{c['id']}.mp3")
        ids.append(c["id"])
        print(f"  phoneme {c['id']:<14} {c['source']:<6} {len(x) / SR:.2f}s")
    return ids


def slug(text: str) -> str:
    return text.replace(" ", "_").replace("'", "-")


def render_speech(text: str, is_word: bool, slow: bool = False) -> np.ndarray:
    w_speed = SPEED_WORD_SLOW if slow else SPEED_WORD
    s_speed = SPEED_SENTENCE_SLOW if slow else SPEED_SENTENCE
    if is_word and text in WORD_IPA:
        return tts_ipa(WORD_IPA[text], w_speed)
    spoken = " ".join("I" if w == "i" else w for w in text.split())
    if not is_word:
        spoken = spoken[0].upper() + spoken[1:] + "."
    return tts_text(spoken, w_speed if is_word else s_speed)


def build_speech() -> tuple[list[str], list[str]]:
    texts = json.loads(TEXTS_JSON.read_text(encoding="utf-8"))
    words, sentences = [], []
    for kind, items, out in (("word", texts["words"], words), ("sentence", texts["sentences"], sentences)):
        for t in items:
            for slow, out_dir in ((False, OUT_SPEECH), (True, OUT_SPEECH_SLOW)):
                x = trim_silence(render_speech(t, kind == "word", slow), pad_s=0.05)
                write_mp3(normalise(x), out_dir / f"{slug(t)}.mp3")
            out.append(t)
        print(f"  {kind}: {len(items)} 個")
    return words, sentences


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", choices=["phonemes", "speech"])
    args = ap.parse_args()

    manifest = json.loads(MANIFEST_JSON.read_text(encoding="utf-8")) if MANIFEST_JSON.exists() else {}
    manifest["voice"] = VOICE
    if args.only in (None, "phonemes"):
        print("孤立音素 …")
        manifest["phonemes"] = build_phonemes()
    if args.only in (None, "speech"):
        print("整字／整句 …")
        manifest["words"], manifest["sentences"] = build_speech()
    MANIFEST_JSON.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("完成")


if __name__ == "__main__":
    sys.exit(main())
