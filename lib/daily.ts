import { getDinosaurBySlug, localContent } from "@/lib/dinosaurs";
import { getQuizPool, type QuizItem } from "@/lib/quiz";
import type { Locale } from "@/lib/i18n";

/** A quiz-pool dinosaur plus one fun fact, when there's a hand-written write-up in this language. */
export interface DailyItem extends Omit<QuizItem, "ageRangeMa" | "thailand"> {
  fact: string | null;
}

/**
 * Candidates for the homepage's dinosaur of the day: the same well-known set as the quiz, in a
 * fixed order so every visitor gets the same pick on the same day.
 */
export function getDailyPool(lang: Locale): DailyItem[] {
  return getQuizPool(lang)
    .sort((a, b) => a.slug.localeCompare(b.slug))
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
