/**
 * Generates AI paleoart for selected dinosaurs (Cloudflare Workers AI or OpenAI) and records the
 * prompt and model next to each image (data/ai-images.json), so the site can disclose
 * exactly how every AI image was made.
 *
 * Prompts are built from scientific data rather than free-form text:
 *   - the dataset (clade, family, diet, geologic age from PBDB/Wikidata)
 *   - the English Wikipedia summary of the genus (size, region, distinguishing features)
 *   - reconstruction rules per group that reflect current paleontological consensus
 *     (e.g. dromaeosaurids fully feathered, no "bunny hands", lips over teeth)
 *
 * Needs in .env.local (never committed):
 *   CLOUDFLARE_ACCOUNT_ID   – optional, defaults to the account in wrangler.jsonc
 *   CLOUDFLARE_AI_TOKEN     – API token with the "Workers AI" permission (FLUX models)
 *   OPENAI_API_KEY          – only for OpenAI models (gpt-image-*)
 *
 * Run with: npm run gen:ai-images -- tyrannosaurus velociraptor
 * Preview prompts without generating (no token or quota needed): add --dry-run
 * Replace a dinosaur's existing AI images instead of adding another: add --replace
 * Pick a model (default FLUX.2 [dev] on Workers AI): add --model=gpt-image-2
 *
 * Every image gets a checklist built from the same rules as its prompt. After looking at
 * the image, record a review (see AiImageReview) so the site can show its accuracy score.
 * Free tier: 10,000 neurons/day, roughly a handful of FLUX.2 [dev] images.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Dinosaur } from "../types/dinosaur";
import type { AiImage, AiImageData } from "../types/ai-image";
import type { PopularityData } from "../types/popularity";

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "data", "dinosaurs.json");
const POPULARITY_PATH = path.join(ROOT, "data", "popularity.json");
const OUTPUT_DATA = path.join(ROOT, "data", "ai-images.json");
const OUTPUT_DIR = path.join(ROOT, "public", "images", "ai");
const SIZES = [330, 960] as const;
const WIDTH = 1024;
const HEIGHT = 768;

const MODEL =
  process.argv.find((a) => a.startsWith("--model="))?.slice("--model=".length) ??
  process.env.AI_IMAGE_MODEL ??
  "@cf/black-forest-labs/flux-2-dev";
const IS_OPENAI = MODEL.startsWith("gpt-image");
const MODEL_LABELS: Record<string, string> = {
  "@cf/black-forest-labs/flux-2-dev": "FLUX.2 [dev] โดย Black Forest Labs (ผ่าน Cloudflare Workers AI)",
  "@cf/black-forest-labs/flux-1-schnell": "FLUX.1 [schnell] โดย Black Forest Labs (ผ่าน Cloudflare Workers AI)",
  "gpt-image-2": "GPT Image 2 โดย OpenAI",
  "gpt-image-2.5-flare": "GPT Image 2.5 Flare โดย OpenAI",
  "gpt-image-2.5-sunburst": "GPT Image 2.5 Sunburst โดย OpenAI",
};
/** OpenAI's standard landscape size; cards crop it to 4:3. */
const OPENAI_SIZE = "1536x1024";
const OPENAI_QUALITY = "medium";
const WIKI_UA = "dino-wiki/0.1 (Thai dinosaur encyclopedia; AI image prompt builder)";

if (existsSync(path.join(ROOT, ".env.local"))) process.loadEnvFile(path.join(ROOT, ".env.local"));

async function accountId(): Promise<string> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID) return process.env.CLOUDFLARE_ACCOUNT_ID;
  const wrangler = await readFile(path.join(ROOT, "wrangler.jsonc"), "utf8");
  const match = wrangler.match(/"account_id"\s*:\s*"([0-9a-f]+)"/);
  if (!match) throw new Error("Set CLOUDFLARE_ACCOUNT_ID in .env.local");
  return match[1];
}

/**
 * One reconstruction requirement. The same list builds the prompt and the review checklist,
 * so an image's score always means "how much of its own prompt it got right".
 */
interface Rule {
  id: string;
  /** Text sent to the model. */
  prompt: string;
  /** Thai checklist item shown on the site. */
  check: string;
  /**
   * Placed right after the subject sentence: FLUX weighs early text most, and rules buried
   * in a long anatomy list were ignored (Velociraptor stood upright, T. rex showed its teeth).
   */
  early?: boolean;
}

