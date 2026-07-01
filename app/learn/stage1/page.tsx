import { redirect } from 'next/navigation';

/** 舊六階段路由 → 新 60 堂課路徑 */
export default function LegacyStageRedirect() {
  redirect('/');
}
