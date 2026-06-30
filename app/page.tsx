import Link from "next/link";

interface LevelCard {
  no: string;
  title: string;
  subtitle: string;
  emoji: string;
  href?: string;
  accent: string;
  shadow: string;
}

const LEVELS: LevelCard[] = [
  {
    no: "關卡一",
    title: "字母積木煉金術",
    subtitle: "拖拉聲音積木，丟進煉金爐拼出單字",
    emoji: "🧪",
    href: "/play/alchemist",
    accent: "#81C784",
    shadow: "#388E3C",
  },
  {
    no: "關卡二",
    title: "字尾大冒險",
    subtitle: "發射子音砲彈撞擊火車頭（即將推出）",
    emoji: "🚂",
    accent: "#4FC3F7",
    shadow: "#0288D1",
  },
  {
    no: "關卡三",
    title: "時空 X 光機",
    subtitle: "用手電筒照亮長單字裡的小積木（即將推出）",
    emoji: "🔦",
    accent: "#BA68C8",
    shadow: "#7B1FA2",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 p-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="animate-float text-7xl">🎮</div>
        <h1 className="text-6xl font-bold tracking-wide text-amber-600 drop-shadow-sm">
          Phonics Adventure
        </h1>
        <p className="max-w-xl text-2xl text-amber-800/80">
          不背規則、不查音標，玩遊戲就把發音直覺裝進腦袋！
        </p>
      </header>

      <section className="grid w-full max-w-5xl gap-6 md:grid-cols-3">
        {LEVELS.map((level) => {
          const inner = (
            <div
              className={[
                "group flex h-full flex-col items-center gap-3 rounded-[2rem] bg-white/80 p-8 text-center transition-transform",
                level.href
                  ? "cursor-pointer hover:-translate-y-2"
                  : "cursor-not-allowed opacity-70",
              ].join(" ")}
              style={{
                border: `5px solid ${level.accent}`,
                boxShadow: `0 8px 0 0 ${level.shadow}`,
              }}
            >
              <div className="text-6xl">{level.emoji}</div>
              <span
                className="rounded-full px-4 py-1 text-lg text-white"
                style={{ backgroundColor: level.accent }}
              >
                {level.no}
              </span>
              <h2 className="text-3xl font-bold text-amber-900">
                {level.title}
              </h2>
              <p className="text-lg text-amber-700/80">{level.subtitle}</p>
              {!level.href && (
                <span className="mt-auto text-base text-gray-400">
                  即將推出
                </span>
              )}
            </div>
          );

          return level.href ? (
            <Link key={level.no} href={level.href} className="block h-full">
              {inner}
            </Link>
          ) : (
            <div key={level.no} className="h-full">
              {inner}
            </div>
          );
        })}
      </section>
    </main>
  );
}
