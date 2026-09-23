/**
 * Builds data/dinosaurs.json and data/meta.json from three public sources:
 *  - Paleobiology Database (PBDB)   https://paleobiodb.org         (CC BY 4.0)
 *  - Wikidata                       https://www.wikidata.org       (CC0)
 *  - Wikimedia Commons              https://commons.wikimedia.org  (per-file license)
 *
 * Run with: npm run fetch:dinosaurs
 *
 * This script only collects objective/factual data. Thai text is never generated
 * here — it lives entirely in data/content-th.json, written by hand.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { Clade, Diet, Dinosaur, DinosaurImage, PipelineMeta } from "../types/dinosaur";

const WIKIMEDIA_UA =
  process.env.WIKIMEDIA_UA ??
  "dino-wiki/0.1 (Thai dinosaur encyclopedia; https://github.com/; contact via repo issues)";

const DATA_DIR = path.join(__dirname, "..", "data");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, headers: Record<string, string> = {}, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": WIKIMEDIA_UA, ...headers } });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`  retrying (${attempt}/${retries}) after error: ${(err as Error).message}`);
      await sleep(1000 * attempt);
    }
  }
  throw new Error("unreachable");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Step 1: PBDB taxa — the authoritative list of dinosaur genera
// ---------------------------------------------------------------------------

interface PbdbTaxonRecord {
  taxon_no: string;
  accepted_no: string;
  taxon_name: string;
  flags?: string;
  ref_author: string;
  ref_pubyr: string;
  n_occs: number;
  class?: string;
  family?: string;
  diet?: string;
  early_interval?: string;
  late_interval?: string;
  firstapp_max_ma: number;
  lastapp_min_ma: number;
}

/**
 * Fossil-egg form-taxa ("oogenera", e.g. Macroolithus) and footprint ichnotaxa are not
 * body-fossil dinosaur genera and don't fit a "meet the animal" encyclopedia entry.
 * PBDB flags most of these with flags="I"/"F"/"IF", but some newer oogenera (e.g.
 * Himeoolithus) aren't flagged, so we also filter on the "-oolithus"/"-oolithes" naming
 * convention as a safety net.
 */
function isRealDinosaurGenus(r: PbdbTaxonRecord): boolean {
  if (r.taxon_no !== r.accepted_no) return false; // skip synonyms, keep only the accepted taxon
  if (r.n_occs <= 0) return false;
  if (r.flags && /[IF]/.test(r.flags)) return false;
  if (/oolithus$|oolithes$/i.test(r.taxon_name)) return false;
  return true;
}

/**
 * PBDB's per-record "class" field is populated from whichever classification opinion
 * chain happens to apply and is NOT consistently useful here (e.g. it comes back as
 * plain "Reptilia" for Tyrannosaurus). Also, in PBDB's actual taxonomic tree "Theropoda"
 * is a direct child of Dinosauria, a *sibling* of "Saurischia" rather than nested under
 * it (Saurischia there only covers Sauropodomorpha + a few basal forms) — the opposite
 * of the traditional Saurischia = Theropoda + Sauropodomorpha definition. So instead of
 * "Saurischia"/"Ornithischia" we classify into the three clades PBDB's tree actually
 * supports well — Theropoda, Sauropodomorpha, Ornithischia — using genus-name set
 * membership fetched directly from each clade's subtree.
 */
async function fetchCladeMembership(): Promise<{ theropoda: Set<string>; sauropodomorpha: Set<string>; ornithischia: Set<string> }> {
  console.log("Fetching Theropoda / Sauropodomorpha / Ornithischia genus lists for clade classification...");
  const fetchNames = (baseName: string) =>
    fetchJson<{ records: { taxon_name: string }[] }>(
      `https://paleobiodb.org/data1.2/taxa/list.json?base_name=${baseName}&rel=all_children&rank=genus&vocab=pbdb`
    ).then((data) => new Set(data.records.map((r) => r.taxon_name)));

  const [theropoda, sauropodomorpha, ornithischia] = await Promise.all([
    fetchNames("Theropoda"),
    fetchNames("Sauropodomorpha"),
    fetchNames("Ornithischia"),
  ]);
  return { theropoda, sauropodomorpha, ornithischia };
}

