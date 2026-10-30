/**
 * Projects Natural Earth country outlines (world-atlas, 1:110m) into SVG path strings and writes
 * data/world-map.json, keyed by ISO 3166-1 alpha-2 code, for the /map page.
 *
 * Done once here rather than at page build so the map libraries stay dev-only and the page just
 * draws stored paths. Re-run only to change the projection or size.
 *
 * Run with: npm run build:map
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import countries from "i18n-iso-countries";
import type { Topology, GeometryCollection } from "topojson-specification";

const WIDTH = 960;
const HEIGHT = 500;
const OUTPUT_PATH = path.join(__dirname, "..", "data", "world-map.json");

async function main() {
  const topologyPath = require.resolve("world-atlas/countries-110m.json");
  const topology = JSON.parse(await readFile(topologyPath, "utf8")) as Topology<{ countries: GeometryCollection }>;
  const world = feature(topology, topology.objects.countries);

  const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], world);
  const draw = geoPath(projection).digits(1);

  const paths: Record<string, string> = {};
  const skipped: string[] = [];
  for (const f of world.features) {
    // Natural Earth leaves a few disputed areas (e.g. Kosovo, N. Cyprus) without an ISO code.
    const code = f.id === undefined ? undefined : countries.numericToAlpha2(String(f.id));
    const d = draw(f);
    if (!code || !d) {
      skipped.push(String((f.properties as { name?: string } | null)?.name ?? f.id));
      continue;
    }
    paths[code] = paths[code] ? `${paths[code]}${d}` : d;
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify({ width: WIDTH, height: HEIGHT, paths })}\n`);
  console.log(`Wrote ${Object.keys(paths).length} countries to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  if (skipped.length) console.log(`Skipped (no ISO code): ${skipped.join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
