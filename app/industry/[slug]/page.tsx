import { getAllPages } from "@/lib/api";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageCard from "@/components/PageCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const INDUSTRY_MAP: Record<string, { label: string; icon: string; color: string; description: string }> = {
  "cement": {
    label: "Cement",
    icon: "🏗️",
    color: "#f59e0b",
    description: "Real-time logistics visibility for cement manufacturers — reduce detention, improve truck TAT, and eliminate manual reconciliation.",
  },
  "freight-marketplace": {
    label: "Freight Marketplace",
    icon: "🚚",
    color: "#10b981",
    description: "Supply chain intelligence for freight platforms — live tracking, carrier performance analytics, and digital POD automation.",
  },
  "api-suite": {
    label: "API Suite",
    icon: "⚡",
    color: "#6366f1",
    description: "Developer resources for Intugine's IntuDB API — integrate real-time freight data, location intelligence, and logistics workflows into your product.",
  },
  "ptl-courier-tracking": {
    label: "PTL/Courier Tracking",
    icon: "📦",
    color: "#0ea5e9",
    description: "End-to-end PTL and courier visibility for Indian enterprises — unified multi-carrier tracking, exception management, e-POD verification, and freight reconciliation via IntuParcel.",
  },
  "metal-mining-coal": {
    label: "Metal, Mining & Coal",
    icon: "⛏️",
    color: "#78716c",
    description: "Logistics visibility for metals, mining, and coal supply chains — GPS tracking, activity sensing using sensors, and cargo security intelligence for bulk freight operations.",
  },
  "transporter": {
    label: "Transporter",
    icon: "🚛",
    color: "#f97316",
    description: "Digital tools for Indian transporters and fleet owners — LeMP freight marketplace, TYT vehicle verification, and EcoTrace carbon emissions tracking powered by ULIP.",
  },
  "express-logistics": {
    title: "Express Logistics Tracking & Visibility Platform | Intugine",
    industry: "Express Logistics",
    heading: "AI-Powered Visibility and Control Tower for Express Logistics",
    description: "Track every express vehicle across GPS, SIM, FASTag, and vehicle-number-only tracking. Intugine helps express logistics companies improve linehaul speed, SLA adherence, ETA accuracy, and control tower automation across national, zonal, and local movements.",
    color: "#dc2626",
    emoji: "⚡",
  },
  "visibility-tracking": {
    label: "Visibility & Tracking",
    icon: "📡",
    color: "#1a3c8f",
    description: "India's multimodal supply chain visibility platform — FASTag toll intelligence, SIM-based tracking, GPS, and IoT activity sensing in one unified logistics intelligence stack.",
  },
};

// Map industry label in DB to slug
const LABEL_TO_SLUG: Record<string, string> = {
  "Cement": "cement",
  "Freight Marketplace": "freight-marketplace",
  "API Suite": "api-suite",
  "PTL/Courier Tracking": "ptl-courier-tracking",
  "Metal, Mining & Coal": "metal-mining-coal",
  "Transporter": "transporter",
  "Visibility & Tracking": "visibility-tracking",
  "Express Logistics": "express-logistics",
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(INDUSTRY_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ind = INDUSTRY_MAP[slug];
  if (!ind) return { title: "Not Found" };
  return {
    title: `${ind.label} Logistics Resources | Intugine Library`,
    description: ind.description,
    alternates: { canonical: `https://library.intugine.com/industry/${slug}` },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ind = INDUSTRY_MAP[slug];
  if (!ind) notFound();

  const allPages = await getAllPages();
  const industryPages = allPages.filter(
    (p) => LABEL_TO_SLUG[p.industry || ""] === slug
  );

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <div
          style={{
            background: `linear-gradient(135deg, ${ind.color}22 0%, #f8fafc 100%)`,
            borderBottom: `3px solid ${ind.color}`,
            padding: "3.5rem 1.5rem 2.5rem",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", fontSize: "0.82rem", color: "#6b7280" }}>
              <a href="https://library.intugine.com" style={{ color: "#1a3c8f", textDecoration: "none", fontWeight: 500 }}>Library</a>
              <span>›</span>
              <span>{ind.label}</span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
              <span style={{ fontSize: "3rem", lineHeight: 1 }}>{ind.icon}</span>
              <div>
                <h1 style={{ margin: "0 0 0.6rem", fontSize: "2rem", fontWeight: 800, color: "#0f2460" }}>
                  {ind.label} Logistics Resources
                </h1>
                <p style={{ margin: 0, color: "#4b5563", fontSize: "1.05rem", maxWidth: 680, lineHeight: 1.6 }}>
                  {ind.description}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", flexWrap: "wrap" }}>
              {[
                { label: "Resources", value: industryPages.length },
                { label: "Avg. Reading Time", value: "5 min" },
                { label: "Updated", value: "Weekly" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontWeight: 700, fontSize: "1.2rem", color: ind.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
          {industryPages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "#6b7280" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚧</div>
              <h2 style={{ color: "#0f2460", marginBottom: "0.5rem" }}>Content coming soon</h2>
              <p>We're publishing {ind.label} resources — check back shortly.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {industryPages.map((page) => (
                <PageCard key={page.id} page={page} />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ background: "#f0f4ff", padding: "3rem 1.5rem", textAlign: "center" }}>
          <h2 style={{ color: "#0f2460", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            See how Intugine works for {ind.label}
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            75+ global enterprises trust Intugine for real-time supply chain visibility.
          </p>
          <a
            href={`https://www.intugine.com/schedule-demo?utm_source=library&utm_medium=industry_cta&utm_campaign=${slug}_library&utm_content=industry_page_cta`}
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
      <Footer />
    </>
  );
}
