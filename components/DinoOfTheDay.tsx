"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DailyItem } from "@/lib/daily";
import { DIET_LABELS, PERIOD_LABELS } from "@/lib/labels";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, type Locale } from "@/lib/i18n";
import { AiBadge } from "@/components/AiImageDisclosure";

/** Days since 1970-01-01 in the visitor's own time zone, so the pick changes at their midnight. */
function localDayNumber(now = new Date()): number {
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000);
}

export function DinoOfTheDay({ pool, lang }: { pool: DailyItem[]; lang: Locale }) {
  const t = getDictionary(lang).daily;
  // Picked after mount: the static HTML was built on some other day, so choosing during render
  // would show a stale dinosaur and mismatch on hydration. Everyone sees the same one per day.
  const [item, setItem] = useState<DailyItem | null>(null);
  useEffect(() => {
    if (pool.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItem(pool[localDayNumber() % pool.length]);
  }, [pool]);

  if (!item) return <div className="h-64 rounded-2xl border border-stone-200 bg-stone-100" aria-hidden="true" />;

  const name = item.localName ?? item.name;
  return (
    <div className="grid overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 sm:grid-cols-[2fr_3fr]">
      <div className="relative aspect-4/3 bg-stone-200 sm:aspect-auto sm:min-h-64">
        <Image src={item.thumbnail} alt={name} fill sizes="(min-width: 640px) 40vw, 100vw" className="object-cover" />
        {item.thumbnailIsAi && <AiBadge lang={lang} className="absolute left-2 top-2" />}
      </div>
      <div className="flex flex-col p-5 sm:p-6">
        <p className="text-sm font-semibold text-amber-700">{t.eyebrow}</p>
        <h3 className="mt-1 text-2xl font-bold text-stone-900">{name}</h3>
        {item.localName && <p className="text-sm italic text-stone-500">{item.name}</p>}
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-700">
          {item.period && (
            <div className="flex gap-1.5">
              <dt className="text-stone-500">{t.period}</dt>
              <dd>{PERIOD_LABELS[lang][item.period]}</dd>
            </div>
          )}
          {item.lengthM && (
            <div className="flex gap-1.5">
              <dt className="text-stone-500">{t.length}</dt>
              <dd>{t.meters(formatNumber(lang, item.lengthM))}</dd>
            </div>
          )}
          {item.diet && (
            <div className="flex gap-1.5">
              <dt className="text-stone-500">{t.diet}</dt>
              <dd>{DIET_LABELS[lang][item.diet]}</dd>
            </div>
          )}
        </dl>
        {item.fact && <p className="mt-3 leading-relaxed text-stone-800">✨ {item.fact}</p>}
        <div className="mt-auto flex flex-wrap gap-x-5 pt-4 text-sm font-medium">
          <Link href={href(lang, `/dinosaurs/${item.slug}`)} className="inline-flex min-h-11 items-center text-emerald-700 hover:underline">
            {t.readMore(name)} →
          </Link>
          {item.lengthM && (
            <Link
              href={`${href(lang, "/size-compare")}?d=${item.slug},tyrannosaurus`}
              className="inline-flex min-h-11 items-center text-emerald-700 hover:underline"
            >
              📐 {t.compare}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
