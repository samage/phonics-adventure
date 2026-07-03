import type { PhonicsType } from '@/types/phonics';

export type HopPatternCategory =
  | 'voiced_consonant'
  | 'voiceless_consonant'
  | 'vowel';

export interface HopEnglishPattern {
  key: string;
  /** 畫面顯示，如 "d / dd" */
  display: string;
  spellings: string[];
  audioId: string;
  phonicsType: PhonicsType;
  soundRule: string;
  category: HopPatternCategory;
  exampleWords: string[];
  hint: string;
  /** 進階說明（選填），顯示於課程介紹區 */
  ruleDetail?: string;
  /** 例字旁註解，如 life → 清晰 L */
  exampleNotes?: Record<string, string>;
}

function pat(
  key: string,
  display: string,
  audioId: string,
  phonicsType: PhonicsType,
  soundRule: string,
  category: HopPatternCategory,
  exampleWords: string[],
  hint: string,
  ruleDetail?: string,
  exampleNotes?: Record<string, string>,
): HopEnglishPattern {
  const spellings = display.split('/').map((s) => s.trim());
  return { key, display, spellings, audioId, phonicsType, soundRule, category, exampleWords, hint, ruleDetail, exampleNotes };
}

/**
 * HOPE English 希平方「自然發音入門班」40 組發音規則
 * @see https://www.hopenglish.com/hope-tips-basic-phonics
 */