function classifyClade(
  name: string,
  membership: { theropoda: Set<string>; sauropodomorpha: Set<string>; ornithischia: Set<string> }
): Clade {
  if (membership.theropoda.has(name)) return "Theropoda";
  if (membership.sauropodomorpha.has(name)) return "Sauropodomorpha";
  if (membership.ornithischia.has(name)) return "Ornithischia";
  return "unclassified";
}

function classifyDiet(pbdbDiet: string | undefined): Diet {
  if (!pbdbDiet) return "unknown";
  const d = pbdbDiet.toLowerCase();
  if (d.includes("omni")) return "omnivore";
  if (d.includes("herb")) return "herbivore";
  if (d.includes("carn")) return "carnivore";
  return "unknown";
}

async function fetchPbdbGenera(): Promise<PbdbTaxonRecord[]> {
  console.log("Fetching PBDB genus list (Dinosauria, excluding Aves)...");
  const url =
    "https://paleobiodb.org/data1.2/taxa/list.json" +
    "?base_name=Dinosauria^Aves&rel=all_children&rank=genus&taxon_status=valid&vocab=pbdb&show=full";
  const data = await fetchJson<{ records: PbdbTaxonRecord[] }>(url);
  const filtered = data.records.filter(isRealDinosaurGenus);
  console.log(`  ${data.records.length} raw records -> ${filtered.length} valid non-avian dinosaur genera`);
  return filtered;
}

// ---------------------------------------------------------------------------
// Step 2: PBDB occurrences — aggregate fossil-locality country codes per genus
// ---------------------------------------------------------------------------

interface PbdbOccRecord {
  accepted_name: string;
  cc?: string;
}

async function fetchCountriesByGenus(genusNames: Set<string>): Promise<Map<string, Set<string>>> {
  console.log("Fetching PBDB occurrences for fossil locality countries...");
  const url = "https://paleobiodb.org/data1.2/occs/list.json?base_name=Dinosauria^Aves&show=loc&vocab=pbdb";
  const data = await fetchJson<{ records: PbdbOccRecord[] }>(url);
  console.log(`  ${data.records.length} occurrence records`);

  const byGenus = new Map<string, Set<string>>();
  for (const occ of data.records) {
    if (!occ.cc || !occ.accepted_name) continue;
    const genus = occ.accepted_name.split(" ")[0];
    if (!genusNames.has(genus)) continue;
    if (!byGenus.has(genus)) byGenus.set(genus, new Set());
    byGenus.get(genus)!.add(occ.cc);
  }
  return byGenus;
}

// ---------------------------------------------------------------------------
// Step 3: Wikidata — match genus names to items and grab a candidate image
// ---------------------------------------------------------------------------

interface WikidataMatch {
  wikidataId: string;
  commonsFile: string | null;
}

interface SparqlBinding {
  taxonName?: { value: string };
  item: { value: string };
  image?: { value: string };
}

async function fetchWikidataMatches(genusNames: string[]): Promise<Map<string, WikidataMatch>> {
  console.log("Querying Wikidata for taxon matches + images...");
  const result = new Map<string, WikidataMatch>();
  const batches = chunk(genusNames, 40);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const values = batch.map((n) => `"${n.replace(/"/g, '\\"')}"`).join(" ");
    const query = `SELECT ?taxonName ?item ?image WHERE {
      VALUES ?taxonName { ${values} }
      ?item wdt:P225 ?taxonName.
      OPTIONAL { ?item wdt:P18 ?image }
    }`;
    const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query);
    const data = await fetchJson<{ results: { bindings: SparqlBinding[] } }>(url, {
      Accept: "application/sparql-results+json",
    });

    for (const b of data.results.bindings) {
      const name = b.taxonName?.value;
      if (!name || result.has(name)) continue; // keep first match+image only
      const itemUri: string = b.item.value;
      const wikidataId = itemUri.substring(itemUri.lastIndexOf("/") + 1);
      let commonsFile: string | null = null;
      if (b.image?.value) {
        const decoded = decodeURIComponent(b.image.value);
        commonsFile = decoded.substring(decoded.lastIndexOf("/") + 1).replace(/_/g, " ");
      }
      result.set(name, { wikidataId, commonsFile });
    }
    console.log(`  batch ${i + 1}/${batches.length} -> ${result.size} matches so far`);
    await sleep(500);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Step 3b: Wikimedia Commons category listing — Wikidata's P18 (image) property
