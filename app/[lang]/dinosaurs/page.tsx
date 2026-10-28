import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrowseIndex } from "@/lib/dinosaurs";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, isLocale, languageAlternates } from "@/lib/i18n";
import { DinosaurBrowser } from "@/components/DinosaurBrowser";

export async function generateMetadata({ params }: PageProps<"/[lang]/dinosaurs">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).browse;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/dinosaurs"), languages: languageAlternates("/dinosaurs") },
    openGraph: { title: t.title, description: t.description },
  };
}

export default async function DinosaursPage({ params }: PageProps<"/[lang]/dinosaurs">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).browse;
  const items = getBrowseIndex(lang);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
      <p className="mt-1 text-stone-600">{t.lead(formatNumber(lang, items.length))}</p>

      <div className="mt-6">
        <DinosaurBrowser items={items} lang={lang} />
      </div>
    </div>
  );
}
