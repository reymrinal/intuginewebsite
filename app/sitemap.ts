import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = "https://library.intugine.com";

  // Fetch slugs directly from backend — no cache
  let pages: { slug: string }[] = [];
  try {
    const res = await fetch("https://rey-6011d59d.base44.app/functions/getDashboardData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_slugs" }),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      pages = (data.pages || []).filter(
        (p: any) =>
          p.slug &&
          p.slug.trim() !== "" &&
          ["reviewed", "published"].includes(p.status || "")
      );
    }
  } catch (e) {
    console.error("[sitemap] Failed to fetch pages:", e);
  }

  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/roi-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/case-studies`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  for (const p of pages) {
    entries.push({
      url: `${BASE}/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
// rebuild: 2026-06-01T05:54:55Z — added truck-tracking-india + fleet-mgmt-south-africa pages
// rebuild: 2026-06-01T08:36:36Z — control tower pages: metal, iron ore, mining ops
