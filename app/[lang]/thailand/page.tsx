import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { displayName, getDinosaurBySlug, getThailandDinosaurs } from "@/lib/dinosaurs";
import { DINO_SITES, mapsUrl } from "@/lib/dino-sites";
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

      <section id="visit" className="mt-12 scroll-mt-20 border-t border-stone-200 pt-8">
        <h2 className="text-xl font-bold text-stone-900">{t.sitesTitle}</h2>
        <p className="mt-1 text-stone-600">{t.sitesLead}</p>

        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {DINO_SITES.map((site) => {
            const text = site.text[lang];
            return (
              <li key={site.id} className="flex flex-col rounded-2xl border border-stone-200 bg-stone-100 p-5">
                <h3 className="text-lg font-semibold text-stone-900">{text.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-amber-700">
                  <MapPinIcon className="h-4 w-4 shrink-0" />
                  {text.place}
                </p>
                <p className="mt-3 leading-relaxed text-stone-700">{text.about}</p>
                {site.dinosaurs.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-stone-500">{t.foundNearby}</p>
                    <ul className="mt-1.5 flex flex-wrap gap-2">
                      {site.dinosaurs.map((slug) => {
                        const d = getDinosaurBySlug(slug);
                        if (!d) return null;
                        return (
                          <li key={slug}>
                            <Link
                              href={href(lang, `/dinosaurs/${slug}`)}
                              className="flex min-h-9 items-center rounded-full bg-emerald-50 px-3 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                            >
                              {displayName(d, lang)}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <a
                  href={mapsUrl(site)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex min-h-11 items-center pt-3 text-sm font-medium text-emerald-700 underline hover:text-emerald-800"
                >
                  {t.openMap} ↗
                </a>
              </li>
            );
          })}
        </ul>

        <aside className="mt-5 rounded-2xl border border-amber-700/40 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-700">{t.routeTitle}</h3>
          <p className="mt-1 text-stone-700">{t.routeText}</p>
        </aside>
        <p className="mt-4 text-sm text-stone-500">{t.sitesNote}</p>
      </section>
    </div>
  );
}
