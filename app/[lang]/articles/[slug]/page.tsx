import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import { getDictionary } from "@/lib/dictionaries";
import { href, isLocale, languageAlternates } from "@/lib/i18n";

export function generateStaticParams() {
  return getAllArticles("th").map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/articles/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const article = getArticleBySlug(slug, lang);
  if (!article) return {};
  const path = `/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: href(lang, path), languages: languageAlternates(path) },
    openGraph: { title: article.title, description: article.summary, type: "article" },
  };
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/articles/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const article = getArticleBySlug(slug, lang);
  if (!article) notFound();

  const t = getDictionary(lang).articles;
  const others = getAllArticles(lang).filter((a) => a.slug !== article.slug);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-stone-500" aria-label="breadcrumb">
        <Link href={href(lang, "/articles")} className="hover:text-emerald-700">
          {t.title}
        </Link>
        {" / "}
        {article.topic}
      </nav>

      <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">{article.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-600">{article.summary}</p>

      {article.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-xl font-bold text-stone-900">{section.heading}</h2>
          {section.paragraphs.map((p, i) => (
            <p key={i} className="mt-3 leading-loose text-stone-800">
              {p}
            </p>
          ))}
        </section>
      ))}

      <section className="mt-12 rounded-2xl border border-stone-200 bg-stone-100 p-5">
        <h2 className="font-semibold text-stone-900">{t.sources}</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {article.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-800">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-semibold text-stone-900">{t.others}</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {others.map((a) => (
            <li key={a.slug}>
              <Link
                href={href(lang, `/articles/${a.slug}`)}
                className="block min-h-11 rounded-xl border border-stone-200 p-3 text-sm font-medium text-stone-800 transition-colors hover:border-emerald-500 hover:text-emerald-700"
              >
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
