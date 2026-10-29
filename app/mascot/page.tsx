import Link from 'next/link';
import Mascot, { MASCOT_MOODS, MASCOT_MOOD_LABEL } from '@/components/mascot/Mascot';
import { Cloud, Cupcake, Pudding, Star } from '@/components/mascot/Decor';

export const metadata = { title: '雲寶的表情 | Phonics Adventure' };

export default function MascotPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-6">
      <div className="flex w-full max-w-3xl items-center gap-4">
        <Link href="/" className="rounded-full bg-white/80 px-4 py-2 text-lg text-sky-800 shadow-md">
          ← 首頁
        </Link>
        <h1 className="text-2xl font-bold text-sky-900">雲寶的表情</h1>
      </div>
      <div className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
        {MASCOT_MOODS.map((mood) => (
          <div
            key={mood}
            className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 p-4 shadow-md"
          >
            <Mascot mood={mood} size={150} />
            <p className="text-lg text-sky-800">{MASCOT_MOOD_LABEL[mood]}</p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-4">
        <Cloud size={90} />
        <Star size={36} />
        <Cupcake size={60} />
        <Pudding size={60} />
      </div>
    </main>
  );
}
