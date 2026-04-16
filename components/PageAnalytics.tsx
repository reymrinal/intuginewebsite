"use client";

import { useEffect } from "react";

interface Props {
  slug: string;
  industry?: string;
  persona?: string;
  funnel_stage?: string;
}

export default function PageAnalytics({ slug, industry, persona, funnel_stage }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const startTime = Date.now();

    // ── 1. Page Read event (fires on load) ──────────────────────────
    const firePageRead = () => {
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: "page_read",
          page_slug: slug,
          industry: industry || "unknown",
          persona: persona || "unknown",
          funnel_stage: funnel_stage || "unknown",
        });
      }
    };
    firePageRead();

    // ── 2. Scroll depth tracking (25%, 50%, 75%, 100%) ──────────────
    const scrollMilestones = new Set<number>();
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);

      [25, 50, 75, 100].forEach((milestone) => {
        if (pct >= milestone && !scrollMilestones.has(milestone)) {
          scrollMilestones.add(milestone);
          if ((window as any).gtag) {
            (window as any).gtag("event", "scroll_depth", {
              event_category: "Engagement",
              event_label: slug,
              scroll_depth: milestone,
              industry: industry || "unknown",
            });
          }
          if ((window as any).dataLayer) {
            (window as any).dataLayer.push({
              event: "scroll_depth",
              page_slug: slug,
              scroll_depth: milestone,
              industry: industry || "unknown",
            });
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // ── 3. Time on page (fires at 30s, 60s, 120s) ──────────────────
    const timeCheckpoints = [30, 60, 120];
    const timers = timeCheckpoints.map((seconds) =>
      setTimeout(() => {
        if ((window as any).gtag) {
          (window as any).gtag("event", "time_on_page", {
            event_category: "Engagement",
            event_label: slug,
            seconds_on_page: seconds,
            industry: industry || "unknown",
          });
        }
        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: "time_on_page",
            page_slug: slug,
            seconds_on_page: seconds,
          });
        }
      }, seconds * 1000)
    );

    // ── 4. Exit intent (mouse leaves viewport top) ──────────────────
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: "exit_intent",
            page_slug: slug,
            time_spent_seconds: timeSpent,
            max_scroll: Math.max(...Array.from(scrollMilestones), 0),
          });
        }
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      timers.forEach(clearTimeout);
    };
  }, [slug, industry, persona, funnel_stage]);

  return null; // purely behavioral, no UI
}
