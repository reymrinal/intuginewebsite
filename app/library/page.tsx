import { getAllPages, getTemplateLabel } from "@/lib/api";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply Chain Visibility Library | Intugine",
  description: "Guides, glossary, and industry resources on logistics visibility, freight tracking, and supply chain intelligence for enterprise teams.",
};

const INDUSTRY_COLORS: Record<string, string> = {
  Cement: "#f59e0b",
  FMCG: "#10b981",
  Pharma: "#6366f1",
  Auto: "#ef4444",
  Default: "#1a3c8f",
};

const TEMPLATE_COLORS: Record<string, string> = {
  glossary: "#e0f2fe",
  how_to: "#d1fae5",
  product_x_industry: "#ede9fe",
  competitor_comparison: "#fee2e2",
};

export default async function LibraryIndex() {
  const pages = await getAllPages();

  const industries = [...new Set(pages.map(p => p.industry).filter(Boolean))];
  const byIndustry: Record<string, typeof pages> = {};
  industries.forEach(ind => {
    byIndustry[ind!] = pages.filter(p => p.industry === ind);
  });

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #1a3c8f 0%, #0f2460 100%)", padding: "4rem 1.5rem 3rem", textAlign: "center" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <span style={{ background: "rgba(255,255,255,0.15)", color: "#bfdbfe", padding: "0.35rem 0.9rem", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Resource Library
            </span>
            <h1 style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 800, margin: "1rem 0 0.75rem", lineHeight: 1.15 }}>
              Supply Chain Visibility Intelligence
            </h1>
            <p style={{ color: "#bfdbfe", fontSize: "1.1rem", lineHeight: 1.6 }}>
              Guides, glossary terms, and industry playbooks to help logistics and supply chain leaders make better decisions.
            </p>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              {industries.map(ind => (
                <a key={ind} href={`#${ind}`} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "0.4rem 1rem", borderRadius: 20, textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
                  {ind}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "1rem 1.5rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Resources", value: pages.length.toString() },
              { label: "Industries", value: industries.length.toString() },
              { label: "Avg. Reading Time", value: "5 min" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#1a3c8f" }}>{stat.value}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content by industry */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
          {Object.entries(byIndustry).map(([industry, indPages]) => (
            <section key={industry} id={industry} style={{ marginBottom: "3.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: 4, height: 28, background: INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.Default, borderRadius: 2 }} />
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#0f2460" }}>{industry} Logistics</h2>
                <span style={{ background: "#f1f5f9", color: "#6b7280", padding: "0.2rem 0.6rem", borderRadius: 12, fontSize: "0.75rem" }}>
                  {indPages.length} resources
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
                {indPages.map(page => (
                  <a
                    key={page.id}
                    href={`/library/${page.slug}`}
                    style={{ textDecoration: "none", display: "block", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem 1.5rem", transition: "box-shadow 0.2s, transform 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(26,60,143,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <span style={{
                        background: TEMPLATE_COLORS[page.template_type] || "#f1f5f9",
                        color: "#374151",
                        padding: "0.2rem 0.6rem",
                        borderRadius: 6,
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}>
                        {getTemplateLabel(page.template_type)}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{page.funnel_stage}</span>
                    </div>
                    <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f2460", lineHeight: 1.4 }}>
                      {page.title.replace(/ \| Intugine$/, "")}
                    </h3>
                    <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.5 }}>
                      {page.meta_description?.slice(0, 100)}...
                    </p>
                    <span style={{ fontSize: "0.8rem", color: "#1a3c8f", fontWeight: 600 }}>Read more →</span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ background: "#f0f4ff", padding: "3rem 1.5rem", textAlign: "center" }}>
          <h2 style={{ color: "#0f2460", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Ready to see Intugine in action?
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>75+ global enterprises trust Intugine for real-time supply chain visibility.</p>
          <a href="https://www.intugine.com/#demo" style={{ background: "#1a3c8f", color: "#fff", padding: "0.85rem 2.5rem", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>
            Book a Demo →
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
