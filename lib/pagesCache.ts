// Server-only: fetches/caches the full SEOPage list for static generation.
// Kept OUT of lib/api.ts on purpose — that file is imported by client
// components (PageCard.tsx uses getTemplateLabel), and Turbopack cannot
// bundle Node built-ins like `node:fs` into a client bundle. Any file that
// touches fs/path must never be imported (even transitively) by "use client"
// code, so this lives in its own module, imported only from Server
// Components (page.tsx files, sitemap.ts).
//
// IMPORTANT (2026-07-03 incident, two-part fix):
// Part 1 (insufficient on its own): fetching each page individually via
// `get_page` during static generation meant 400+ separate HTTP calls to the
// backend in a short window — reliably tripped Base44's rate limiter mid-build.
// Part 2 (also insufficient): a module-level in-memory promise cache fetched
// all pages ONCE and shared the result — but Next.js/Turbopack static
// generation spawns multiple worker PROCESSES, and an in-memory cache only
// dedupes within a single process. Each worker still made its own network
// call, and when Base44's rate limiter rejected just one worker's call, that
// worker silently rendered its assigned pages with an empty list (partial,
// hard-to-spot breakage: some pages 404, homepage/library counts show 0).
//
// Part 3 (this version): `scripts/fetch-pages-cache.mjs` runs as a prebuild
// step (see package.json) and fetches all pages ONCE, before any Next.js
// worker process starts, writing the result to data/pages-cache.json. Every
// worker then reads this local file — zero network calls during static
// generation, so there's nothing left to rate-limit.
import fs from "node:fs";
import path from "node:path";
import type { SEOPage } from "./api";

const BACKEND_URL = "https://rey-6011d59d.base44.app/functions/getDashboardData";
const PAGES_CACHE_FILE = path.join(process.cwd(), "data", "pages-cache.json");
const LIVE_STATUSES = ["reviewed", "published"];

let _fullPagesCache: SEOPage[] | null = null;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllFullPagesWithRetry(): Promise<SEOPage[]> {
  const MAX_RETRIES = 6;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`[getAllFullPages] Retry ${attempt}/${MAX_RETRIES - 1} after ${Math.round(delay)}ms`);
        await sleep(delay);
      }
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_all_full_pages" }),
        cache: "no-store",
      });
      if (res.status === 429 || res.status === 500 || res.status === 503) {
        console.warn(`[getAllFullPages] Got ${res.status}, retrying...`);
        continue;
      }
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      const pages: SEOPage[] = data.pages || [];
      return pages.filter(p => p.slug && p.slug.trim() !== "" && LIVE_STATUSES.includes(p.status || ""));
    } catch (e) {
      if (attempt === MAX_RETRIES - 1) {
        console.error("[getAllFullPages] All retries exhausted:", e);
        return [];
      }
    }
  }
  return [];
}

// Reads the prebuild-generated disk cache (production/CI builds). Falls back
// to a direct network fetch only if the file is missing — e.g. `next dev`
// locally without running the prebuild script first.
function getAllFullPagesCached(): Promise<SEOPage[]> {
  if (_fullPagesCache) return Promise.resolve(_fullPagesCache);
  try {
    const raw = fs.readFileSync(PAGES_CACHE_FILE, "utf-8");
    const pages = JSON.parse(raw) as SEOPage[];
    if (Array.isArray(pages) && pages.length > 0) {
      _fullPagesCache = pages;
      return Promise.resolve(pages);
    }
  } catch {
    // File missing or invalid — fall through to network fetch.
  }
  console.warn("[getAllFullPages] data/pages-cache.json missing/empty, fetching from network directly");
  return fetchAllFullPagesWithRetry().then(pages => {
    _fullPagesCache = pages;
    return pages;
  });
}

// ── Slim list: used by generateStaticParams and the library index page. ─────
// Derived from the same single cached bulk fetch — no separate network call.
export async function getAllPages(): Promise<SEOPage[]> {
  return getAllFullPagesCached();
}

// ── Full page by slug — served from the cached bulk fetch, no per-page call ─
// Used by generateMetadata and the page renderer.
export async function getPageBySlug(slug: string): Promise<SEOPage | null> {
  const pages = await getAllFullPagesCached();
  return pages.find(p => p.slug === slug) || null;
}
