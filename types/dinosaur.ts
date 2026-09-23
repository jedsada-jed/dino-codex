export type Diet = "carnivore" | "herbivore" | "omnivore" | "unknown";

export type Clade = "Theropoda" | "Sauropodomorpha" | "Ornithischia" | "unclassified";

export interface DinosaurImage {
  /** Commons file title, e.g. "Tyrannosaurus Rex Holotype.jpg" */
  commonsFile: string;
  /** Original full-resolution URL on upload.wikimedia.org, used only by the image-fetch pipeline. */
  sourceUrl: string;
  commonsPageUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
  width: number | null;
  height: number | null;
  /**
   * Populated by scripts/fetch-images.ts once the image has been downloaded and
   * converted. Widths are 330 and 960 — the closest Wikimedia "standard" thumbnail
   * steps to a small/large pair, since Wikimedia now rejects thumbnail requests for
   * arbitrary widths (see scripts/fetch-images.ts for details).
   */
  localSmall: string | null;
  localLarge: string | null;
}

export interface Dinosaur {
  slug: string;
  /** Scientific genus name. */
  name: string;
  namingAuthor: string;
  namingYear: number;
  clade: Clade;
  family: string | null;
  diet: Diet;
  /** [oldest Ma, youngest Ma] the genus is known from. */
  ageRangeMa: [number, number];
  earlyInterval: string | null;
  lateInterval: string | null;
  /** ISO 3166-1 alpha-2 country codes derived from fossil occurrence localities. */
  countries: string[];
  occurrenceCount: number;
  pbdbTaxonId: number;
  wikidataId: string | null;
  images: DinosaurImage[];
}

export interface DinosaurThaiContent {
  nameTh: string;
  nameMeaningTh: string;
  sizeComparisonTh?: string;
  descriptionTh?: string;
  funFactsTh: string[];
}

export interface PipelineMeta {
  generatedAt: string;
  dinosaurCount: number;
  withImageCount: number;
  thailandCount: number;
  sources: {
    pbdb: { name: string; url: string; license: string };
    wikidata: { name: string; url: string; license: string };
    wikimediaCommons: { name: string; url: string; license: string };
  };
}
