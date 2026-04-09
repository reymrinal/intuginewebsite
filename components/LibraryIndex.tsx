"use client";
import { useState } from "react";
import PageCard from "@/components/PageCard";
import type { SEOPage } from "@/lib/api";

const INDUSTRY_COLORS: Record<string, string> = {
  Cement: "#f59e0b",
  FMCG: "#10b981",
  Pharma: "#6366f1",
  Auto: "#ef4444",
  Default: "#1a3c8f",
};

const INDUSTRY_ICONS: Record<string, string> = {
  Cement: "🏗️",
  FMCG: "🛒",
  Pharma: "💊",
  Auto: "🚗",
  Default: "📦",
};

export default function LibraryIndex({ pages }: { pages: SEOPage[] }) {
  const industries = [...new Set(pages.map((p) => p.industry).filter(Boolean))] as string[];
  const [activeIndustry, setActiveIndustry] = useState<string>("All");

  const filteredPages =
    activeIndustry === "All"
      ? pages
      : pages.filter((p) => p.industry === activeIndustry);

  const byIndustry: Record<string, SEOPage[]> = {};
  if (activeIndustry === "All") {
    industries.forEach((ind) => {
      byIndustry[ind] = pages.filter((p) => p.industry === ind);
    });
  } else {
    byIndustry[activeIndustry] = filteredPages;
  }

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

        {/* Industry filter tabs — inside hero, flush at bottom */}
        <div
          style={{
            maxWidth: 1200,
            margin: "2.5rem auto 0",
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: 0,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {["All", ...industries].map((ind) => {
            const isActive = activeIndustry === ind;
            const color = ind === "All" ? "#1a3c8f" : (INDUSTRY_COLORS[ind] || INDUSTRY_COLORS.Default);
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
                  marginBottom: 0,
                }}
              >
                {ind !== "All" && <span>{INDUSTRY_ICONS[ind] || INDUSTRY_ICONS.Default}</span>}
                {ind}
                {ind !== "All" && (
                  <span
                    style={{
                      background: isActive ? color : "rgba(255,255,255,0.25)",
                      color: isActive ? "#fff" : "#fff",
                      borderRadius: 10,
                      padding: "0.1rem 0.45rem",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    {pages.filter((p) => p.industry === ind).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          background: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
          padding: "1rem 1.5rem",
        }}
      >
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
            { label: "Resources", value: filteredPages.length.toString() },
            { label: "Industries", value: activeIndustry === "All" ? industries.length.toString() : "1" },
            { label: "Avg. Reading Time", value: "5 min" },
          ].map((stat) => (
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 28,
                  background: INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.Default,
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: "1.4rem" }}>{INDUSTRY_ICONS[industry] || INDUSTRY_ICONS.Default}</span>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#0f2460" }}>
                {industry} Logistics
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
      <div
        style={{
          background: "#f0f4ff",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#0f2460",
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Ready to see Intugine in action?
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          75+ global enterprises trust Intugine for real-time supply chain visibility.
        </p>
        <a
          href="https://www.intugine.com/schedule-demo"
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
