/**
 * Ranks dinosaurs by English Wikipedia pageviews over the last 12 full months and writes
 * the top entries to data/popularity.json, for the "ไดโนเสาร์ยอดฮิต" section.
 *
 * Pipeline: wikidataId → enwiki article title (Wikidata sitelinks) → monthly user
 * pageviews (Wikimedia Pageviews API). Only bots/spiders are excluded (agent=user).
 *
 * Genera whose range reaches past the end of the Cretaceous (modern bird genera in the
 * PBDB data, e.g. Alectoris) are skipped, since their pageviews reflect living birds.
 *
 * Run with: npm run fetch:popularity
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Dinosaur } from "../types/dinosaur";
import type { PopularityData } from "../types/popularity";

const WIKIMEDIA_UA =
  process.env.WIKIMEDIA_UA ??
  "dino-wiki/0.1 (Thai dinosaur encyclopedia; https://github.com/; contact via repo issues)";

const DATA_PATH = path.join(__dirname, "..", "data", "dinosaurs.json");
const OUTPUT_PATH = path.join(__dirname, "..", "data", "popularity.json");
const TOP_N = 50;
const CONCURRENCY = 3;
const END_OF_CRETACEOUS_MA = 66;

async function getJson<T>(url: string): Promise<T | null> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": WIKIMEDIA_UA } });
    if (res.status === 404) return null;
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 5000 * 2 ** attempt));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return (await res.json()) as T;
  }
  throw new Error(`Gave up after repeated 429s: ${url}`);
}

/** Last 12 complete calendar months, as [first day, last day] in UTC. */
function last12Months(now = new Date()): [Date, Date] {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 11, 1));
  return [start, end];
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const compact = (d: Date) => ymd(d).replaceAll("-", "");

async function getEnwikiTitles(wikidataIds: string[]): Promise<Map<string, string>> {
  const titles = new Map<string, string>();
  for (let i = 0; i < wikidataIds.length; i += 50) {
    const ids = wikidataIds.slice(i, i + 50).join("|");
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=sitelinks&sitefilter=enwiki&format=json`;
    const data = await getJson<{ entities: Record<string, { sitelinks?: { enwiki?: { title: string } } }> }>(url);
    for (const [id, entity] of Object.entries(data?.entities ?? {})) {
      const title = entity.sitelinks?.enwiki?.title;
      if (title) titles.set(id, title);
    }
  }
  return titles;
}

async function getViews(title: string, start: Date, end: Date): Promise<number> {
  const article = encodeURIComponent(title.replaceAll(" ", "_"));
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${article}/monthly/${compact(start)}00/${compact(end)}00`;
  const data = await getJson<{ items: { views: number }[] }>(url);
  return data?.items.reduce((sum, m) => sum + m.views, 0) ?? 0;
}

async function main() {
  const dinosaurs = JSON.parse(await readFile(DATA_PATH, "utf8")) as Dinosaur[];
  const candidates = dinosaurs.filter((d) => d.wikidataId && d.ageRangeMa[1] >= END_OF_CRETACEOUS_MA);
  const [start, end] = last12Months();

  console.log(`Resolving enwiki titles for ${candidates.length} dinosaurs…`);
  const titles = await getEnwikiTitles(candidates.map((d) => d.wikidataId!));

  const withTitle = candidates.filter((d) => titles.has(d.wikidataId!));
  console.log(`Fetching pageviews ${ymd(start)} → ${ymd(end)} for ${withTitle.length} articles…`);

  const results: PopularityData["items"] = [];
  let next = 0;
  async function worker() {
    while (next < withTitle.length) {
      const d = withTitle[next++];
      const title = titles.get(d.wikidataId!)!;
      results.push({ slug: d.slug, wikipediaTitle: title, views: await getViews(title, start, end) });
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  results.sort((a, b) => b.views - a.views);
  const output: PopularityData = {
    generatedAt: new Date().toISOString(),
    periodStart: ymd(start),
    periodEnd: ymd(end),
    items: results.slice(0, TOP_N),
  };
  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");
  console.log(`Wrote top ${output.items.length} to ${OUTPUT_PATH}`);
  console.table(output.items.slice(0, 15));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
