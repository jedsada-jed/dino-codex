import popularityData from "@/data/popularity.json";
import { getDinosaurBySlug, type DinosaurWithContent } from "@/lib/dinosaurs";
import type { PopularityData } from "@/types/popularity";

const popularity = popularityData as PopularityData;


export interface PopularDinosaur {
  rank: number;
  dinosaur: DinosaurWithContent;
  views: number;
  wikipediaTitle: string;
}

export function getPopularDinosaurs(limit = 20): PopularDinosaur[] {
  const result: PopularDinosaur[] = [];
  for (const item of popularity.items) {
    if (result.length >= limit) break;
    const dinosaur = getDinosaurBySlug(item.slug);
    if (!dinosaur) continue;
    result.push({
      rank: result.length + 1,
      dinosaur,
      views: item.views,
      wikipediaTitle: item.wikipediaTitle,
    });
  }
  return result;
}


export function getPopularityPeriod(): { start: string; end: string } {
  return { start: popularity.periodStart, end: popularity.periodEnd };
}

/** Wikimedia's Pageviews Analysis tool for the same articles and range, so readers can check the numbers. */
export function pageviewsToolUrl(titles: string[], period: { start: string; end: string }): string {
  const params = new URLSearchParams({
    project: "en.wikipedia.org",
    platform: "all-access",
    agent: "user",
    start: period.start,
    end: period.end,
    pages: titles.slice(0, 10).map((t) => t.replaceAll(" ", "_")).join("|"),
  });
  return `https://pageviews.wmcloud.org/?${params}`;
}
