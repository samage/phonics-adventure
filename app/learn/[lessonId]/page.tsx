import { redirect } from 'next/navigation';
import { resolveLessonId } from '@/data/curriculum';

/** 舊書籤／連結：直接進入課程遊玩頁 */
export default async function LessonRedirectPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const mapped = resolveLessonId(lessonId);
  redirect(`/learn/${mapped}/play`);
}
