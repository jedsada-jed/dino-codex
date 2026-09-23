import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinocodex.com"),
  title: {
    default: "สารานุกรมไดโนเสาร์",
    template: "%s | สารานุกรมไดโนเสาร์",
  },
  description: "สารานุกรมไดโนเสาร์ภาษาไทย ข้อมูลไดโนเสาร์กว่า 1,500 สายพันธุ์ พร้อมภาพประกอบและข้อมูลไดโนเสาร์ที่พบในประเทศไทย",
};

const NAV_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/dinosaurs", label: "ไดโนเสาร์ทั้งหมด" },
  { href: "/thailand", label: "ไดโนเสาร์ไทย" },
  { href: "/timeline", label: "ไทม์ไลน์" },
  { href: "/about", label: "เกี่ยวกับ" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-800">
              <span aria-hidden="true">🦕</span>
              สารานุกรมไดโนเสาร์
            </Link>
            <nav aria-label="เมนูหลัก">
              <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-stone-700">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-emerald-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-stone-200 bg-white text-sm text-stone-600">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <p>
              ข้อมูลไดโนเสาร์จาก{" "}
              <a className="underline hover:text-emerald-700" href="https://paleobiodb.org" target="_blank" rel="noopener noreferrer">
                Paleobiology Database
              </a>{" "}
              (CC BY 4.0) และ{" "}
              <a className="underline hover:text-emerald-700" href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer">
                Wikidata
              </a>{" "}
              (CC0) ภาพประกอบจาก{" "}
              <a className="underline hover:text-emerald-700" href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">
                Wikimedia Commons
              </a>{" "}
              (สัญญาอนุญาตแยกตามรูปภาพ) ดูรายละเอียดที่{" "}
              <Link href="/about" className="underline hover:text-emerald-700">
                หน้าเกี่ยวกับ
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
