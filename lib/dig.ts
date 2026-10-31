import type { DigDino } from "@/components/FossilDig";
import { getQuizPool } from "@/lib/quiz";
import { getSizeIndex } from "@/lib/sizes";
import type { Locale } from "@/lib/i18n";

/**
 * Dinosaurs for the fossil dig game: the quiz's well-known set (popular and Thai), limited to those
 * with a known length so the buried skeleton has the right body plan.
 */
export function getDigPool(lang: Locale): DigDino[] {
  const known = new Set(getQuizPool(lang).map((q) => q.slug));
  return getSizeIndex(lang)
    .filter((s) => known.has(s.slug))
    .map(({ slug, name, localName, lengthM, plan, thumbnail }) => ({ slug, name, localName, lengthM, plan, thumbnail }));
}
