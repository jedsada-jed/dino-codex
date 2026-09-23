"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Fuse from "fuse.js";
import type { BrowseItem } from "@/lib/dinosaurs";
import { DIET_LABELS_TH, PERIOD_LABELS_TH } from "@/lib/labels";
import type { Diet } from "@/types/dinosaur";

const PERIOD_OPTIONS = ["Triassic", "Jurassic", "Cretaceous"] as const;
const DIET_OPTIONS: Diet[] = ["carnivore", "herbivore", "omnivore", "unknown"];

export function DinosaurBrowser({ items }: { items: BrowseItem[] }) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<string>("all");
  const [diet, setDiet] = useState<string>("all");
  const [imageOnly, setImageOnly] = useState(false);
  const [thailandOnly, setThailandOnly] = useState(false);

  // Picks up ?q= from the homepage search form. Read directly from the URL (rather than
  // useSearchParams) so this page can stay statically exported without a Suspense boundary.
  // A one-time read of browser state on mount, not state derived from props/existing state,
  // so syncing it via effect is the correct pattern despite the lint rule's default heuristic.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(q);
    }
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["name", "nameTh"],
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
    return list;
  }, [query, period, diet, imageOnly, thailandOnly, fuse, items]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อไดโนเสาร์..."
          aria-label="ค้นหาชื่อไดโนเสาร์"
          className="w-full flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none sm:min-w-[200px]"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="กรองตามยุค"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="all">ทุกยุค</option>
          {PERIOD_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABELS_TH[p]}
            </option>
          ))}
        </select>
        <select
          value={diet}
          onChange={(e) => setDiet(e.target.value)}
          aria-label="กรองตามอาหาร"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="all">ทุกประเภทอาหาร</option>
          {DIET_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {DIET_LABELS_TH[d]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={imageOnly} onChange={(e) => setImageOnly(e.target.checked)} />
          มีภาพประกอบ
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={thailandOnly} onChange={(e) => setThailandOnly(e.target.checked)} />
          พบในไทย
        </label>
      </div>

      <p className="mt-4 text-sm text-stone-500">พบ {results.length.toLocaleString("th-TH")} รายการ</p>

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {results.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/dinosaurs/${d.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
                {d.thumbnail ? (
                  <Image
                    src={d.thumbnail}
                    alt={d.nameTh ?? d.name}
                    fill
                    sizes="(min-width: 768px) 200px, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-stone-200 text-3xl">
                    🦴
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-sm font-semibold text-stone-900 group-hover:text-emerald-700">
                  {d.nameTh ?? d.name}
                </p>
                <p className="truncate text-xs italic text-stone-500">{d.name}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className="mt-8 text-center text-stone-500">ไม่พบไดโนเสาร์ที่ตรงกับเงื่อนไข ลองปรับตัวกรองดูใหม่</p>
      )}
    </div>
  );
}
