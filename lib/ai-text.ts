import aiTextEnData from "@/data/ai-image-text-en.json";
import type { Locale } from "@/lib/i18n";

type AiTextKind = "labels" | "notes" | "other";
const aiTextEn = aiTextEnData as Record<AiTextKind, Record<string, string>>;

/**
 * AI image text (checklist items, review notes, caveats, model names) is stored in Thai;
 * English pages look it up in data/ai-image-text-en.json and fall back to the Thai original.
 * Kept apart from lib/ai-images so client components don't bundle the image data.
 */
export function aiText(lang: Locale, kind: AiTextKind, thai: string): string {
  return lang === "en" ? (aiTextEn[kind][thai] ?? thai) : thai;
}
