"use client";

import { useState } from "react";
import { useModal } from "./DemoModalProvider";

export default function Nav() {
  const { openModal } = useModal();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleDemoClick(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(false);
    if (typeof window !== "undefined") {
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
    openModal({ utmContent: "nav_get_demo", utmCampaign: "library_nav", utmSource: "library" });
  }

  const links = [
    { href: "https://library.intugine.com", label: "Library" },
    { href: "https://library.intugine.com/reports", label: "Reports" },
    { href: "https://library.intugine.com/cruise", label: "Cruise" },
    { href: "https://library.intugine.com/roi-calculator", label: "ROI Calculator" },
    { href: "https://library.intugine.com/ias-simulation", label: "IAS" },
  ];

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <a href="https://www.intugine.com" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/logo.png" alt="Intugine" width={36} height={36} style={{ objectFit: "contain" }} />
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a3c8f", letterSpacing: "-0.01em" }}>Intugine</span>
        </a>

        {/* Desktop Nav */}
        <nav className="nav-desktop" style={{ alignItems: "center", gap: "2rem" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} style={{ color: l.label === "Library" ? "#1a3c8f" : "#374151", textDecoration: "none", fontSize: "0.9rem", fontWeight: l.label === "Library" ? 600 : 500 }}>
              {l.label}
            </a>
          ))}
          <a
            href="#"
            onClick={handleDemoClick}
            style={{ background: "#1a3c8f", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: 6, textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}
          >
            Get a Demo
          </a>
        </nav>

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="nav-toggle"
          style={{ background: "none", border: "none", padding: 8, cursor: "pointer", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3c8f" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav className="nav-mobile-panel" style={{ borderTop: "1px solid #e5e7eb", padding: "0.5rem 1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{ color: l.label === "Library" ? "#1a3c8f" : "#374151", textDecoration: "none", fontSize: "0.95rem", fontWeight: l.label === "Library" ? 600 : 500, padding: "0.6rem 0" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#"
            onClick={handleDemoClick}
            style={{ background: "#1a3c8f", color: "#fff", padding: "0.6rem 1.25rem", borderRadius: 6, textDecoration: "none", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", textAlign: "center", marginTop: "0.4rem" }}
          >
            Get a Demo
          </a>
        </nav>
      )}

    </header>
  );
}
