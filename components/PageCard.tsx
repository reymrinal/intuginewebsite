"use client";

import { getTemplateLabel } from "@/lib/api";
import type { SEOPage } from "@/lib/api";

const TEMPLATE_COLORS: Record<string, string> = {
  glossary: "#e0f2fe",
  how_to: "#d1fae5",
  product_x_industry: "#ede9fe",
  competitor_comparison: "#fee2e2",
};

export default function PageCard({ page }: { page: SEOPage }) {
  return (
    <a
      href={`/${page.slug}`}
      style={{
        textDecoration: "none",
        display: "block",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "1.25rem 1.5rem",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(26,60,143,0.12)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
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

      </div>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f2460", lineHeight: 1.4 }}>
        {page.title.replace(/ \| Intugine$/, "")}
      </h3>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.5 }}>
        {page.meta_description?.slice(0, 100)}...
      </p>
      <span style={{ fontSize: "0.8rem", color: "#1a3c8f", fontWeight: 600 }}>Read more →</span>
    </a>
  );
}
