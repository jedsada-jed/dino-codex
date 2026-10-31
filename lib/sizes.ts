import curatedData from "@/data/sizes-curated.json";
import wikidataData from "@/data/sizes-wikidata.json";
import { countryName, displayName, getAllDinosaurs, getPeriod, type PeriodKey } from "@/lib/dinosaurs";
import formationsData from "@/data/formations.json";
import { getCoverImage } from "@/lib/ai-images";
import type { Locale } from "@/lib/i18n";
import type { Diet, Dinosaur } from "@/types/dinosaur";

/** Silhouette used on /size-compare; see components/Silhouettes.tsx. */
export type BodyPlan = "theropod" | "sauropod" | "ceratopsian" | "stegosaur" | "ankylosaur" | "ornithopod";

interface CuratedSize {
  lengthM: number;
  massKg?: number;
}

const curated = curatedData as unknown as Record<string, CuratedSize>;
const wikidata = wikidataData as Record<string, number>;
/** Formation names per slug, most occurrences first (scripts/fetch-formations.ts). */
const formations = formationsData as unknown as Record<string, [string, number][]>;

const PLAN_BY_FAMILY: Record<string, BodyPlan> = {
  Ceratopsidae: "ceratopsian",
  Protoceratopsidae: "ceratopsian",
  Leptoceratopsidae: "ceratopsian",
  Stegosauridae: "stegosaur",
  Huayangosauridae: "stegosaur",
  Ankylosauridae: "ankylosaur",
  Nodosauridae: "ankylosaur",
  Scelidosauridae: "ankylosaur",
};

function bodyPlan(d: Dinosaur): BodyPlan {
  const byFamily = d.family ? PLAN_BY_FAMILY[d.family] : undefined;
  if (byFamily) return byFamily;
  if (d.clade === "Sauropodomorpha") return "sauropod";
  if (d.clade === "Ornithischia") return "ornithopod";
  return "theropod";
}

export interface SizeItem {
  slug: string;
  name: string;
  /** Name in the page language when it differs from the scientific name. */
  localName: string | null;
  lengthM: number;
  massKg: number | null;
  plan: BodyPlan;
  thumbnail: string | null;
  thailand: boolean;
  /** The rest is for the side-by-side table under the silhouettes. */
  period: PeriodKey | "unknown";
  diet: Diet;
  ageRangeMa: [number, number];
  /** Country names in the page language. */
  countries: string[];
  /** The formation with the most finds, if PBDB records one. */
  formation: string | null;
  namedBy: string;
}

/** Every dinosaur with a known length, longest first. Hand-checked sizes win over Wikidata. */
export function getSizeIndex(lang: Locale): SizeItem[] {
  const items: SizeItem[] = [];
  for (const d of getAllDinosaurs()) {
    const lengthM = curated[d.slug]?.lengthM ?? wikidata[d.slug];
    if (!lengthM) continue;
    const local = displayName(d, lang);
    items.push({
      slug: d.slug,
      name: d.name,
      localName: local === d.name ? null : local,
      lengthM,
      massKg: curated[d.slug]?.massKg ?? null,
      plan: bodyPlan(d),
      thumbnail: getCoverImage(d).image?.localSmall ?? null,
      thailand: d.countries.includes("TH"),
      period: getPeriod(d),
      diet: d.diet,
      ageRangeMa: d.ageRangeMa,
      countries: d.countries.map((c) => countryName(c, lang)),
      formation: formations[d.slug]?.[0]?.[0] ?? null,
      namedBy: `${d.namingAuthor}, ${d.namingYear}`,
    });
  }
  return items.sort((a, b) => b.lengthM - a.lengthM);
}

export function hasSize(slug: string): boolean {
  return Boolean(curated[slug]?.lengthM ?? wikidata[slug]);
}
