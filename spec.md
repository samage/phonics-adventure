# Phonics Adventure 自然發音學習 App — 規格書

## 一、專案說明

Oxford 風格互動（Sound buttons → Sound-talk → Blend），**四個單元、每個音只教一次**，不重複 Hop 與字母課。

**音檔：** Sound City Reading 音素 + Web Speech 整字備援。

## 二、課程架構 v6.0.0

| Tab | Unit ID | 課次 | 內容 |
| --- | --- | --- | --- |
| 入門拼讀 | `start` | L01–L08 | s a t p i n m d |
| 讀字基礎 | `cvc` | L09–L21 | 其餘 CVC 字母 + 讀短句 + 特殊字（the/said/was） |
| 進階發音 | `advanced` | L22–L32 | sh、ch、th、ng、長母音、母音組（Hop 規則課，各一次） |
| 替代拼法 | `alt_spellings` | L33–L59 | bb、ph、kn、schwa…（Hop 其餘規則）+ 讀短句 + 特殊字 |

**共 59 堂**，線性編號 L01–L59。

### 刻意移除的重複

- 不再有「混音單元」— 每堂字母／規則課內含 WordPhonicsLab
- 不再有 Phase3 教 sh 又 Phase5 教 hop_sh
- 不再有 Phase4 Magic E 又 Hop 長母音重複一輪
- 特殊字分兩次（基礎 3 個 + 進階 7 個），讀短句每階段各 1 堂

## 三、發音系統

| 情境 | 音源 |
| --- | --- |
| 單音素 | `/audio/soundcity/`（字母、長短母音、sh/ch/th/ng/oi/ou） |
| 五堂核心 Hop（SCR 無檔） | `/audio/ipa/`（Wikimedia Commons IPA，CC BY-SA） |
| Hop 其餘規則課 | SCR 近似音素 → 無檔時 TTS 念音素 |

```powershell
npm run download:audio
# 或分開：
npm run download:soundcity-audio
npm run download:ipa-audio
```

## 四、進度

- Storage：`phonics-adventure-progress-v6`
- 自動從 v5、v4 遷移課次 ID

## 五、路由

| 路由 | 說明 |
| --- | --- |
| `/` | 4 tab 課程路徑 |
| `/learn/L01/play` | 入門第一堂 |
| `/play/decode` | 試唸生字 |

舊書籤 `L01`–`L41`（v4 Hop）會映射到新課次。
