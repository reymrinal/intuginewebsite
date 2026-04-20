"use client";

export default function Nav() {
  function handleDemoClick() {
    if (typeof window === "undefined") return;
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "cta_click", {
        event_category: "CTA",
        event_label: "nav_get_demo",
        cta_position: "nav",
        value: 1,
      });
    }
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "cta_click", cta_position: "nav", event_label: "nav_get_demo" });
    }
  }

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo → main site */}
        <a href="https://www.intugine.com" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img
            src="/logo.png"
            alt="Intugine"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
          />
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a3c8f", letterSpacing: "-0.01em" }}>Intugine</span>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <a
            href="https://library.intugine.com"
            style={{ color: "#1a3c8f", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
          >
            Library
          </a>
          <a
            href="https://library.intugine.com/faq"
            style={{ color: "#374151", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}
          >
            FAQ
          </a>
          <a
            href="https://library.intugine.com/case-studies"
            style={{ color: "#374151", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}
          >
            Case Studies
          </a>
          <a
            href="https://www.intugine.com/schedule-demo?utm_source=library&utm_medium=nav&utm_campaign=library_nav&utm_content=get_demo_btn"
            onClick={handleDemoClick}
            style={{ background: "#1a3c8f", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: 6, textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}
          >
            Get a Demo
          </a>
        </nav>
      </div>
    </header>
  );
}
