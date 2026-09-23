import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const THEME_INIT_SCRIPT = `
try {
  var stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    document.documentElement.dataset.theme = stored;
  }
} catch (e) {}
`;

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_NAME = "สารานุกรมไดโนเสาร์";
const SITE_DESCRIPTION =
  "สารานุกรมไดโนเสาร์ภาษาไทย ข้อมูลไดโนเสาร์กว่า 1,500 สายพันธุ์ พร้อมภาพประกอบและข้อมูลไดโนเสาร์ที่พบในประเทศไทย";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinocodex.com"),
  title: {
    default: SITE_NAME,
    template: "%s | สารานุกรมไดโนเสาร์",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "./",
  },
  openGraph: {
    siteName: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "th_TH",
    type: "website",
    images: ["/images/dinos/tyrannosaurus-960.webp"],
  },
  twitter: {
    card: "summary_large_image",
  },
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <header className="border-b border-stone-200 bg-stone-100">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-800">
              <LogoMark className="h-7 w-7" />
              สารานุกรมไดโนเสาร์
            </Link>
            <div className="flex items-center gap-4">
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
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-stone-200 bg-stone-100 text-sm text-stone-600">
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
