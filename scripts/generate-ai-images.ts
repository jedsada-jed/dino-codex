/**
 * Generates AI paleoart for selected dinosaurs (Cloudflare Workers AI, OpenAI or Google's Gemini
 * Enterprise Agent Platform) and records the
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
 *   AGENT_PLATFORM_API_KEY  – only for Gemini image models (gemini-*-image*), an API key for Google's
 *                             Gemini Enterprise Agent Platform (formerly Vertex AI) with the
 *                             Agent Platform API (aiplatform.googleapis.com) enabled
 *   AGENT_PLATFORM_PROJECT  – with AGENT_PLATFORM_API_KEY: the Google Cloud project number or ID.
 *                             Without it the key's default region is used, which may not offer
 *                             image models (asia-southeast1 didn't); with it, the global endpoint.
 *
 * Run with: npm run gen:ai-images -- tyrannosaurus velociraptor
 * Preview prompts without generating (no token or quota needed): add --dry-run
 * Replace a dinosaur's existing AI images instead of adding another: add --replace
 * Pick a model (default FLUX.2 [dev] on Workers AI): add --model=gpt-image-2 or --model=gemini-2.5-flash-image
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
const TEXT_EN_PATH = path.join(ROOT, "data", "ai-image-text-en.json");
const SIZES = [330, 960] as const;
const WIDTH = 1024;
const HEIGHT = 768;

const MODEL =
  process.argv.find((a) => a.startsWith("--model="))?.slice("--model=".length) ??
  process.env.AI_IMAGE_MODEL ??
  "@cf/black-forest-labs/flux-2-dev";
const IS_OPENAI = MODEL.startsWith("gpt-image");
const IS_AGENT_PLATFORM = MODEL.startsWith("gemini-");
const MODEL_LABELS: Record<string, string> = {
  "@cf/black-forest-labs/flux-2-dev": "FLUX.2 [dev] โดย Black Forest Labs (ผ่าน Cloudflare Workers AI)",
  "@cf/black-forest-labs/flux-1-schnell": "FLUX.1 [schnell] โดย Black Forest Labs (ผ่าน Cloudflare Workers AI)",
  "gpt-image-2": "GPT Image 2 โดย OpenAI",
  "gpt-image-2.5-flare": "GPT Image 2.5 Flare โดย OpenAI",
  "gpt-image-2.5-sunburst": "GPT Image 2.5 Sunburst โดย OpenAI",
  "gemini-2.5-flash-image": "Gemini 2.5 Flash Image โดย Google (ผ่าน Gemini Enterprise Agent Platform)",
};
/** OpenAI's standard landscape size; cards crop it to 4:3. */
const OPENAI_SIZE = "1536x1024";
const OPENAI_QUALITY = "medium";
/** Gemini image models take an aspect ratio rather than pixel sizes; 3:2 matches OpenAI's 1536×1024. */
const AGENT_PLATFORM_ASPECT = "3:2";
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
export interface Rule {
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

/** Family for genera the dataset leaves unassigned, so they still get group rules. */
const GENUS_GROUPS: Record<string, string> = {
  allosaurus: "Allosauridae",
  archaeopteryx: "Archaeopterygidae",
  dilophosaurus: "Dilophosauridae",
  argentinosaurus: "Titanosauria",
  pachycephalosaurus: "Pachycephalosauridae",
  // Thai genera
  isanosaurus: "EarlySauropoda",
  kinnareemimus: "Ornithomimosauria",
  minimocursor: "Neornithischia",
  phuwiangvenator: "Megaraptora",
  psittacosaurus: "Psittacosauridae",
  ratchasimasaurus: "Iguanodontia",
  siamodon: "Iguanodontia",
  siamraptor: "Carcharodontosauridae",
  sirindhorna: "Hadrosauroidea",
  vayuraptor: "Coelurosauria",
};

/**
 * Genera known from only a few bones. Their images fill the gaps from close relatives, and
 * the site says so next to the image.
 */
const FRAGMENTARY = new Set([
  "isanosaurus",
  "kinnareemimus",
  "nagatitan",
  "phuwiangvenator",
  "ratchasimasaurus",
  "siamodon",
  "siamotyrannus",
  "siamraptor",
  "sirindhorna",
  "uragasaurus",
  "vayuraptor",
]);
export const FRAGMENTARY_CAVEAT =
  "ไดโนเสาร์ตัวนี้รู้จักจากซากเพียงบางส่วน ภาพนี้เติมส่วนที่ไม่พบด้วยการคาดเดาจากญาติใกล้ชิด จึงอาจต่างจากตัวจริงได้มาก";

export function groupOf(d: Dinosaur): string {
  return d.family ?? GENUS_GROUPS[d.slug] ?? d.clade;
}

const r = (id: string, prompt: string, check: string, early = false): Rule => ({ id, prompt, check, early });

/** Body length used in the dromaeosaur size rule, so one rule set serves every raptor. */
const DROMAEOSAUR_SIZES: Record<string, { prompt: string; check: string }> = {
  velociraptor: { prompt: "about 2 meters long including the tail and about 50 cm tall at the hip", check: "ประมาณ 2 เมตรรวมหาง" },
  deinonychus: { prompt: "about 3.4 meters long including the tail, the size of a large wolf", check: "ประมาณ 3.4 เมตรรวมหาง" },
  utahraptor: { prompt: "about 6 meters long, heavily built and robust with thick legs", check: "ใหญ่ราว 6 เมตร ตัวหนาบึกบึน" },
};

/**
 * Rules for specific groups. Order matters within a list only for readability; rules marked
 * early are moved up in the prompt.
 */
const GROUP_RULES: Record<string, (d: Dinosaur) => Rule[]> = {
  Dromaeosauridae: (d) => {
    const size = DROMAEOSAUR_SIZES[d.slug] ?? DROMAEOSAUR_SIZES.velociraptor;
    return [
      r("snout", "a long, low, narrow snout with a slightly upturned profile, NOT a bird beak and NOT a rounded bird head", "ปากยาว ต่ำ และแคบ ไม่ใช่จะงอยปากหรือหัวกลมแบบนก"),
      r("neck", "a short S-curved neck about as long as the skull, NOT a long ostrich neck", "คอสั้นโค้งรูปตัว S ไม่ยาวแบบนกกระจอกเทศ"),
      r(
        "arms",
        "clearly visible arms folded at the sides of the body like a bird's wings, with long pennaceous feathers attached along the forearm and hand, and three separate clawed fingers visible at the end of each hand",
        "เห็นแขนพับข้างลำตัว มีขนปีกติดที่แขน และเห็นนิ้วที่มีกรงเล็บ",
      ),
      r("tail", "a stiff, straight tail fringed with feathers along its sides and a fan of feathers at the tip", "หางแข็งตรง มีขนเรียงด้านข้างและเป็นพัดที่ปลาย"),
      r(
        "sickle-claw",
        "each foot has a clearly visible sickle-shaped claw on the second toe, retracted and held off the ground, proportionate in size and attached to the toe",
        "เห็นกรงเล็บรูปเคียวที่นิ้วเท้าที่ 2 ยกพ้นพื้น ขนาดสมส่วน",
      ),
      r("feathers", `body covered in short feathers, ${size.prompt}`, `ลำตัวมีขนปกคลุม ขนาด${size.check}`),
    ];
  },
  Spinosauridae: () => [
    r("snout", "a long, narrow, crocodile-like snout with conical teeth and nostrils set far back near the eyes, NOT a deep tyrannosaur-like skull", "ปากยาวแคบแบบจระเข้ ฟันทรงกรวย รูจมูกอยู่ค่อนไปทางตา", true),
    r("sail", "a tall sail along the back formed by elongated neural spines covered in skin", "มีใบเรือสูงบนหลังจากกระดูกสันหลังที่ยืดยาว", true),
    r("tail", "a deep, flexible, paddle-like tail with tall thin spines forming a fin, like a giant newt's tail", "หางแบนลึกเป็นครีบคล้ายพาย"),
    r("limbs", "robust arms with a large curved thumb claw, relatively short hind legs with broad, flat feet", "แขนแข็งแรงมีกรงเล็บนิ้วโป้งใหญ่ ขาหลังค่อนข้างสั้น เท้ากว้างแบน"),
  ],
  Tyrannosauridae: () => [
    r("scales", "skin predominantly covered in small scales", "ผิวส่วนใหญ่เป็นเกล็ดเล็ก"),
    r("build", "massive deep skull, short two-fingered arms, powerful hind legs", "กะโหลกใหญ่ลึก แขนสั้นมี 2 นิ้ว ขาหลังแข็งแรง"),
  ],
  Allosauridae: () => [
    r("skull", "a long, narrow skull with a pair of small triangular horns just in front of the eyes and low ridges along the top of the snout", "กะโหลกยาวแคบ มีเขาเล็กสามเหลี่ยมหน้าตาและสันต่ำบนจมูก", true),
    r("arms", "strong arms with three large curved claws on each hand", "แขนแข็งแรง มือมี 3 นิ้วพร้อมกรงเล็บโค้งใหญ่"),
    r("build", "about 9 meters long, slender and agile compared to tyrannosaurs, skin of small scales", "ยาวราว 9 เมตร รูปร่างเพรียวกว่า T. rex ผิวเกล็ดเล็ก"),
  ],
  Carcharodontosauridae: (d) => {
    const size =
      d.slug === "siamraptor"
        ? { prompt: "a large animal about 8 meters long", check: "ยาวราว 8 เมตร" }
        : { prompt: "a huge animal about 12–13 meters long", check: "ตัวใหญ่ยาว 12–13 เมตร" };
    return [
      r("skull", "a long, low, narrow skull with blade-like teeth, NOT the broad deep skull of Tyrannosaurus", "กะโหลกยาว ต่ำ แคบ ไม่กว้างลึกแบบ T. rex", true),
      r("build", `${size.prompt}, short arms with three clawed fingers, powerful hind legs, skin of small scales`, `${size.check} แขนสั้นมี 3 นิ้ว ผิวเกล็ดเล็ก`),
    ];
  },
  Metriacanthosauridae: () => [
    r("skull", "a long, fairly narrow skull of an allosaur-like predator, NOT a tyrannosaur despite its name", "กะโหลกยาวแบบอัลโลซอร์ ไม่ใช่ไทแรนโนซอร์แม้จะมีชื่อคล้าย", true),
    r("build", "medium-sized, about 6–7 meters long, three-fingered arms, skin of small scales", "ขนาดกลางยาวราว 6–7 เมตร แขนมี 3 นิ้ว ผิวเกล็ดเล็ก"),
  ],
  Megaraptora: () => [
    r("claws", "long, strong arms with an enormous curved claw on the thumb and a large claw on the first finger", "แขนยาวแข็งแรง มีกรงเล็บโค้งขนาดใหญ่มากที่นิ้วโป้งและนิ้วแรก", true),
    r("build", "a slender, lightly built predator about 6 meters long with a long, narrow skull and long legs", "นักล่ารูปร่างเพรียวยาวราว 6 เมตร หัวยาวแคบ ขายาว"),
  ],
  Coelurosauria: () => [
    r("build", "a slender, lightly built, long-legged predator about 4–5 meters long with a narrow head", "นักล่ารูปร่างเพรียว ขายาว ยาวราว 4–5 เมตร หัวแคบ", true),
    r("feathers", "body covered in simple filament-like feathers", "ลำตัวมีขนเส้นเล็กปกคลุม"),
  ],
  Ornithomimosauria: () => [
    r("build", "an ostrich-like build with long slender legs, a long slender neck and a small head with a toothless beak", "รูปร่างคล้ายนกกระจอกเทศ ขายาวเรียว คอยาว หัวเล็กมีจะงอยปากไม่มีฟัน", true),
    r("arms", "long arms with three slender clawed fingers and wing-like feathers along the forearms", "แขนยาวมีนิ้วเรียว 3 นิ้วพร้อมกรงเล็บ และมีขนคล้ายปีกที่แขน"),
    r("feathers", "body covered in feathers, tail held straight out", "ลำตัวมีขนปกคลุม หางยื่นตรง"),
  ],
  Abelisauridae: () => [
    r("skull", "a short, deep, blunt skull with two thick horns sticking out sideways above the eyes, like a bull", "หัวสั้นทู่ มีเขาหนา 2 อันยื่นออกด้านข้างเหนือตาแบบวัวกระทิง", true),
    r("arms", "tiny, stubby, almost useless arms much smaller than a tyrannosaur's", "แขนเล็กกุดมาก เล็กกว่าแขน T. rex", true),
    r("skin", "skin covered in rows of large cone-shaped scales along the sides and back", "ผิวมีเกล็ดรูปกรวยใหญ่เรียงเป็นแถวตามลำตัว"),
    r("legs", "long, slender hind legs built for running", "ขาหลังยาวเรียวเหมาะกับการวิ่ง"),
  ],
  Dilophosauridae: () => [
    r("crests", "a pair of thin, parallel, half-moon-shaped bony crests running along the top of the skull", "มีหงอนกระดูกบางรูปครึ่งวงกลม 2 อันขนานกันบนหัว", true),
    r("no-frill", "NO neck frill and NOT spitting venom, unlike in movies", "ไม่มีแผงคอและไม่พ่นพิษแบบในภาพยนตร์", true),
    r("build", "slender build about 7 meters long, narrow snout with a notch behind the tip of the upper jaw, three main fingers", "รูปร่างเพรียวยาวราว 7 เมตร ปากแคบมีรอยหยักใกล้ปลายขากรรไกรบน"),
  ],
  Therizinosauridae: () => [
    r("claws", "extremely long, straight, blade-like claws on the hands, each almost as long as a human arm", "กรงเล็บมือยาวตรงมาก แต่ละอันยาวเกือบเท่าแขนคน", true),
    r("build", "a pot-bellied body, long neck, small head with a toothless beak at the front, covered in simple shaggy feathers", "ท้องป่อง คอยาว หัวเล็กมีจะงอยปาก ขนฟูทั้งตัว"),
    r("feet", "broad feet with four weight-bearing toes", "เท้ากว้างมีนิ้วรับน้ำหนัก 4 นิ้ว"),
  ],
  Archaeopterygidae: () => [
    r("wings", "fully feathered wings with long asymmetric flight feathers, and three separate clawed fingers free at the front edge of each wing", "ปีกมีขนบินยาว และมีนิ้วที่มีกรงเล็บ 3 นิ้วโผล่ที่ขอบปีก", true),
    r("tail", "a long bony tail with a row of feathers along each side of its whole length, NOT a short fan-like bird tail", "หางยาวมีกระดูก มีขนเรียงสองข้างตลอดหาง", true),
    r("jaws", "jaws lined with small teeth, NOT a beak", "ปากมีฟันซี่เล็ก ไม่ใช่จะงอยปาก"),
    r("size", "about the size of a raven, body and legs covered in feathers, mostly dark plumage", "ขนาดประมาณอีกา มีขนทั้งตัวรวมถึงขา ขนสีเข้ม"),
  ],
  Stegosauridae: () => [
    r(
      "pose",
      "quadrupedal with the hind legs much longer than the front legs, so the back arches highest over the hips, small head held low near the ground, tail held off the ground",
      "เดินสี่ขา ขาหลังยาวกว่าขาหน้า หลังโก่งสูงสุดที่สะโพก หัวเล็กต่ำ หางไม่ลากพื้น",
      true,
    ),
    r("plates", "two alternating rows of large, flat, kite-shaped bony plates standing upright along the neck, back and tail", "แผ่นกระดูกรูปว่าวตั้งเรียงสลับ 2 แถวตามคอ หลัง และหาง", true),
    r("spikes", "four long bony spikes at the end of the tail pointing outward and backward", "หนามยาว 4 อันที่ปลายหาง ชี้ออกด้านข้างและด้านหลัง"),
    r("head", "a small, narrow head with a toothless beak at the front", "หัวเล็กแคบ มีจะงอยปากด้านหน้า"),
  ],
  Ceratopsidae: () => [
    r("horns", "two long brow horns above the eyes and one short horn on the nose", "เขายาว 2 อันเหนือตา และเขาสั้น 1 อันบนจมูก", true),
    r("frill", "a solid bony frill without holes, edged with small triangular bony points", "แผงคอกระดูกทึบ ไม่มีรู ขอบมีปุ่มสามเหลี่ยม", true),
    r("beak", "a large, hooked, parrot-like beak", "จะงอยปากใหญ่งุ้มคล้ายนกแก้ว"),
    r(
      "posture",
      "quadrupedal with pillar-like hind legs; front legs semi-erect with the elbows slightly out and the fingers pointing forward and outward, NOT palms-down",
      "เดินสี่ขา ขาหน้ากางศอกเล็กน้อย นิ้วชี้ไปด้านหน้าและออกด้านข้าง",
    ),
    r("skin", "skin of large rounded scales, some with small conical bumps", "ผิวเป็นเกล็ดกลมใหญ่ บางเกล็ดมีปุ่มเล็ก"),
  ],
  Ankylosauridae: () => [
    r("armor", "a very wide, low body covered on top in rows of flat and keeled bony plates (osteoderms)", "ลำตัวกว้างเตี้ย หลังปกคลุมด้วยแผ่นกระดูกเกราะเรียงเป็นแถว", true),
    r("club", "a large, heavy bony club at the end of a stiff tail", "ปลายหางเป็นตะบองกระดูกใหญ่ หางแข็ง", true),
    r("head", "a broad triangular head with short pyramid-shaped horns pointing backward and sideways from the back corners, small beak", "หัวกว้างสามเหลี่ยม มีเขาสั้นที่มุมหลังหัว จะงอยปากเล็ก"),
    r("legs", "short, sturdy legs held under the body, walking on four legs", "ขาสั้นแข็งแรงอยู่ใต้ลำตัว เดินสี่ขา"),
  ],
  Hadrosauridae: () => [
    r("crest", "a long, hollow, tube-shaped crest curving backward from the top of the head well past the neck", "หงอนเป็นท่อกลวงยาวโค้งไปด้านหลังเลยคอ", true),
    r("beak", "a broad, flat, duck-like toothless beak", "ปากแบนกว้างแบบปากเป็ด"),
    r("posture", "walking on all fours with the front hands forming small hoof-like pads, tail held straight out off the ground", "เดินสี่ขา มือหน้าเป็นแป้นคล้ายกีบ หางยื่นตรงไม่ลากพื้น"),
    r("skin", "skin of small pebbly scales", "ผิวเป็นเกล็ดเล็กคล้ายกรวด"),
  ],
  Pachycephalosauridae: () => [
    r("dome", "a thick, high, rounded bony dome on top of the skull, ringed at the back with bony knobs and short spikes", "หัวเป็นโดมกระดูกหนาสูง มีปุ่มและหนามสั้นรอบด้านหลัง", true),
    r("build", "bipedal with a short neck, small beak, short arms and a stiff tail held straight out", "เดินสองขา คอสั้น จะงอยปากเล็ก แขนสั้น หางแข็งยื่นตรง"),
  ],
  Brachiosauridae: () => [
    r("proportions", "front legs longer than the hind legs so the back slopes down from high shoulders to the hips, like a giraffe", "ขาหน้ายาวกว่าขาหลัง หลังลาดลงจากไหล่ไปสะโพก", true),
    r("neck", "a very long neck held raised upward at a steep angle", "คอยาวมาก ชูขึ้นในมุมชัน", true),
    r("head", "a small head with a bony arch over the nose in front of the eyes", "หัวเล็ก มีสันกระดูกโค้งเหนือจมูก"),
    r("feet", "pillar-like legs; front feet are columns with a single thumb claw", "ขาเป็นเสา เท้าหน้ามีกรงเล็บเดียว"),
    r("tail", "a relatively short tail held off the ground", "หางค่อนข้างสั้น ไม่ลากพื้น"),
  ],
  Diplodocidae: (d) => [
    r("neck", "a very long neck held roughly horizontal, extending forward rather than straight up", "คอยาวมากยื่นไปข้างหน้าแนวราบ ไม่ชูตั้งตรง", true),
    r("tail", "an extremely long, whip-like tail held off the ground", "หางยาวมากเรียวเหมือนแส้ ไม่ลากพื้น", true),
    r("legs", "pillar-like legs with the front legs slightly shorter than the hind legs, front feet with a single thumb claw", "ขาเป็นเสา ขาหน้าสั้นกว่าขาหลังเล็กน้อย เท้าหน้ามีกรงเล็บเดียว"),
    d.slug === "brontosaurus"
      ? r("build", "a deep, heavily built body and a thick, robust neck", "ลำตัวลึกหนา คอหนาแข็งแรง")
      : r("build", "a slender body and a long, low head", "ลำตัวเพรียว หัวยาวต่ำ"),
  ],
  Mamenchisauridae: () => [
    r("neck", "an extremely long neck making up about half of the whole body length, held roughly horizontal to moderately raised", "คอยาวมากราวครึ่งหนึ่งของความยาวลำตัว", true),
    r("build", "quadrupedal on pillar-like legs, small head, tail held off the ground", "เดินสี่ขา ขาเป็นเสา หัวเล็ก หางไม่ลากพื้น"),
  ],
  Euhelopodidae: (d) => [
    r(
      "build",
      `a titanosauriform sauropod about ${d.slug === "nagatitan" ? "27 meters long, very large and heavy" : "15–20 meters long"}, with a long neck held moderately raised`,
      d.slug === "nagatitan" ? "ไดโนเสาร์คอยาวขนาดใหญ่มากราว 27 เมตร คอชูขึ้นปานกลาง" : "ไดโนเสาร์คอยาวยาวราว 15–20 เมตร คอชูขึ้นปานกลาง",
      true,
    ),
    r("legs", "pillar-like legs with the front legs about as long as or slightly longer than the hind legs, broad body", "ขาเป็นเสา ขาหน้ายาวพอๆ กับหรือยาวกว่าขาหลังเล็กน้อย ลำตัวกว้าง"),
    r("tail", "a tail held off the ground", "หางไม่ลากพื้น"),
  ],
  EarlySauropoda: () => [
    r("build", "an early sauropod, quadrupedal on pillar-like legs, with a moderately long neck, smaller and more lightly built than later sauropods", "ไดโนเสาร์คอยาวรุ่นแรก เดินสี่ขา คอยาวปานกลาง ตัวเล็กและเพรียวกว่ารุ่นหลัง", true),
    r("tail", "a tail held off the ground", "หางไม่ลากพื้น"),
  ],
  Neornithischia: () => [
    r("build", "a small, lightly built two-legged plant-eater about the size of a large dog, with long hind legs for running", "ไดโนเสาร์กินพืชเดินสองขาตัวเล็กขนาดสุนัขใหญ่ ขาหลังยาวเหมาะกับการวิ่ง", true),
    r("details", "short arms with five-fingered hands, a small head with a beak, and a long stiff tail held straight out", "แขนสั้นมือ 5 นิ้ว หัวเล็กมีจะงอยปาก หางยาวแข็งยื่นตรง"),
  ],
  Psittacosauridae: () => [
    r("head", "a short, deep skull with a parrot-like beak and short horn-like cheek bones sticking out sideways, NO neck frill", "หัวสั้นลึก ปากคล้ายนกแก้ว มีกระดูกแก้มยื่นออกด้านข้าง ไม่มีแผงคอ", true),
    r("build", "a small two-legged dinosaur about 1.5–2 meters long, short arms", "เดินสองขา ตัวเล็กยาวราว 1.5–2 เมตร แขนสั้น"),
    r("quills", "a row of long bristle-like quills along the top of the tail", "มีขนแข็งยาวเรียงเป็นแถวบนหาง"),
  ],
  Iguanodontia: () => [
    r("build", "a medium-sized, bulky iguanodontian plant-eater that walks on four legs, with a long tail held off the ground", "ไดโนเสาร์กินพืชกลุ่มอิกัวโนดอน ตัวหนา เดินสี่ขา หางไม่ลากพื้น", true),
    r("head", "a long head with a toothless beak at the front", "หัวยาว ปลายปากเป็นจะงอย"),
    r("thumb", "a conical spike on each thumb", "นิ้วโป้งมีหนามรูปกรวย"),
  ],
  Hadrosauroidea: () => [
    r("head", "an early relative of duck-billed dinosaurs with a broad beak and NO head crest", "ญาติรุ่นแรกของไดโนเสาร์ปากเป็ด ปากกว้าง ไม่มีหงอน", true),
    r("build", "about 6 meters long, walks on four legs or two, tail held straight out", "ยาวราว 6 เมตร เดินได้ทั้งสี่ขาและสองขา หางยื่นตรง"),
  ],
  Titanosauria: () => [
    r("scale", "an enormous sauropod about 35 meters long, one of the largest land animals ever, with a broad, wide body", "ไดโนเสาร์คอยาวขนาดมหึมาราว 35 เมตร ลำตัวกว้าง", true),
    r("neck", "a long neck held roughly horizontal or slightly raised", "คอยาวยื่นแนวราบหรือชูขึ้นเล็กน้อย"),
    r("legs", "pillar-like legs; front feet are columns without claws", "ขาเป็นเสา เท้าหน้าไม่มีกรงเล็บ"),
  ],
};

/** Theropod groups whose posture or anatomy the generic theropod rules get wrong. */
const NO_LIPS = new Set(["Spinosauridae", "Therizinosauridae", "Archaeopterygidae", "Ornithomimosauria"]);
const NO_THREE_TOE_RULE = new Set(["Dromaeosauridae", "Spinosauridae", "Therizinosauridae"]);

/** Reconstruction guidance that reflects current consensus for each group. */
export function anatomyRules(d: Dinosaur): Rule[] {
  const group = groupOf(d);
  const rules: Rule[] = [];
  if (d.clade === "Theropoda") {
    if (group === "Dromaeosauridae") {
      rules.push(
        r(
          "pose",
          "walking with the whole body held horizontal and balanced over the hips like a seesaw, back parallel to the ground, head held low and forward at the same height as the hips, short neck curving forward rather than upward, long stiff tail extended straight back in line with the back. NOT standing upright, NOT a raised head, NOT an ostrich or kangaroo posture",
          "ลำตัวขนานพื้น หัวต่ำระดับสะโพก หางยื่นตรงแนวเดียวกับหลัง",
          true,
        ),
      );
    } else if (group === "Therizinosauridae") {
      rules.push(r("pose", "bipedal with the body tilted slightly upward at the front and the tail held off the ground", "ยืนสองขา ลำตัวเชิดขึ้นเล็กน้อย หางไม่ลากพื้น", true));
    } else {
      rules.push(
        r(
          "pose",
          "bipedal with the back held roughly horizontal and the tail held straight out behind for balance, never dragging on the ground. NOT standing upright like a kangaroo",
          "ยืนสองขา หลังขนานพื้น หางยื่นตรงไม่ลากพื้น",
          true,
        ),
      );
    }
    // Lips are well supported for most theropods, but not for beaked therizinosaurs, the
    // interlocking snout-tip teeth of spinosaurids, or bird-like Archaeopteryx.
    if (!NO_LIPS.has(group)) {
      rules.push(
        r("lips", "mouth closed with all teeth fully hidden behind scaly lips, like a monitor lizard. NO visible teeth", "ปากปิด มีริมฝีปากปิดฟันจนมองไม่เห็นฟัน", true),
      );
    }
    rules.push(r("hands", "hands held with palms facing each other (not pronated, not palms-down, not dangling)", "ฝ่ามือหันเข้าหากัน ไม่คว่ำลงหรือห้อยลง"));
    if (!NO_THREE_TOE_RULE.has(group)) {
      rules.push(r("feet", "three main weight-bearing toes on each foot", "เท้ามีนิ้วรับน้ำหนัก 3 นิ้ว"));
    }
  }

  const specific = GROUP_RULES[group]?.(d);
  if (specific) {
    rules.push(...specific);
  } else if (d.clade === "Sauropodomorpha") {
    rules.push(r("sauropod-build", "quadrupedal on pillar-like legs, long neck held at a natural angle, small head", "เดินสี่ขา ขาเป็นเสาตรง คอยาวในมุมธรรมชาติ หัวเล็ก"));
  } else if (d.clade === "Ornithischia") {
    rules.push(r("ornithischian-build", "beaked mouth, anatomically correct posture for an ornithischian", "ปากเป็นจะงอย ท่าทางถูกต้องตามกลุ่มออร์นิธิสเชีย"));
  }
  return rules;
}

/**
 * Age for genera whose PBDB range includes doubtful referrals or lacks stage names
 * (Spinosaurus spans 125–72 Ma there, but the genus is Cenomanian). Uses Wikipedia's range.
 */
const AGE_OVERRIDES: Record<string, string> = {
  spinosaurus: "the Cenomanian age of the Late Cretaceous (about 100–94 million years ago)",
  stegosaurus: "the Late Jurassic, Kimmeridgian–Tithonian (about 155–145 million years ago)",
  allosaurus: "the Late Jurassic (about 155–143 million years ago)",
  brachiosaurus: "the Late Jurassic (about 155–145 million years ago)",
  diplodocus: "the Late Jurassic (about 154–152 million years ago)",
  archaeopteryx: "the Late Jurassic, Tithonian (about 150 million years ago)",
  triceratops: "the late Maastrichtian, at the very end of the Cretaceous (about 68–66 million years ago)",
  ankylosaurus: "the late Maastrichtian, at the very end of the Cretaceous (about 68–66 million years ago)",
  pachycephalosaurus: "the late Maastrichtian, at the very end of the Cretaceous (about 68–66 million years ago)",
  dilophosaurus: "the Early Jurassic (about 186 million years ago)",
  deinonychus: "the Early Cretaceous (about 115–108 million years ago)",
  utahraptor: "the Early Cretaceous (about 139–135 million years ago)",
  carnotaurus: "the Maastrichtian of the Late Cretaceous (about 69–66 million years ago)",
  therizinosaurus: "the Maastrichtian of the Late Cretaceous (about 69–66 million years ago)",
  parasaurolophus: "the Campanian of the Late Cretaceous (about 76.5–73 million years ago)",
  isanosaurus: "the Early Jurassic, Sinemurian–Pliensbachian (about 195–185 million years ago)",
  mamenchisaurus: "the Late Jurassic (about 160–145 million years ago)",
  psittacosaurus: "the Early Cretaceous (about 125–113 million years ago)",
};

// Khorat Group formations of northeastern Thailand.
const NAM_PHONG =
  "an Early Jurassic river floodplain in northeastern Thailand (Nam Phong Formation), with conifers, cycads and ferns, no grass and no flowering plants";
const PHU_KRADUNG =
  "a Late Jurassic river floodplain like the Phu Kradung Formation of northeastern Thailand, with conifers, cycads, tree ferns and ferns, no grass and no flowering plants";
const SAO_KHUA =
  "an Early Cretaceous river floodplain like the Sao Khua Formation of northeastern Thailand, warm and semi-arid with conifers, cycads and ferns along meandering rivers, no grass and no flowering plants";
const KHOK_KRUAT =
  "an Early Cretaceous floodplain like the Khok Kruat Formation of northeastern Thailand, warm and semi-arid with conifers, cycads, ferns and rare early flowering plants, no grass";

const MORRISON =
  "a semi-arid Late Jurassic floodplain like the Morrison Formation of western North America, with conifers, cycads, ginkgoes, tree ferns and ferns along a river, no grass and no flowering plants";
const HELL_CREEK =
  "a humid latest-Cretaceous floodplain forest like the Hell Creek Formation of North America, with conifers, ferns and early flowering trees and shrubs, no grass";

/** Known depositional settings that the period-wide default would get wrong. */
const HABITAT_OVERRIDES: Record<string, string> = {
  spinosaurus:
    "shallow water at the edge of a wide Late Cretaceous river system in North Africa, like the Kem Kem beds of Morocco, with large fish in the water, ferns and conifers on the banks, no grass",
  velociraptor:
    "an arid Late Cretaceous landscape of red sand dunes with sparse low shrubs and scattered small conifers, like the Djadochta Formation of Mongolia",
  stegosaurus: MORRISON,
  allosaurus: MORRISON,
  brachiosaurus: MORRISON,
  brontosaurus: MORRISON,
  diplodocus: MORRISON,
  triceratops: HELL_CREEK,
  ankylosaurus: HELL_CREEK,
  pachycephalosaurus: HELL_CREEK,
  archaeopteryx:
    "a warm, semi-arid Late Jurassic island in the Solnhofen archipelago of southern Germany, with low conifer shrubs and cycads near a shallow turquoise lagoon, no grass and no flowering plants",
  giganotosaurus:
    "an Early Cretaceous river floodplain in Patagonia, Argentina, like the Candeleros Formation, with Araucaria conifers and ferns, no grass",
  argentinosaurus: "a Cretaceous floodplain in Patagonia, Argentina, with tall Araucaria conifers and ferns, no grass",
  carnotaurus: "a Late Cretaceous coastal plain in Patagonia, Argentina, like the La Colonia Formation, with conifers, ferns and early flowering plants near a tidal estuary, no grass",
  therizinosaurus: "a humid Late Cretaceous river floodplain forest like the Nemegt Formation of Mongolia, with conifers and broadleaf flowering trees, no grass",
  dilophosaurus: "an Early Jurassic river floodplain like the Kayenta Formation of Arizona, with conifers, cycads and ferns, no grass and no flowering plants",
  deinonychus: "an Early Cretaceous floodplain like the Cloverly Formation of Montana, with conifers, cycads, tree ferns and ferns, no grass",
  utahraptor: "an Early Cretaceous semi-arid plain like the Cedar Mountain Formation of Utah, with conifers, cycads and ferns, no grass and no flowering plants",
  parasaurolophus: "a Late Cretaceous coastal floodplain like the Dinosaur Park Formation of Alberta, with conifers, ferns and early flowering plants by a river, no grass",
  isanosaurus: NAM_PHONG,
  minimocursor: PHU_KRADUNG,
  uragasaurus: PHU_KRADUNG,
  mamenchisaurus: PHU_KRADUNG,
  phuwiangosaurus: SAO_KHUA,
  siamotyrannus: SAO_KHUA,
  kinnareemimus: SAO_KHUA,
  phuwiangvenator: SAO_KHUA,
  vayuraptor: SAO_KHUA,
  siamraptor: KHOK_KRUAT,
  nagatitan: KHOK_KRUAT,
  sirindhorna: KHOK_KRUAT,
  ratchasimasaurus: KHOK_KRUAT,
  siamodon: KHOK_KRUAT,
  psittacosaurus: KHOK_KRUAT,
};

function habitat(d: Dinosaur): string {
  if (HABITAT_OVERRIDES[d.slug]) return HABITAT_OVERRIDES[d.slug];
  const mid = (d.ageRangeMa[0] + d.ageRangeMa[1]) / 2;
  if (mid >= 201.4) return "a Triassic landscape with conifers, cycads and ferns, no grass and no flowering plants";
  if (mid >= 145) return "a Jurassic landscape with conifers, cycads, ginkgoes and ferns, no grass and no flowering plants";
  return "a Late Cretaceous landscape with conifers, ferns and early flowering plants, no grass lawns";
}

/** Null when the genus has no English Wikipedia article (several recently named Thai genera). */
async function wikipediaSummary(title: string): Promise<{ text: string; url: string } | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
  let res = await fetch(url, { headers: { "User-Agent": WIKI_UA } });
  for (let attempt = 1; res.status === 429 && attempt <= 4; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
    res = await fetch(url, { headers: { "User-Agent": WIKI_UA } });
  }
  if (res.status === 404) return null;
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

function buildPrompt(d: Dinosaur, summary: string | null): { prompt: string; checklist: AiImage["checklist"] } {
  const anatomy = anatomyRules(d);
  const [composition, scene, clean] = sceneRules(d);
  const early = anatomy.filter((r) => r.early);
  const rest = anatomy.filter((r) => !r.early);
  const prompt = [
    `Scientifically accurate paleoart of ${d.name}, a ${d.diet === "unknown" ? "" : `${d.diet} `}${groupOf(
      d,
    )} dinosaur from ${
      AGE_OVERRIDES[d.slug] ??
      `${d.earlyInterval ?? ""}${d.lateInterval ? `–${d.lateInterval}` : ""} times (${d.ageRangeMa[0]}–${d.ageRangeMa[1]} million years ago)`
    }.`,
    ...early.map((r) => `${r.prompt[0].toUpperCase()}${r.prompt.slice(1)}.`),
    ...(summary ? [`Reference: ${summary}`] : []),
    ...(rest.length ? [`Anatomy: ${rest.map((r) => r.prompt).join("; ")}.`] : []),
    `${composition.prompt}, ${scene.prompt}.`,
    "Natural history museum illustration style, realistic textures and natural daylight, muted natural colors.",
    `${clean.prompt}.`,
  ].join(" ");
  const checklist = [...anatomy, composition, scene, clean].map(({ id, check }) => ({ id, label: check }));
  return { prompt, checklist };
}

export async function generateOpenAi(prompt: string, apiKey: string, model = MODEL): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, size: OPENAI_SIZE, quality: OPENAI_QUALITY, output_format: "png", n: 1 }),
  });
  const json = (await res.json()) as { data?: { b64_json?: string }[]; error?: { message: string } };
  const b64 = json.data?.[0]?.b64_json;
  if (!res.ok || !b64) throw new Error(`OpenAI ${res.status}: ${json.error?.message ?? JSON.stringify(json).slice(0, 500)}`);
  return Buffer.from(b64, "base64");
}

