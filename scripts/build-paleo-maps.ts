/**
 * Fetches reconstructed coastlines for a few moments in the age of dinosaurs from the GPlates
 * Web Service (EarthByte, plate model of Müller et al. 2019, CC BY 4.0), projects them into SVG
 * path strings and writes data/paleo-maps.json for the /timeline page.
 *
 * Like build-world-map.ts, this runs ahead of time so the page only draws stored paths.
 *
 * Run with: npm run build:paleo-maps
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { geoArea, geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";

const WIDTH = 640;
const HEIGHT = 330;
const OUTPUT_PATH = path.join(__dirname, "..", "data", "paleo-maps.json");
const MODEL = "MULLER2019";
/** Millions of years ago: mid-Late Triassic, mid Jurassic, mid Cretaceous, and the day of the impact. */
const TIMES = [220, 170, 100, 66];
/** Points closer than this (degrees) to the last kept point are dropped, to keep the file small. */
const MIN_STEP_DEG = 1.5;
/** Rings smaller than this (steradians) are tiny islands that would only add noise. */
const MIN_AREA_SR = 0.002;
/** Khon Kaen (Phu Wiang), reconstructed for each time so the map can mark where Thailand was. */
const THAILAND: [number, number] = [102.8, 16.4];

const UA = process.env.WIKIMEDIA_UA ?? "dino-wiki/0.1 (Thai dinosaur encyclopedia; contact via repo issues)";

function thin(ring: Position[]): Position[] {
  const kept: Position[] = [ring[0]];
  for (const p of ring.slice(1, -1)) {
    const last = kept[kept.length - 1];
    if (Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) >= MIN_STEP_DEG) kept.push(p);
  }
  kept.push(ring[ring.length - 1]);
  return kept;
}

/**
 * GeoJSON from the service follows the right-hand rule (exterior rings counter-clockwise), but
 * d3-geo treats rings as spherical, where that winding means "everything except this land".
 * A ring covering more than half the sphere is therefore reversed.
 */
function rewind(polygon: Position[][]): Position[][] {
  return polygon.map((ring) => {
    const area = geoArea({ type: "Polygon", coordinates: [ring] });
    return area > 2 * Math.PI ? [...ring].reverse() : ring;
  });
}

function landFeatures(fc: FeatureCollection): Feature<Polygon>[] {
  const out: Feature<Polygon>[] = [];
  for (const f of fc.features) {
    const g = f.geometry as Polygon | MultiPolygon | null;
    if (!g) continue;
    const polygons = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polygons) {
      const outer = thin(poly[0]);
      if (outer.length < 4) continue;
      const coordinates = rewind([outer]);
      const feature: Feature<Polygon> = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates } };
      if (geoArea(feature) < MIN_AREA_SR) continue;
      out.push(feature);
    }
  }
  return out;
}

async function main() {
  const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], { type: "Sphere" });
  const draw = geoPath(projection).digits(0);
  const maps: { ma: number; d: string; thailand: [number, number] | null }[] = [];
  for (const ma of TIMES) {
    const url = `https://gws.gplates.org/reconstruct/coastlines/?time=${ma}&model=${MODEL}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const land = landFeatures((await res.json()) as FeatureCollection);
    const d = land.map((f) => draw(f) ?? "").join("");
    const pointUrl = `https://gws.gplates.org/reconstruct/reconstruct_points/?points=${THAILAND.join(",")}&time=${ma}&model=${MODEL}`;
    const point = (await (await fetch(pointUrl, { headers: { "User-Agent": UA } })).json()) as { coordinates: [number, number][] };
    const xy = projection(point.coordinates[0]);
    maps.push({ ma, d, thailand: xy ? [Math.round(xy[0]), Math.round(xy[1])] : null });
    console.log(`${ma} Ma: ${land.length} land polygons, ${Math.round(d.length / 1024)} KB of path`);
  }
  const sphere = draw({ type: "Sphere" }) ?? "";
  await writeFile(OUTPUT_PATH, `${JSON.stringify({ width: WIDTH, height: HEIGHT, model: MODEL, sphere, maps })}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
