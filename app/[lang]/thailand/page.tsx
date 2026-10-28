import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getThailandDinosaurs } from "@/lib/dinosaurs";
import { getDictionary } from "@/lib/dictionaries";
import { href, isLocale, languageAlternates } from "@/lib/i18n";
import { DinosaurCard } from "@/components/DinosaurCard";
import { MapPinIcon } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/thailand">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).thailandPage;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/thailand"), languages: languageAlternates("/thailand") },
    openGraph: { title: t.title, description: t.description },
  };
}

export default async function ThailandPage({ params }: PageProps<"/[lang]/thailand">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).thailandPage;
  const dinosaurs = getThailandDinosaurs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-900">
        <MapPinIcon className="h-6 w-6 text-amber-700" />
        {t.title}
      </h1>
      <p className="mt-2 max-w-2xl text-stone-600">{t.lead(dinosaurs.length)}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {dinosaurs.map((d) => (
          <DinosaurCard key={d.slug} dinosaur={d} lang={lang} />
        ))}
      </div>
    </div>
  );
}
