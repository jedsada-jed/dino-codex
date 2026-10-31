import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCountryStats, WORLD_MAP } from "@/lib/fossil-map";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, isLocale, languageAlternates } from "@/lib/i18n";
import { FossilMap } from "@/components/FossilMap";
import { openGraphFor } from "@/lib/og";

export async function generateMetadata({ params }: PageProps<"/[lang]/map">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).fossilMap;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/map"), languages: languageAlternates("/map") },
    openGraph: openGraphFor(lang, { title: t.title, description: t.description }),
  };
}

export default async function MapPage({ params }: PageProps<"/[lang]/map">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).fossilMap;
  const { stats, genera } = getCountryStats(lang);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
      <p className="mt-2 max-w-3xl text-stone-600">{t.lead(formatNumber(lang, genera), formatNumber(lang, stats.length))}</p>
      <div className="mt-6">
        <FossilMap map={WORLD_MAP} stats={stats} lang={lang} initial="TH" />
      </div>
      <p className="mt-10 max-w-3xl text-sm text-stone-500">{t.note}</p>
    </div>
  );
}
