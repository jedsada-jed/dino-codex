/**
 * Makes 1200×630 JPEG share images (Open Graph) into public/og/ before each build: one per popular or
 * Thai dinosaur (see hasOwnShareImage) from its cover image, plus a default for every other page.
 *
 * The site's images are WebP, which some apps don't show in link previews (LinkedIn doesn't, and
 * Facebook's support has been patchy); JPEG works everywhere. They're generated rather than
 * committed because ~1,300 of them would add ~100 MB to the repo. No text is drawn on them: the
 * build machine has no Thai font, and the link preview shows the page title anyway.
 *
 * A manifest records which source picture (path and size) each JPEG was cut from, so only changed
 * covers are redone; the size catches a cover regenerated under the same file name. CI restores
 * public/og/ from its cache (see .github/workflows/deploy.yml), where file times can't be trusted
 * after a fresh checkout.
 *
 * Runs automatically as `prebuild`; on its own: npm run build:og
 */
import { existsSync, statSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getAllDinosaurs, getDinosaurBySlug } from "@/lib/dinosaurs";
import { getCoverImage } from "@/lib/ai-images";
import { hasOwnShareImage, OG_DEFAULT_DINOSAUR, ogImagePath } from "@/lib/og";

const PUBLIC = path.join(__dirname, "..", "public");
const WIDTH = 1200;
const HEIGHT = 630;
const MANIFEST = path.join(PUBLIC, "og", "manifest.json");
/** Bump when the crop or encoding changes, to redo every image. */
const VERSION = 1;

async function render(source: string, target: string) {
  await mkdir(path.dirname(target), { recursive: true });
  // "attention" keeps the most detailed part of the picture (usually the animal) in the crop.
  await sharp(source)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: sharp.strategy.attention })
    .jpeg({ quality: 76, mozjpeg: true })
    .toFile(target);
}

async function main() {
  let made = 0;
  let kept = 0;
  const before: { version?: number; sources?: Record<string, string> } = existsSync(MANIFEST)
    ? JSON.parse(await readFile(MANIFEST, "utf8"))
    : {};
  const previous = before.version === VERSION ? (before.sources ?? {}) : {};
  const sources: Record<string, string> = {};
  const coverOf = (d: Parameters<typeof getCoverImage>[0]) => {
    const image = getCoverImage(d).image;
    return image?.localLarge ?? image?.localSmall;
  };
  const jobs: [string, string][] = [];
  const fallback = getDinosaurBySlug(OG_DEFAULT_DINOSAUR);
  const fallbackSrc = fallback && coverOf(fallback);
  if (fallbackSrc) jobs.push([path.join(PUBLIC, fallbackSrc), path.join(PUBLIC, ogImagePath(null))]);
  for (const d of getAllDinosaurs()) {
    if (!hasOwnShareImage(d.slug)) continue;
    const src = coverOf(d);
    if (src) jobs.push([path.join(PUBLIC, src), path.join(PUBLIC, ogImagePath(d.slug))]);
  }
  for (const [source, target] of jobs) {
    if (!existsSync(source)) continue;
    const key = path.relative(PUBLIC, target);
    sources[key] = `${path.relative(PUBLIC, source)}:${statSync(source).size}`;
    if (previous[key] === sources[key] && existsSync(target)) {
      kept++;
      continue;
    }
    await render(source, target);
    made++;
  }
  // JPEGs left from genera no longer in the set would still count against the deploy file limit.
  for (const key of Object.keys(previous)) {
    if (!(key in sources)) await rm(path.join(PUBLIC, key), { force: true });
  }
  await writeFile(MANIFEST, `${JSON.stringify({ version: VERSION, sources })}\n`);
  console.log(`Share images: ${made} made, ${kept} already up to date`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
