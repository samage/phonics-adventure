/**
 * 本地開發：略過線性解鎖，地圖上所有課程皆可進入。
 * 正式環境（NODE_ENV=production）一律關閉，就算環境變數誤設也不會生效。
 */
export const DEV_UNLOCK_ALL_LESSONS =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_DEV_UNLOCK_ALL_LESSONS === 'true';
