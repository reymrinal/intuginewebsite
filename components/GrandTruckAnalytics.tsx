"use client";

import { useEffect } from "react";

/**
 * Forwards gameplay events posted from the game iframe to GA4.
 * The game posts { type: "gta-event", payload: { event, params } }.
 * Origin is checked so third-party frames cannot inject events.
 */
export default function GrandTruckAnalytics() {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data;
      if (!data || data.type !== "gta-event" || !data.payload) return;
      const { event, params } = data.payload as { event?: string; params?: Record<string, unknown> };
      if (!event) return;
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag === "function") {
        gtag("event", event, params ?? {});
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
