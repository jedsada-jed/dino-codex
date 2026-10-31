import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDigPool } from "@/lib/dig";
import { getDictionary } from "@/lib/dictionaries";
import { href, isLocale, languageAlternates } from "@/lib/i18n";
import { openGraphFor } from "@/lib/og";
import { FossilDig } from "@/components/FossilDig";

export async function generateMetadata({ params }: PageProps<"/[lang]/fossil-dig">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).dig;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/fossil-dig"), languages: languageAlternates("/fossil-dig") },
    openGraph: openGraphFor(lang, { title: t.title, description: t.description }),
  };
}

export default async function FossilDigPage({ params }: PageProps<"/[lang]/fossil-dig">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).dig;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
      <p className="mt-2 text-stone-600">{t.lead}</p>
      <div className="mt-6">
        <FossilDig pool={getDigPool(lang)} lang={lang} />
      </div>
    </div>
  );
}
