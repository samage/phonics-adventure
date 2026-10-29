/**
 * 「看字母說音」的字素項目（recall items）。
 *
 * 每個項目 = 一個「看到就要立刻說出聲音」的字母／字母組合：
 * - display：畫面上顯示的字形（可能不只一個項目共用，如 th 清音／濁音）。
 * - soundId：同一個聲音的項目共用同一個 soundId（ai／ay 都是 long_a）。
 *   出選擇題時，選項之間的 soundId 一定互不相同，所以正確答案唯一。
 * - audio：預錄音檔 key（SCR / Wikimedia），blend 以「blend:xx」逐字母連念。
 * - patternKey：對應課程裡的哪一課（graphemes 內含此 key 的課）。
 * - words：規則、好唸的例字（不含其他容易混淆的拼法），用於「選例字」題與提示。
 */

export type RecallCategory = 'letters' | 'combos' | 'blends';

/** 分班測驗用的難度層級（由易到難） */
export type RecallTier =
  | 'core'
  | 'letters'
  | 'digraphs'
  | 'long_vowels'
  | 'teams'
  | 'blends';

export const RECALL_TIERS: RecallTier[] = [
  'core',
  'letters',
  'digraphs',
  'long_vowels',
  'teams',
  'blends',
];

export const TIER_LABEL: Record<RecallTier, string> = {
  core: '基本字母音',
  letters: '其他字母音',
  digraphs: '雙字母（sh、ch、th…）',
  long_vowels: '長母音（a-e、ai、ee…）',
  teams: '母音組合（oo、oi、er…）',
  blends: '子音連音（st、bl、tr…）',
};

export interface RecallItem {
  id: string;
  display: string;
  /** 額外標示（區分同字形不同音，如 th 清音／濁音） */
  tag?: string;
  category: RecallCategory;
  tier: RecallTier;
  soundId: string;
  audio: string;
  ipa: string;
  hint: string;
  words: string[];
  patternKey?: string;
}

type Opts = {
  tag?: string;
  patternKey?: string;
};

function item(
  id: string,
  display: string,
  category: RecallCategory,
  tier: RecallTier,
  soundId: string,
  audio: string,
  ipa: string,
  hint: string,
  words: string[],
  opts: Opts = {},
): RecallItem {
  return { id, display, category, tier, soundId, audio, ipa, hint, words, ...opts };
}

const L = 'letters' as const;
const C = 'combos' as const;
const B = 'blends' as const;

