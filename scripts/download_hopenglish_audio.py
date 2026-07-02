"""
下載 HOPE English 希平方自然發音音檔至 public/audio/hopenglish/
來源：https://www.hopenglish.com/hope-tips-basic-phonics

執行：python scripts/download_hopenglish_audio.py
"""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "audio" / "hopenglish"
S3_BASE = "https://s3-ap-northeast-1.amazonaws.com/hopenglish/wp/wp-content/uploads/2018/09"

# pattern key -> audio id（與 data/hopEnglishPatterns.ts 同步）
PATTERN_AUDIO: dict[str, str] = {
    "hop_b_bb": "17", "hop_d_dd": "18", "hop_g_gg": "19", "hop_j_g_dge_ge": "20",
    "hop_l_ll": "211", "hop_m_mm_mb": "22", "hop_n_nn_kn": "23", "hop_r_rr_wr": "24",
    "hop_v_ve": "25", "hop_w_wh_u": "26", "hop_z_zz_s_se": "27", "hop_s_si_z": "28",
    "hop_th_voiced": "29", "hop_ng_n_ngue": "30", "hop_y_i_u": "311",
    "hop_f_ff_ph_gh": "32", "hop_h_wh": "33", "hop_c_k_ck_q_ch": "34", "hop_p_pp": "35",
    "hop_s_ss_ce_se_c_sc": "36", "hop_t_tt": "37", "hop_ch_tch_ture": "38",
    "hop_sh_ch_ti": "39", "hop_th_voiceless": "40",
    "hop_a": "13", "hop_e_ea": "21", "hop_i_y": "31", "hop_o_a": "41",
    "hop_u_o_oo": "51", "hop_a_o_oa_ough": "61", "hop_oo_u_ou": "71",
    "hop_ir_er_ur_or": "81", "hop_schwa": "91", "hop_ee_ea_ie_e_ey": "101",
    "hop_oo_ou_ew_ue": "111", "hop_ai_ay_ae": "121", "hop_oa_ow_o_oe": "131",
    "hop_igh_ie_y_i_ie": "14", "hop_ou_ow": "15", "hop_oi_oy": "16",
}

# 孤立音素（L42 混音）請用 npm run generate:phonics-audio → public/audio/phonemes/
ALL_KEYS = PATTERN_AUDIO


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    data = urllib.request.urlopen(req, timeout=30).read()
    dest.write_bytes(data)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cache: dict[str, Path] = {}
    ok, skip = 0, 0

    for key, audio_id in ALL_KEYS.items():
        dest = OUT_DIR / f"{key}.mp3"
        if dest.exists() and dest.stat().st_size > 1000:
            skip += 1
            continue

        if audio_id in cache:
            dest.write_bytes(cache[audio_id].read_bytes())
            print(f"  {key}.mp3 <- copy {audio_id}")
            ok += 1
            continue

        url = f"{S3_BASE}/{audio_id}.mp3"
        try:
            download(url, dest)
            cache[audio_id] = dest
            print(f"  {key}.mp3 <- {audio_id}")
            ok += 1
        except Exception as exc:
            print(f"  FAIL {key} ({audio_id}): {exc}")

    manifest = {k: f"{S3_BASE}/{v}.mp3" for k, v in ALL_KEYS.items()}
    (OUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Done: {ok} downloaded, {skip} skipped")


if __name__ == "__main__":
    main()
