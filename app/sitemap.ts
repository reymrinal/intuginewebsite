import { getAllPages } from "@/lib/api";
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.intugine.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();

  const pageEntries: MetadataRoute.Sitemap = pages.map(page => ({
    url: `${BASE_URL}/library/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: page.priority === "high" ? 0.9 : page.priority === "medium" ? 0.7 : 0.5,
  }));

  return [
    {
      url: `${BASE_URL}/library`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...pageEntries,
  ];
}
