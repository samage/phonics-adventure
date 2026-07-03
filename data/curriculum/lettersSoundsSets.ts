/** 單元一、二：基礎字母（SCR 音檔），每課已含 WordPhonicsLab，不再另開混音課 */

export interface BasicLetterSet {
  id: string;
  grapheme: string;
  display: string;
  practiceWords: string[];
}

/** 入門：s a t p i n m d（Letters and Sounds Set 1–2） */
export const START_LETTERS: BasicLetterSet[] = [
  { id: 's', grapheme: 's', display: 's', practiceWords: ['sat', 'sit', 'sap'] },
  { id: 'a', grapheme: 'a', display: 'a', practiceWords: ['sat', 'mat', 'tap'] },
  { id: 't', grapheme: 't', display: 't', practiceWords: ['sat', 'tap', 'sit'] },
  { id: 'p', grapheme: 'p', display: 'p', practiceWords: ['pat', 'tap', 'sap'] },
  { id: 'i', grapheme: 'i', display: 'i', practiceWords: ['pin', 'pit', 'sip'] },
  { id: 'n', grapheme: 'n', display: 'n', practiceWords: ['pin', 'nap', 'nip'] },
  { id: 'm', grapheme: 'm', display: 'm', practiceWords: ['mat', 'map', 'man'] },
  { id: 'd', grapheme: 'd', display: 'd', practiceWords: ['dad', 'mad', 'pad'] },
];

/** 讀字基礎：補齊常見 CVC 用字母 */
export const CVC_LETTERS: BasicLetterSet[] = [
  { id: 'g', grapheme: 'g', display: 'g', practiceWords: ['gap', 'got', 'dig'] },
  { id: 'o', grapheme: 'o', display: 'o', practiceWords: ['dog', 'pot', 'mop'] },
  { id: 'c', grapheme: 'c', display: 'c', practiceWords: ['cat', 'cup', 'cap'] },
  { id: 'k', grapheme: 'k', display: 'k', practiceWords: ['kit', 'kid', 'kin'] },
  { id: 'e', grapheme: 'e', display: 'e', practiceWords: ['bed', 'pen', 'net'] },
  { id: 'u', grapheme: 'u', display: 'u', practiceWords: ['sun', 'cup', 'mud'] },
  { id: 'r', grapheme: 'r', display: 'r', practiceWords: ['rat', 'run', 'rip'] },
  { id: 'h', grapheme: 'h', display: 'h', practiceWords: ['hat', 'hot', 'hit'] },
  { id: 'b', grapheme: 'b', display: 'b', practiceWords: ['bed', 'bat', 'bus'] },
  { id: 'f', grapheme: 'f', display: 'f', practiceWords: ['fan', 'fit', 'fun'] },
  { id: 'l', grapheme: 'l', display: 'l', practiceWords: ['lip', 'lot', 'lap'] },
];

export const UNIT2_SENTENCES = ['A red hat.', 'The dog ran.', 'Fun in the sun.'];

export const UNIT4_SENTENCES = ['Fish in a ship.', 'Make a cake.', 'I like my bike.'];

/** 進階發音：雙字母、長母音、母音組（每個音只教一次，用 Hop 規則課呈現多種拼法） */
export const ADVANCED_HOP_KEYS = [
  'hop_sh_ch_ti',
  'hop_ch_tch_ture',
  'hop_th_combined',
  'hop_ng_n_ngue',
  'hop_ee_ea_ie_e_ey',
  'hop_ai_ay_ae',
  'hop_igh_ie_y_i_ie',
  'hop_oa_ow_o_oe',
  'hop_oo_ou_ew_ue',
  'hop_ou_ow',
  'hop_oi_oy',
] as const;

/** 替代拼法：Hop 40 組中，未在入門／進階出現的規則 */
export const ALT_SPELLING_HOP_KEYS = [
  'hop_b_bb',
  'hop_d_dd',
  'hop_g_gg',
  'hop_j_g_dge_ge',
  'hop_l_ll',
  'hop_m_mm_mb',
  'hop_n_nn_kn',
  'hop_r_rr_wr',
  'hop_v_ve',
  'hop_w_wh_u',
  'hop_z_zz_s_se',
  'hop_s_si_z',
  'hop_f_ff_ph_gh',
  'hop_h_wh',
  'hop_c_k_ck_q_ch',
  'hop_p_pp',
  'hop_s_ss_ce_se_c_sc',
  'hop_t_tt',
  'hop_y_i_u',
  'hop_e_ea',
  'hop_i_y',
  'hop_o_a',
  'hop_u_o_oo',
  'hop_a_o_oa_ough',
  'hop_oo_u_ou',
  'hop_ir_er_ur_or',
  'hop_schwa',
] as const;
