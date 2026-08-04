import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import { getDieselReport } from "@/lib/api";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getDieselReport();
  const avg = data?.report.avg_diesel_price ?? "—";
  return {
    title: "India Diesel & Freight Cost Index — Live Weekly Tracker | Intugine",
    description: `Live weekly index of Indian diesel prices city-wise, with real Rs/km freight cost impact across major trucking corridors. Current 8-city average: Rs ${avg}/litre.`,
    alternates: { canonical: "https://library.intugine.com/diesel-freight-cost-index" },
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function Arrow({ value }: { value: number }) {
  if (value === 0) return <span className="text-white/40">▬</span>;
  return value > 0 ? <span className="text-emerald-400">▲</span> : <span className="text-rose-400">▼</span>;
}

function changeColor(value: number) {
  if (value === 0) return "text-white/50";
  return value > 0 ? "text-rose-400" : "text-emerald-400"; // red = cost UP (bad), green = cost DOWN (good)
}

// Lightweight inline SVG line chart — no client JS / chart lib dependency.
// Renders Y-axis gridlines + value labels, X-axis date labels, and native
// <title> tooltips on each point (hover shows exact date + value, no JS needed).
function shortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function fullDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function TrendChart({ data, field, valueSuffix = "" }: { data: { date: string; avg_diesel_price: number; index_score?: number }[]; field: "avg_diesel_price" | "index_score"; valueSuffix?: string }) {
  // De-dupe same-day entries (keep last) and sort chronologically
  const byDate = new Map<string, { date: string; avg_diesel_price: number; index_score?: number }>();
  for (const d of data) {
    if (d[field] !== undefined && d[field] !== null) byDate.set(d.date, d);
  }
  const points = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

  if (!points || points.length < 2) {
    return (
      <div className="flex items-center justify-center h-[200px] text-white/30 text-sm border border-white/5 rounded-xl bg-white/[0.02]">
        Trend line appears once 2+ weekly snapshots are recorded.
      </div>
    );
  }

  const W = 720, H = 300, PAD_L = 54, PAD_R = 16, PAD_T = 20, PAD_B = 44;
  const vals = points.map(d => Number(d[field]));
  const rawMin = Math.min(...vals);
  const rawMax = Math.max(...vals);
  const pad = Math.max(0.5, (rawMax - rawMin) * 0.15);
  const min = rawMin - pad;
  const max = rawMax + pad;
  const range = max - min || 1;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const stepX = points.length > 1 ? plotW / (points.length - 1) : 0;

  const coords = points.map((d, i) => {
    const x = PAD_L + i * stepX;
    const y = PAD_T + plotH - ((Number(d[field]) - min) / range) * plotH;
    return { x, y, d };
  });
  const path = "M" + coords.map(c => `${c.x},${c.y}`).join(" L");
  const areaPath = `${path} L${coords[coords.length - 1].x},${PAD_T + plotH} L${coords[0].x},${PAD_T + plotH} Z`;

  // 4 horizontal gridlines (top/upper-mid/lower-mid/bottom) with value labels
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const frac = i / gridCount;
    const y = PAD_T + plotH * frac;
    const value = max - range * frac;
    return { y, value };
  });

  // X-axis date labels — thin out if too many points to avoid overlap
  const maxLabels = 7;
  const labelEvery = Math.max(1, Math.ceil(points.length / maxLabels));
  const lastValue = vals[vals.length - 1];
  const prevValue = vals[vals.length - 2];
  const deltaUp = lastValue > prevValue;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
      <defs>
        <linearGradient id="tealFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis gridlines + value labels */}
      {gridLines.map((g, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={g.y} x2={W - PAD_R} y2={g.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray={i === gridCount ? undefined : "3 4"} />
          <text x={PAD_L - 10} y={g.y + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.35)" className="tabular-nums">
            {g.value.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Area + line */}
      <path d={areaPath} fill="url(#tealFade)" />
      <path d={path} fill="none" stroke="#22c55e" strokeWidth={2.5} />

      {/* X-axis date labels */}
      {coords.map((c, i) => {
        const showLabel = i % labelEvery === 0 || i === coords.length - 1;
        if (!showLabel) return null;
        return (
          <text key={`lbl-${i}`} x={c.x} y={H - PAD_B + 20} textAnchor="middle" fontSize="10.5" fill="rgba(255,255,255,0.4)">
            {shortDate(c.d.date)}
          </text>
        );
      })}

      {/* Points with native tooltips (hover shows exact date + value) */}
      {coords.map((c, i) => {
        const isLast = i === coords.length - 1;
        return (
          <g key={i}>
            <line x1={c.x} y1={PAD_T} x2={c.x} y2={PAD_T + plotH} stroke="transparent" strokeWidth={14} />
            <circle cx={c.x} cy={c.y} r={isLast ? 5 : 3} fill={isLast ? "#4ade80" : "#22c55e"} stroke={isLast ? "#0a0a0a" : "none"} strokeWidth={isLast ? 2 : 0}>
              <title>{`${fullDate(c.d.date)}: ${Number(c.d[field]).toFixed(2)}${valueSuffix}`}</title>
            </circle>
          </g>
        );
      })}

      {/* Latest value callout */}
      <text x={coords[coords.length - 1].x} y={coords[coords.length - 1].y - 12} textAnchor="end" fontSize="12" fontWeight="700" fill={deltaUp ? "#fb7185" : "#4ade80"}>
        {lastValue.toFixed(1)}{valueSuffix}
      </text>
    </svg>
  );
}

export default async function DieselFreightIndexPage() {
  const data = await getDieselReport();

  if (!data) {
    return (
      <>
        <Nav />
        <main className="max-w-2xl mx-auto py-24 px-6 text-center">
          <h1 className="text-xl text-white/70">Report loading — check back shortly.</h1>
        </main>
        <Footer />
      </>
    );
  }

  const { report, city_deltas } = data;

  let faqs: { q: string; a: string }[] = [];
  try {
    faqs = JSON.parse(report.faq_block || "[]");
  } catch {
    faqs = [];
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "India Diesel & Freight Cost Index",
    description: "Weekly tracked diesel prices across major Indian cities with computed freight cost impact per km.",
    temporalCoverage: report.report_date,
    creator: { "@type": "Organization", name: "Intugine Technologies" },
  };

  const indexUp = report.wow_change_pct > 0;
  const indexDown = report.wow_change_pct < 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />

      {/* ── Ticker bar ─────────────────────────────────────────────── */}
      <div className="border-y border-white/10 bg-white/[0.03] overflow-hidden whitespace-nowrap py-2.5">
        <div className="animate-[ticker_35s_linear_infinite] inline-flex gap-10 px-6">
          {[...city_deltas, ...city_deltas].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm font-medium">
              <span className="text-white/50 uppercase tracking-wide">{c.city}</span>
              <span className="text-white font-semibold">₹{c.price}</span>
              <span className={changeColor(c.delta_rs)}>
                <Arrow value={c.delta_rs} /> {c.delta_rs !== 0 ? `${Math.abs(c.delta_rs)} (${Math.abs(c.delta_pct)}%)` : "—"}
              </span>
            </span>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }` }} />

      <main className="max-w-5xl mx-auto px-6 pt-10 pb-4">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full px-4 py-1.5 mb-4">
          Live Weekly Index · Updated {formatDate(report.report_date)}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">India Diesel & Freight Cost Index</h1>
        <p className="text-white/60 text-base md:text-lg max-w-2xl mb-10">
          What diesel actually costs across India&apos;s major cities right now — and what it means for your freight bill, translated into real ₹/km cost impact.
        </p>

        {/* ── Index headline ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#22c55e]/25 bg-[#0f1e14] p-8 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 shadow-lg shadow-[#22c55e]/5">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-2">Intugine Diesel Freight Index</div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl md:text-6xl font-extrabold text-[#22c55e] tabular-nums">{report.index_score?.toFixed(2) ?? "1000.00"}</span>
              <span className={`text-lg font-bold ${indexUp ? "text-rose-400" : indexDown ? "text-emerald-400" : "text-white/40"}`}>
                {report.wow_change_pct !== 0 ? <>{indexUp ? "▲" : "▼"} {Math.abs(report.wow_change_pct)}%</> : "Base week"}
              </span>
            </div>
            <div className="text-white/40 text-sm mt-2">Base: 1,000 pts on launch (3 Jul 2026) · 8-city average</div>
          </div>
          <div className="grid grid-cols-2 gap-6 md:gap-10 text-right md:text-left">
            <div>
              <div className="text-xs uppercase text-white/40 font-semibold">8-City Avg</div>
              <div className="text-2xl font-bold tabular-nums">₹{report.avg_diesel_price}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-white/40 font-semibold">Freight Impact</div>
              <div className="text-2xl font-bold tabular-nums">{report.freight_cost_impact_per_km >= 0 ? "+" : ""}₹{report.freight_cost_impact_per_km}/km</div>
            </div>
          </div>
        </div>

        {/* ── Mini stat row: crude, fx, volatility ─────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase text-white/40 font-semibold mb-1">Brent Crude</div>
            <div className="text-xl font-bold tabular-nums">${report.crude_oil_price_usd}</div>
            <div className="text-xs text-white/30">per barrel</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase text-white/40 font-semibold mb-1">USD/INR</div>
            <div className="text-xl font-bold tabular-nums">₹{report.usd_inr_rate}</div>
            <div className="text-xs text-white/30">exchange rate</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase text-white/40 font-semibold mb-1">Volatility</div>
            <div className="text-xl font-bold tabular-nums">{report.volatility_score !== null && report.volatility_score !== undefined ? report.volatility_score : "—"}</div>
            <div className="text-xs text-white/30">{report.volatility_score !== null && report.volatility_score !== undefined ? "rolling stddev" : "needs 2+ weeks"}</div>
          </div>
        </div>

        {/* ── Trend chart ──────────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4">Index Trend</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <TrendChart data={report.chart_data} field="index_score" />
          </div>
        </div>

        {/* ── City board — Sensex style table ─────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4">City Board</h2>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 px-5 py-3 bg-white/[0.04] text-xs uppercase font-semibold text-white/40">
              <span>City</span>
              <span className="text-right">Price (₹/L)</span>
              <span className="text-right">Change</span>
              <span className="text-right">% Change</span>
            </div>
            {city_deltas.map((c, i) => (
              <div key={c.city} className={`grid grid-cols-4 gap-2 px-5 py-3.5 items-center ${i % 2 === 0 ? "bg-white/[0.015]" : ""} border-t border-white/5`}>
                <span className="capitalize font-semibold">{c.city}</span>
                <span className="text-right font-bold tabular-nums">₹{c.price}</span>
                <span className={`text-right font-semibold tabular-nums ${changeColor(c.delta_rs)}`}>
                  {c.is_new ? <span className="text-white/30 text-xs font-normal">baseline</span> : <>{c.delta_rs > 0 ? "+" : ""}{c.delta_rs}</>}
                </span>
                <span className={`text-right font-semibold tabular-nums flex items-center justify-end gap-1.5 ${changeColor(c.delta_rs)}`}>
                  {!c.is_new && <Arrow value={c.delta_rs} />}
                  {c.is_new ? "—" : `${Math.abs(c.delta_pct)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Corridor cost impact ─────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4">Corridor Cost Impact This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(report.lane_cost_impact || []).map((lane) => (
              <div key={lane.lane} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="font-bold text-sm">{lane.lane}</div>
                <div className="text-xs text-white/30 mb-3">{lane.distance_km} km</div>
                <div className={`text-2xl font-extrabold tabular-nums ${lane.cost_impact_rs > 0 ? "text-rose-400" : lane.cost_impact_rs < 0 ? "text-emerald-400" : "text-white/40"}`}>
                  {lane.cost_impact_rs > 0 ? "+" : ""}₹{lane.cost_impact_rs}
                </div>
                <div className="text-xs text-white/30 mt-1">fuel cost impact / trip</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Narrative ────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4">This Week&apos;s Read</h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            {(report.narrative || "").split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        {faqs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
            <div className="divide-y divide-white/5 border-t border-white/5">
              {faqs.map((f, i) => (
                <div key={i} className="py-4">
                  <div className="font-semibold mb-1">{f.q}</div>
                  <div className="text-white/60 text-sm leading-relaxed">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sources ──────────────────────────────────────────────────── */}
        <div className="text-xs text-white/30 mb-10 border-t border-white/5 pt-4">
          Sources: {(report.sources || []).join(" · ")}. Freight cost impact assumes a standard {report.km_per_litre_assumption} km/litre 32ft container truck; actual mileage varies by vehicle and load.
        </div>
      </main>

      <CTABanner
        cta="See How Cruise™ Cuts Fuel-Driven Cost Surprises|Book a Demo"
        slug="diesel-freight-cost-index"
        industry="Diesel Freight Index"
      />
      <Footer />
    </div>
  );
}
