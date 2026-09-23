/**
 * Downloads the lead image for each dinosaur in data/dinosaurs.json, converts it to
 * WebP at two widths, and writes the local paths back into data/dinosaurs.json.
 *
 * Images are never hotlinked from upload.wikimedia.org at runtime — this script runs
 * once at data-build time and the site only ever serves the local files it produces.
 *
 * Uses Wikimedia's own thumbnailing service (upload.wikimedia.org/.../thumb/...) to
 * request already-downsized images instead of pulling multi-megapixel originals just
 * to shrink them locally.
 *
 * Run with: npm run fetch:images
 */
import { writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Dinosaur } from "../types/dinosaur";

const WIKIMEDIA_UA =
  process.env.WIKIMEDIA_UA ??
  "dino-wiki/0.1 (Thai dinosaur encyclopedia; https://github.com/; contact via repo issues)";

const DATA_PATH = path.join(__dirname, "..", "data", "dinosaurs.json");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "dinos");
/**
 * Wikimedia rejects thumbnail requests for arbitrary widths and only serves a fixed
 * set of "standard" steps (see https://www.mediawiki.org/wiki/Common_thumbnail_sizes,
 * phab:T414805). 330 and 960 are the closest steps to a small/large pair.
 */
const SIZES = [330, 960] as const;
/**
 * Wikimedia throttles on-demand thumbnail *rendering* (a new width it hasn't
 * generated before) much more aggressively than it throttles plain requests —
 * a short burst reliably triggers HTTP 429 regardless of the generous
 * x-ratelimit-limit header. A slow, steady pace with backoff-on-429 is required.
 */
const REQUEST_DELAY_MS = 1000;

// Optional cap for local testing, e.g. IMAGE_LIMIT=20 npm run fetch:images
const LIMIT = process.env.IMAGE_LIMIT ? Number(process.env.IMAGE_LIMIT) : Infinity;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds a Wikimedia thumbnail URL for a given width from a full-resolution
 * upload.wikimedia.org URL. See https://www.mediawiki.org/wiki/Manual:Thumb.php
 * for the underlying convention (also used transparently by Commons itself).
 */
function thumbUrl(sourceUrl: string, width: number): string {
  const clean = sourceUrl.split("?")[0];
  const marker = "/wikipedia/commons/";
  const idx = clean.indexOf(marker);
  if (idx === -1) return clean; // not a recognizable Commons URL; fall back to original

  const afterMarker = clean.slice(idx + marker.length); // e.g. "9/94/File.jpg"
  const filename = afterMarker.slice(afterMarker.lastIndexOf("/") + 1);
  const isSvg = filename.toLowerCase().endsWith(".svg");
  const thumbFilename = isSvg ? `${width}px-${filename}.png` : `${width}px-${filename}`;

  return `${clean.slice(0, idx + marker.length)}thumb/${afterMarker}/${thumbFilename}`;
}

async function downloadBuffer(url: string, retries = 5): Promise<Buffer> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": WIKIMEDIA_UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());

    if (res.status === 429 && attempt < retries) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const backoffMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 5000 * attempt;
      console.warn(`  429 rate limited, backing off ${backoffMs}ms (attempt ${attempt}/${retries})`);
      await sleep(backoffMs);
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  throw new Error("unreachable");
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const dinosaurs: Dinosaur[] = JSON.parse(await (await import("node:fs/promises")).readFile(DATA_PATH, "utf8"));
  await mkdir(OUTPUT_DIR, { recursive: true });

  const withImages = dinosaurs.filter((d) => d.images.length > 0);
  const targets = withImages.slice(0, LIMIT === Infinity ? withImages.length : LIMIT);
  console.log(`Processing ${targets.length}/${withImages.length} dinosaur images...`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const dino = targets[i];
    const image = dino.images[0];
    const localPaths: Record<number, string> = {};

    const alreadySmall = path.join(OUTPUT_DIR, `${dino.slug}-${SIZES[0]}.webp`);
    const alreadyLarge = path.join(OUTPUT_DIR, `${dino.slug}-${SIZES[1]}.webp`);
    if ((await fileExists(alreadySmall)) && (await fileExists(alreadyLarge))) {
      image.localSmall = `/images/dinos/${dino.slug}-${SIZES[0]}.webp`;
      image.localLarge = `/images/dinos/${dino.slug}-${SIZES[1]}.webp`;
      skipped++;
      continue;
    }

    try {
      for (const width of SIZES) {
        const outPath = path.join(OUTPUT_DIR, `${dino.slug}-${width}.webp`);
        const buf = await downloadBuffer(thumbUrl(image.sourceUrl, width));
        await sharp(buf)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(outPath);
        localPaths[width] = `/images/dinos/${dino.slug}-${width}.webp`;
        await sleep(REQUEST_DELAY_MS);
      }
      image.localSmall = localPaths[SIZES[0]];
      image.localLarge = localPaths[SIZES[1]];
      downloaded++;
    } catch (err) {
      console.warn(`  failed: ${dino.slug} (${dino.name}): ${(err as Error).message}`);
      failed++;
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  ${i + 1}/${targets.length} processed (downloaded=${downloaded}, skipped=${skipped}, failed=${failed})`);
    }
  }

  await writeFile(DATA_PATH, JSON.stringify(dinosaurs, null, 2));

  console.log("\nDone.");
  console.log(`  downloaded: ${downloaded}`);
  console.log(`  skipped (already cached): ${skipped}`);
  console.log(`  failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
