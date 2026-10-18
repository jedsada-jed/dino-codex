"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { NewsCard } from "@/components/NewsCard";
import type { NewsItem } from "@/types/news";

const SHOW_COUNT = 3;
const SERVER_PICK = Array.from({ length: SHOW_COUNT }, (_, i) => i);

// Picked once per page load and cached so useSyncExternalStore gets a stable snapshot.
let clientPick: number[] | null = null;

function pickRandomIndexes(poolSize: number): number[] {
  if (!clientPick) {
    const indexes = Array.from({ length: poolSize }, (_, i) => i);
    for (let i = indexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }
    clientPick = indexes.slice(0, SHOW_COUNT).sort((a, b) => a - b);
  }
  return clientPick;
}

const subscribe = () => () => {};

/**
 * Site-wide latest-news strip. The page is statically exported, so the random pick happens
 * on the client: the server HTML shows the newest items, then hydration swaps in a random
 * 3 from the pool. Hidden on /news, which already lists everything.
 */
export function NewsSection({ pool }: { pool: NewsItem[] }) {
  const pathname = usePathname();
  const pick = useSyncExternalStore(
    subscribe,
    () => pickRandomIndexes(pool.length),
    () => SERVER_PICK,
  );

  if (pathname === "/news" || pathname === "/news/") return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="latest-news-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="latest-news-heading" className="text-xl font-bold text-stone-900">
          ข่าวสารไดโนเสาร์
        </h2>
        <Link href="/news" className="shrink-0 text-sm font-medium text-emerald-700 hover:underline">
          ดูข่าวสารทั้งหมด →
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {pick
          .filter((i) => i < pool.length)
          .map((i) => (
            <NewsCard key={pool[i].id} item={pool[i]} />
          ))}
      </div>
    </section>
  );
}
