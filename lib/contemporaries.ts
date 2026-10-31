import formationsData from "@/data/formations.json";
import { getDinosaurBySlug, type DinosaurWithContent } from "@/lib/dinosaurs";

/**
 * Formation names per slug with occurrence counts, most first (scripts/fetch-formations.ts). JSON
 * infers the pairs as (string | number)[], so the tuple cast goes through unknown.
 */
const formations = formationsData as unknown as Record<string, [string, number][]>;

export interface Contemporary {
  dinosaur: DinosaurWithContent;
  /** The shared formation that ties them together most strongly. */
  formation: string;
}

/**
 * A genus's main formations: its most common one plus any it was found in at least twice. A single
 * stray record (often an old, doubtful identification) shouldn't make two genera neighbours.
 */
function mainFormations(slug: string): Map<string, number> {
  const list = formations[slug] ?? [];
  const total = list.reduce((sum, [, n]) => sum + n, 0);
  const main = new Map<string, number>();
  list.forEach(([name, n], i) => {
    if (i === 0 || n >= 2) main.set(name, n / total);
  });
  return main;
}

let byFormation: Map<string, string[]> | null = null;

function formationIndex(): Map<string, string[]> {
  if (byFormation) return byFormation;
  byFormation = new Map();
  for (const slug of Object.keys(formations)) {
    for (const name of mainFormations(slug).keys()) byFormation.set(name, [...(byFormation.get(name) ?? []), slug]);
  }
  return byFormation;
}

/**
 * Genera from the same rock formations (both counting it among their main ones), strongest link
 * first: the share of each genus's finds that come from the shared formation. Being in one formation
 * means the same region and broad span of time, not that two individuals ever met.
 */
export function getContemporaries(slug: string, limit = 8): Contemporary[] {
  const mine = mainFormations(slug);
  const index = formationIndex();
  const best = new Map<string, { score: number; formation: string }>();
  for (const [name, myShare] of mine) {
    for (const other of index.get(name) ?? []) {
      if (other === slug) continue;
      const score = Math.min(myShare, mainFormations(other).get(name) ?? 0);
      const current = best.get(other);
      if (!current || score > current.score) best.set(other, { score, formation: name });
    }
  }
  return [...best.entries()]
    .map(([other, { score, formation }]) => ({ dinosaur: getDinosaurBySlug(other), score, formation }))
    .filter((c): c is { dinosaur: DinosaurWithContent; score: number; formation: string } => Boolean(c.dinosaur))
    // Coarse score bands, so a well-known genus (Triceratops beside T. rex) isn't pushed out by
    // rarities that happen to be known only from the shared formation.
    .sort((a, b) => Math.round(b.score * 4) - Math.round(a.score * 4) || b.dinosaur.occurrenceCount - a.dinosaur.occurrenceCount)
    .slice(0, limit)
    .map(({ dinosaur, formation }) => ({ dinosaur, formation }));
}
