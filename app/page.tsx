import LearningMap from '@/components/learn/LearningMap';
import HomeToday from '@/components/home/HomeToday';
import Mascot from '@/components/mascot/Mascot';
import { Star } from '@/components/mascot/Decor';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-7 p-5">
      <header className="flex flex-col items-center gap-1 text-center">
        <div className="relative">
          <Star size={26} className="absolute -left-6 top-2 animate-float" />
          <Star size={18} className="absolute -right-5 top-8 animate-float" />
          <Mascot mood="happy" size={150} />
        </div>
        <h1 className="text-4xl font-bold tracking-wide text-sky-600 drop-shadow-sm md:text-5xl">
          Phonics Adventure
        </h1>
        <p className="text-base text-sky-700">跟雲寶一起，看到字母就會唸 ☁️</p>
      </header>

      <HomeToday />
      <LearningMap />
    </main>
  );
}
