import type { Metadata } from "next";
import popularityData from "@/data/popularity.json";
import dinosaursData from "@/data/dinosaurs.json";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

/**
 * Open Graph share images, generated as JPEG by scripts/build-og-images.ts (run before every build)
 * into public/og/, which is not committed.
 */

/** The dinosaur whose cover picture the site-wide default share image is cut from. */
export const OG_DEFAULT_DINOSAUR = "tyrannosaurus";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Dinosaurs that get their own share image: popular and Thai genera only. The site sits close to
 * Cloudflare Workers Free's 20,000-files-per-deploy limit (Next writes ~4 RSC files per page), and
 * one JPEG for every genus pushed a deploy to 21,164 files. Everyone else shares the default image.
 */
const OWN_SHARE_IMAGE = new Set([
  ...popularityData.items.map((i) => i.slug),
  ...(dinosaursData as { slug: string; countries: string[] }[]).filter((d) => d.countries.includes("TH")).map((d) => d.slug),
]);

export function hasOwnShareImage(slug: string): boolean {
  return OWN_SHARE_IMAGE.has(slug);
}

/** Public path of a dinosaur's share image, or of the site-wide default when slug is null. */
export function ogImagePath(slug: string | null): string {
  return slug ? `og/dinos/${slug}.jpg` : "og/site.jpg";
}

/**
 * A page's full openGraph block. Next merges metadata shallowly, so a page that sets openGraph
 * replaces the layout's entirely; building every block here keeps the site name, locale and
 * share image on all pages. Pass `slug` for a dinosaur page; only those in hasOwnShareImage get
 * their own picture.
 */
export function openGraphFor(
  lang: Locale,
  page: { title?: string; description?: string; type?: "website" | "article"; slug?: string | null },
): NonNullable<Metadata["openGraph"]> {
  const t = getDictionary(lang);
  return {
    siteName: t.siteName,
    locale: lang === "th" ? "th_TH" : "en_US",
    type: page.type ?? "website",
    title: page.title,
    description: page.description ?? t.siteDescription,
    images: [{ url: `/${ogImagePath(page.slug && hasOwnShareImage(page.slug) ? page.slug : null)}`, ...OG_SIZE }],
  };
}
