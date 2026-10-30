"use client";

import { useState } from "react";
import { NewsCard } from "@/components/NewsCard";
import { NEWS_TAGS } from "@/lib/labels";
import type { NewsItem, NewsTag } from "@/types/news";

const TAGS = Object.keys(NEWS_TAGS) as NewsTag[];

/** News grid with category chips; "ทั้งหมด" (null) shows every item. */
export function NewsBrowser({ news }: { news: NewsItem[] }) {
  const [active, setActive] = useState<NewsTag | null>(null);
  const shown = active ? news.filter((item) => item.tags.includes(active)) : news;
  const count = (tag: NewsTag) => news.filter((item) => item.tags.includes(tag)).length;

  const chip = (selected: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition ${
      selected
        ? "border-emerald-700 bg-emerald-700 text-stone-50"
        : "border-stone-300 bg-stone-100 text-stone-700 hover:border-emerald-500"
    }`;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="กรองตามหมวดหมู่">
        <button type="button" className={chip(active === null)} aria-pressed={active === null} onClick={() => setActive(null)}>
          ทั้งหมด <span className="opacity-70">{news.length}</span>
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={chip(active === tag)}
            aria-pressed={active === tag}
            onClick={() => setActive(active === tag ? null : tag)}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: NEWS_TAGS[tag].color }} aria-hidden="true" />
            {NEWS_TAGS[tag].label} <span className="opacity-70">{count(tag)}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
