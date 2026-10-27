import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { NewsSection } from "@/components/NewsSection";
import { getLatestNews } from "@/lib/news";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <a
          href="#main"
          className="sr-only rounded-lg bg-emerald-700 px-4 py-2 font-medium text-stone-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          ข้ามไปยังเนื้อหา
        </a>
        <SiteHeader />

        <main id="main" className="flex-1">{children}</main>

        <NewsSection pool={getLatestNews(10)} />

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
