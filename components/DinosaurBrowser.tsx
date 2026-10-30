"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Fuse from "fuse.js";
import type { BrowseItem } from "@/lib/dinosaurs";
import { DIET_LABELS, PERIOD_LABELS } from "@/lib/labels";
import { getDictionary } from "@/lib/dictionaries";
import { formatNumber, href, type Locale } from "@/lib/i18n";
import type { Diet } from "@/types/dinosaur";
import { BoneIcon, CloseIcon } from "@/components/Icons";
import { AiBadge } from "@/components/AiImageDisclosure";

const PERIOD_OPTIONS = ["Triassic", "Jurassic", "Cretaceous"] as const;
const DIET_OPTIONS: Diet[] = ["carnivore", "herbivore", "omnivore", "unknown"];

export function DinosaurBrowser({ items, lang }: { items: BrowseItem[]; lang: Locale }) {
  const t = getDictionary(lang).browse;
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<string>("all");
  const [diet, setDiet] = useState<string>("all");
  const [imageOnly, setImageOnly] = useState(false);
  const [thailandOnly, setThailandOnly] = useState(false);
  // ISO code from the fossil map's "see all" link; there is no dropdown for it, only a removable chip.
  const [country, setCountry] = useState<string | null>(null);

  // Picks up ?q= from the homepage search form. Read directly from the URL (rather than
  // useSearchParams) so this page can stay statically exported without a Suspense boundary.
  // A one-time read of browser state on mount, not state derived from props/existing state,
  // so syncing it via effect is the correct pattern despite the lint rule's default heuristic.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(q);
    }
    const c = params.get("country");
    if (c && /^[A-Z]{2}$/.test(c)) setCountry(c);
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["name", "localName"],
        threshold: 0.3,
      }),
    [items]
  );

  const results = useMemo(() => {
    let list = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : items;
    if (period !== "all") list = list.filter((d) => d.period === period);
    if (diet !== "all") list = list.filter((d) => d.diet === diet);
    if (imageOnly) list = list.filter((d) => d.thumbnail);
    if (thailandOnly) list = list.filter((d) => d.countries.includes("TH"));
    // PBDB writes the United Kingdom as "UK"; the map links with ISO "GB". Like the map, leave out
    // genera with no Mesozoic period (modern birds), so "see all 63" shows 63.
    if (country)
      list = list.filter((d) => d.period !== "unknown" && (d.countries.includes(country) || (country === "GB" && d.countries.includes("UK"))));
    return list;
  }, [query, period, diet, imageOnly, thailandOnly, country, fuse, items]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-100 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchLabel}
          className="min-h-11 w-full flex-1 rounded-lg border border-stone-300 px-3 py-2 text-base focus:border-emerald-500 sm:text-sm sm:min-w-[200px]"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label={t.periodLabel}
          className="min-h-11 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm"
        >
          <option value="all">{t.allPeriods}</option>
          {PERIOD_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABELS[lang][p]}
            </option>
          ))}
        </select>
        <select
          value={diet}
          onChange={(e) => setDiet(e.target.value)}
          aria-label={t.dietLabel}
          className="min-h-11 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm"
        >
          <option value="all">{t.allDiets}</option>
          {DIET_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {DIET_LABELS[lang][d]}
            </option>
          ))}
        </select>
        <div className="flex gap-5">
          <label className="flex min-h-11 items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" className="h-4 w-4 accent-emerald-700" checked={imageOnly} onChange={(e) => setImageOnly(e.target.checked)} />
            {t.withImage}
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" className="h-4 w-4 accent-emerald-700" checked={thailandOnly} onChange={(e) => setThailandOnly(e.target.checked)} />
            {t.inThailand}
          </label>
        </div>
      </div>

      {country && (
        <button
          type="button"
          onClick={() => {
            setCountry(null);
            const url = new URL(window.location.href);
            url.searchParams.delete("country");
            window.history.replaceState(null, "", url);
          }}
          aria-label={t.clearCountry(new Intl.DisplayNames([lang], { type: "region" }).of(country) ?? country)}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-50 px-4 text-sm font-medium text-amber-700"
        >
          {t.countryChip(new Intl.DisplayNames([lang], { type: "region" }).of(country) ?? country)}
          <CloseIcon className="h-4 w-4" />
        </button>
      )}

      <p className="mt-4 text-sm text-stone-500" aria-live="polite">{t.results(formatNumber(lang, results.length))}</p>

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {results.map((d) => (
          <li key={d.slug}>
            <Link
              href={href(lang, `/dinosaurs/${d.slug}`)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm transition hover:border-emerald-500 hover:shadow-lg motion-safe:hover:-translate-y-1"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
                {d.thumbnail ? (
                  <Image
                    src={d.thumbnail}
                    alt={d.localName ?? d.name}
                    fill
                    sizes="(min-width: 768px) 200px, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-stone-200 text-emerald-800">
                    <BoneIcon className="h-8 w-8 opacity-60" />
                  </div>
                )}
                {d.thumbnailIsAi && <AiBadge lang={lang} className="absolute left-2 top-2" percent={d.thumbnailAiScore ?? undefined} />}
              </div>
              <div className="p-2">
                <p className="truncate text-sm font-semibold text-stone-900 group-hover:text-emerald-700">
                  {d.localName ?? d.name}
                </p>
                {d.localName && <p className="truncate text-xs italic text-stone-500">{d.name}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className="mt-8 text-center text-stone-500">{t.noResults}</p>
      )}
    </div>
  );
}
