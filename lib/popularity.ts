import popularityData from "@/data/popularity.json";
import { getDinosaurBySlug, type DinosaurWithContent } from "@/lib/dinosaurs";
import type { PopularityData } from "@/types/popularity";

const popularity = popularityData as PopularityData;

/**
 * Thai names for popular genera that don't have hand-written content yet, so the
 * ranking doesn't fall back to scientific names. content-th.json wins when present.
 */
const POPULAR_NAMES_TH: Record<string, string> = {
  spinosaurus: "สไปโนซอรัส",
  allosaurus: "อัลโลซอรัส",
  archaeopteryx: "อาร์คีออปเทอริกซ์",
  giganotosaurus: "จิกาโนโตซอรัส",
  ankylosaurus: "แองคิโลซอรัส",
  dilophosaurus: "ไดโลโฟซอรัส",
  therizinosaurus: "เทอริซิโนซอรัส",
  deinonychus: "ไดโนนิคัส",
  carnotaurus: "คาร์โนทอรัส",
  utahraptor: "ยูทาห์แรปเตอร์",
  diplodocus: "ดิพลอโดคัส",
  parasaurolophus: "พาราซอโรโลฟัส",
  pachycephalosaurus: "แพคีเซฟาโลซอรัส",
  iguanodon: "อิกัวโนดอน",
  brontosaurus: "บรอนโตซอรัส",
  argentinosaurus: "อาร์เจนติโนซอรัส",
  apatosaurus: "อะแพโทซอรัส",
};

export interface PopularDinosaur {
  rank: number;
  dinosaur: DinosaurWithContent;
  nameTh: string | null;
  views: number;
  wikipediaTitle: string;
}

export function getPopularDinosaurs(limit = 10): PopularDinosaur[] {
  const result: PopularDinosaur[] = [];
  for (const item of popularity.items) {
    if (result.length >= limit) break;
    const dinosaur = getDinosaurBySlug(item.slug);
    if (!dinosaur) continue;
    result.push({
      rank: result.length + 1,
      dinosaur,
      nameTh: dinosaur.content?.nameTh ?? POPULAR_NAMES_TH[item.slug] ?? null,
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
