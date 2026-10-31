import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSizeIndex, hasSize } from "@/lib/sizes";
import { getPopularDinosaurs } from "@/lib/popularity";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, isLocale, languageAlternates } from "@/lib/i18n";
import { SizeCompare } from "@/components/SizeCompare";
import { openGraphFor } from "@/lib/og";

const DEFAULTS = ["tyrannosaurus", "phuwiangosaurus", "velociraptor"];

export async function generateMetadata({ params }: PageProps<"/[lang]/size-compare">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).sizeCompare;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/size-compare"), languages: languageAlternates("/size-compare") },
    openGraph: openGraphFor(lang, { title: t.title, description: t.description }),
  };
}

export default async function SizeComparePage({ params }: PageProps<"/[lang]/size-compare">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).sizeCompare;
  const items = getSizeIndex(lang);
  const popular = getPopularDinosaurs(50)
    .map((p) => p.dinosaur.slug)
    .filter(hasSize)
    .slice(0, 16);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
      <p className="mt-2 max-w-2xl text-stone-600">{t.lead(formatNumber(lang, items.length))}</p>

      <div className="mt-6">
        <SizeCompare items={items} lang={lang} defaults={DEFAULTS} popular={popular} />
      </div>

      <p className="mt-10 max-w-3xl text-sm text-stone-500">{t.note}</p>
    </div>
  );
}
