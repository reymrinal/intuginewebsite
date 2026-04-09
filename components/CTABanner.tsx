export default function CTABanner({ cta }: { cta?: string }) {
  const parts = cta?.split("|") ?? [];
  const ctaText = parts[0]?.trim() || "See How Intugine Works";
  const ctaAction = parts[1]?.trim() || "Book Demo";

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a3c8f 0%, #0f2460 100%)",
      borderRadius: 12,
      padding: "3rem 2.5rem",
      textAlign: "center",
      margin: "3rem 0",
    }}>
      <h2 style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.75rem" }}>{ctaText}</h2>
      <p style={{ color: "#bfdbfe", marginBottom: "1.5rem", fontSize: "1rem" }}>
        Join 75+ global enterprises using Intugine for real-time supply chain visibility.
      </p>
      <a
        href="https://www.intugine.com/#demo"
        style={{
          display: "inline-block",
          background: "#fff",
          color: "#1a3c8f",
          padding: "0.85rem 2.5rem",
          borderRadius: 8,
          fontWeight: 700,
          textDecoration: "none",
          fontSize: "1rem",
          transition: "opacity 0.2s",
        }}
      >
        {ctaAction} →
      </a>
    </div>
  );
}
