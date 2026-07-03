import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import { getDieselReport } from "@/lib/api";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const report = await getDieselReport();
  const avg = report?.avg_diesel_price ?? "—";
  return {
    title: "India Diesel & Freight Cost Index — Weekly Tracker | Intugine",
    description: `Weekly tracker of Indian diesel prices and the real Rs/km freight cost impact across major trucking corridors. Current 4-metro average: Rs ${avg}/litre.`,
    alternates: { canonical: "https://library.intugine.com/diesel-freight-cost-index" },
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function ChangeBadge({ pct }: { pct: number }) {
  if (pct === 0) return <span style={{ color: "#6b7280", fontWeight: 600, fontSize: "0.9rem" }}>No change</span>;
  const up = pct > 0;
  return (
    <span style={{ color: up ? "#b91c1c" : "#15803d", fontWeight: 700, fontSize: "0.95rem" }}>
      {up ? "▲" : "▼"} {Math.abs(pct)}% WoW
    </span>
  );
}

// Lightweight inline SVG line chart — no client JS / chart lib dependency
function TrendChart({ data }: { data: { date: string; avg_diesel_price: number }[] }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af", fontSize: "0.9rem", background: "#f8fafc", borderRadius: 8 }}>
        Trend chart will appear once we have 2+ weekly snapshots.
      </div>
    );
  }
  const W = 640, H = 200, PAD = 30;
  const prices = data.map(d => d.avg_diesel_price);
  const min = Math.min(...prices) - 1;
  const max = Math.max(...prices) + 1;
  const range = max - min || 1;
  const stepX = (W - PAD * 2) / (data.length - 1);
  const points = data.map((d, i) => {
    const x = PAD + i * stepX;
    const y = H - PAD - ((d.avg_diesel_price - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const path = "M" + points.join(" L");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#e5e7eb" strokeWidth={1} />
      <path d={path} fill="none" stroke="#1a3c8f" strokeWidth={2.5} />
      {data.map((d, i) => {
        const x = PAD + i * stepX;
        const y = H - PAD - ((d.avg_diesel_price - min) / range) * (H - PAD * 2);
        return <circle key={i} cx={x} cy={y} r={3.5} fill="#1a3c8f" />;
      })}
    </svg>
  );
}

export default async function DieselFreightIndexPage() {
  const report = await getDieselReport();

  if (!report) {
    return (
      <>
        <Nav />
        <main style={{ maxWidth: 800, margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", color: "#374151" }}>Report loading — check back shortly.</h1>
        </main>
        <Footer />
      </>
    );
  }

  let faqs: { q: string; a: string }[] = [];
  try {
    faqs = JSON.parse(report.faq_block || "[]");
  } catch {
    faqs = [];
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "India Diesel & Freight Cost Index",
    description: "Weekly tracked diesel prices across Indian metro cities with computed freight cost impact per km.",
    temporalCoverage: report.report_date,
    creator: { "@type": "Organization", name: "Intugine Technologies" },
  };

  const cityEntries = Object.entries(report.city_prices || {}).sort((a, b) => a[1] - b[1]);

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "3rem 1.5rem 1rem" }}>
        <div style={{ marginBottom: "0.5rem", fontSize: "0.85rem", color: "#1a3c8f", fontWeight: 700, letterSpacing: "0.03em" }}>
          WEEKLY INDEX · UPDATED {formatDate(report.report_date).toUpperCase()}
        </div>
        <h1 style={{ fontSize: "2.1rem", fontWeight: 800, color: "#111827", lineHeight: 1.15, marginBottom: "0.75rem" }}>
          India Diesel & Freight Cost Index
        </h1>
        <p style={{ fontSize: "1.05rem", color: "#4b5563", marginBottom: "2rem", maxWidth: 680 }}>
          What today&apos;s diesel price actually means for your freight bill — translated into real Rs/km cost impact across major Indian trucking corridors.
        </p>

        {/* Headline stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>4-Metro Average</div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#111827", marginTop: 4 }}>₹{report.avg_diesel_price}/L</div>
            <div style={{ marginTop: 4 }}><ChangeBadge pct={report.wow_change_pct} /></div>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Freight Cost Impact</div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#111827", marginTop: 4 }}>
              {report.freight_cost_impact_per_km >= 0 ? "+" : ""}₹{report.freight_cost_impact_per_km}/km
            </div>
            <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 4 }}>@ {report.km_per_litre_assumption} km/L truck</div>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Cheapest / Costliest</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#15803d", marginTop: 8, textTransform: "capitalize" }}>{report.cheapest_city} ↓</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#b91c1c", textTransform: "capitalize" }}>{report.costliest_city} ↑</div>
          </div>
        </div>

        {/* Trend chart */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>Price Trend</h2>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.5rem" }}>
            <TrendChart data={report.chart_data} />
          </div>
        </div>

        {/* City breakdown */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>City-Wise Diesel Price</h2>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            {cityEntries.map(([city, price], i) => (
              <div key={city} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: i < cityEntries.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <span style={{ textTransform: "capitalize", fontWeight: 600, color: "#374151" }}>{city}</span>
                <span style={{ fontWeight: 700, color: "#111827" }}>₹{price}/L</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lane cost impact */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>Corridor Cost Impact This Week</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {(report.lane_cost_impact || []).map((lane) => (
              <div key={lane.lane} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.1rem" }}>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>{lane.lane}</div>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 2 }}>{lane.distance_km} km</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: lane.cost_impact_rs > 0 ? "#b91c1c" : lane.cost_impact_rs < 0 ? "#15803d" : "#6b7280", marginTop: 8 }}>
                  {lane.cost_impact_rs > 0 ? "+" : ""}₹{lane.cost_impact_rs}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>fuel cost impact / trip</div>
              </div>
            ))}
          </div>
        </div>

        {/* Narrative */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>This Week&apos;s Read</h2>
          <div style={{ color: "#374151", fontSize: "1rem", lineHeight: 1.75 }}>
            {(report.narrative || "").split("\n\n").map((para, i) => (
              <p key={i} style={{ marginBottom: "1rem" }}>{para}</p>
            ))}
          </div>
        </div>

        {/* FAQ */}
        {faqs.length > 0 && (
          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>Frequently Asked Questions</h2>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: "1px solid #f1f5f9", padding: "1rem 0" }}>
                <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{f.q}</div>
                <div style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
          </div>
        )}

        {/* Sources / methodology */}
        <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "3rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
          Sources: {(report.sources || []).join(" · ")}. Freight cost impact assumes a standard {report.km_per_litre_assumption} km/litre 32ft container truck; actual mileage varies by vehicle and load.
        </div>
      </main>

      <CTABanner
        cta="See How Cruise™ Cuts Fuel-Driven Cost Surprises|Book a Demo"
        slug="diesel-freight-cost-index"
        industry="Diesel Freight Index"
      />
      <Footer />
    </>
  );
}