/** Reconstruction guidance that reflects current consensus for each group. */
function anatomyRules(d: Dinosaur): Rule[] {
  const dromaeosaur = d.family === "Dromaeosauridae";
  const spinosaurid = d.family === "Spinosauridae";
  const rules: Rule[] = [];
  if (d.clade === "Theropoda") {
    rules.push(
      dromaeosaur
        ? {
            id: "pose",
            early: true,
            prompt:
              "walking with the whole body held horizontal and balanced over the hips like a seesaw, back parallel to the ground, head held low and forward at the same height as the hips, short neck curving forward rather than upward, long stiff tail extended straight back in line with the back. NOT standing upright, NOT a raised head, NOT an ostrich or kangaroo posture",
            check: "ลำตัวขนานพื้น หัวต่ำระดับสะโพก หางยื่นตรงแนวเดียวกับหลัง",
          }
        : {
            id: "pose",
            early: true,
            prompt:
              "bipedal with the back held roughly horizontal and the tail held straight out behind for balance, never dragging on the ground. NOT standing upright like a kangaroo",
            check: "ยืนสองขา หลังขนานพื้น หางยื่นตรงไม่ลากพื้น",
          },
    );
    // Lips are well supported for most theropods, but the interlocking snout-tip teeth of
    // spinosaurids may have stayed exposed, so the rule is left out for them.
    if (!spinosaurid) {
      rules.push({
        id: "lips",
        early: true,
        prompt:
          "mouth closed with all teeth fully hidden behind scaly lips, like a monitor lizard. NO visible teeth",
        check: "ปากปิด มีริมฝีปากปิดฟันจนมองไม่เห็นฟัน",
      });
    }
    rules.push(
      {
        id: "hands",
        prompt: "hands held with palms facing each other (not pronated, not palms-down, not dangling)",
        check: "ฝ่ามือหันเข้าหากัน ไม่คว่ำลงหรือห้อยลง",
      },
    );
    if (!dromaeosaur && !spinosaurid) {
      rules.push({ id: "feet", prompt: "three main weight-bearing toes on each foot", check: "เท้ามีนิ้วรับน้ำหนัก 3 นิ้ว" });
    }
  }
  if (dromaeosaur) {
    rules.push(
      {
        id: "snout",
        prompt:
          "a long, low, narrow snout with a slightly upturned profile, NOT a bird beak and NOT a rounded bird head",
        check: "ปากยาว ต่ำ และแคบ ไม่ใช่จะงอยปากหรือหัวกลมแบบนก",
      },
      {
        id: "neck",
        prompt: "a short S-curved neck about as long as the skull, NOT a long ostrich neck",
        check: "คอสั้นโค้งรูปตัว S ไม่ยาวแบบนกกระจอกเทศ",
      },
      {
        id: "arms",
        prompt:
          "clearly visible arms folded at the sides of the body like a bird's wings, with long pennaceous feathers attached along the forearm and hand, and three separate clawed fingers visible at the end of each hand",
        check: "เห็นแขนพับข้างลำตัว มีขนปีกติดที่แขน และเห็นนิ้วที่มีกรงเล็บ",
      },
      {
        id: "tail",
        prompt: "a stiff, straight tail fringed with feathers along its sides and a fan of feathers at the tip",
        check: "หางแข็งตรง มีขนเรียงด้านข้างและเป็นพัดที่ปลาย",
      },
      {
        id: "sickle-claw",
        prompt:
          "each foot has a clearly visible sickle-shaped claw on the second toe, retracted and held off the ground, proportionate in size and attached to the toe",
        check: "เห็นกรงเล็บรูปเคียวที่นิ้วเท้าที่ 2 ยกพ้นพื้น ขนาดสมส่วน",
      },
      {
        id: "feathers",
        prompt: "body covered in short feathers, about 2 meters long including the tail and about 50 cm tall at the hip",
        check: "ลำตัวมีขนปกคลุม ขนาดเล็กประมาณ 2 เมตรรวมหาง",
      },
    );
  }
  if (spinosaurid) {
    rules.push(
      {
        id: "snout",
        early: true,
        prompt:
          "a long, narrow, crocodile-like snout with conical teeth and nostrils set far back near the eyes, NOT a deep tyrannosaur-like skull",
        check: "ปากยาวแคบแบบจระเข้ ฟันทรงกรวย รูจมูกอยู่ค่อนไปทางตา",
      },
      {
        id: "sail",
        early: true,
        prompt: "a tall sail along the back formed by elongated neural spines covered in skin",
        check: "มีใบเรือสูงบนหลังจากกระดูกสันหลังที่ยืดยาว",
      },
      {
        id: "tail",
        prompt: "a deep, flexible, paddle-like tail with tall thin spines forming a fin, like a giant newt's tail",
        check: "หางแบนลึกเป็นครีบคล้ายพาย",
      },
      {
        id: "limbs",
        prompt: "robust arms with a large curved thumb claw, relatively short hind legs with broad, flat feet",
        check: "แขนแข็งแรงมีกรงเล็บนิ้วโป้งใหญ่ ขาหลังค่อนข้างสั้น เท้ากว้างแบน",
      },
    );
  }
  if (d.family === "Tyrannosauridae") {
    rules.push(
      { id: "scales", prompt: "skin predominantly covered in small scales", check: "ผิวส่วนใหญ่เป็นเกล็ดเล็ก" },
      {
        id: "build",
        prompt: "massive deep skull, short two-fingered arms, powerful hind legs",
        check: "กะโหลกใหญ่ลึก แขนสั้นมี 2 นิ้ว ขาหลังแข็งแรง",
      },
    );
  }
  if (d.clade === "Sauropodomorpha") {
    rules.push({
      id: "sauropod-build",
      prompt: "quadrupedal on pillar-like legs, long neck held at a natural angle, small head",
      check: "เดินสี่ขา ขาเป็นเสาตรง คอยาวในมุมธรรมชาติ หัวเล็ก",
    });
  }
  if (d.clade === "Ornithischia") {
    rules.push({
      id: "ornithischian-build",
      prompt: "beaked mouth, anatomically correct posture for an ornithischian",
      check: "ปากเป็นจะงอย ท่าทางถูกต้องตามกลุ่มออร์นิธิสเชีย",
    });
  }
  return rules;
}

