import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-rounded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Phonics Adventure 自然發音遊戲",
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
      className={`${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans font-bold">
        {children}
      </body>
    </html>
  );
}
