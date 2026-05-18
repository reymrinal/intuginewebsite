"use client";

import { useEffect, useCallback } from "react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

export default function DemoModal({
  isOpen,
  onClose,
  utmSource = "library",
  utmMedium = "content_cta",
  utmCampaign = "library_content",
  utmContent = "unknown",
}: DemoModalProps) {
  // Close on ESC
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKey]);

  // Load HubSpot form once modal opens
  useEffect(() => {
    if (!isOpen) return;

    const container = document.getElementById("hs-form-container");
    if (!container) return;
    container.innerHTML = ""; // reset on re-open

    const loadForm = () => {
      if ((window as any).hbspt) {
        (window as any).hbspt.forms.create({
          portalId: "5978916",
          formId: "84670385-63cf-49b8-93c0-cb87359c8182",
          region: "na2",
          target: "#hs-form-container",
          onFormReady: (form: any) => {
            // Inject UTM hidden fields after form renders
            setTimeout(() => {
              const setHidden = (name: string, value: string) => {
                const el = form?.querySelector?.(`input[name="${name}"]`) as HTMLInputElement | null;
                if (el) el.value = value;
              };
              setHidden("utm_source", utmSource);
              setHidden("utm_medium", utmMedium);
              setHidden("utm_campaign", utmCampaign);
              setHidden("utm_content", utmContent);
            }, 300);
          },
          onFormSubmit: () => {
            if (typeof (window as any).gtag === "function") {
              (window as any).gtag("event", "demo_form_submit", {
                event_category: "Lead",
                event_label: utmContent,
                utm_source: utmSource,
                utm_campaign: utmCampaign,
                value: 1,
              });
            }
            if ((window as any).dataLayer) {
              (window as any).dataLayer.push({
                event: "demo_form_submit",
                utm_source: utmSource,
                utm_campaign: utmCampaign,
                utm_content: utmContent,
              });
            }
          },
        });
      }
    };

    // If HubSpot script already loaded
    if ((window as any).hbspt) {
      loadForm();
      return;
    }

    // Otherwise inject the script
    const existing = document.getElementById("hs-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "hs-script";
      script.charset = "utf-8";
      script.type = "text/javascript";
      script.src = "//js-na2.hsforms.net/forms/embed/v2.js";
      script.onload = loadForm;
      document.head.appendChild(script);
    } else {
      // Script tag exists but hbspt not ready — poll
      const poll = setInterval(() => {
        if ((window as any).hbspt) {
          clearInterval(poll);
          loadForm();
        }
      }, 100);
    }
  }, [isOpen, utmSource, utmMedium, utmCampaign, utmContent]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem 2rem 1.5rem",
          position: "relative",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: "#6b7280",
            lineHeight: 1,
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{
            display: "inline-block",
            background: "#eff6ff",
            color: "#1a3c8f",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: 6,
            marginBottom: "0.6rem",
          }}>
            Book a Demo
          </div>
          <h2 style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            lineHeight: 1.3,
          }}>
            See Intugine in action
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.92rem", marginTop: "0.4rem", marginBottom: 0 }}>
            Talk to our team about your logistics visibility needs. We'll show you exactly what's possible.
          </p>
        </div>

        {/* Social proof strip */}
        <div style={{
          display: "flex",
          gap: "1.2rem",
          marginBottom: "1.25rem",
          padding: "0.75rem 1rem",
          background: "#f9fafb",
          borderRadius: 8,
          fontSize: "0.82rem",
          color: "#374151",
        }}>
          <span>✅ 75+ enterprise clients</span>
          <span>✅ 24–48h response</span>
          <span>✅ No commitment</span>
        </div>

        {/* HubSpot form mounts here */}
        <div id="hs-form-container" />
      </div>
    </div>
  );
}