/**
 * Age for genera whose PBDB range includes doubtful referrals (Spinosaurus spans 125–72 Ma
 * there, but the genus is Cenomanian). Uses the range given in the Wikipedia summary.
 */
const AGE_OVERRIDES: Record<string, string> = {
  spinosaurus: "the Cenomanian age of the Late Cretaceous (about 100–94 million years ago)",
};

/** Known depositional settings that the period-wide default would get wrong. */
const HABITAT_OVERRIDES: Record<string, string> = {
  spinosaurus:
    "shallow water at the edge of a wide Late Cretaceous river system in North Africa, like the Kem Kem beds of Morocco, with large fish in the water, ferns and conifers on the banks, no grass",
  velociraptor:
    "an arid Late Cretaceous landscape of red sand dunes with sparse low shrubs and scattered small conifers, like the Djadochta Formation of Mongolia",
};

function habitat(d: Dinosaur): string {
  if (HABITAT_OVERRIDES[d.slug]) return HABITAT_OVERRIDES[d.slug];
  const mid = (d.ageRangeMa[0] + d.ageRangeMa[1]) / 2;
  if (mid >= 201.4) return "a Triassic landscape with conifers, cycads and ferns, no grass and no flowering plants";
  if (mid >= 145) return "a Jurassic landscape with conifers, cycads, ginkgoes and ferns, no grass and no flowering plants";
  return "a Late Cretaceous landscape with conifers, ferns and early flowering plants, no grass lawns";
}

async function wikipediaSummary(title: string): Promise<{ text: string; url: string }> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
  const res = await fetch(url, { headers: { "User-Agent": WIKI_UA } });
  if (!res.ok) throw new Error(`Wikipedia summary ${res.status} for ${title}`);
  const data = (await res.json()) as { extract: string; content_urls: { desktop: { page: string } } };
  // First three sentences carry size, age and region without padding the prompt. Only split
  // after a lowercase word or ")" so abbreviations like "T. rex" and "V. mongoliensis" stay whole.
  const text = data.extract.split(/(?<=[a-z)]\.)\s+(?=[A-Z])/).slice(0, 3).join(" ");
  return { text, url: data.content_urls.desktop.page };
}

function sceneRules(d: Dinosaur): Rule[] {
  return [
    {
      id: "composition",
      prompt: "Full body in side view, whole animal visible",
      check: "เห็นทั้งตัวในมุมด้านข้าง",
    },
    { id: "habitat", prompt: `standing in ${habitat(d)}`, check: "ฉากตรงกับยุคและแหล่งที่พบฟอสซิล" },
    {
      id: "clean",
      prompt: "No text, no labels, no humans, no modern objects",
      check: "ไม่มีตัวหนังสือ คน หรือวัตถุสมัยใหม่",
    },
  ];
}

function buildPrompt(d: Dinosaur, summary: string): { prompt: string; checklist: AiImage["checklist"] } {
  const anatomy = anatomyRules(d);
  const [composition, scene, clean] = sceneRules(d);
  const early = anatomy.filter((r) => r.early);
  const rest = anatomy.filter((r) => !r.early);
  const prompt = [
    `Scientifically accurate paleoart of ${d.name}, a ${d.diet === "unknown" ? "" : `${d.diet} `}${
      d.family ?? d.clade
    } dinosaur from ${
      AGE_OVERRIDES[d.slug] ??
      `${d.earlyInterval ?? ""}${d.lateInterval ? `–${d.lateInterval}` : ""} times (${d.ageRangeMa[0]}–${d.ageRangeMa[1]} million years ago)`
    }.`,
    ...early.map((r) => `${r.prompt[0].toUpperCase()}${r.prompt.slice(1)}.`),
    `Reference: ${summary}`,
    ...(rest.length ? [`Anatomy: ${rest.map((r) => r.prompt).join("; ")}.`] : []),
    `${composition.prompt}, ${scene.prompt}.`,
    "Natural history museum illustration style, realistic textures and natural daylight, muted natural colors.",
    `${clean.prompt}.`,
  ].join(" ");
  const checklist = [...anatomy, composition, scene, clean].map(({ id, check }) => ({ id, label: check }));
  return { prompt, checklist };
}

