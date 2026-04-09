export default function Footer() {
  return (
    <footer style={{ background: "#0f2460", color: "#cbd5e1", padding: "3rem 1.5rem 2rem", marginTop: "4rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2rem", marginBottom: "2.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" style={{ marginRight: 8 }}>
                <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="#fff" />
                <path d="M20 12L28 16V24L20 28L12 24V16L20 12Z" fill="#0f2460" fillOpacity="0.5" />
              </svg>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "#fff" }}>Intugine</span>
            </div>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, maxWidth: 260, color: "#94a3b8" }}>
              Complete real-time visibility for your supply chain. Trusted by 75+ global enterprises.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Solutions</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["IntuTrack", "IntuParcel", "EcoTrace", "IntuDB"].map(s => (
                <li key={s}><a href="https://www.intugine.com" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem" }}>{s}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Industries</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Cement", "FMCG", "Pharma", "Auto"].map(i => (
                <li key={i}><a href="https://www.intugine.com" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem" }}>{i}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Library</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Guides", "Glossary", "FAQs", "Case Studies"].map(l => (
                <li key={l}><a href="/library" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem" }}>{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #1e3a6e", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>© {new Date().getFullYear()} Intugine Technologies. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a href="https://www.intugine.com" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.8rem" }}>Privacy Policy</a>
            <a href="https://www.intugine.com" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.8rem" }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
