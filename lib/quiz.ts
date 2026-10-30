import popularityData from "@/data/popularity.json";
import { displayName, getAllDinosaurs, PERIODS, type PeriodKey } from "@/lib/dinosaurs";
import { getCoverImage } from "@/lib/ai-images";
import { getSizeIndex } from "@/lib/sizes";
import type { Locale } from "@/lib/i18n";
import type { Diet, Dinosaur } from "@/types/dinosaur";
import type { PopularityData } from "@/types/popularity";

/** Slim, client-safe facts the quiz builds its questions from. */
export interface QuizItem {
  slug: string;
  name: string;
  /** Name in the page language when it differs from the scientific name. */
  localName: string | null;
  /** The large rendition when there is one; the picture question shows it at up to ~450px. */
  thumbnail: string;
  thumbnailIsAi: boolean;
  /** Null when the known age range spans two periods, so "which period?" has no single answer. */
  period: PeriodKey | null;
  /** Null when PBDB has no diet for it. */
  diet: Exclude<Diet, "unknown"> | null;
  lengthM: number | null;
  thailand: boolean;
  ageRangeMa: [number, number];
}

function singlePeriod(d: Dinosaur): PeriodKey | null {
  const [oldest, youngest] = d.ageRangeMa;
  return PERIODS.find((p) => oldest <= p.maxMa && youngest >= p.minMa)?.key ?? null;
}

/**
 * Dinosaurs people are likely to have heard of (the popularity ranking), plus every Thai
 * dinosaur — a pool of obscure genera would make the quiz a guessing game. Only ones with an
 * image, since the picture is half the fun.
 */
export function getQuizPool(lang: Locale): QuizItem[] {
  const popular = new Set((popularityData as PopularityData).items.map((i) => i.slug));
  const lengths = new Map(getSizeIndex(lang).map((s) => [s.slug, s.lengthM]));
  const pool: QuizItem[] = [];
  for (const d of getAllDinosaurs()) {
    const thailand = d.countries.includes("TH");
    if (!popular.has(d.slug) && !thailand) continue;
    const cover = getCoverImage(d);
    const thumbnail = cover.image?.localLarge ?? cover.image?.localSmall;
    if (!thumbnail) continue;
    const local = displayName(d, lang);
    pool.push({
      slug: d.slug,
      name: d.name,
      localName: local === d.name ? null : local,
      thumbnail,
      thumbnailIsAi: cover.ai !== null,
      period: singlePeriod(d),
      diet: d.diet === "unknown" ? null : d.diet,
      lengthM: lengths.get(d.slug) ?? null,
      thailand,
      ageRangeMa: d.ageRangeMa,
    });
  }
  return pool;
}
