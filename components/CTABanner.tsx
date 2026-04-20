"use client";

const DEMO_URL = "https://www.intugine.com/schedule-demo";

function buildDemoUrl(source: string, medium: string, campaign: string, content?: string) {
  const url = new URL(DEMO_URL);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}

function fireEvent(eventName: string, params: Record<string, string>) {
  if (typeof window === "undefined") return;
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, { ...params, value: 1 });
  }
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({ event: eventName, ...params });
  }
}

export default function CTABanner({ cta, slug, industry }: { cta?: string; slug?: string; industry?: string }) {
  const parts = cta?.split("|") ?? [];
  const ctaText = parts[0]?.trim() || "See How Intugine Works";
  const ctaAction = parts[1]?.trim() || "Book Demo";

  const campaign = industry
    ? industry.toLowerCase().replace(/[^a-z0-9]+/g, "_") + "_library"
    : "library_content";

  const href = buildDemoUrl("library", "content_cta", campaign, slug || "unknown");

  function handleClick() {
    fireEvent("cta_click", {
      event_category: "CTA",
      event_label: slug || "unknown",
      industry: industry || "unknown",
      cta_position: "inline_banner",
      cta_text: ctaAction,
    });
    fireEvent("demo_request_click", {
      page_slug: slug || "unknown",
      industry: industry || "unknown",
      cta_position: "inline_banner",
    });
  }

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
        href={href}
        onClick={handleClick}
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

// Reusable tracked CTA link for use in other components
export function TrackedDemoLink({
  children,
  source,
  medium,
  campaign,
  content,
  slug,
  industry,
  position,
  style,
}: {
  children: React.ReactNode;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  slug?: string;
  industry?: string;
  position: string;
  style?: React.CSSProperties;
}) {
  const href = buildDemoUrl(source, medium, campaign, content);

  function handleClick() {
    fireEvent("cta_click", {
      event_category: "CTA",
      event_label: slug || content || "unknown",
      industry: industry || "unknown",
      cta_position: position,
      utm_source: source,
      utm_campaign: campaign,
    });
    fireEvent("demo_request_click", {
      page_slug: slug || "unknown",
      industry: industry || "unknown",
      cta_position: position,
    });
  }

  return (
    <a href={href} onClick={handleClick} style={style}>
      {children}
    </a>
  );
}
