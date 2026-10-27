"use client";

import { useState } from "react";
import type { NewsItem } from "@/types/news";
import { BoneIcon } from "@/components/Icons";

function formatNewsDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function NewsCover({ item }: { item: NewsItem }) {
  // Try the article's own image first, then our local dinosaur image, then the placeholder.
  const sources = [item.image, item.cover].filter((s): s is string => Boolean(s));
  const [failed, setFailed] = useState(0);
  const src = sources[failed];

  if (!src) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-stone-200"
        aria-hidden="true"
      >
        <BoneIcon className="h-10 w-10 text-emerald-800 opacity-60" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote hotlinked images, static export
    <img
      key={src}
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed((n) => n + 1)}
      // An image that already failed before hydration never fires onError, so check on mount.
      ref={(el) => {
        if (el?.complete && el.naturalWidth === 0) setFailed((n) => n + 1);
      }}
      className="h-full w-full object-cover"
    />
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm transition hover:border-emerald-500 hover:shadow-lg motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-stone-200">
        <NewsCover item={item} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-stone-500">
          <time dateTime={item.date}>{formatNewsDate(item.date)}</time> · {item.source}
        </p>
        <h3 className="line-clamp-2 font-semibold text-stone-900 group-hover:text-emerald-700">{item.title}</h3>
        <p className="line-clamp-3 text-sm text-stone-600">{item.description}</p>
      </div>
    </a>
  );
}
