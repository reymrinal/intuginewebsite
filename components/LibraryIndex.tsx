"use client";
import { useState } from "react";
import PageCard from "@/components/PageCard";
import type { SEOPage } from "@/lib/api";

const ACTIVE_INDUSTRIES = ["Cement", "Freight Marketplace", "API Suite", "PTL/Courier Tracking", "Metal, Mining & Coal", "Transporter", "Visibility & Tracking"];

const INDUSTRY_COLORS: Record<string, string> = {
  "Cement": "#f59e0b",
  "Freight Marketplace": "#10b981",
  "API Suite": "#6366f1",
  "PTL/Courier Tracking": "#0ea5e9",
  "Metal, Mining & Coal": "#78716c",
  "Transporter": "#f97316",
  "Visibility & Tracking": "#1a3c8f",
  Default: "#1a3c8f",
};

const INDUSTRY_ICONS: Record<string, string> = {
  "Cement": "🏗️",
  "Freight Marketplace": "🚚",
  "API Suite": "⚡",
  "PTL/Courier Tracking": "📦",
  "Metal, Mining & Coal": "⛏️",
  "Transporter": "🚛",
  "Visibility & Tracking": "📡",
  Default: "📄",
};

const INDUSTRY_SLUGS: Record<string, string> = {
  "Cement": "cement",
  "Freight Marketplace": "freight-marketplace",
  "API Suite": "api-suite",
  "PTL/Courier Tracking": "ptl-courier-tracking",
  "Metal, Mining & Coal": "metal-mining-coal",
  "Transporter": "transporter",
  "Visibility & Tracking": "visibility-tracking",
};

export default function LibraryIndex({ pages }: { pages: SEOPage[] }) {
  const [activeIndustry, setActiveIndustry] = useState<string>("All");

  const visiblePages =
    activeIndustry === "All"
      ? pages
      : pages.filter((p) => p.industry === activeIndustry);

  const sections: { industry: string; pages: SEOPage[] }[] =
    activeIndustry === "All"
      ? ACTIVE_INDUSTRIES.map((ind) => ({
          industry: ind,
          pages: pages.filter((p) => p.industry === ind),
        })).filter((s) => s.pages.length > 0)
      : [{ industry: activeIndustry, pages: visiblePages }];

  return (
    <main>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a3c8f 0%, #0f2460 100%)",
          padding: "4rem 1.5rem 0",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <span
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#bfdbfe",
              padding: "0.35rem 0.9rem",
              borderRadius: 20,
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Resource Library
          </span>
          <h1
            style={{
              color: "#fff",
              fontSize: "2.5rem",
              fontWeight: 800,
              margin: "1rem 0 0.75rem",
              lineHeight: 1.15,
            }}
          >
            Supply Chain Visibility Intelligence
          </h1>
          <p style={{ color: "#bfdbfe", fontSize: "1.1rem", lineHeight: 1.6 }}>
            Guides, glossary terms, and industry playbooks to help logistics and supply chain leaders make better decisions.
          </p>
        </div>

        {/* Industry filter tabs */}
        <div
          style={{
            maxWidth: 1200,
            margin: "2.5rem auto 0",
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {["All", ...ACTIVE_INDUSTRIES].map((ind) => {
            const isActive = activeIndustry === ind;
            const color = ind === "All" ? "#1a3c8f" : (INDUSTRY_COLORS[ind] || INDUSTRY_COLORS.Default);
            const count = ind === "All" ? pages.length : pages.filter((p) => p.industry === ind).length;

            return (
              <button
                key={ind}
                onClick={() => setActiveIndustry(ind)}
                style={{
                  background: isActive ? "#fff" : "rgba(255,255,255,0.12)",
                  color: isActive ? color : "#fff",
                  border: "none",
                  padding: "0.55rem 1.25rem",
                  borderRadius: "8px 8px 0 0",
                  fontSize: "0.88rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                {ind !== "All" && <span>{INDUSTRY_ICONS[ind] || INDUSTRY_ICONS.Default}</span>}
                {ind}
                <span
                  style={{
                    background: isActive ? color : "rgba(255,255,255,0.25)",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "0.1rem 0.45rem",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "1rem 1.5rem" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            gap: "2.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Resources", value: visiblePages.length.toString() },
            {
              label: "Industries",
              value: activeIndustry === "All" ? ACTIVE_INDUSTRIES.length.toString() : "1",
            },
            { label: "Avg. Reading Time", value: "5 min" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#1a3c8f" }}>{stat.value}</div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content sections */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {sections.map(({ industry, pages: indPages }) => (
          <section key={industry} id={industry} style={{ marginBottom: "3.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: 4,
                  height: 28,
                  background: INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.Default,
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: "1.3rem" }}>{INDUSTRY_ICONS[industry] || INDUSTRY_ICONS.Default}</span>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#0f2460" }}>
                {industry}
              </h2>
              <span
                style={{
                  background: "#f1f5f9",
                  color: "#6b7280",
                  padding: "0.2rem 0.6rem",
                  borderRadius: 12,
                  fontSize: "0.75rem",
                }}
              >
                {indPages.length} resources
              </span>
              <a
                href={`https://library.intugine.com/industry/${INDUSTRY_SLUGS[industry] || industry.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                style={{
                  marginLeft: "auto",
                  color: INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.Default,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View all {industry} resources →
              </a>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {indPages.map((page) => (
                <PageCard key={page.id} page={page} />
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
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          75+ global enterprises trust Intugine for real-time supply chain visibility.
        </p>
        <a
          href="https://www.intugine.com/schedule-demo?utm_source=library&utm_medium=index_cta&utm_campaign=library_index&utm_content=bottom_cta"
          style={{
            background: "#1a3c8f",
            color: "#fff",
            padding: "0.85rem 2.5rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          Book a Demo →
        </a>
      </div>
    </main>
  );
}
