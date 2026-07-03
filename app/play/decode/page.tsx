import DecodeWordActivity from '@/components/activities/DecodeWordActivity';

export default function DecodePlayPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold text-amber-900">試唸生字</h1>
      <DecodeWordActivity />
    </main>
  );
}
