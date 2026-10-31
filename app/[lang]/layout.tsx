import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { NewsSection } from "@/components/NewsSection";
import { getLatestNews } from "@/lib/news";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, href, isLocale } from "@/lib/i18n";
import { AUTHOR } from "@/lib/author";
import { CLOUDFLARE_ANALYTICS_TOKEN } from "@/lib/analytics";
import "../globals.css";
import { openGraphFor } from "@/lib/og";

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

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}
// Anything else in the first segment (e.g. a browser asking for /favicon.ico) is a 404.
export const dynamicParams = false;

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinocodex.com"),
    title: { default: t.siteName, template: `%s | ${t.siteName}` },
    description: t.siteDescription,
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    creator: AUTHOR.name,
    openGraph: openGraphFor(lang, {}),
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    // THEME_INIT_SCRIPT sets data-theme on <html> before hydration to avoid a flash of the
    // wrong theme, so that one attribute is expected to differ from the server HTML.
    <html lang={lang} className={`${notoSansThai.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Production builds only, so local dev visits don't count. */}
        {CLOUDFLARE_ANALYTICS_TOKEN && process.env.NODE_ENV === "production" && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CLOUDFLARE_ANALYTICS_TOKEN })}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <a
          href="#main"
          className="sr-only rounded-lg bg-emerald-700 px-4 py-2 font-medium text-stone-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          {t.nav.skipToContent}
        </a>
        <SiteHeader lang={lang} />

        <main id="main" className="flex-1">
          {children}
        </main>

        {/* News items are written in Thai, so the strip only appears on Thai pages. */}
        {lang === "th" && <NewsSection pool={getLatestNews(10)} />}

        <footer className="border-t border-stone-200 bg-stone-100 text-sm text-stone-600">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <p>
              {t.footer.dataFrom}{" "}
              <a className="underline hover:text-emerald-700" href="https://paleobiodb.org" target="_blank" rel="noopener noreferrer">
                Paleobiology Database
              </a>{" "}
              (CC BY 4.0) {t.footer.and}{" "}
              <a className="underline hover:text-emerald-700" href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer">
                Wikidata
              </a>{" "}
              (CC0){lang === "en" && "."} {t.footer.imagesFrom}{" "}
              <a className="underline hover:text-emerald-700" href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">
                Wikimedia Commons
              </a>{" "}
              {t.footer.licensePerImage}{" "}
              <Link href={href(lang, "/about")} className="underline hover:text-emerald-700">
                {t.footer.aboutPage}
              </Link>
            </p>
            <p className="mt-3">
              {t.footer.madeBy}{" "}
              <a href={AUTHOR.url} target="_blank" rel="noopener author" className="font-medium text-stone-800 underline hover:text-emerald-700">
                {AUTHOR.name}
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
