import { redirect } from 'next/navigation';

/** 舊六階段路由 → 課程路徑首頁 */
export default function LegacyStageRedirect() {
  redirect('/');
}
