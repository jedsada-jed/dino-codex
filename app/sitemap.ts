import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/dinosaurs";
import { getAllArticles } from "@/lib/articles";

// Required for `output: "export"` — sitemap.ts is otherwise treated as a dynamic route handler.
export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dinocodex.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/dinosaurs", "/thailand", "/timeline", "/articles", "/news", "/about"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const dinosaurRoutes = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/dinosaurs/${slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  const articleRoutes = getAllArticles().map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...dinosaurRoutes];
}
