import path from 'node:path';
import { defineConfig } from 'vitest/config';

/** 只給 npm run export:speech-texts 用：借 vitest 的模組解析（@/ 別名）來載入 TS 資料 */
export default defineConfig({
  root: path.resolve(__dirname, '..'),
  resolve: { alias: { '@': path.resolve(__dirname, '..') } },
  test: { include: ['scripts/export-speech-texts.export.ts'] },
});
