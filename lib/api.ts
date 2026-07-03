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

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// NOTE: getAllPages() and getPageBySlug() moved to lib/pagesCache.ts.
// lib/api.ts is imported by client components (e.g. PageCard.tsx via
// getTemplateLabel) — it must stay free of Node built-ins like `node:fs`,
// which Turbopack cannot bundle for the client and hard-fails the build.
// See lib/pagesCache.ts for the full incident history/rationale.

export interface DieselReport {
  id: string;
  report_date: string;
  city_prices: Record<string, number>;
  avg_diesel_price: number;
  wow_change_pct: number;
  crude_oil_price_usd: number;
  usd_inr_rate: number;
  km_per_litre_assumption: number;
  freight_cost_impact_per_km: number;
  lane_cost_impact: { lane: string; distance_km: number; cost_impact_rs: number }[];
  cheapest_city: string;
  costliest_city: string;
  volatility_score: number | null;
  narrative: string;
  faq_block: string;
  linkedin_post_copy: string;
  chart_data: { date: string; avg_diesel_price: number }[];
  sources: string[];
  status: string;
  page_slug: string;
  index_score?: number;
}

export interface CityDelta {
  city: string;
  price: number;
  delta_rs: number;
  delta_pct: number;
  is_new: boolean;
}

const DIESEL_INDEX_BACKEND_URL = "https://rey-6011d59d.base44.app/functions/dieselFreightIndex";

// ── getDieselReport with retry + jitter (mirrors getPageBySlug) ─────────────
export async function getDieselReport(): Promise<{ report: DieselReport; city_deltas: CityDelta[]; previous_report_date: string | null } | null> {
  const MAX_RETRIES = 6;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await sleep(delay);
      }
      const res = await fetch(DIESEL_INDEX_BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_latest" }),
        next: { revalidate: 3600 },
      });
      if (res.status === 429 || res.status === 500 || res.status === 503) continue;
      if (!res.ok) return null;
      const data = await res.json();
      return data.ok ? { report: data.report, city_deltas: data.city_deltas || [], previous_report_date: data.previous_report_date } : null;
    } catch (e) {
      if (attempt === MAX_RETRIES - 1) {
        console.error("[getDieselReport] All retries exhausted:", e);
        return null;
      }
    }
  }
  return null;
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

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS SECTION — /reports hub + /reports/[slug] detail pages
// New backend function (reportsData.ts), separate from getDashboardData/SEOPage.
// Same retry+backoff+no-store pattern as getAllPages/getPageBySlug to avoid
// the class of build-time 429/500 outage documented for the main library.
// ═══════════════════════════════════════════════════════════════════════════

const REPORTS_BACKEND_URL = "https://rey-6011d59d.base44.app/functions/reportsData";

export interface ReportMeta {
  id: string;
  title: string;
  slug: string;
  category?: string;
  summary?: string;
  hero_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  published_date?: string;
  is_featured?: boolean;
  status?: string;
  tags?: string[];
  read_time_minutes?: number;
  author_name?: string;
}

export interface Report extends ReportMeta {
  html_content?: string;
  og_image_url?: string;
  schema_type?: string;
  faq_block?: string;
  cta_text?: string;
  cta_link?: string;
  impressions?: number;
  clicks?: number;
}

// ── Slim list — feeds generateStaticParams for /reports/[slug] and the /reports hub ──
export async function getAllReports(): Promise<ReportMeta[]> {
  const MAX_RETRIES = 6;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`[getAllReports] Retry ${attempt}/${MAX_RETRIES - 1} after ${Math.round(delay)}ms`);
        await sleep(delay);
      }
      const res = await fetch(REPORTS_BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_report_slugs" }),
        next: { revalidate: 60 },
      });
      if (res.status === 429 || res.status === 500 || res.status === 503) {
        console.warn(`[getAllReports] Got ${res.status}, retrying...`);
        continue;
      }
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      return (data.reports || []) as ReportMeta[];
    } catch (e) {
      if (attempt === MAX_RETRIES - 1) {
        console.error("[getAllReports] All retries exhausted:", e);
        return [];
      }
    }
  }
  return [];
}

// ── Full report by slug ──────────────────────────────────────────────────────
export async function getReportBySlug(slug: string): Promise<Report | null> {
  const MAX_RETRIES = 6;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await sleep(delay);
      }
      const res = await fetch(REPORTS_BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_report", slug }),
        next: { revalidate: 3600 },
      });
      if (res.status === 429 || res.status === 500 || res.status === 503) continue;
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      return (data.report as Report) || null;
    } catch (e) {
      if (attempt === MAX_RETRIES - 1) {
        console.error(`[getReportBySlug] All retries exhausted for "${slug}":`, e);
        return null;
      }
    }
  }
  return null;
}
