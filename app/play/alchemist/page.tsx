import Link from "next/link";
import SoundAlchemist from "@/components/games/SoundAlchemist/SoundAlchemist";

export default function AlchemistPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-6">
      <div className="flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="rounded-full bg-white/80 px-5 py-2 text-xl text-amber-800 shadow-[0_4px_0_0_#d6a96b] transition-transform active:translate-y-1"
        >
          ← 回首頁
        </Link>
        <h1 className="text-4xl font-bold text-amber-600">🧪 字母積木煉金術</h1>
        <span className="w-[5.5rem]" />
      </div>

      <SoundAlchemist />
    </main>
  );
}
