import PlacementFlow from '@/components/recall/PlacementFlow';

export const metadata = { title: '快速分班測驗 | Phonics Adventure' };

export default function PlacementPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-5 p-5">
      <PlacementFlow />
    </main>
  );
}
