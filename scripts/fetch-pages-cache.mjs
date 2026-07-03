// Pre-build step: fetch ALL published pages' full content ONCE from the
// backend and write to a local JSON file on disk. This runs before `next
// build` starts (see package.json "build" script).
//
// WHY THIS EXISTS (2026-07-03 incident): Next.js/Turbopack static generation
// spawns multiple worker PROCESSES. A module-level in-memory cache in
// lib/api.ts only dedupes fetches *within* a single process — each worker
// still makes its own independent network call to the backend. Under load
// this occasionally hit Base44's rate limiter for just one worker's call,
// which silently returned an empty page list for every route that worker
// happened to render (partial, hard-to-spot failures: some pages 404,
// homepage counts show 0, while most of the site looks fine).
//
// Fetching once here — before any workers spin up — and writing the result
// to disk means every worker, regardless of process, reads the exact same
// complete dataset from the filesystem instead of touching the network.
import fs from "node:fs";
import path from "node:path";

const BACKEND_URL = "https://rey-6011d59d.base44.app/functions/getDashboardData";
const OUT_DIR = path.join(process.cwd(), "data");
const OUT_FILE = path.join(OUT_DIR, "pages-cache.json");
const LIVE_STATUSES = ["reviewed", "published"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAllFullPages() {
  const MAX_RETRIES = 8;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`[fetch-pages-cache] Retry ${attempt}/${MAX_RETRIES - 1} after ${Math.round(delay)}ms`);
        await sleep(delay);
      }
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_all_full_pages" }),
      });
      if (res.status === 429 || res.status === 500 || res.status === 503) {
        console.warn(`[fetch-pages-cache] Got ${res.status}, retrying...`);
        continue;
      }
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      const pages = (data.pages || []).filter(
        (p) => p.slug && p.slug.trim() !== "" && LIVE_STATUSES.includes(p.status || "")
      );
      if (pages.length === 0) {
        throw new Error("Backend returned 0 pages — refusing to cache an empty result");
      }
      return pages;
    } catch (e) {
      console.warn(`[fetch-pages-cache] Attempt ${attempt} failed:`, e.message);
      if (attempt === MAX_RETRIES - 1) throw e;
    }
  }
  throw new Error("unreachable");
}

const pages = await fetchAllFullPages();
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(pages));
console.log(`[fetch-pages-cache] Wrote ${pages.length} pages to ${OUT_FILE}`);
