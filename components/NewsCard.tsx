import type { NewsItem } from "@/types/news";

function formatNewsDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-stone-200">
        {item.cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export with unoptimized images
          <img src={item.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-stone-200"
            aria-hidden="true"
          >
            <span className="text-5xl">🦴</span>
          </div>
        )}
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
