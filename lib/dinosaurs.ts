import dinosaursData from "@/data/dinosaurs.json";
import contentThData from "@/data/content-th.json";
import metaData from "@/data/meta.json";
import type { Dinosaur, DinosaurThaiContent, PipelineMeta } from "@/types/dinosaur";

const dinosaurs = dinosaursData as Dinosaur[];
const contentTh = contentThData as Record<string, DinosaurThaiContent>;
const meta = metaData as PipelineMeta;

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

const COUNTRY_NAMES_TH: Record<string, string> = {
  TH: "ไทย",
  US: "สหรัฐอเมริกา",
  CN: "จีน",
  CA: "แคนาดา",
  MN: "มองโกเลีย",
  AR: "อาร์เจนตินา",
  GB: "สหราชอาณาจักร",
  DE: "เยอรมนี",
  FR: "ฝรั่งเศส",
  AU: "ออสเตรเลีย",
  BR: "บราซิล",
  MX: "เม็กซิโก",
  ES: "สเปน",
  IN: "อินเดีย",
  JP: "ญี่ปุ่น",
  KR: "เกาหลีใต้",
  NE: "ไนเจอร์",
  MA: "โมร็อกโก",
  EG: "อียิปต์",
  ZA: "แอฟริกาใต้",
  RU: "รัสเซีย",
  RO: "โรมาเนีย",
  PT: "โปรตุเกส",
  IT: "อิตาลี",
  CH: "สวิตเซอร์แลนด์",
  PL: "โปแลนด์",
  NZ: "นิวซีแลนด์",
  LA: "ลาว",
  MM: "เมียนมา",
  MY: "มาเลเซีย",
};

export function countryNameTh(code: string): string {
  return COUNTRY_NAMES_TH[code] ?? code;
}

export interface BrowseItem {
  slug: string;
  name: string;
  nameTh: string | null;
  diet: Dinosaur["diet"];
  clade: Dinosaur["clade"];
  period: PeriodKey | "unknown";
  countries: string[];
  thumbnail: string | null;
}

/** Slim, client-safe index for the search/filter UI on /dinosaurs — avoids shipping the full dataset to the browser. */
export function getBrowseIndex(): BrowseItem[] {
  return getAllDinosaurs().map((d) => ({
    slug: d.slug,
    name: d.name,
    nameTh: d.content?.nameTh ?? null,
    diet: d.diet,
    clade: d.clade,
    period: getPeriod(d),
    countries: d.countries,
    thumbnail: d.images[0]?.localSmall ?? null,
  }));
}
