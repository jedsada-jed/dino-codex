/**
 * Pulls body length (Wikidata P2043) for every dinosaur with a Wikidata item and writes
 * data/sizes-wikidata.json, keyed by slug, for the /size-compare page.
 *
 * Only length is taken: mass statements on Wikidata are sparse and often wrong by an order
 * of magnitude. Hand-checked lengths and masses live in data/sizes-curated.json, which this
 * script never touches and which wins over these values (see lib/sizes.ts).
 *
 * Run with: npm run fetch:sizes
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Dinosaur } from "../types/dinosaur";

const WIKIMEDIA_UA =
  process.env.WIKIMEDIA_UA ??
  "dino-wiki/0.1 (Thai dinosaur encyclopedia; https://github.com/; contact via repo issues)";

const DATA_PATH = path.join(__dirname, "..", "data", "dinosaurs.json");
const OUTPUT_PATH = path.join(__dirname, "..", "data", "sizes-wikidata.json");
const BATCH = 300;

/** Wikidata unit item → metres. Anything else (or no unit) is ignored. */
const TO_METRES: Record<string, number> = {
  Q11573: 1, // metre
  Q174728: 0.01, // centimetre
  Q3710: 0.3048, // foot
};

// Lengths outside this range are data-entry errors (e.g. a femur length entered as body length).
const MIN_M = 0.2;
const MAX_M = 45;

interface Binding {
  item: { value: string };
  amount: { value: string };
  unit: { value: string };
}

async function queryLengths(ids: string[]): Promise<Binding[]> {
  const values = ids.map((id) => `wd:${id}`).join(" ");
  const sparql = `SELECT ?item ?amount ?unit WHERE {
    VALUES ?item { ${values} }
    ?item p:P2043/psv:P2043 ?node .
    ?node wikibase:quantityAmount ?amount ; wikibase:quantityUnit ?unit .
  }`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": WIKIMEDIA_UA } });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 5000 * 2 ** attempt));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url.slice(0, 120)}`);
    return ((await res.json()) as { results: { bindings: Binding[] } }).results.bindings;
  }
  throw new Error("Gave up after repeated 429s from the Wikidata Query Service");
}

async function main() {
  const dinosaurs = JSON.parse(await readFile(DATA_PATH, "utf8")) as Dinosaur[];
  const slugById = new Map(dinosaurs.filter((d) => d.wikidataId).map((d) => [d.wikidataId!, d.slug]));
  const ids = [...slugById.keys()];

  const lengths = new Map<string, number[]>();
  for (let i = 0; i < ids.length; i += BATCH) {
    for (const b of await queryLengths(ids.slice(i, i + BATCH))) {
      const factor = TO_METRES[b.unit.value.split("/").pop() ?? ""];
      const metres = Number(b.amount.value) * (factor ?? NaN);
      if (!(metres >= MIN_M && metres <= MAX_M)) continue;
      const slug = slugById.get(b.item.value.split("/").pop()!)!;
      lengths.set(slug, [...(lengths.get(slug) ?? []), metres]);
    }
    console.log(`Queried ${Math.min(i + BATCH, ids.length)}/${ids.length}`);
  }

  // Several statements usually mean competing estimates; their mean is a fair middle value.
  const output: Record<string, number> = {};
  for (const slug of [...lengths.keys()].sort()) {
    const values = lengths.get(slug)!;
    output[slug] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(output).length} lengths to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
