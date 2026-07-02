import { redirect } from 'next/navigation';

/** 舊書籤／連結：直接進入課程遊玩頁 */
export default async function LessonRedirectPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  redirect(`/learn/${lessonId}/play`);
}
