import LearningMap from '@/components/learn/LearningMap';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-10 p-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="animate-float text-7xl">📚</div>
        <h1 className="text-5xl font-bold tracking-wide text-amber-600 drop-shadow-sm md:text-6xl">
          Phonics Adventure
        </h1>
      </header>

      <LearningMap />
    </main>
  );
}
