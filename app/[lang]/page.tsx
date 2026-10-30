import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFeaturedDinosaurs, getThailandDinosaurs, getMeta, getAllDinosaurs, getPeriod, PERIODS } from "@/lib/dinosaurs";
import { PERIOD_COLORS, PERIOD_LABELS } from "@/lib/labels";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, isLocale, languageAlternates } from "@/lib/i18n";
import { DinosaurCard } from "@/components/DinosaurCard";
import { PopularDinosaurs } from "@/components/PopularDinosaurs";
import { Hero } from "@/components/Hero";
import { DinoOfTheDay } from "@/components/DinoOfTheDay";
import { getDailyPool } from "@/lib/daily";
import { SectionHeading } from "@/components/SectionHeading";
import { ArrowRightIcon, MapPinIcon } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: { canonical: href(lang, "/"), languages: languageAlternates("/") } };
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const featured = getFeaturedDinosaurs(6);
  const allThailand = getThailandDinosaurs();
  const meta = getMeta();

  const periodCounts: Record<string, number> = {};
  for (const d of getAllDinosaurs()) {
    const p = getPeriod(d);
    periodCounts[p] = (periodCounts[p] ?? 0) + 1;
  }

  return (
    <div>
      <Hero lang={lang} dinosaurCount={meta.dinosaurCount} thailandCount={allThailand.length} />

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6" aria-labelledby="daily-heading">
        <h2 id="daily-heading" className="text-2xl font-bold text-stone-900">
          {t.daily.title}
        </h2>
        <div className="mt-5">
          <DinoOfTheDay pool={getDailyPool(lang)} lang={lang} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="periods-heading">
        <SectionHeading
          id="periods-heading"
          eyebrow={t.home.periodsEyebrow}
          title={t.home.periodsTitle}
          description={t.home.periodsDescription}
          href={href(lang, "/timeline")}
          linkLabel={t.home.periodsLink}
        />
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {PERIODS.map((p) => (
            <li key={p.key}>
              <Link
                href={`${href(lang, "/timeline")}#${p.key.toLowerCase()}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 text-white shadow-sm transition motion-safe:hover:-translate-y-1 hover:shadow-lg"
                style={{ backgroundColor: PERIOD_COLORS[p.key] }}
              >
                <span
                  className="pointer-events-none absolute -right-4 -top-6 text-8xl font-black text-white/10"
                  aria-hidden="true"
                >
                  {p.key[0]}
                </span>
                <span className="text-sm text-white/80">{t.common.millionYearsAgo(`${p.maxMa}–${p.minMa}`)}</span>
                <span className="mt-1 text-2xl font-bold">{PERIOD_LABELS[lang][p.key]}</span>
                <span className="mt-6 flex items-center justify-between text-sm font-medium">
                  {t.common.species(formatNumber(lang, periodCounts[p.key] ?? 0))}
                  <ArrowRightIcon className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <PopularDinosaurs lang={lang} />

      <section className="bg-amber-50 py-14" aria-labelledby="thailand-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            id="thailand-heading"
            eyebrow={t.home.thailandEyebrow}
            title={t.home.thailandTitle}
            icon={<MapPinIcon className="h-6 w-6 text-amber-700" />}
            description={t.home.thailandDescription(allThailand.length)}
            href={href(lang, "/thailand")}
            linkLabel={t.common.seeAll}
          />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {allThailand.slice(0, 6).map((d) => (
              <DinosaurCard key={d.slug} dinosaur={d} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="featured-heading">
          <SectionHeading
            id="featured-heading"
            eyebrow={t.home.featuredEyebrow}
            title={t.home.featuredTitle}
            description={t.home.featuredDescription}
            href={href(lang, "/dinosaurs")}
            linkLabel={t.common.seeAll}
          />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {featured.map((d) => (
              <DinosaurCard key={d.slug} dinosaur={d} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
