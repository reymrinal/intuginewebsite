export default function Nav() {
  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <a href="https://www.intugine.com" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" style={{ marginRight: 8 }}>
            <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="#1a3c8f" />
            <path d="M20 12L28 16V24L20 28L12 24V16L20 12Z" fill="#fff" fillOpacity="0.3" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a3c8f", letterSpacing: "-0.01em" }}>Intugine</span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <a href="https://www.intugine.com" style={{ color: "#374151", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>Solutions</a>
          <a href="https://www.intugine.com" style={{ color: "#374151", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>Industries</a>
          <a href="https://www.intugine.com/library" style={{ color: "#1a3c8f", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>Library</a>
          <a
            href="https://www.intugine.com/schedule-demo"
            style={{ background: "#1a3c8f", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: 6, textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
          >
            Get a Demo
          </a>
        </nav>
      </div>
    </header>
  );
}
