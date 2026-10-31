import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/lib/glossary";
import { getDictionary } from "@/lib/dictionaries";
import { href, isLocale, languageAlternates } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/glossary">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).glossary;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/glossary"), languages: languageAlternates("/glossary") },
    openGraph: { title: t.title, description: t.description },
  };
}

export default async function GlossaryPage({ params }: PageProps<"/[lang]/glossary">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).glossary;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
      <p className="mt-2 text-stone-600">{t.lead}</p>

      <nav aria-label={t.jumpLabel} className="mt-5 flex flex-wrap gap-2">
        {GLOSSARY_CATEGORIES.map((c) => (
          <a
            key={c}
            href={`#${c}`}
            className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
          >
            {t.categories[c]}
          </a>
        ))}
      </nav>

      {GLOSSARY_CATEGORIES.map((c) => (
        <section key={c} id={c} className="mt-10 scroll-mt-20">
          <h2 className="text-xl font-bold text-stone-900">{t.categories[c]}</h2>
          <dl className="mt-4 space-y-3">
            {GLOSSARY.filter((g) => g.category === c).map((g) => (
              <div key={g.id} id={g.id} className="scroll-mt-20 rounded-2xl border border-stone-200 bg-stone-100 p-4">
                <dt>
                  <span className="font-semibold text-stone-900">{g.text[lang].term}</span>
                  {g.latin !== g.text[lang].term && <span className="ml-2 text-sm italic text-stone-500">{g.latin}</span>}
                </dt>
                <dd className="mt-1 leading-relaxed text-stone-700">{g.text[lang].definition}</dd>
                <dd className="mt-2 flex flex-wrap gap-x-4 text-sm">
                  {g.seeAlso && (
                    <Link href={href(lang, g.seeAlso)} className="inline-flex min-h-11 items-center font-medium text-emerald-700 hover:underline">
                      {t.readMore} →
                    </Link>
                  )}
                  <a
                    href={`https://en.wikipedia.org/wiki/${g.wikipedia}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-stone-500 underline hover:text-emerald-700"
                  >
                    {t.source}: Wikipedia
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
