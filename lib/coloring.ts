import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { displayName, getDinosaurBySlug } from "@/lib/dinosaurs";
import { MIN_COVER_SCORE } from "@/lib/ai-images";
import type { Locale } from "@/lib/i18n";
import type { ColoringData } from "@/types/coloring";

export interface ColoringItem {
  slug: string;
  name: string;
  /** Scientific name, when `name` is a Thai name. */
  sci: string | null;
  image: string;
  thumb: string;
  width: number;
  height: number;
  model: string;
  /** Checklist items that passed review, out of `total`. */
  passed: number;
  total: number;
  /** Reviewer notes, mostly where the drawing doesn't match the evidence. Shown on the card. */
  notes: string[];
}

/** A page that fails one of these isn't usable as a coloring page, whatever its anatomy score. */
const PAGE_CHECKS = new Set(["line-art", "no-fill", "composition", "clean"]);

/**
 * Reviewed coloring pages, in data/coloring.json order. A page is shown when every page check
 * (clean line art, no fill, whole animal, nothing modern) passed and at least MIN_COVER_SCORE of
 * all checks passed, the same bar as AI cover images. Unreviewed pages stay off the site.
 * Read from disk (not imported) so the page still builds before any page has been generated.
 */
export function getColoringPages(lang: Locale): ColoringItem[] {
  const file = path.join(process.cwd(), "data", "coloring.json");
  if (!existsSync(file)) return [];
  const data = JSON.parse(readFileSync(file, "utf8")) as ColoringData;
  const items: ColoringItem[] = [];
  for (const [slug, page] of Object.entries(data)) {
    const results = page.review?.results ?? [];
    const passed = results.filter((r) => r.pass).length;
    if (results.length === 0 || results.some((r) => PAGE_CHECKS.has(r.id) && !r.pass)) continue;
    if (passed / results.length < MIN_COVER_SCORE) continue;
    const d = getDinosaurBySlug(slug);
    if (!d) continue;
    const name = displayName(d, lang);
    items.push({
      slug,
      name,
      sci: name === d.name ? null : d.name,
      image: page.image,
      thumb: page.thumb,
      width: page.width,
      height: page.height,
      model: page.model,
      passed,
      total: results.length,
      notes: results.flatMap((r) => {
        const note = lang === "en" ? r.noteEn : r.note;
        return note ? [note] : [];
      }),
    });
  }
  return items;
}