/**
 * Gemini image models on Google's Gemini Enterprise Agent Platform (Vertex AI until 2026; the
 * endpoint kept its aiplatform.googleapis.com name), called with an API key. Image models live on
 * the global endpoint, so the project is named in the URL when AGENT_PLATFORM_PROJECT is set.
 */
export async function generateAgentPlatform(prompt: string, apiKey: string, model = MODEL): Promise<Buffer> {
  const project = process.env.AGENT_PLATFORM_PROJECT;
  const base = project
    ? `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}`
    : `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}`;
  const url = `${base}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: AGENT_PLATFORM_ASPECT } },
    }),
  });
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] }; finishReason?: string }[];
    error?: { message: string };
  };
  const b64 = json.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData?.data;
  if (!res.ok || !b64) {
    const reason = json.error?.message ?? json.candidates?.[0]?.finishReason ?? JSON.stringify(json).slice(0, 500);
    throw new Error(`Agent Platform ${res.status}: ${reason}`);
  }
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
  const token = IS_OPENAI
    ? process.env.OPENAI_API_KEY
    : IS_AGENT_PLATFORM
      ? process.env.AGENT_PLATFORM_API_KEY
      : process.env.CLOUDFLARE_AI_TOKEN;
  if (!token && !dryRun) {
    throw new Error(
      IS_OPENAI
        ? "Set OPENAI_API_KEY in .env.local"
        : IS_AGENT_PLATFORM
          ? "Set AGENT_PLATFORM_API_KEY in .env.local (API key with the Agent Platform API enabled)"
          : "Set CLOUDFLARE_AI_TOKEN in .env.local (API token with Workers AI permission)",
    );
  }
  const account = IS_OPENAI || IS_AGENT_PLATFORM ? "" : await accountId();
  const generate = (prompt: string) =>
    IS_OPENAI
      ? generateOpenAi(prompt, token!)
      : IS_AGENT_PLATFORM
        ? generateAgentPlatform(prompt, token!)
        : generateWorkersAi(prompt, account, token!);

  const dinosaurs = JSON.parse(await readFile(DATA_PATH, "utf8")) as Dinosaur[];
  const textEn = JSON.parse(await readFile(TEXT_EN_PATH, "utf8")) as { labels: Record<string, string> };
  const popularity = JSON.parse(await readFile(POPULARITY_PATH, "utf8")) as PopularityData;
  // Re-read before every use: reviews may be recorded into the same file while a long run is going.
  const loadData = async (): Promise<AiImageData> =>
    existsSync(OUTPUT_DATA) ? JSON.parse(await readFile(OUTPUT_DATA, "utf8")) : {};
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const slug of slugs) {
    const d = dinosaurs.find((x) => x.slug === slug);
    if (!d) throw new Error(`Unknown slug: ${slug}`);
    const title = popularity.items.find((p) => p.slug === slug)?.wikipediaTitle ?? d.name;
    const summary = await wikipediaSummary(title);
    const { prompt, checklist } = buildPrompt(d, summary?.text ?? null);
    const untranslated = checklist.filter((c) => !textEn.labels[c.label]).map((c) => c.label);
    if (untranslated.length) {
      console.warn(`[${slug}] add English for these checklist items to data/ai-image-text-en.json:\n  ${untranslated.join("\n  ")}`);
    }
    console.log(`\n[${slug}] ${prompt}\n`);
    if (dryRun) continue;

    const png = await generate(prompt);
    const before = await loadData();
    if (replace) before[slug] = [];
    const index = (before[slug]?.length ?? 0) + 1;
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
      ...(FRAGMENTARY.has(slug) ? { caveat: FRAGMENTARY_CAVEAT } : {}),
      promptSources: [
        ...(summary ? [{ label: "Wikipedia (en)", url: summary.url }] : []),
        { label: "Paleobiology Database", url: `https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${d.pbdbTaxonId}` },
      ],
      createdAt: new Date().toISOString(),
    };
    const latest = await loadData();
    latest[slug] = [...(replace ? [] : (latest[slug] ?? [])), image];
    await writeFile(OUTPUT_DATA, JSON.stringify(latest, null, 2) + "\n");
    console.log(`[${slug}] saved ${files[960]}`);
  }
}

// Only when run directly: scripts/generate-coloring-pages.ts imports the rules and OpenAI call.
// (tsx doesn't set require.main, so check the script path instead.)
if (process.argv[1]?.endsWith("generate-ai-images.ts")) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