export const RECALL_ITEMS: RecallItem[] = [
  // ── 基本字母音（入門 s a t p i n m d）──
  item('s', 's', L, 'core', 's', 's', '/s/', '像蛇的嘶嘶聲', ['sun', 'sit'], { patternKey: 's' }),
  item('a', 'a', L, 'core', 'a_short', 'a_short', '/æ/', '短母音 a，嘴巴張大像 apple', ['cat', 'map'], { patternKey: 'a' }),
  item('t', 't', L, 'core', 't', 't', '/t/', '舌尖輕彈，不出聲的 t', ['top', 'tin'], { patternKey: 't' }),
  item('p', 'p', L, 'core', 'p', 'p', '/p/', '雙唇吐氣，不出聲的 p', ['pig', 'pen'], { patternKey: 'p' }),
  item('i', 'i', L, 'core', 'i_short', 'i_short', '/ɪ/', '短母音 i，像 sit', ['pig', 'sit'], { patternKey: 'i' }),
  item('n', 'n', L, 'core', 'n', 'n', '/n/', '舌尖頂上顎，鼻子出聲', ['net', 'nap'], { patternKey: 'n' }),
  item('m', 'm', L, 'core', 'm', 'm', '/m/', '雙唇閉起來，嗯～', ['map', 'mud'], { patternKey: 'm' }),
  item('d', 'd', L, 'core', 'd', 'd', '/d/', '舌尖彈開，有聲的 d', ['dog', 'dig'], { patternKey: 'd' }),

  // ── 其他字母音 ──
  item('g', 'g', L, 'letters', 'g', 'g', '/g/', '喉嚨後面彈出來的 g', ['gap', 'dig'], { patternKey: 'g' }),
  item('o', 'o', L, 'letters', 'o_short', 'o_short', '/ɒ/', '短母音 o，嘴巴圓圓張開', ['pot', 'mop'], { patternKey: 'o' }),
  item('c', 'c', L, 'letters', 'k', 'c', '/k/', 'c 在 a、o、u 前面唸 /k/', ['cat', 'cup'], { patternKey: 'c' }),
  item('k', 'k', L, 'letters', 'k', 'k', '/k/', 'k 唸 /k/，和 c 同一個音', ['kit', 'kid'], { patternKey: 'k' }),
  item('e', 'e', L, 'letters', 'e_short', 'e_short', '/ɛ/', '短母音 e，像 bed', ['bed', 'pen'], { patternKey: 'e' }),
  item('u', 'u', L, 'letters', 'u_short', 'u_short', '/ʌ/', '短母音 u，像 sun', ['sun', 'mud'], { patternKey: 'u' }),
  item('r', 'r', L, 'letters', 'r', 'r', '/r/', '舌頭捲起來不碰到上顎', ['red', 'run'], { patternKey: 'r' }),
  item('h', 'h', L, 'letters', 'h', 'h', '/h/', '像哈氣，只有氣沒有聲音', ['hat', 'hen'], { patternKey: 'h' }),
  item('b', 'b', L, 'letters', 'b', 'b', '/b/', '雙唇彈開，有聲的 b', ['bed', 'bus'], { patternKey: 'b' }),
  item('f', 'f', L, 'letters', 'f', 'f', '/f/', '上排牙齒輕咬下唇吹氣', ['fan', 'fin'], { patternKey: 'f' }),
  item('l', 'l', L, 'letters', 'l', 'l', '/l/', '舌尖頂上齒後面', ['leg', 'lip'], { patternKey: 'l' }),
  item('j', 'j', L, 'letters', 'dj', 'j', '/dʒ/', 'j 像 jam 的開頭', ['jam', 'jet'], { patternKey: 'hop_j_g_dge_ge' }),
  item('v', 'v', L, 'letters', 'v', 'v', '/v/', '咬下唇，喉嚨會震動', ['van', 'vet'], { patternKey: 'hop_v_ve' }),
  item('w', 'w', L, 'letters', 'w', 'w', '/w/', '嘴巴嘟起來', ['web', 'win'], { patternKey: 'hop_w_wh_u' }),
  item('y', 'y', L, 'letters', 'y', 'y', '/j/', 'y 在字首像「ㄧ」', ['yes', 'yum'], { patternKey: 'hop_y_i_u' }),
  item('z', 'z', L, 'letters', 'z', 'z', '/z/', '像蜜蜂嗡嗡聲', ['zip', 'zap'], { patternKey: 'hop_z_zz_s_se' }),
  item('x', 'x', L, 'letters', 'ks', 'x', '/ks/', 'x 是兩個音連在一起：k + s', ['box', 'fox']),

  // ── 雙字母 ──
  item('sh', 'sh', C, 'digraphs', 'sh', 'sh', '/ʃ/', '嘴巴嘟起來，「噓～」', ['ship', 'shop'], { patternKey: 'hop_sh_ch_ti' }),
  item('ch', 'ch', C, 'digraphs', 'ch', 'ch', '/tʃ/', '像火車「七七」', ['chip', 'chop'], { patternKey: 'hop_ch_tch_ture' }),
  item('ck', 'ck', C, 'digraphs', 'k', 'ck', '/k/', 'ck 唸 /k/，常在短母音後面', ['duck', 'sock'], { patternKey: 'hop_ck' }),
  item('th_voiceless', 'th', C, 'digraphs', 'th_voiceless', 'th_voiceless', '/θ/', '舌尖放在牙齒中間，只吹氣', ['thin', 'math'], { tag: '清音（不震動喉嚨）', patternKey: 'hop_th_combined' }),
  item('th_voiced', 'th', C, 'digraphs', 'th_voiced', 'th_voiced', '/ð/', '舌尖放在牙齒中間，喉嚨震動', ['then', 'that'], { tag: '濁音（喉嚨震動）', patternKey: 'hop_th_combined' }),
  item('ng', 'ng', C, 'digraphs', 'ng', 'ng', '/ŋ/', '鼻音，舌根頂住，像 ring', ['ring', 'king'], { patternKey: 'hop_ng_n_ngue' }),
  item('qu', 'qu', C, 'digraphs', 'kw', 'qu', '/kw/', 'q 一定跟 u：唸 /kw/', ['quit', 'quiz'], { patternKey: 'hop_w_wh_u' }),

  // ── 長母音／Magic E ──
  item('a-e', 'a-e', C, 'long_vowels', 'long_a', 'a_long', '/eɪ/', 'Magic e 讓 a 唸出字母名「誒」', ['cake', 'name'], { patternKey: 'hop_ai_ay_ae' }),
  item('ai', 'ai', C, 'long_vowels', 'long_a', 'a_long', '/eɪ/', 'ai 唸「誒」，常在字中間', ['rain', 'tail'], { patternKey: 'hop_ai_ay_ae' }),
  item('ay', 'ay', C, 'long_vowels', 'long_a', 'a_long', '/eɪ/', 'ay 唸「誒」，常在字尾', ['day', 'say'], { patternKey: 'hop_ai_ay_ae' }),
  item('i-e', 'i-e', C, 'long_vowels', 'long_i', 'i-e', '/aɪ/', 'Magic e 讓 i 唸「愛」', ['like', 'bike'], { patternKey: 'hop_igh_ie_y_i_ie' }),
  item('igh', 'igh', C, 'long_vowels', 'long_i', 'igh', '/aɪ/', 'igh 唸「愛」，gh 不發音', ['light', 'night'], { patternKey: 'hop_igh_ie_y_i_ie' }),
  item('o-e', 'o-e', C, 'long_vowels', 'long_o', 'o-e', '/oʊ/', 'Magic e 讓 o 唸「歐」', ['bone', 'home'], { patternKey: 'hop_oa_ow_o_oe' }),
  item('oa', 'oa', C, 'long_vowels', 'long_o', 'oa', '/oʊ/', 'oa 唸「歐」', ['boat', 'coat'], { patternKey: 'hop_oa_ow_o_oe' }),
  item('ee', 'ee', C, 'long_vowels', 'long_e', 'ee', '/iː/', 'ee 唸長長的「ㄧ」', ['tree', 'bee'], { patternKey: 'hop_ee_ea_ie_e_ey' }),
  item('u-e', 'u-e', C, 'long_vowels', 'long_u', 'u_long', '/juː/', 'Magic e 讓 u 唸「優」', ['cute', 'tube'], { patternKey: 'hop_oo_ou_ew_ue' }),

  // ── 母音組合 ──
  item('oo_long', 'oo', C, 'teams', 'long_oo', 'oo', '/uː/', '長長的「烏」，像 moon', ['moon', 'food'], { tag: '長音', patternKey: 'hop_oo_ou_ew_ue' }),
  item('ew', 'ew', C, 'teams', 'long_oo', 'oo', '/uː/', 'ew 唸長長的「烏」', ['new', 'few'], { patternKey: 'hop_oo_ou_ew_ue' }),
  item('oo_short', 'oo', C, 'teams', 'oo_short', 'oo_short', '/ʊ/', '短短的「ㄨ」，像 book', ['book', 'look'], { tag: '短音', patternKey: 'hop_oo_u_ou' }),
  item('ou', 'ou', C, 'teams', 'ow', 'ou', '/aʊ/', 'ou 唸「奧」', ['house', 'mouse'], { patternKey: 'hop_ou_ow' }),
  item('ow', 'ow', C, 'teams', 'ow', 'ow', '/aʊ/', 'ow 唸「奧」（像 cow）', ['cow', 'now'], { patternKey: 'hop_ou_ow' }),
  item('oi', 'oi', C, 'teams', 'oi', 'oi', '/ɔɪ/', 'oi 唸「喔ㄧ」', ['coin', 'oil'], { patternKey: 'hop_oi_oy' }),
  item('oy', 'oy', C, 'teams', 'oi', 'oy', '/ɔɪ/', 'oy 唸「喔ㄧ」，常在字尾', ['boy', 'toy'], { patternKey: 'hop_oi_oy' }),
  item('er', 'er', C, 'teams', 'er', 'ipa:hop_ir_er_ur_or', '/ɚ/', 'er 的捲舌音', ['her', 'fern'], { patternKey: 'hop_ir_er_ur_or' }),
  item('ir', 'ir', C, 'teams', 'er', 'ipa:hop_ir_er_ur_or', '/ɚ/', 'ir 和 er 同一個捲舌音', ['bird', 'girl'], { patternKey: 'hop_ir_er_ur_or' }),
  item('ur', 'ur', C, 'teams', 'er', 'ipa:hop_ir_er_ur_or', '/ɚ/', 'ur 和 er 同一個捲舌音', ['burn', 'turn'], { patternKey: 'hop_ir_er_ur_or' }),

  // ── 子音連音（兩個音連在一起，各自都聽得出來）──
  item('st', 'st', B, 'blends', 'st', 'blend:st', '/st/', 's + t 連起來', ['stop', 'step'], { patternKey: 'st' }),
  item('sp', 'sp', B, 'blends', 'sp', 'blend:sp', '/sp/', 's + p 連起來', ['spin', 'spot'], { patternKey: 'sp' }),
  item('sn', 'sn', B, 'blends', 'sn', 'blend:sn', '/sn/', 's + n 連起來', ['snap', 'snip'], { patternKey: 'sn' }),
  item('sk', 'sk', B, 'blends', 'sk', 'blend:sk', '/sk/', 's + k 連起來', ['skip', 'skin'], { patternKey: 'sk' }),
  item('sm', 'sm', B, 'blends', 'sm', 'blend:sm', '/sm/', 's + m 連起來', ['smell', 'smog'], { patternKey: 'sm' }),
  item('sl', 'sl', B, 'blends', 'sl', 'blend:sl', '/sl/', 's + l 連起來', ['slip', 'slap'], { patternKey: 'sl' }),
  item('sw', 'sw', B, 'blends', 'sw', 'blend:sw', '/sw/', 's + w 連起來', ['swim', 'swan'], { patternKey: 'sw' }),
  item('bl', 'bl', B, 'blends', 'bl', 'blend:bl', '/bl/', 'b + l 連起來', ['black', 'blot'], { patternKey: 'bl' }),
  item('cl', 'cl', B, 'blends', 'cl', 'blend:cl', '/kl/', 'c(k) + l 連起來', ['clap', 'club'], { patternKey: 'cl' }),
  item('fl', 'fl', B, 'blends', 'fl', 'blend:fl', '/fl/', 'f + l 連起來', ['flag', 'flip'], { patternKey: 'fl' }),
  item('gl', 'gl', B, 'blends', 'gl', 'blend:gl', '/gl/', 'g + l 連起來', ['glad', 'glum'], { patternKey: 'gl' }),
  item('pl', 'pl', B, 'blends', 'pl', 'blend:pl', '/pl/', 'p + l 連起來', ['plan', 'plum'], { patternKey: 'pl' }),
  item('br', 'br', B, 'blends', 'br', 'blend:br', '/br/', 'b + r 連起來', ['brim', 'brag'], { patternKey: 'br' }),
  item('cr', 'cr', B, 'blends', 'cr', 'blend:cr', '/kr/', 'c(k) + r 連起來', ['crab', 'crop'], { patternKey: 'cr' }),
  item('dr', 'dr', B, 'blends', 'dr', 'blend:dr', '/dr/', 'd + r 連起來', ['drum', 'drip'], { patternKey: 'dr' }),
  item('fr', 'fr', B, 'blends', 'fr', 'blend:fr', '/fr/', 'f + r 連起來', ['frog', 'fresh'], { patternKey: 'fr' }),
  item('gr', 'gr', B, 'blends', 'gr', 'blend:gr', '/gr/', 'g + r 連起來', ['grab', 'grin'], { patternKey: 'gr' }),
  item('pr', 'pr', B, 'blends', 'pr', 'blend:pr', '/pr/', 'p + r 連起來', ['prop', 'pram'], { patternKey: 'pr' }),
  item('tr', 'tr', B, 'blends', 'tr', 'blend:tr', '/tr/', 't + r 連起來', ['trip', 'trap'], { patternKey: 'tr' }),
  item('str', 'str', B, 'blends', 'str', 'blend:str', '/str/', 's + t + r 三個音連起來', ['strap', 'strip'], { patternKey: 'str' }),
  item('spr', 'spr', B, 'blends', 'spr', 'blend:spr', '/spr/', 's + p + r 三個音連起來', ['sprig', 'sprint'], { patternKey: 'spr' }),
];

