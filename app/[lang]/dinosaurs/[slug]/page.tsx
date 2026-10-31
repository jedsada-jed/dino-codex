import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { countryName, displayName, getAllSlugs, getDinosaurBySlug, localContent } from "@/lib/dinosaurs";
import { CLADE_LABELS, DIET_LABELS } from "@/lib/labels";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, isLocale, languageAlternates } from "@/lib/i18n";
import { DinosaurGallery, type GalleryItem } from "@/components/DinosaurGallery";
import { aiImageScore, getAiImages, getCoverImage } from "@/lib/ai-images";
import { hasSize } from "@/lib/sizes";
import { getContemporaries } from "@/lib/contemporaries";
import { DinosaurCard } from "@/components/DinosaurCard";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/dinosaurs/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const dinosaur = getDinosaurBySlug(slug);
  if (!dinosaur || !isLocale(lang)) return {};

  const t = getDictionary(lang).detail;
  const name = displayName(dinosaur, lang);
  const title = name === dinosaur.name ? name : `${name} (${dinosaur.name})`;
  const description =
    localContent(dinosaur, lang)?.description ??
    t.metaFallback(dinosaur.name, CLADE_LABELS[lang][dinosaur.clade], dinosaur.ageRangeMa[0], dinosaur.ageRangeMa[1]);
  const cover = getCoverImage(dinosaur).image;
  const image = cover?.localLarge ?? cover?.localSmall;
  const path = `/dinosaurs/${dinosaur.slug}`;

  return {
    title,
    description,
    alternates: { canonical: href(lang, path), languages: languageAlternates(path) },
    openGraph: { title, description, images: image ? [{ url: image }] : undefined },
  };
}

export default async function DinosaurDetailPage({ params }: PageProps<"/[lang]/dinosaurs/[slug]">) {
  const { lang, slug } = await params;
  const dinosaur = getDinosaurBySlug(slug);
  if (!dinosaur || !isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const t = dict.detail;
  const name = displayName(dinosaur, lang);
  const content = localContent(dinosaur, lang);
  // A well-reviewed AI image leads; otherwise the Commons image stays first and AI images follow.
  const aiItems: GalleryItem[] = getAiImages(dinosaur.slug).map((image) => ({ kind: "ai", image, score: aiImageScore(image) }));
  const commonsItems: GalleryItem[] = dinosaur.images.map((image) => ({ kind: "commons", image }));
  const galleryItems = getCoverImage(dinosaur).ai ? [...aiItems, ...commonsItems] : [...commonsItems, ...aiItems];

  const contemporaries = getContemporaries(dinosaur.slug);
  const sharedFormations = [...new Set(contemporaries.map((c) => c.formation))];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: dinosaur.name,
    alternateName: name === dinosaur.name ? undefined : name,
    description: content?.description,
    inLanguage: lang,
    additionalType: "https://en.wikipedia.org/wiki/Dinosaur",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-stone-500">
        <Link href={href(lang, "/dinosaurs")} className="hover:text-emerald-700">
          {t.breadcrumb}
        </Link>
        {" / "}
        {name}
      </nav>

      {/* Simple layer */}
      <section className="mt-4">
        <DinosaurGallery items={galleryItems} name={name} lang={lang} />

        <h1 className="mt-4 text-3xl font-bold text-stone-900">{name}</h1>
        {name !== dinosaur.name && <p className="text-lg italic text-stone-500">{dinosaur.name}</p>}
        {content?.nameMeaning && (
          <p className="mt-2 text-stone-700">
            {t.nameMeaning}: {content.nameMeaning}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            {DIET_LABELS[lang][dinosaur.diet]}
          </span>
          {dinosaur.countries.includes("TH") && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              {dict.common.foundInThailandLong}
            </span>
          )}
        </div>

        {content?.sizeComparison && (
          <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-900">📏 {content.sizeComparison}</p>
        )}

        {hasSize(dinosaur.slug) && (
          <Link
            href={`${href(lang, "/size-compare")}?d=${dinosaur.slug},tyrannosaurus`}
            className="mt-3 inline-flex min-h-11 items-center font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            📐 {dict.sizeCompare.detailLink} →
          </Link>
        )}

        {content?.description && <p className="mt-4 leading-relaxed text-stone-800">{content.description}</p>}

        {content && content.funFacts.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold text-stone-900">{t.funFacts}</h2>
            <ul className="mt-2 space-y-2">
              {content.funFacts.map((fact, i) => (
                <li key={i} className="flex gap-2 rounded-xl bg-stone-100 p-3 shadow-sm">
                  <span aria-hidden="true">✨</span>
                  <span className="text-stone-800">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!content && <p className="mt-4 rounded-xl bg-stone-100 p-4 text-sm text-stone-600">{t.noContent}</p>}
      </section>

      {contemporaries.length > 0 && (
        <section className="mt-10 border-t border-stone-200 pt-6" aria-labelledby="contemporaries-heading">
          <h2 id="contemporaries-heading" className="text-xl font-bold text-stone-900">
            {t.contemporariesTitle}
          </h2>
          <p className="mt-1 text-stone-600">{t.contemporariesLead(name, sharedFormations.join(", "))}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {contemporaries.map((c) => (
              <DinosaurCard key={c.dinosaur.slug} dinosaur={c.dinosaur} lang={lang} />
            ))}
          </div>
          <p className="mt-3 text-xs text-stone-500">{t.contemporariesNote}</p>
        </section>
      )}

      {/* Deep layer */}
      <section className="mt-10 border-t border-stone-200 pt-6">
        <h2 className="text-xl font-bold text-stone-900">{t.deepTitle}</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-stone-500">{t.classification}</dt>
            <dd className="text-stone-900">{CLADE_LABELS[lang][dinosaur.clade]}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">{t.family}</dt>
            <dd className="text-stone-900">{dinosaur.family ?? t.unknown}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">{t.livedWhen}</dt>
            <dd className="text-stone-900">
              {dict.common.millionYearsAgo(
                `${formatNumber(lang, dinosaur.ageRangeMa[1])}–${formatNumber(lang, dinosaur.ageRangeMa[0])}`,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">{t.geologicAge}</dt>
            <dd className="text-stone-900">
              {dinosaur.earlyInterval ?? t.unknown}
              {dinosaur.lateInterval && dinosaur.lateInterval !== dinosaur.earlyInterval ? ` – ${dinosaur.lateInterval}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">{t.namedBy}</dt>
            <dd className="text-stone-900">
              {dinosaur.namingAuthor}, {dinosaur.namingYear}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">{t.occurrences}</dt>
            <dd className="text-stone-900">{t.sites(formatNumber(lang, dinosaur.occurrenceCount))}</dd>
          </div>
        </dl>

        {dinosaur.countries.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-stone-500">{t.countries}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {dinosaur.countries.map((cc) => (
                <li key={cc} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">
                  {countryName(cc, lang)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-sm text-stone-500">
          {t.sourcesFrom}{" "}
          <a
            href={`https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${dinosaur.pbdbTaxonId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-700"
          >
            Paleobiology Database
          </a>
          {dinosaur.wikidataId && (
            <>
              {" "}
              {t.and}{" "}
              <a
                href={`https://www.wikidata.org/wiki/${dinosaur.wikidataId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-emerald-700"
              >
                Wikidata
              </a>
            </>
          )}
        </p>
      </section>
    </div>
  );
}
