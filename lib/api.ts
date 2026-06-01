const BACKEND_URL = "https://rey-6011d59d.base44.app/functions/getDashboardData";

export interface SEOPage {
  id: string;
  slug: string;
  title: string;
  template_type: string;
  target_keyword: string;
  secondary_keywords?: string;
  industry?: string;
  persona?: string;
  funnel_stage?: string;
  meta_title?: string;
  meta_description?: string;
  full_content?: string;
  faq_block?: string;
  schema_markup?: string;
  cta?: string;
  status?: string;
  priority?: string;
}

const LIVE_STATUSES = ["reviewed", "published"];

// ── Slim list: only metadata fields, no full_content/faq_block ──────────────
// Used by generateStaticParams and the library index page.
// Response is small (~50-100KB) — safely cacheable.
export async function getAllPages(): Promise<SEOPage[]> {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_slugs" }),
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    const data = await res.json();
    const pages: SEOPage[] = data.pages || [];
    return pages.filter(p => p.slug && p.slug.trim() !== "" && LIVE_STATUSES.includes(p.status || ""));
  } catch (e) {
    console.error("[getAllPages] Failed:", e);
    return [];
  }
}

// ── Full page by slug: fetches only the one page needed ──────────────────────
// Used by generateMetadata and the page renderer.
// Each call fetches ~10-30KB max — no caching issues.
// ── Build-time page cache ─────────────────────────────────────────────────
// Fetches ALL 308 pages in ONE request at build start, then serves from memory.
// Eliminates 308 individual backend calls → no more 429/500 during static gen.
let _buildCache: Map<string, SEOPage> | null = null;

async function getBuildCache(): Promise<Map<string, SEOPage>> {
  if (_buildCache) return _buildCache;
  console.log("[getBuildCache] Fetching all pages in one request...");
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_all_full_pages" }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    const data = await res.json();
    const pages: SEOPage[] = data.pages || [];
    _buildCache = new Map(pages.map((p: SEOPage) => [p.slug, p]));
    console.log(`[getBuildCache] Cached ${_buildCache.size} pages`);
    return _buildCache;
  } catch (e) {
    console.error("[getBuildCache] Failed:", e);
    _buildCache = new Map();
    return _buildCache;
  }
}

export async function getPageBySlug(slug: string): Promise<SEOPage | null> {
  const cache = await getBuildCache();
  const page = cache.get(slug) || null;
  if (!page) console.warn(`[getPageBySlug] slug not found in cache: ${slug}`);
  return page;
}

function renderMarkdownTable(tableBlock: string): string {
  const lines = tableBlock.trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return tableBlock;

  const parseRow = (line: string) =>
    line.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);

  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  const headerHtml = headers.map(h => `<th style="padding:0.6rem 1rem;text-align:left;border-bottom:2px solid #e5e7eb;color:#0f2460;font-size:0.85rem;white-space:nowrap">${h}</th>`).join("");
  const rowsHtml = rows.map(row =>
    `<tr>${row.map(cell => `<td style="padding:0.6rem 1rem;border-bottom:1px solid #f1f5f9;color:#374151;font-size:0.85rem">${cell}</td>`).join("")}</tr>`
  ).join("");

  return `<div style="overflow-x:auto;margin:1.5rem 0"><table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden"><thead><tr style="background:#f8fafc">${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
}

export function markdownToHtml(md: string): string {
  if (!md) return "";

  const tableRegex = /(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g;
  const tables: string[] = [];
  const withPlaceholders = md.replace(tableRegex, (match) => {
    tables.push(renderMarkdownTable(match));
    return `%%TABLE_${tables.length - 1}%%`;
  });

  let html = withPlaceholders
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|o|l|h|p|s|b|i|a])/gm, '')
    .replace(/<p><\/p>/g, '')
    .trim();

  tables.forEach((tableHtml, i) => {
    html = html.replace(`%%TABLE_${i}%%`, tableHtml);
  });

  return html;
}

export function buildSchemaMarkup(page: SEOPage, baseUrl: string): object[] {
  const schemas: object[] = [];
  const url = baseUrl + "/" + page.slug;
  const schemaTypes = page.schema_markup || "";

  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.meta_title || page.title,
    "description": page.meta_description,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "Intugine Technologies",
      "url": "https://www.intugine.com",
    },
  });

  // NewsArticle schema — required for Google News eligibility
  schemas.push({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": (page.meta_title || page.title).substring(0, 110),
    "description": page.meta_description || "",
    "url": url,
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Intugine Technologies",
      "url": "https://www.intugine.com",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Intugine Technologies",
      "url": "https://www.intugine.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://library.intugine.com/intugine-logo.png",
        "width": 200,
        "height": 60,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
    "articleSection": page.industry || "Logistics",
    "keywords": [page.target_keyword, ...(page.secondary_keywords?.split(",").map((k: string) => k.trim()) || [])].filter(Boolean).join(", "),
    "inLanguage": "en-IN",
  });

  if (schemaTypes.includes("FAQPage") && page.faq_block) {
    const questions = page.faq_block.split("|").map((q: string) => q.replace(/^Q:\s*/, "").trim()).filter(Boolean);
    if (questions.length) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions.map((q: string) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": "Contact Intugine to learn more." },
        })),
      });
    }
  }

  if (schemaTypes.includes("DefinedTerm") || page.template_type === "glossary") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": page.target_keyword,
      "description": page.meta_description,
      "url": url,
    });
  }

  return schemas;
}

export function getTemplateLabel(type: string): string {
  const map: Record<string, string> = {
    glossary: "Glossary",
    how_to: "Guide",
    product_x_industry: "Industry Solution",
    competitor_comparison: "Comparison",
  };
  return map[type] || "Resource";
}

export function getReadingTime(content: string): number {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}
