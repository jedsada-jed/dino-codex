import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getColoringPages } from "@/lib/coloring";
import { getDictionary } from "@/lib/dictionaries";
import { href, isLocale, languageAlternates } from "@/lib/i18n";
import { openGraphFor } from "@/lib/og";

export async function generateMetadata({ params }: PageProps<"/[lang]/coloring">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).coloring;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/coloring"), languages: languageAlternates("/coloring") },
    openGraph: openGraphFor(lang, { title: t.title, description: t.description }),
  };
}

export default async function ColoringPage({ params }: PageProps<"/[lang]/coloring">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).coloring;
  const pages = getColoringPages(lang);
  const models = [...new Set(pages.map((p) => p.model))].join(", ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
      <p className="mt-2 max-w-3xl text-stone-600">{t.lead}</p>

      {pages.length === 0 ? (
        <p className="mt-8 text-stone-500">{t.empty}</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <li key={p.slug} className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
              {/* Line art is drawn on white, so the frame stays white in dark mode too. */}
              <div className="relative aspect-3/2 bg-white">
                <Image src={p.thumb} alt={p.name} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-contain" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <Link href={href(lang, `/dinosaurs/${p.slug}`)} className="font-semibold text-stone-900 hover:text-emerald-700">
                  {p.name}
                </Link>
                {p.sci && <p className="text-xs italic text-stone-500">{p.sci}</p>}
                <p className="mt-2 text-xs font-medium text-stone-600">{t.checks(p.passed, p.total)}</p>
                {p.notes.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-stone-500">
                    {p.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <a
                    href={p.image}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-stone-50 hover:bg-emerald-800"
                  >
                    🖨️ {t.print}
                  </a>
                  <a
                    href={p.image}
                    download={`dinocodex-${p.slug}-coloring.png`}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-stone-300 px-4 text-sm font-semibold text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
                  >
                    ⬇️ {t.download}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages.length > 0 && <p className="mt-8 max-w-3xl text-sm text-stone-500">{t.aiNote(models)}</p>}
    </div>
  );
}
