import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/dinosaurs";
import { getAllArticles } from "@/lib/articles";
import { LOCALES, href } from "@/lib/i18n";

// Required for `output: "export"` — sitemap.ts is otherwise treated as a dynamic route handler.
export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinocodex.com";

type Entry = MetadataRoute.Sitemap[number];

/** One entry per language, each pointing at its translations so search engines pair them. */
function localized(path: string, changeFrequency: Entry["changeFrequency"], priority: number): Entry[] {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${href(l, path)}`]));
  return LOCALES.map((lang) => ({
    url: `${SITE_URL}${href(lang, path)}`,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/dinosaurs", "/thailand", "/timeline", "/size-compare", "/quiz", "/articles", "/about"].flatMap((path) =>
    localized(path, "monthly", path === "/" ? 1 : 0.7),
  );
  // News is Thai-only.
  const news: Entry = { url: `${SITE_URL}${href("th", "/news")}`, changeFrequency: "weekly", priority: 0.6 };
  const articles = getAllArticles("th").flatMap((a) => localized(`/articles/${a.slug}`, "yearly", 0.6));
  const dinosaurs = getAllSlugs().flatMap((slug) => localized(`/dinosaurs/${slug}`, "yearly", 0.5));

  return [...pages, news, ...articles, ...dinosaurs];
}
