import RecallFlow from '@/components/recall/RecallFlow';

export const metadata = { title: '看字母說音 | Phonics Adventure' };

export default function RecallPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-5 p-5">
      <RecallFlow />
    </main>
  );
}
