import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies | Intugine Library",
  description: "Real-world case studies from Intugine's enterprise customers — coming soon.",
  robots: { index: false, follow: false },
};

export default function CaseStudiesPage() {
  return (
    <>
      <Nav />
      <main>
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 1.5rem",
            textAlign: "center",
            background: "linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "3rem 3.5rem",
              boxShadow: "0 4px 24px rgba(26,60,143,0.08)",
              maxWidth: 520,
              width: "100%",
            }}
          >
            <span style={{ fontSize: "3rem" }}>📖</span>
            <h1 style={{ color: "#0f2460", fontSize: "1.8rem", fontWeight: 800, margin: "1rem 0 0.5rem" }}>
              Case Studies — Coming Soon
            </h1>
            <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: "2rem" }}>
              In-depth stories of how Intugine's customers improved truck TAT, reduced detention costs, and achieved end-to-end supply chain visibility. Publishing soon.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://library.intugine.com"
                style={{
                  background: "#f1f5f9",
                  color: "#1a3c8f",
                  padding: "0.65rem 1.5rem",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                ← Back to Library
              </a>
              <a
                href="https://www.intugine.com/schedule-demo"
                style={{
                  background: "#1a3c8f",
                  color: "#fff",
                  padding: "0.65rem 1.5rem",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                See customer stories →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
