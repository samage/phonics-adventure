import DecodeTool from '@/components/learn/DecodeTool';
import PageHeader from '@/components/ui/PageHeader';

export const metadata = { title: '試唸生字 | Phonics Adventure' };

export default function DecodePage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-5 p-5">
      <PageHeader title="試唸生字" />
      <DecodeTool />
    </main>
  );
}
