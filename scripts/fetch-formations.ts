/**
 * Records which rock formations each genus was found in, from every Mesozoic dinosaur occurrence
 * in the Paleobiology Database, and writes data/formations.json keyed by slug.
 *
 * Used for "lived alongside" on dinosaur pages: two genera from the same formation were buried in
 * the same rocks, a far better sign that they shared a time and place than a shared country plus
 * PBDB's stage-wide age ranges (which, for example, date Stegosaurus up to 94 Ma).
 *
 * Run with: npm run fetch:formations
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Dinosaur } from "../types/dinosaur";

const DATA_PATH = path.join(__dirname, "..", "data", "dinosaurs.json");
const OUTPUT_PATH = path.join(__dirname, "..", "data", "formations.json");
const URL = "https://paleobiodb.org/data1.2/occs/list.json?base_name=Dinosauria&interval=Mesozoic&show=strat,class";
const UA = process.env.WIKIMEDIA_UA ?? "dino-wiki/0.1 (Thai dinosaur encyclopedia; contact via repo issues)";

interface Occurrence {
  /** Genus of the accepted name, when identified to genus or below. */
  gnl?: string;
  /** Formation. */
  sfm?: string;
}

async function main() {
  const dinosaurs = JSON.parse(await readFile(DATA_PATH, "utf8")) as Dinosaur[];
  const slugByGenus = new Map(dinosaurs.map((d) => [d.name, d.slug]));

  const res = await fetch(URL, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${URL}`);
  const { records } = (await res.json()) as { records: Occurrence[] };
  console.log(`${records.length} occurrences`);

  const counts = new Map<string, Map<string, number>>();
  for (const r of records) {
    const slug = r.gnl ? slugByGenus.get(r.gnl) : undefined;
    const formation = r.sfm?.trim();
    if (!slug || !formation) continue;
    const forGenus = counts.get(slug) ?? new Map<string, number>();
    forGenus.set(formation, (forGenus.get(formation) ?? 0) + 1);
    counts.set(slug, forGenus);
  }

  // Most occurrences first, so the main formation of each genus leads.
  const output: Record<string, [string, number][]> = {};
  for (const slug of [...counts.keys()].sort()) {
    output[slug] = [...counts.get(slug)!.entries()].sort((a, b) => b[1] - a[1]);
  }
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output)}\n`);
  console.log(`Wrote formations for ${Object.keys(output).length} of ${dinosaurs.length} genera`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
