import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/components/Providers";
import { Header } from "@/app/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "맛나배달 — 배달 주문 서비스",
  description: "컴퓨터과학개론 기말 프로젝트 배달앱 (Next.js + PostgreSQL)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">{children}</main>
          <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-400">
            맛나배달 · 컴퓨터과학개론 기말 프로젝트
          </footer>
        </Providers>
      </body>
    </html>
  );
}
