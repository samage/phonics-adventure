import ReviewFlow from '@/components/recall/ReviewFlow';

export const metadata = { title: '今天複習 | Phonics Adventure' };

export default function ReviewPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-5 p-5">
      <ReviewFlow />
    </main>
  );
}
