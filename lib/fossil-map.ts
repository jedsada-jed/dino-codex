import worldMapData from "@/data/world-map.json";
import { countryName, displayName, getAllDinosaurs, getPeriod } from "@/lib/dinosaurs";
import { getCoverImage } from "@/lib/ai-images";
import type { Locale } from "@/lib/i18n";

/** Projected country outlines from scripts/build-world-map.ts, keyed by ISO alpha-2. */
export const WORLD_MAP = worldMapData as { width: number; height: number; paths: Record<string, string> };

/** Cards shown when a country is picked; the full list is one click away on /dinosaurs. */
const TOP_PER_COUNTRY = 8;

export interface MapDino {
  slug: string;
  label: string;
  /** Scientific name, when `label` is a Thai name. */
  sci: string | null;
  thumbnail: string | null;
}

export interface CountryStat {
  code: string;
  name: string;
  count: number;
  top: MapDino[];
}

/** PBDB writes the United Kingdom as "UK"; the map and Intl use ISO "GB". */
export const toIso = (code: string) => (code === "UK" ? "GB" : code);

/**
 * Genera per country, most first. Only genera dated to a Mesozoic period count: the PBDB data
 * also has modern bird genera (e.g. Alectoris), which would otherwise put "dinosaur finds" on
 * Pacific islands. /dinosaurs?country= applies the same rule, so the counts match.
 */
export function getCountryStats(lang: Locale): { stats: CountryStat[]; genera: number } {
  const byCountry = new Map<string, ReturnType<typeof getAllDinosaurs>>();
  // A genus found in several countries counts once here.
  const genera = new Set<string>();
  for (const d of getAllDinosaurs()) {
    if (getPeriod(d) === "unknown") continue;
    for (const c of d.countries) {
      const code = toIso(c);
      if (!WORLD_MAP.paths[code]) continue;
      byCountry.set(code, [...(byCountry.get(code) ?? []), d]);
      genera.add(d.slug);
    }
  }
  const stats = [...byCountry.entries()]
    .map(([code, list]) => ({
      code,
      name: countryName(code, lang),
      count: list.length,
      // Genera known only from this country first, so China isn't headed by Tyrannosaurus on the
      // strength of a few old referrals; then most fossil occurrences as a stand-in for "best known".
      top: [...list]
        .sort((a, b) => Number(a.countries.length > 1) - Number(b.countries.length > 1) || b.occurrenceCount - a.occurrenceCount)
        .slice(0, TOP_PER_COUNTRY)
        .map((d) => {
          const label = displayName(d, lang);
          return { slug: d.slug, label, sci: label === d.name ? null : d.name, thumbnail: getCoverImage(d).image?.localSmall ?? null };
        }),
    }))
    .sort((a, b) => b.count - a.count);
  return { stats, genera: genera.size };
}
