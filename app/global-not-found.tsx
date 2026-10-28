import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "404 – ไม่พบหน้านี้ / Page not found",
};

/**
 * Served for URLs that match no route. It renders outside app/[lang]/layout, so it can't know
 * the reader's language and offers both.
 */
export default function GlobalNotFound() {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="flex min-h-full items-center justify-center bg-stone-50 p-6 text-stone-900">
        <main className="max-w-md text-center">
          <p className="text-6xl font-black text-emerald-700">404</p>
          <h1 className="mt-4 text-2xl font-bold">ไม่พบหน้านี้</h1>
          <p className="mt-1 text-stone-600" lang="en">
            Page not found
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/th" className="flex min-h-11 items-center rounded-full bg-emerald-700 px-5 font-medium text-stone-50">
              กลับหน้าแรก
            </Link>
            <Link
              href="/en"
              lang="en"
              className="flex min-h-11 items-center rounded-full border border-stone-300 px-5 font-medium text-stone-800"
            >
              English home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