// often references only one image (sometimes a skull/bone photo) even when the
// Commons category for the same genus has a proper life-restoration illustration
// that Wikidata was simply never updated to link. So for each genus we also list
// its Commons category directly and rank every candidate (from the category and
// from Wikidata) by filename, preferring restorations over fossil/skull photos.
// ---------------------------------------------------------------------------

const BAD_IMAGE_RE =
  /\b(skull|skeleton|holotype|specimen|fossil|jaw|mandible|maxilla|tooth|teeth|vertebra|vertebrae|femur|tibia|humerus|radius|ulna|cranium|cranial|fragment|bone|material|cast|distribution|range|size|comparison|compared|silhouette|chart|scalebar|infobox|taxobox|head)\b|\bmap\b|diagram|location/i;
const GOOD_IMAGE_RE = /(life[\s_-]?restoration|reconstruction|illustration|_nt\.|_bw\.|_db\d*\.|_pg\.|paleoart)/i;
const UNUSABLE_FORMAT_RE = /\.(svg|pdf|ogv|webm|tif|tiff)$/i;

/**
 * Category membership on Commons isn't a fully reliable "this file depicts this genus"
 * signal — multi-subject files (e.g. a size-comparison chart across many dinosaurs) can
 * end up categorized under an individual genus too. Requiring the genus name to actually
 * appear in the filename filters those out; anything that fails this check is almost
 * certainly not a dedicated picture of the animal.
 */
function scoreImageFilename(filename: string, genusName: string): number {
  let score = 0;
  if (!filename.toLowerCase().includes(genusName.toLowerCase())) score -= 8;
  if (GOOD_IMAGE_RE.test(filename)) score += 3;
  if (BAD_IMAGE_RE.test(filename)) score -= 3;
  if (UNUSABLE_FORMAT_RE.test(filename)) score -= 10;
  return score;
}

async function fetchCategoryFiles(genusName: string): Promise<string[]> {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtype=file&cmlimit=50&format=json&cmtitle=" +
    encodeURIComponent(`Category:${genusName}`);
  try {
    const data = await fetchJson<{ query?: { categorymembers: { title: string }[] } }>(url, {}, 2);
    return (data.query?.categorymembers ?? []).map((m) => m.title.replace(/^File:/, ""));
  } catch {
    return [];
  }
}

/** Picks the best lead-image candidate per genus from its Commons category plus its Wikidata image. */
async function fetchBestImagePerGenus(
  genusNames: string[],
  wikidataMatches: Map<string, WikidataMatch>
): Promise<Map<string, string>> {
  console.log("Scanning Wikimedia Commons categories for the best lead image per genus...");
  const best = new Map<string, string>();

  for (let i = 0; i < genusNames.length; i++) {
    const name = genusNames[i];
    const categoryFiles = await fetchCategoryFiles(name);
    const wikidataFile = wikidataMatches.get(name)?.commonsFile;
    const candidates = [...new Set([...categoryFiles, ...(wikidataFile ? [wikidataFile] : [])])];

    if (candidates.length > 0) {
      candidates.sort((a, b) => scoreImageFilename(b, name) - scoreImageFilename(a, name));
      best.set(name, candidates[0]);
    }

    if ((i + 1) % 200 === 0) console.log(`  ${i + 1}/${genusNames.length} genera checked`);
    await sleep(150);
  }
  return best;
}

// ---------------------------------------------------------------------------
// Step 4: Wikimedia Commons — attribution metadata for each candidate image
// ---------------------------------------------------------------------------

interface CommonsInfo {
  sourceUrl: string;
  commonsPageUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
  width: number | null;
  height: number | null;
}

interface CommonsImageInfo {
  url: string;
  descriptionurl: string;
  width?: number;
  height?: number;
  extmetadata?: Record<string, { value: string }>;
}

interface CommonsPage {
  title: string;
  imageinfo?: CommonsImageInfo[];
}