async function generateOpenAi(prompt: string, apiKey: string): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, size: OPENAI_SIZE, quality: OPENAI_QUALITY, output_format: "png", n: 1 }),
  });
  const json = (await res.json()) as { data?: { b64_json?: string }[]; error?: { message: string } };
  const b64 = json.data?.[0]?.b64_json;
  if (!res.ok || !b64) throw new Error(`OpenAI ${res.status}: ${json.error?.message ?? JSON.stringify(json).slice(0, 500)}`);
  return Buffer.from(b64, "base64");
}

async function generateWorkersAi(prompt: string, account: string, token: string): Promise<Buffer> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`;
  const isMultipart = MODEL.includes("flux-2");
  let body: BodyInit;
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (isMultipart) {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("width", String(WIDTH));
    form.append("height", String(HEIGHT));
    body = form;
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ prompt: prompt.slice(0, 2048), steps: 8 });
  }
  const res = await fetch(url, { method: "POST", headers, body });
  const json = (await res.json()) as { success: boolean; result?: { image?: string }; errors?: unknown };
  if (!res.ok || !json.success || !json.result?.image) {
    throw new Error(`Workers AI ${res.status}: ${JSON.stringify(json.errors ?? json).slice(0, 500)}`);
  }
  return Buffer.from(json.result.image, "base64");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const replace = process.argv.includes("--replace");
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (slugs.length === 0) throw new Error("Pass dinosaur slugs, e.g. npm run gen:ai-images -- tyrannosaurus");
  const token = IS_OPENAI ? process.env.OPENAI_API_KEY : process.env.CLOUDFLARE_AI_TOKEN;
  if (!token && !dryRun) {
    throw new Error(
      IS_OPENAI
        ? "Set OPENAI_API_KEY in .env.local"
        : "Set CLOUDFLARE_AI_TOKEN in .env.local (API token with Workers AI permission)",
    );
  }
  const account = IS_OPENAI ? "" : await accountId();
  const generate = (prompt: string) =>
    IS_OPENAI ? generateOpenAi(prompt, token!) : generateWorkersAi(prompt, account, token!);

  const dinosaurs = JSON.parse(await readFile(DATA_PATH, "utf8")) as Dinosaur[];
  const popularity = JSON.parse(await readFile(POPULARITY_PATH, "utf8")) as PopularityData;
  const existing: AiImageData = existsSync(OUTPUT_DATA) ? JSON.parse(await readFile(OUTPUT_DATA, "utf8")) : {};
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const slug of slugs) {
    const d = dinosaurs.find((x) => x.slug === slug);
    if (!d) throw new Error(`Unknown slug: ${slug}`);
    const title = popularity.items.find((p) => p.slug === slug)?.wikipediaTitle ?? d.name;
    const summary = await wikipediaSummary(title);
    const { prompt, checklist } = buildPrompt(d, summary.text);
    console.log(`\n[${slug}] ${prompt}\n`);
    if (dryRun) continue;

    const png = await generate(prompt);
    if (replace) existing[slug] = [];
    const index = (existing[slug]?.length ?? 0) + 1;
    const files = {} as Record<(typeof SIZES)[number], string>;
    for (const size of SIZES) {
      const name = `${slug}-${index}-${size}.webp`;
      await sharp(png).resize({ width: size }).webp({ quality: 82 }).toFile(path.join(OUTPUT_DIR, name));
      files[size] = `/images/ai/${name}`;
    }
    const meta = await sharp(png).metadata();

    const image: AiImage = {
      localSmall: files[330],
      localLarge: files[960],
      width: meta.width ?? WIDTH,
      height: meta.height ?? HEIGHT,
      model: MODEL,
      modelLabel: MODEL_LABELS[MODEL] ?? MODEL,
      prompt,
      checklist,
      promptSources: [
        { label: "Wikipedia (en)", url: summary.url },
        { label: "Paleobiology Database", url: `https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${d.pbdbTaxonId}` },
      ],
      createdAt: new Date().toISOString(),
    };
    existing[slug] = [...(existing[slug] ?? []), image];
    await writeFile(OUTPUT_DATA, JSON.stringify(existing, null, 2) + "\n");
    console.log(`[${slug}] saved ${files[960]}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
