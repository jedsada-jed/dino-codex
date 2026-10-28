import dinosaursData from "@/data/dinosaurs.json";
import contentThData from "@/data/content-th.json";
import contentEnData from "@/data/content-en.json";
import metaData from "@/data/meta.json";
import type { Dinosaur, DinosaurThaiContent, PipelineMeta } from "@/types/dinosaur";
import { aiImageScore, getCoverImage } from "@/lib/ai-images";
import { fallbackNameTh } from "@/lib/names-th";
import type { Locale } from "@/lib/i18n";

// `ageRangeMa` is a fixed-length tuple, but TypeScript infers a plain `number[]` from JSON
// module content, so the cast needs to go through `unknown` first.
const dinosaurs = dinosaursData as unknown as Dinosaur[];
const contentTh = contentThData as Record<string, DinosaurThaiContent>;
const meta = metaData as PipelineMeta;

/** Hand-written English counterparts of content-th.json (name meaning, size, description, facts). */
interface EnglishContent {
  nameMeaning: string;
  sizeComparison?: string;
  description?: string;
  funFacts: string[];
}
const contentEn = contentEnData as Record<string, EnglishContent>;

export interface DinosaurWithContent extends Dinosaur {
  content: DinosaurThaiContent | null;
}

function attachContent(d: Dinosaur): DinosaurWithContent {
  return { ...d, content: contentTh[d.slug] ?? null };
}

export function getAllDinosaurs(): DinosaurWithContent[] {
  return dinosaurs.map(attachContent);
}

export function getDinosaurBySlug(slug: string): DinosaurWithContent | undefined {
  const found = dinosaurs.find((d) => d.slug === slug);
  return found ? attachContent(found) : undefined;
}

export function getAllSlugs(): string[] {
  return dinosaurs.map((d) => d.slug);
}

export function getThailandDinosaurs(): DinosaurWithContent[] {
  return getAllDinosaurs().filter((d) => d.countries.includes("TH"));
}

export function getMeta(): PipelineMeta {
  return meta;
}

/** Dinosaurs with both an image and hand-written Thai content, for homepage highlights. */
export function getFeaturedDinosaurs(limit = 6): DinosaurWithContent[] {
  return getAllDinosaurs()
    .filter((d) => d.content && d.images.length > 0)
    .slice(0, limit);
}

export const PERIODS = [
  { key: "Triassic", minMa: 201.4, maxMa: 251.9 },
  { key: "Jurassic", minMa: 145, maxMa: 201.4 },
  { key: "Cretaceous", minMa: 66, maxMa: 145 },
] as const;

export type PeriodKey = (typeof PERIODS)[number]["key"];

/** Classifies a dinosaur's period by where the midpoint of its age range falls. */
export function getPeriod(d: Dinosaur): PeriodKey | "unknown" {
  const mid = (d.ageRangeMa[0] + d.ageRangeMa[1]) / 2;
  for (const p of PERIODS) {
    if (mid >= p.minMa && mid <= p.maxMa) return p.key;
  }
  return "unknown";
}

const regionNames: Partial<Record<Locale, Intl.DisplayNames>> = {};

/** Country name in the page language, from an ISO 3166-1 alpha-2 code. */
export function countryName(code: string, lang: Locale): string {
  regionNames[lang] ??= new Intl.DisplayNames([lang], { type: "region" });
  // PBDB uses a few non-ISO codes (e.g. "UK"), which Intl rejects.
  try {
    return regionNames[lang]!.of(code === "UK" ? "GB" : code) ?? code;
  } catch {
    return code;
  }
}

/** Name to show: Thai name in Thai (hand-written, else our transliteration), scientific name in English. */
export function displayName(d: Pick<DinosaurWithContent, "slug" | "name" | "content">, lang: Locale): string {
  if (lang === "en") return d.name;
  return d.content?.nameTh ?? fallbackNameTh(d.slug) ?? d.name;
}

export interface LocalContent {
  nameMeaning: string;
  sizeComparison?: string;
  description?: string;
  funFacts: string[];
}

/** Write-up in the page language, or null when that language has none. */
export function localContent(d: DinosaurWithContent, lang: Locale): LocalContent | null {
  if (lang === "en") return contentEn[d.slug] ?? null;
  const c = d.content;
  if (!c) return null;
  return { nameMeaning: c.nameMeaningTh, sizeComparison: c.sizeComparisonTh, description: c.descriptionTh, funFacts: c.funFactsTh };
}

export interface BrowseItem {
  slug: string;
  name: string;
  /** Name in the page language when it differs from the scientific name. */
  localName: string | null;
  diet: Dinosaur["diet"];
  clade: Dinosaur["clade"];
  period: PeriodKey | "unknown";
  countries: string[];
  thumbnail: string | null;
  thumbnailIsAi: boolean;
  /** Prompt-accuracy percent when the thumbnail is a reviewed AI image. */
  thumbnailAiScore: number | null;
}

/** Slim, client-safe index for the search/filter UI on /dinosaurs — avoids shipping the full dataset to the browser. */
export function getBrowseIndex(lang: Locale): BrowseItem[] {
  return getAllDinosaurs().map((d) => {
    const cover = getCoverImage(d);
    const local = displayName(d, lang);
    return {
    slug: d.slug,
    name: d.name,
    localName: local === d.name ? null : local,
    diet: d.diet,
    clade: d.clade,
    period: getPeriod(d),
    countries: d.countries,
    thumbnail: cover.image?.localSmall ?? null,
    thumbnailIsAi: cover.ai !== null,
    thumbnailAiScore: cover.ai ? (aiImageScore(cover.ai)?.percent ?? null) : null,
  };
  });
}