async function fetchCommonsInfo(fileTitles: string[]): Promise<Map<string, CommonsInfo>> {
  console.log("Fetching Wikimedia Commons attribution metadata...");
  const result = new Map<string, CommonsInfo>();
  const batches = chunk(fileTitles, 50);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const titles = batch.map((t) => `File:${t}`).join("|");
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata%7Curl%7Csize&format=json&titles=" +
      encodeURIComponent(titles);
    const data = await fetchJson<{ query?: { pages: Record<string, CommonsPage> } }>(url);
    const pages = data.query?.pages ?? {};

    for (const page of Object.values(pages)) {
      const info = page.imageinfo?.[0];
      if (!info) continue;
      const title: string = page.title.replace(/^File:/, "");
      const meta = info.extmetadata ?? {};
      result.set(title, {
        sourceUrl: info.url,
        commonsPageUrl: info.descriptionurl,
        author: stripHtml(meta.Artist?.value) || "Unknown",
        license: meta.LicenseShortName?.value ?? "Unknown",
        licenseUrl: meta.LicenseUrl?.value ?? "https://commons.wikimedia.org/wiki/Commons:Licensing",
        width: info.width ?? null,
        height: info.height ?? null,
      });
    }
    console.log(`  batch ${i + 1}/${batches.length} -> ${result.size} images resolved so far`);
    await sleep(500);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const genera = await fetchPbdbGenera();
  const genusNameSet = new Set(genera.map((g) => g.taxon_name));

  const cladeMembership = await fetchCladeMembership();
  const countriesByGenus = await fetchCountriesByGenus(genusNameSet);
  const wikidataMatches = await fetchWikidataMatches(genera.map((g) => g.taxon_name));
  const bestImages = await fetchBestImagePerGenus(genera.map((g) => g.taxon_name), wikidataMatches);

  const fileTitles = [...new Set(bestImages.values())];
  const commonsInfo = await fetchCommonsInfo(fileTitles);

  const dinosaurs: Dinosaur[] = genera.map((g) => {
    const wd = wikidataMatches.get(g.taxon_name);
    const bestFile = bestImages.get(g.taxon_name);
    const images: DinosaurImage[] = [];
    if (bestFile) {
      const info = commonsInfo.get(bestFile);
      if (info) {
        images.push({
          commonsFile: bestFile,
          sourceUrl: info.sourceUrl,
          commonsPageUrl: info.commonsPageUrl,
          author: info.author,
          license: info.license,
          licenseUrl: info.licenseUrl,
          width: info.width,
          height: info.height,
          localSmall: null,
          localLarge: null,
        });
      }
    }

    return {
      slug: slugify(g.taxon_name),
      name: g.taxon_name,
      namingAuthor: g.ref_author,
      namingYear: Number(g.ref_pubyr),
      clade: classifyClade(g.taxon_name, cladeMembership),
      family: g.family ?? null,
      diet: classifyDiet(g.diet),
      ageRangeMa: [g.firstapp_max_ma, g.lastapp_min_ma],
      earlyInterval: g.early_interval ?? null,
      lateInterval: g.late_interval ?? null,
      countries: [...(countriesByGenus.get(g.taxon_name) ?? [])].sort(),
      occurrenceCount: g.n_occs,
      pbdbTaxonId: Number(g.taxon_no),
      wikidataId: wd?.wikidataId ?? null,
      images,
    };
  });

  dinosaurs.sort((a, b) => a.name.localeCompare(b.name));

  const meta: PipelineMeta = {
    generatedAt: new Date().toISOString(),
    dinosaurCount: dinosaurs.length,
    withImageCount: dinosaurs.filter((d) => d.images.length > 0).length,
    thailandCount: dinosaurs.filter((d) => d.countries.includes("TH")).length,
    sources: {
      pbdb: { name: "Paleobiology Database", url: "https://paleobiodb.org", license: "CC BY 4.0" },
      wikidata: { name: "Wikidata", url: "https://www.wikidata.org", license: "CC0" },
      wikimediaCommons: {
        name: "Wikimedia Commons",
        url: "https://commons.wikimedia.org",
        license: "Per-file, see each image's attribution",
      },
    },
  };

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, "dinosaurs.json"), JSON.stringify(dinosaurs, null, 2));
  await writeFile(path.join(DATA_DIR, "meta.json"), JSON.stringify(meta, null, 2));

  console.log("\nDone.");
  console.log(`  dinosaurs.json: ${dinosaurs.length} genera`);
  console.log(`  with image:     ${meta.withImageCount}`);
  console.log(`  found in TH:    ${meta.thailandCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
