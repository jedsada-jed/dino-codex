import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles } from "@/lib/articles";
import { getDictionary } from "@/lib/dictionaries";
import { href, isLocale, languageAlternates } from "@/lib/i18n";
import { ArrowRightIcon } from "@/components/Icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/articles">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).articles;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: href(lang, "/articles"), languages: languageAlternates("/articles") },
    openGraph: { title: t.title, description: t.description },
  };
}

export default async function ArticlesPage({ params }: PageProps<"/[lang]/articles">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.articles;
  const articles = getAllArticles(lang);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Articles</p>
      <h1 className="mt-1 text-3xl font-extrabold text-stone-900">{t.title}</h1>
      <p className="mt-2 max-w-2xl text-stone-600">{t.description}</p>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2">
        {articles.map((article, i) => (
          <li key={article.slug}>
            <Link
              href={href(lang, `/articles/${article.slug}`)}
              className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-stone-100 p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-lg motion-safe:hover:-translate-y-1"
            >
              <span className="text-xs font-semibold text-amber-700">
                {String(i + 1).padStart(2, "0")} · {article.topic}
              </span>
              <h2 className="mt-2 text-balance text-lg font-bold leading-snug text-stone-900 group-hover:text-emerald-700">{article.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{article.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                {dict.common.readMore}
                <ArrowRightIcon className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
