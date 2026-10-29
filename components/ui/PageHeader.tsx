import Link from 'next/link';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  right?: ReactNode;
}

export default function PageHeader({
  title,
  backHref = '/',
  backLabel = '← 首頁',
  right,
}: PageHeaderProps) {
  return (
    <div className="flex w-full max-w-2xl items-center gap-3">
      <Link
        href={backHref}
        className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-base text-sky-800 shadow-md hover:bg-white"
      >
        {backLabel}
      </Link>
      <h1 className="flex-1 truncate text-xl font-bold text-sky-900">{title}</h1>
      {right}
    </div>
  );
}

export const BTN_PRIMARY =
  'rounded-full bg-sky-400 px-8 py-3 text-xl text-white shadow-[0_5px_0_0_#2f8fd0] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#2f8fd0]';
export const BTN_SECONDARY =
  'rounded-full bg-white px-6 py-3 text-lg text-sky-800 shadow-[0_4px_0_0_#bfe0f7] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#bfe0f7]';
export const BTN_PINK =
  'rounded-full bg-pink-300 px-6 py-3 text-lg text-white shadow-[0_4px_0_0_#e58aa9] transition-transform active:translate-y-1 active:shadow-[0_1px_0_0_#e58aa9]';
