import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BACKEND_URL = "https://rey-6011d59d.base44.app/functions/getDashboardData";

export async function GET() {
  let pages: any[] = [];

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_slugs" }),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      pages = (data.pages || []).filter(
        (p: any) => p.slug && ["reviewed", "published"].includes(p.status || "")
      );
    }
  } catch (e) {
    console.error("[news-sitemap] fetch failed:", e);
  }

  const BASE = "https://library.intugine.com";
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Google News: only include articles published in the last 2 days
  const recentPages = pages.filter((p: any) => {
    if (p.created_date) return new Date(p.created_date) >= twoDaysAgo;
    return false;
  });

  // Fallback: use last 20 pages (newest by array order) if no date info
  const finalPages = recentPages.length > 0 ? recentPages : pages.slice(-20);

  const urls = finalPages.map((p: any) => {
    const title = (p.title || p.slug)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    const pubDate = p.created_date ? new Date(p.created_date).toISOString() : now.toISOString();

    return `  <url>
    <loc>${BASE}/${p.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Intugine Logistics Library</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
