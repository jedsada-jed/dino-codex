import { getDinosaurBySlug, localContent } from "@/lib/dinosaurs";
import { getQuizPool, type QuizItem } from "@/lib/quiz";
import type { Locale } from "@/lib/i18n";

/** A quiz-pool dinosaur plus one fun fact, when there's a hand-written write-up in this language. */
export interface DailyItem extends Omit<QuizItem, "ageRangeMa" | "thailand"> {
  fact: string | null;
}

/** Change to reshuffle the daily order; any fixed value keeps it stable across builds. */
const SHUFFLE_SEED = 66;

/** Small seeded PRNG (mulberry32), so the shuffle is the same on every build and in both languages. */
function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Candidates for the homepage's dinosaur of the day: the same well-known set as the quiz, in a
 * fixed shuffled order so every visitor gets the same pick on the same day, and neighbouring days
 * aren't alphabetical neighbours with near-identical names.
 */
export function getDailyPool(lang: Locale): DailyItem[] {
  const pool = getQuizPool(lang).sort((a, b) => a.slug.localeCompare(b.slug));
  const random = seededRandom(SHUFFLE_SEED);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool
    .map((q) => {
      const d = getDinosaurBySlug(q.slug);
      return {
        slug: q.slug,
        name: q.name,
        localName: q.localName,
        thumbnail: q.thumbnail,
        thumbnailIsAi: q.thumbnailIsAi,
        period: q.period,
        diet: q.diet,
        lengthM: q.lengthM,
        fact: (d && localContent(d, lang)?.funFacts[0]) ?? null,
      };
    });
}
