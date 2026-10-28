import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllNews } from "@/lib/news";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";
import { NewsCard } from "@/components/NewsCard";

// News items are written in Thai, so this page only exists at /th/news.
export function generateStaticParams() {
  return [{ lang: "th" }];
}
export const dynamicParams = false;

const t = getDictionary("th").news;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: href("th", "/news") },
  openGraph: { title: t.title, description: t.description },
};

export default async function NewsPage({ params }: PageProps<"/[lang]/news">) {
  if ((await params).lang !== "th") notFound();
  const news = getAllNews();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
      <p className="mt-2 max-w-2xl text-stone-600">{t.lead}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
