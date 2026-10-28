/**
 * Locales live in the first URL segment (/th/..., /en/...). Every page and the root layout sit
 * under app/[lang], which generates both locales statically.
 */
export const LOCALES = ["th", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "th";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Locale-prefixed path: href("en", "/dinosaurs") -> "/en/dinosaurs", href("th", "/") -> "/th". */
export function href(lang: Locale, path: string): string {
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** BCP 47 tag for Intl number and date formatting. Thai dates use the Buddhist calendar. */
export const INTL_LOCALE: Record<Locale, string> = { th: "th-TH", en: "en-US" };

export function formatNumber(lang: Locale, n: number): string {
  return n.toLocaleString(INTL_LOCALE[lang]);
}

export function formatDate(lang: Locale, iso: string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Date(iso).toLocaleDateString(INTL_LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  });
}

/** `alternates.languages` for page metadata, so search engines link the two versions. */
export function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, href(l, path)]));
}
