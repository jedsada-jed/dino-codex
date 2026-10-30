import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllDinosaurs, getPeriod, PERIODS } from "@/lib/dinosaurs";
import { getArticleBySlug } from "@/lib/articles";
import { PERIOD_COLORS, PERIOD_LABELS } from "@/lib/labels";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, isLocale, languageAlternates } from "@/lib/i18n";
import { DinosaurCard } from "@/components/DinosaurCard";

export async function generateMetadata({ params }: PageProps<"/[lang]/timeline">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).timeline;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/timeline"), languages: languageAlternates("/timeline") },
    openGraph: { title: t.title, description: t.description },
  };
}

export default async function TimelinePage({ params }: PageProps<"/[lang]/timeline">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.timeline;
  const all = getAllDinosaurs();
  const byPeriod = { Triassic: [] as typeof all, Jurassic: [] as typeof all, Cretaceous: [] as typeof all };
  for (const d of all) {
    const p = getPeriod(d);
    if (p !== "unknown") byPeriod[p].push(d);
  }

  const extinction = getArticleBySlug("dinosaur-extinction", lang);
  const totalDuration = PERIODS.reduce((sum, p) => sum + (p.maxMa - p.minMa), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
      <p className="mt-2 max-w-2xl text-stone-600">{t.lead}</p>

      <div className="mt-6 flex h-12 overflow-hidden rounded-full text-sm font-medium text-white" role="img" aria-label={t.barLabel}>
        {PERIODS.map((p) => {
          const duration = p.maxMa - p.minMa;
          const widthPercent = (duration / totalDuration) * 100;
                    return (
            <div
              key={p.key}
              className="flex items-center justify-center"
              style={{ width: `${widthPercent}%`, backgroundColor: PERIOD_COLORS[p.key] }}
            >
              {PERIOD_LABELS[lang][p.key]}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-stone-500">
        <span>{t.start}</span>
        <span>{t.end}</span>
      </div>

      {PERIODS.map((p) => (
        <section key={p.key} id={p.key.toLowerCase()} className="mt-10 scroll-mt-20 border-t border-stone-200 pt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-stone-900">{PERIOD_LABELS[lang][p.key]}</h2>
            <p className="text-sm text-stone-500">
              {dict.common.millionYearsAgo(`${p.maxMa}–${p.minMa}`)} · {dict.common.species(formatNumber(lang, byPeriod[p.key].length))}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {byPeriod[p.key]
              .filter((d) => d.images.length > 0)
              .slice(0, 12)
              .map((d) => (
                <DinosaurCard key={d.slug} dinosaur={d} lang={lang} />
              ))}
          </div>
        </section>
      ))}

      {extinction && (
        <Link
          href={href(lang, `/articles/${extinction.slug}`)}
          className="group mt-10 block rounded-2xl border border-amber-700/40 bg-amber-50 p-5 transition-colors hover:border-amber-700"
        >
          <p className="text-sm font-semibold text-amber-700">{t.extinctionEyebrow}</p>
          <p className="mt-1 text-lg font-bold text-stone-900 group-hover:text-emerald-700">{extinction.title} →</p>
          <p className="mt-1 text-stone-700">{t.extinctionLead}</p>
        </Link>
      )}
    </div>
  );
}
