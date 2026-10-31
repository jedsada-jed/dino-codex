"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SizeItem } from "@/lib/sizes";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, type Locale } from "@/lib/i18n";
import { CloseIcon } from "@/components/Icons";
import { DIET_LABELS, PERIOD_LABELS } from "@/lib/labels";
import { BUS_LENGTH_M, BUS_SHAPE, BUS_WHEELS, DINO_SHAPES, HUMAN_HEIGHT_M, HUMAN_SHAPE } from "@/components/Silhouettes";

const MAX_SELECTED = 5;
/** Fixed series fills, mid-tone so they read on both the light and dark page background. */
const SERIES_COLORS = ["#2f9e6a", "#e0a352", "#3f86ad", "#c2410c", "#8b5cf6"];
const GRID_STEPS = [0.5, 1, 2, 5, 10, 20];
/** The stage scrolls sideways rather than shrinking below this height... */
const MIN_STAGE_PX = 180;
/** ...and is never wider than this, so on desktop it fits without scrolling (extra sky on top). */
const MAX_ASPECT = 4.5;

interface Placed {
  key: string;
  x: number;
  width: number;
  height: number;
}

function round(n: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function SizeCompare({
  items,
  lang,
  defaults,
  popular,
}: {
  items: SizeItem[];
  lang: Locale;
  defaults: string[];
  popular: string[];
}) {
  const t = getDictionary(lang).sizeCompare;
  const bySlug = useMemo(() => new Map(items.map((d) => [d.slug, d])), [items]);
  const [selected, setSelected] = useState<string[]>(defaults);
  const [showBus, setShowBus] = useState(false);
  const [query, setQuery] = useState("");

  // ?d=slug,slug makes a comparison shareable. Read once on mount from the URL (not
  // useSearchParams) so the page stays statically exported, as DinosaurBrowser does.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("d");
    if (!fromUrl) return;
    const slugs = fromUrl.split(",").filter((s) => bySlug.has(s)).slice(0, MAX_SELECTED);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (slugs.length > 0) setSelected(slugs);
  }, [bySlug]);

  function update(next: string[]) {
    setSelected(next);
    const url = new URL(window.location.href);
    if (next.length > 0) url.searchParams.set("d", next.join(","));
    else url.searchParams.delete("d");
    window.history.replaceState(null, "", url);
  }

  const add = (slug: string) => {
    if (selected.includes(slug) || selected.length >= MAX_SELECTED) return;
    update([...selected, slug]);
    setQuery("");
  };
  const remove = (slug: string) => update(selected.filter((s) => s !== slug));
  const randomize = () => {
    const pool = items.filter((d) => !selected.includes(d.slug));
    if (pool.length === 0 || selected.length >= MAX_SELECTED) return;
    add(pool[Math.floor(Math.random() * pool.length)].slug);
  };

  const fuse = useMemo(() => new Fuse(items, { keys: ["name", "localName"], threshold: 0.3 }), [items]);
  const suggestions = query.trim() ? fuse.search(query.trim(), { limit: 8 }).map((r) => r.item) : [];

  const chosen = selected.map((s) => bySlug.get(s)).filter((d): d is SizeItem => Boolean(d));
  const label = (d: SizeItem) => d.localName ?? d.name;
  const full = chosen.length >= MAX_SELECTED;

  // Lay everything out left to right on one ground line, in metres.
  const placed: Placed[] = [];
  const humanWidth = (HUMAN_SHAPE.w / HUMAN_SHAPE.h) * HUMAN_HEIGHT_M;
  const longest = Math.max(BUS_LENGTH_M * (showBus ? 1 : 0), humanWidth, ...chosen.map((d) => d.lengthM));
  const gap = Math.max(0.4, longest * 0.06);
  let cursor = gap;
  const put = (key: string, width: number, height: number) => {
    placed.push({ key, x: cursor, width, height });
    cursor += width + gap;
  };
  put("human", humanWidth, HUMAN_HEIGHT_M);
  if (showBus) put("bus", BUS_LENGTH_M, (BUS_SHAPE.h / BUS_SHAPE.w) * BUS_LENGTH_M);
  for (const d of chosen) put(d.slug, d.lengthM, (DINO_SHAPES[d.plan].h / 100) * d.lengthM);

  const stageW = cursor;
  const stageH = Math.max(Math.max(...placed.map((p) => p.height)) * 1.2, stageW / MAX_ASPECT);
  const step = GRID_STEPS.find((s) => stageW / s <= 12) ?? 50;
  const gridLines = Array.from({ length: Math.floor(stageW / step) + 1 }, (_, i) => i * step);
  const aspect = stageW / stageH;

  const fmtM = (m: number) => t.meters(formatNumber(lang, round(m)));
  const fmtMass = (kg: number) => (kg >= 1000 ? t.tonnes(formatNumber(lang, round(kg / 1000))) : t.kg(formatNumber(lang, kg)));

  const sortedChosen = [...chosen].sort((a, b) => b.lengthM - a.lengthM);
  const biggest = sortedChosen[0];
  const smallest = sortedChosen[sortedChosen.length - 1];

  const pickButton = (d: SizeItem) => {
    const isSelected = selected.includes(d.slug);
    return (
      <button
        key={d.slug}
        type="button"
        onClick={() => add(d.slug)}
        disabled={isSelected || full}
        aria-label={t.add(label(d))}
        className="flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-3 text-sm text-stone-700 transition-colors hover:border-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-stone-300 disabled:hover:text-stone-700"
      >
        <span>{label(d)}</span>
        <span className="text-xs text-stone-500">{fmtM(d.lengthM)}</span>
      </button>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-100 p-4">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && suggestions[0]) add(suggestions[0].slug);
            }}
            placeholder={full ? t.full : t.searchPlaceholder}
            aria-label={t.searchLabel}
            disabled={full}
            className="min-h-11 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-base focus:border-emerald-500 disabled:opacity-60 sm:text-sm"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-50 shadow-lg">
              {suggestions.map((d) => (
                <li key={d.slug}>
                  <button
                    type="button"
                    onClick={() => add(d.slug)}
                    disabled={selected.includes(d.slug)}
                    className="flex min-h-11 w-full items-center justify-between gap-3 px-3 text-left text-sm text-stone-800 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <span>
                      {label(d)}
                      {d.localName && <span className="ml-2 text-xs italic text-stone-500">{d.name}</span>}
                    </span>
                    <span className="text-xs text-stone-500">{fmtM(d.lengthM)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="text-sm text-stone-500">{t.limit(MAX_SELECTED)}</p>
          <label className="flex min-h-11 items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" className="h-4 w-4 accent-emerald-700" checked={showBus} onChange={(e) => setShowBus(e.target.checked)} />
            {t.showBus}
          </label>
          <div className="flex gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={randomize}
              disabled={full}
              className="min-h-11 rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-700 hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            >
              {t.random}
            </button>
            <button
              type="button"
              onClick={() => update([])}
              disabled={chosen.length === 0}
              className="min-h-11 rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-700 hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            >
              {t.clear}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50">
        <div className="relative" style={{ aspectRatio: `${aspect}`, minWidth: `max(100%, ${Math.round(aspect * MIN_STAGE_PX)}px)` }}>
          <svg
            viewBox={`0 0 ${stageW} ${stageH}`}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={t.stageLabel([t.human, ...(showBus ? [t.bus] : []), ...chosen.map((d) => `${label(d)} ${fmtM(d.lengthM)}`)].join(", "))}
          >
            {gridLines.map((x) => (
              <line key={x} x1={x} x2={x} y1={0} y2={stageH} className="stroke-stone-200" strokeWidth={stageW / 800} />
            ))}
            {placed.map((p) => {
              if (p.key === "human") {
                const s = p.height / HUMAN_SHAPE.h;
                return (
                  <path key={p.key} d={HUMAN_SHAPE.d} transform={`translate(${p.x} ${stageH - p.height}) scale(${s})`} className="fill-stone-500" />
                );
              }
              if (p.key === "bus") {
                const s = p.width / BUS_SHAPE.w;
                return (
                  <g key={p.key} transform={`translate(${p.x} ${stageH - p.height}) scale(${s})`}>
                    <path d={BUS_SHAPE.d} fillRule="evenodd" className="fill-stone-300" />
                    <path d={BUS_WHEELS} className="fill-stone-600" />
                  </g>
                );
              }
              const d = bySlug.get(p.key)!;
              const s = p.width / 100;
              return (
                <path
                  key={p.key}
                  d={DINO_SHAPES[d.plan].d}
                  fillRule="evenodd"
                  fill={SERIES_COLORS[selected.indexOf(p.key) % SERIES_COLORS.length]}
                  transform={`translate(${p.x} ${stageH - p.height}) scale(${s})`}
                />
              );
            })}
            <line x1={0} x2={stageW} y1={stageH} y2={stageH} className="stroke-stone-500" strokeWidth={stageW / 400} />
          </svg>

          {/* Labels are HTML, positioned in percent of the stage, so they stay crisp at any zoom. */}
          {placed.map((p) => {
            const d = bySlug.get(p.key);
            const text = p.key === "human" ? t.human : p.key === "bus" ? t.bus : d ? String(selected.indexOf(p.key) + 1) : "";
            return (
              <span
                key={p.key}
                aria-hidden="true"
                className={`absolute -translate-x-1/2 -translate-y-full whitespace-nowrap text-xs font-semibold ${
                  d ? "flex h-6 w-6 items-center justify-center rounded-full text-white" : "text-stone-600"
                }`}
                style={{
                  left: `${((p.x + p.width / 2) / stageW) * 100}%`,
                  top: `calc(${((stageH - p.height) / stageH) * 100}% - 4px)`,
                  backgroundColor: d ? SERIES_COLORS[selected.indexOf(p.key) % SERIES_COLORS.length] : undefined,
                }}
              >
                {text}
              </span>
            );
          })}
          {gridLines.slice(1).map((x) => (
            <span
              key={x}
              aria-hidden="true"
              className="absolute top-1 -translate-x-1/2 text-[11px] text-stone-500"
              style={{ left: `${(x / stageW) * 100}%` }}
            >
              {fmtM(x)}
            </span>
          ))}
        </div>
      </div>

      {chosen.length === 0 ? (
        <p className="mt-4 text-stone-500">{t.empty}</p>
      ) : (
        <>
          {chosen.length >= 2 && biggest.lengthM > smallest.lengthM && (
            <p className="mt-4 text-stone-700" aria-live="polite">
              {t.compareLine(label(biggest), label(smallest), formatNumber(lang, round(biggest.lengthM / smallest.lengthM)))}
            </p>
          )}
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chosen.map((d, i) => (
              <li key={d.slug} className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-100 p-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={href(lang, `/dinosaurs/${d.slug}`)} className="font-semibold text-stone-900 hover:text-emerald-700">
                    {label(d)}
                  </Link>
                  {d.localName && <p className="text-xs italic text-stone-500">{d.name}</p>}
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-sm text-stone-700">
                    <dt className="text-stone-500">{t.length}</dt>
                    <dd>{fmtM(d.lengthM)}</dd>
                    {d.massKg && (
                      <>
                        <dt className="text-stone-500">{t.mass}</dt>
                        <dd>{fmtMass(d.massKg)}</dd>
                      </>
                    )}
                  </dl>
                  <p className="mt-1 text-xs text-stone-500">
                    {d.lengthM >= BUS_LENGTH_M
                      ? t.timesBus(formatNumber(lang, round(d.lengthM / BUS_LENGTH_M)))
                      : t.timesHuman(formatNumber(lang, round(d.lengthM / HUMAN_HEIGHT_M)))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(d.slug)}
                  aria-label={t.remove(label(d))}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-500 hover:bg-stone-200 hover:text-stone-900"
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {chosen.length >= 2 && (
        <section className="mt-8" aria-labelledby="compare-table-heading">
          <h2 id="compare-table-heading" className="text-lg font-bold text-stone-900">
            {t.tableTitle}
          </h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-stone-100">
                <tr>
                  <th scope="col" className="w-36 px-3 py-2 font-medium text-stone-500">
                    <span className="sr-only">{t.tableAttribute}</span>
                  </th>
                  {chosen.map((d, i) => (
                    <th key={d.slug} scope="col" className="px-3 py-2 font-semibold text-stone-900">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
                          aria-hidden="true"
                        />
                        {label(d)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {(
                  [
                    [t.rowWhen, (d: SizeItem) => t.ma(formatNumber(lang, d.ageRangeMa[0]), formatNumber(lang, d.ageRangeMa[1]))],
                    [t.rowPeriod, (d: SizeItem) => PERIOD_LABELS[lang][d.period]],
                    [t.rowDiet, (d: SizeItem) => DIET_LABELS[lang][d.diet]],
                    [t.length, (d: SizeItem) => fmtM(d.lengthM)],
                    [t.mass, (d: SizeItem) => (d.massKg ? fmtMass(d.massKg) : "–")],
                    [t.rowFormation, (d: SizeItem) => d.formation ?? "–"],
                    [t.rowCountries, (d: SizeItem) => d.countries.join(", ") || "–"],
                    [t.rowNamedBy, (d: SizeItem) => d.namedBy],
                  ] as const
                ).map(([rowLabel, value]) => (
                  <tr key={rowLabel}>
                    <th scope="row" className="px-3 py-2 align-top font-medium text-stone-500">
                      {rowLabel}
                    </th>
                    {chosen.map((d) => (
                      <td key={d.slug} className="px-3 py-2 align-top text-stone-800">
                        {value(d)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-stone-500">{t.tableNote}</p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-stone-900">{t.popularTitle}</h2>
        <div className="mt-3 flex flex-wrap gap-2">{popular.map((s) => bySlug.get(s)).filter((d) => d !== undefined).map(pickButton)}</div>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-bold text-stone-900">{t.thailandTitle}</h2>
        <div className="mt-3 flex flex-wrap gap-2">{items.filter((d) => d.thailand).map(pickButton)}</div>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-bold text-stone-900">{t.longestTitle}</h2>
        <ol className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-stone-100">
          {items.slice(0, 10).map((d, i) => (
            <li key={d.slug} className="flex items-center gap-3 px-3 py-1">
              <span className="w-6 text-right text-sm font-semibold text-stone-500">{i + 1}</span>
              <Link href={href(lang, `/dinosaurs/${d.slug}`)} className="min-w-0 flex-1 truncate font-medium text-stone-900 hover:text-emerald-700">
                {label(d)}
              </Link>
              <span className="text-sm text-stone-600">{fmtM(d.lengthM)}</span>
              <button
                type="button"
                onClick={() => add(d.slug)}
                disabled={selected.includes(d.slug) || full}
                aria-label={t.add(label(d))}
                className="min-h-11 rounded-lg px-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
              >
                {selected.includes(d.slug) ? t.added : t.addShort}
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
