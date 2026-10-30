"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CountryStat } from "@/lib/fossil-map";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, type Locale } from "@/lib/i18n";
import { BoneIcon } from "@/components/Icons";

/** Lower bounds of the shading steps (genera per country); counts run from 1 to ~400. */
const STEPS = [1, 10, 50, 200];
const STEP_OPACITY = [0.3, 0.5, 0.75, 1];
const RANKING_SIZE = 15;

const stepOf = (count: number) => STEPS.findLastIndex((min) => count >= min);

export function FossilMap({
  map,
  stats,
  lang,
  initial,
}: {
  map: { width: number; height: number; paths: Record<string, string> };
  stats: CountryStat[];
  lang: Locale;
  initial: string;
}) {
  const t = getDictionary(lang).fossilMap;
  const byCode = new Map(stats.map((s) => [s.code, s]));
  const [selected, setSelected] = useState(initial);
  const current = byCode.get(selected);
  const max = stats[0]?.count ?? 1;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 p-2 sm:p-4">
        <svg viewBox={`0 0 ${map.width} ${map.height}`} className="h-auto w-full" role="img" aria-label={t.mapLabel}>
          {Object.entries(map.paths).map(([code, d]) => {
            const stat = byCode.get(code);
            if (!stat) return <path key={code} d={d} className="fill-stone-200 stroke-stone-50" strokeWidth={0.5} />;
            const isSelected = code === selected;
            return (
              <path
                key={code}
                d={d}
                onClick={() => setSelected(code)}
                className={`cursor-pointer stroke-stone-50 transition-opacity hover:opacity-80 ${isSelected ? "fill-amber-700" : "fill-emerald-600"}`}
                fillOpacity={isSelected ? 1 : STEP_OPACITY[stepOf(stat.count)]}
                strokeWidth={0.5}
              >
                <title>{t.tooltip(stat.name, formatNumber(lang, stat.count))}</title>
              </path>
            );
          })}
        </svg>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-stone-600" aria-hidden="true">
          {STEPS.map((min, i) => (
            <span key={min} className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded-sm bg-emerald-600" style={{ opacity: STEP_OPACITY[i] }} />
              {i + 1 < STEPS.length ? `${min}–${STEPS[i + 1] - 1}` : `${min}+`}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-sm bg-amber-700" />
            {t.selected}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section>
          <h2 className="text-lg font-bold text-stone-900">{t.rankingTitle}</h2>
          <ol className="mt-3 space-y-1">
            {stats.slice(0, RANKING_SIZE).map((s, i) => (
              <li key={s.code}>
                <button
                  type="button"
                  onClick={() => setSelected(s.code)}
                  aria-pressed={s.code === selected}
                  className={`grid min-h-11 w-full grid-cols-[1.5rem_minmax(0,8rem)_1fr_auto] items-center gap-2 rounded-lg px-2 text-left text-sm transition-colors ${
                    s.code === selected ? "bg-amber-50 text-stone-900" : "text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  <span className="text-right text-stone-500">{i + 1}</span>
                  <span className="truncate font-medium">{s.name}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
                    <span
                      className={`block h-full rounded-full ${s.code === selected ? "bg-amber-700" : "bg-emerald-600"}`}
                      style={{ width: `${(s.count / max) * 100}%` }}
                    />
                  </span>
                  <span className="text-right tabular-nums text-stone-600">{formatNumber(lang, s.count)}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>

        {current && (
          <section aria-live="polite">
            <h2 className="text-lg font-bold text-stone-900">{current.name}</h2>
            <p className="mt-1 text-stone-600">{t.countryLead(formatNumber(lang, current.count))}</p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {current.top.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={href(lang, `/dinosaurs/${d.slug}`)}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-100 transition hover:border-emerald-500"
                  >
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-200">
                      {d.thumbnail ? (
                        <Image src={d.thumbnail} alt={d.label} fill sizes="(min-width: 1024px) 150px, 45vw" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-emerald-800">
                          <BoneIcon className="h-7 w-7 opacity-60" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-sm font-semibold text-stone-900 group-hover:text-emerald-700">{d.label}</p>
                      {d.sci && <p className="truncate text-xs italic text-stone-500">{d.sci}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`${href(lang, "/dinosaurs")}?country=${current.code}`}
              className="mt-3 inline-flex min-h-11 items-center font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              {t.seeAll(formatNumber(lang, current.count), current.name)} →
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