export const RECALL_ITEM_MAP: Record<string, RecallItem> = Object.fromEntries(
  RECALL_ITEMS.map((i) => [i.id, i]),
);

export function getRecallItem(id: string): RecallItem | null {
  return RECALL_ITEM_MAP[id] ?? null;
}

/**
 * 容易混淆的組別。出選擇題時，干擾選項優先從「和答案同組」的項目挑，
 * 這樣孩子要真的分辨 a／e、b／d、sh／ch，而不是靠排除法。
 */
export const CONFUSION_GROUPS: string[][] = [
  ['a', 'e', 'i', 'o', 'u'],
  ['b', 'd', 'p'],
  ['m', 'n'],
  ['f', 'v'],
  ['t', 'd', 'th_voiceless'],
  ['c', 'g', 'k'],
  ['s', 'z', 'sh', 'th_voiceless'],
  ['sh', 'ch'],
  ['th_voiceless', 'th_voiced', 's', 'f'],
  ['l', 'r', 'w', 'y'],
  ['j', 'ch', 'g'],
  ['i', 'ee', 'igh', 'i-e'],
  ['a', 'ai', 'a-e', 'e'],
  ['e', 'ee', 'er'],
  ['o', 'oa', 'o-e', 'oo_short', 'ou'],
  ['u', 'oo_long', 'oo_short', 'u-e', 'ew'],
  ['oi', 'ou', 'oa'],
  ['er', 'o', 'u'],
  ['oo_long', 'oo_short', 'ou'],
  ['qu', 'k', 'w'],
  ['x', 's', 'z'],
  ['bl', 'br', 'pl', 'pr'],
  ['cl', 'cr', 'gl', 'gr'],
  ['fl', 'fr', 'sl', 'sw'],
  ['st', 'sp', 'sk', 'sn', 'sm', 'sl', 'sw'],
  ['tr', 'dr', 'br', 'cr', 'gr', 'pr', 'fr'],
  ['str', 'spr', 'st', 'sp', 'tr'],
];