export const HOP_ENGLISH_PATTERNS: HopEnglishPattern[] = [
  // ── 有聲子音 ──
  pat('hop_b_bb', 'b / bb', '17', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['banana', 'bubble'], 'b / bb 發 /b/'),
  pat('hop_d_dd', 'd / dd', '18', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['duck', 'add'], 'd / dd 發 /d/'),
  pat('hop_g_gg', 'g / gg', '19', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['glass', 'bigger'], 'g / gg 發 /g/'),
  pat('hop_j_g_dge_ge', 'j / g / dge / ge', '20', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['jelly', 'gym', 'bridge', 'page'], 'j、g、dge、ge 可發 /dʒ/'),
  pat(
    'hop_l_ll',
    'l / ll',
    '211',
    'consonant',
    'Voiced Consonant',
    'voiced_consonant',
    ['life', 'bell'],
    'l / ll 的發音會因位置而改變',
    '清晰 L（Clear L）— 字首或母音前，如 life：舌尖頂住上齒齦再彈開，像注音「ㄌ」。\n\n含糊 L（Dark L）— 字尾或子音前，如 bell：不像「ㄌ」，接近「喔」結尾；舌尖不用彈開，舌後部抬高，順著母音發出悶悶尾音（bell 像「杯喔」）。',
    { life: '清晰 L', bell: '含糊 L' },
  ),
  pat('hop_m_mm_mb', 'm / mm / mb', '22', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['money', 'summer', 'comb'], 'm / mm / mb 發 /m/'),
  pat('hop_n_nn_kn', 'n / nn / kn', '23', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['night', 'dinner', 'knot'], 'n / nn / kn 發 /n/'),
  pat('hop_r_rr_wr', 'r / rr / wr', '24', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['rain', 'carrot', 'write'], 'r / rr / wr 發 /r/'),
  pat('hop_v_ve', 'v / ve', '25', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['vase', 'five'], 'v / ve 發 /v/'),
  pat(
    'hop_w_wh_u',
    'w / wh / u',
    '26',
    'consonant',
    'Voiced Consonant',
    'voiced_consonant',
    ['watch', 'what', 'queen'],
    'w / wh 發 /w/；qu- 裡的 u 也發 /w/',
    'w、wh 發 /w/（雙唇嘟起，像注音「ㄨ」）。\n\n表格裡的 u 在此是「半母音」：在 qu- 組合中，u 不當母音，而是發跟 w 一樣的音。例如 queen 唸 /kwiːn/（ㄎㄨ＋ㄧ），q 幾乎永遠和 u 連在一起。\n\nu 單獨當母音時（如 umbrella）則是母音，不屬於這條規則。',
    { watch: 'w', what: 'wh', queen: 'qu 裡的 u' },
  ),
  pat('hop_z_zz_s_se', 'z / zz / s / se', '27', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['zip', 'buzz', 'his', 'please'], 'z / zz / s / se 可發 /z/'),
  pat('hop_s_si_z', 's / si / z', '28', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['treasure', 'television', 'seizure'], 's / si / z 可發 /ʒ/'),
  pat('hop_th_voiced', 'th', '29', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['then', 'father'], 'th 可發濁音 /ð/'),
  pat('hop_ng_n_ngue', 'ng / n / ngue', '30', 'consonant', 'Voiced Consonant', 'voiced_consonant', ['ring', 'pink', 'tongue'], 'ng / n / ngue 發 /ŋ/'),
  pat(
    'hop_y_i_u',
    'y / i / u',
    '311',
    'consonant',
    'Voiced Consonant',
    'voiced_consonant',
    ['you', 'onion', 'cute'],
    'y / i / u 當半母音，發快速滑過的「ㄧ」',
    '這組談的是「半母音」— 字母當母音寫，功能卻像子音，快速滑向後面的主要母音。\n\nY（字首）— 發「ㄧ」再滑向後面母音：you = ㄧ＋ㄨ，yes = ㄧ＋ㄝ。\n\nI（字中，後面接母音）— 退化成配角「ㄧ」：onion 的 o-n-i-o-n，後面的 o 是主角，i 發快速「ㄧ」，nion 像「ㄋㄧㄤ」。\n\nU（u-e 長母音）— 自帶「ㄧ＋ㄨ」：cute 的 ute 唸「ㄧㄨㄊ」，整字像「ㄎ-特」。',
    { you: 'y 字首', onion: 'i 字中', cute: 'u-e' },
  ),

  // ── 無聲子音 ──
  pat('hop_f_ff_ph_gh', 'f / ff / ph / gh', '32', 'consonant', 'Voiceless Consonant', 'voiceless_consonant', ['fish', 'cliff', 'photo', 'enough'], 'f / ff / ph / gh 可發 /f/'),
  pat('hop_h_wh', 'h / wh', '33', 'consonant', 'Voiceless Consonant', 'voiceless_consonant', ['hello', 'who'], 'h / wh 發 /h/'),
  pat('hop_c_k_ck_q_ch', 'c / k / ck / q / ch', '34', 'consonant', 'Voiceless Consonant', 'voiceless_consonant', ['cat', 'kitchen', 'duck', 'queen', 'chris'], 'c / k / ck / q / ch 可發 /k/'),
  pat('hop_p_pp', 'p / pp', '35', 'consonant', 'Voiceless Consonant', 'voiceless_consonant', ['pig', 'puppet'], 'p / pp 發 /p/'),
  pat('hop_s_ss_ce_se_c_sc', 's / ss / ce / se / c / sc', '36', 'consonant', 'Voiceless Consonant', 'voiceless_consonant', ['sun', 'kiss', 'since', 'mouse', 'center', 'scene'], 's / ss / ce / se / c / sc 可發 /s/'),
  pat('hop_t_tt', 't / tt', '37', 'consonant', 'Voiceless Consonant', 'voiceless_consonant', ['toe', 'little'], 't / tt 發 /t/'),
  pat('hop_ch_tch_ture', 'ch / tch / tu(re)', '38', 'digraph', 'Voiceless Consonant', 'voiceless_consonant', ['chip', 'watch', 'future'], 'ch / tch / ture 可發 /tʃ/'),
  pat('hop_sh_ch_ti', 'sh / ch / ti', '39', 'digraph', 'Voiceless Consonant', 'voiceless_consonant', ['shoe', 'machine', 'station'], 'sh / ch / ti 可發 /ʃ/'),
  pat('hop_th_voiceless', 'th', '40', 'consonant', 'Voiceless Consonant', 'voiceless_consonant', ['math'], 'th 可發清音 /θ/'),

  // ── 母音 ──
  pat('hop_a', 'a', '13', 'short_vowel', 'Short Vowel', 'vowel', ['apple'], 'a 短母音，像 apple'),
  pat('hop_e_ea', 'e / ea', '21', 'short_vowel', 'Short Vowel', 'vowel', ['egg', 'bread'], 'e / ea 短母音，像 egg'),
  pat('hop_i_y', 'i / y', '31', 'short_vowel', 'Short Vowel', 'vowel', ['hit', 'gym'], 'i / y 短母音，像 hit'),
  pat('hop_o_a', 'o / a', '41', 'short_vowel', 'Short Vowel', 'vowel', ['pot', 'wash'], 'o / a 短母音，像 pot'),
  pat('hop_u_o_oo', 'u / o / oo', '51', 'short_vowel', 'Short Vowel', 'vowel', ['umbrella', 'come', 'blood'], 'u / o / oo 短母音 /ʌ/'),
  pat('hop_a_o_oa_ough', 'a / o / oa / ough', '61', 'short_vowel', 'Short Vowel', 'vowel', ['all', 'dog', 'broad', 'fought'], 'a / o / oa / ough 發 /ɒ/'),
  pat('hop_oo_u_ou', 'oo / u / ou', '71', 'short_vowel', 'Short Vowel', 'vowel', ['look', 'bush', 'would'], 'oo / u / ou 短母音 /ʊ/'),
  pat('hop_ir_er_ur_or', 'ir / er / ur / or', '81', 'r_controlled', 'R-Controlled', 'vowel', ['bird', 'term', 'burn', 'word'], 'ir / er / ur / or 發 /ɚ/'),
  pat('hop_schwa', 'a / e / i / o / u', '91', 'short_vowel', 'Schwa', 'vowel', ['about', 'celebrate', 'president', 'kingdom', 'campus'], '未重讀母音發 /ə/'),
  pat('hop_ee_ea_ie_e_ey', 'ee / ea / ie / e / ey', '101', 'long_vowel', 'Long Vowel', 'vowel', ['tree', 'tea', 'grief', 'me', 'key'], 'ee / ea / ie / e / ey 長母音 /iː/'),
  pat('hop_oo_ou_ew_ue', 'oo / ou / ew / u-e', '111', 'long_vowel', 'Long Vowel', 'vowel', ['cool', 'soup', 'stew', 'tune'], 'oo / ou / ew / u-e 長母音 /uː/'),
  pat('hop_ai_ay_ae', 'ai / ay / a-e', '121', 'long_vowel', 'Vowel Team', 'vowel', ['rain', 'tray', 'gate'], 'ai / ay / a-e 發 /eɪ/'),
  pat('hop_oa_ow_o_oe', 'oa / ow / o / o-e', '131', 'long_vowel', 'Vowel Team', 'vowel', ['boat', 'low', 'no', 'bone'], 'oa / ow / o / o-e 發 /oʊ/'),
  pat('hop_igh_ie_y_i_ie', 'igh / i-e / y / i / ie', '14', 'long_vowel', 'Vowel Team', 'vowel', ['light', 'like', 'sky', 'island', 'pie'], 'igh / i-e / y / i / ie 發 /aɪ/'),
  pat('hop_ou_ow', 'ou / ow', '15', 'diphthong', 'Vowel Team', 'vowel', ['house', 'cow'], 'ou / ow 發 /aʊ/'),
  pat('hop_oi_oy', 'oi / oy', '16', 'diphthong', 'Vowel Team', 'vowel', ['coin', 'boy'], 'oi / oy 發 /ɔɪ/'),

  // 進階課：th 清／濁合併（SCR 有 th_voiceless + th_voiced）
  pat(
    'hop_th_combined',
    'th',
    '40',
    'consonant',
    'Voiceless Consonant',
    'voiceless_consonant',
    ['thin', 'math', 'then', 'father'],
    'th 有清音與濁音兩種',
    'th 有兩種音：清音 thin、math；濁音 then、father。同一組字母，要聽整字判斷。',
    { thin: '清音', then: '濁音' },
  ),
];

export const HOP_PATTERN_MAP: Record<string, HopEnglishPattern> = Object.fromEntries(
  HOP_ENGLISH_PATTERNS.map((p) => [p.key, p]),
);

export function getHopPattern(key: string): HopEnglishPattern | null {
  return HOP_PATTERN_MAP[key.toLowerCase()] ?? null;
}

/** 挑選適合拼字練習的例字（較短、較常見） */
export function practiceWordsForPattern(key: string, max = 3): string[] {
  const pattern = getHopPattern(key);
  if (!pattern) return [];
  return pattern.exampleWords
    .filter((w) => w.length <= 7)
    .slice(0, max);
}
