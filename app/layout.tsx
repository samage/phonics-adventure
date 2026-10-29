import type { Metadata } from "next";
import { Fredoka, Huninn } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-rounded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// 粉圓體（繁體中文圓體），讓中文也有圓潤的感覺
const huninn = Huninn({
  variable: "--font-zh-rounded",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Phonics Adventure 自然發音遊戲 · 雲寶",
  description: "不背規則、不查音標，透過遊戲操作自然內化發音直覺。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${fredoka.variable} ${huninn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans font-bold">
        {children}
      </body>
    </html>
  );
}
