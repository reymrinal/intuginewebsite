import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();
  const BASE = "https://library.intugine.com";

  const entries: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/roi-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ];

  for (const p of pages) {
    entries.push({
      url: `${BASE}/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
