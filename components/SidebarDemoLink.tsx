"use client";

import { useModal } from "./DemoModalProvider";

export default function SidebarDemoLink({ slug, industry }: { slug: string; industry?: string }) {
  const { openModal } = useModal();

  const campaign = industry
    ? industry.toLowerCase().replace(/[^a-z0-9]+/g, "_") + "_library"
    : "library_content";

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "cta_click", {
          event_category: "CTA",
          event_label: slug,
          industry: industry || "unknown",
          cta_position: "sidebar",
          utm_source: "library",
          utm_campaign: campaign,
          value: 1,
        });
        (window as any).gtag("event", "demo_request_click", {
          page_slug: slug,
          industry: industry || "unknown",
          cta_position: "sidebar",
        });
      }
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: "cta_click",
          cta_position: "sidebar",
          page_slug: slug,
          industry: industry || "unknown",
        });
      }
    }
    openModal({ utmContent: slug, utmCampaign: campaign, utmSource: "library" });
  }

  return (
    <a
      href="#"
      onClick={handleClick}
      style={{
        display: "block",
        background: "#fff",
        color: "#1a3c8f",
        padding: "0.7rem",
        borderRadius: 6,
        textDecoration: "none",
        fontWeight: 700,
        fontSize: "0.85rem",
        cursor: "pointer",
      }}
    >
      Book Demo →
    </a>
  );
}
