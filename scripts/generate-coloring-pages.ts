/**
 * Generates black-and-white coloring pages with OpenAI image models and writes them to
 * public/coloring/ plus data/coloring.json, for the /coloring page.
 *
 * Anatomy comes from the same rules as the site's colour AI images (scripts/generate-ai-images.ts),
 * so a coloring page of Velociraptor has feathers and the right claws, not a film monster. Every
 * page gets the same checklist; look at each image and record a review before it goes live (the
 * page only shows pages whose review passed).
 *
 * Needs in .env.local (never committed) the key for the chosen model: OPENAI_API_KEY for gpt-image-*
 * (the default), or AGENT_PLATFORM_API_KEY for gemini-*-image* via Google's Gemini Enterprise Agent
 * Platform (formerly Vertex AI).
 *
 * Run with: npm run gen:coloring -- tyrannosaurus triceratops
 * Preview prompts without generating: add --dry-run
 * Pick a model: add --model=gemini-2.5-flash-image
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { anatomyRules, generateAgentPlatform, generateOpenAi, groupOf } from "./generate-ai-images";
import type { Dinosaur } from "../types/dinosaur";
import type { ColoringData, ColoringPage } from "../types/coloring";

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "data", "dinosaurs.json");
const OUTPUT_DATA = path.join(ROOT, "data", "coloring.json");
const OUTPUT_DIR = path.join(ROOT, "public", "coloring");
const MODEL = process.argv.find((a) => a.startsWith("--model="))?.slice("--model=".length) ?? "gpt-image-2";
const IS_AGENT_PLATFORM = MODEL.startsWith("gemini-");
const THUMB_WIDTH = 480;

if (existsSync(path.join(ROOT, ".env.local"))) process.loadEnvFile(path.join(ROOT, ".env.local"));

/** Checks that make it a usable coloring page, on top of the anatomy rules. */
const PAGE_RULES = [
  { id: "line-art", prompt: "clean bold black outlines on a pure white background", check: "เส้นขอบสีดำชัด พื้นขาว" },
  { id: "no-fill", prompt: "no shading, no gray tones, no color fills, large open areas left white to color in", check: "ไม่มีการลงเงา สีเทา หรือสี" },
  { id: "composition", prompt: "the whole animal in side view, filling most of the page, on a simple ground line with a few plants", check: "เห็นทั้งตัวในมุมด้านข้าง" },
  { id: "clean", prompt: "no text, no labels, no humans, no modern objects, no border frame", check: "ไม่มีตัวหนังสือ คน หรือวัตถุสมัยใหม่" },
];

function buildPrompt(d: Dinosaur): { prompt: string; checklist: ColoringPage["checklist"] } {
  // Colour-only details (e.g. "mostly dark plumage") can't show in line art, so they're dropped.
  const anatomy = anatomyRules(d).filter((r) => !/\b(colou?r|plumage|dark|pale|stripe)/i.test(r.prompt));
  const prompt = [
    `A children's coloring book page of ${d.name}, a ${groupOf(d)} dinosaur, drawn as simple, friendly but scientifically accurate line art.`,
    `Anatomy: ${anatomy.map((r) => r.prompt).join("; ")}.`,
    ...PAGE_RULES.map((r) => `${r.prompt[0].toUpperCase()}${r.prompt.slice(1)}.`),
  ].join(" ");
  const checklist = [...anatomy, ...PAGE_RULES].map(({ id, check }) => ({ id, label: check }));
  return { prompt, checklist };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (slugs.length === 0) throw new Error("Pass dinosaur slugs, e.g. npm run gen:coloring -- tyrannosaurus");
  const keyName = IS_AGENT_PLATFORM ? "AGENT_PLATFORM_API_KEY" : "OPENAI_API_KEY";
  const key = process.env[keyName];
  if (!key && !dryRun) throw new Error(`Set ${keyName} in .env.local`);

  const dinosaurs = JSON.parse(await readFile(DATA_PATH, "utf8")) as Dinosaur[];
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const slug of slugs) {
    const d = dinosaurs.find((x) => x.slug === slug);
    if (!d) throw new Error(`Unknown slug: ${slug}`);
    const { prompt, checklist } = buildPrompt(d);
    console.log(`\n[${slug}] ${prompt}\n`);
    if (dryRun) continue;

    const png = IS_AGENT_PLATFORM ? await generateAgentPlatform(prompt, key!, MODEL) : await generateOpenAi(prompt, key!, MODEL);
    // Grayscale and stretch contrast so off-white paper tones print as white. Line art needs only a
    // few grays, so a 16-colour palette halves the file without visible change.
    const clean = await sharp(png).grayscale().normalise().png({ palette: true, colors: 16, compressionLevel: 9 }).toBuffer();
    const meta = await sharp(clean).metadata();
    await writeFile(path.join(OUTPUT_DIR, `${slug}.png`), clean);
    await sharp(clean).resize({ width: THUMB_WIDTH }).webp({ quality: 80 }).toFile(path.join(OUTPUT_DIR, `${slug}-thumb.webp`));

    const data: ColoringData = existsSync(OUTPUT_DATA) ? JSON.parse(await readFile(OUTPUT_DATA, "utf8")) : {};
    data[slug] = {
      image: `/coloring/${slug}.png`,
      thumb: `/coloring/${slug}-thumb.webp`,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      model: MODEL,
      prompt,
      checklist,
      createdAt: new Date().toISOString(),
    };
    await writeFile(OUTPUT_DATA, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`[${slug}] saved /coloring/${slug}.png`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
