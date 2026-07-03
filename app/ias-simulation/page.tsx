"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";

type Vertical = "cement" | "coal";

const CONTENT: Record<
  Vertical,
  {
    label: string;
    iframeSrc: string;
    pills: string[];
    detects: string[];
    cta: string;
    ctaIndustry: string;
    relatedHref: string;
    relatedLabel: string;
    relatedDesc: string;
    relatedIcon: string;
  }
> = {
  cement: {
    label: "Cement",
    iframeSrc: "/ias-simulation.html",
    pills: [
      "Activity Waveform Analysis",
      "Geofence Validation",
      "OCR Vehicle Verification",
      "Confidence Score Engine",
      "Back-Unloading Detection",
    ],
    detects: [
      "Back-unloading at unauthorised points before reaching the dealer",
      "Short delivery — truck unloads less than the invoiced quantity",
      "Drive-through fraud — truck enters geofence without unloading",
      "Vehicle substitution — different truck at delivery vs dispatch",
    ],
    cta: "See IAS deployed at your cement plant | Book a Free Demo",
    ctaIndustry: "Cement",
    relatedHref: "/cement-logistics-control-tower",
    relatedLabel: "Cement Logistics Control Tower",
    relatedDesc: "End-to-end cement logistics visibility with 24×7 monitoring",
    relatedIcon: "🏗️",
  },
  coal: {
    label: "Coal",
    iframeSrc: "/ias-simulation-coal.html",
    pills: [
      "Activity Waveform Analysis",
      "Geofence Validation",
      "OCR Vehicle Verification",
      "Confidence Score Engine",
      "Pet Coke / Coal Grade Mismatch Detection",
    ],
    detects: [
      "Grey market diversion — coal offloaded before reaching the plant or dealer",
      "Short delivery — truck unloads less than the invoiced tonnage at the power plant or kiln",
      "Drive-through fraud — truck enters weighbridge/geofence without unloading",
      "Vehicle substitution — different truck at delivery vs dispatch from the mine or siding",
    ],
    cta: "See IAS deployed at your coal or thermal power operation | Book a Free Demo",
    ctaIndustry: "Coal",
    relatedHref: "/coal-supply-chain-risk-management-india",
    relatedLabel: "Coal Supply Chain Risk Management",
    relatedDesc: "End-to-end coal & pet coke logistics visibility with 24×7 monitoring",
    relatedIcon: "⛏️",
  },
};

export default function IASSimulationPage() {
  const [vertical, setVertical] = useState<Vertical>("cement");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(900);
  const active = CONTENT[vertical];

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data && typeof e.data.iasHeight === "number") {
        // Cap at 1400px to prevent runaway void below the simulation
        const h = Math.min(e.data.iasHeight + 24, 1400);
        setIframeHeight(h);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Reset height when switching tabs so a shorter/taller sim doesn't inherit
  // the previous tab's frame size before its own postMessage arrives.
  useEffect(() => {
    setIframeHeight(900);
  }, [vertical]);

  return (
    <div className="min-h-screen bg-[#03080F] text-white">
      <Nav />

      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="mb-6">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#3A8FF0] bg-[#1B6FD4]/10 border border-[#1B6FD4]/20 rounded-full px-4 py-1.5 mb-4">
            IAS Module · Interactive Simulation
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Intugine Activity Sensing — How It Works
          </h1>
          <p className="text-white/50 text-base max-w-2xl">
            A live walkthrough of the IAS module — from activity sensing using sensors through
            geofence validation, OCR confirmation, and final confidence score generation.
          </p>
        </div>

        {/* ── Industry tabs ── */}
        <div className="flex gap-2 mb-6 border-b border-[#132030]">
          {(Object.keys(CONTENT) as Vertical[]).map((key) => (
            <button
              key={key}
              onClick={() => setVertical(key)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
                vertical === key
                  ? "bg-[#0f172a] text-white border border-b-0 border-[#1B6FD4]/40"
                  : "text-white/40 hover:text-white/70 border border-transparent"
              }`}
              style={vertical === key ? { marginBottom: "-1px" } : undefined}
            >
              {CONTENT[key].label}
            </button>
          ))}
        </div>

        {/* ── Feature pills ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {active.pills.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-3 py-1 rounded-full border border-white/10 text-white/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ── Simulation iframe — auto-height, no scroll ── */}
        <div className="w-full rounded-xl overflow-hidden border border-[#132030] shadow-2xl mb-10">
          <iframe
            key={active.iframeSrc}
            ref={iframeRef}
            src={active.iframeSrc}
            width="100%"
            height={iframeHeight}
            style={{ border: "none", background: "#03080F", display: "block" }}
            title={`Intugine IAS Module Simulation — ${active.label}`}
            scrolling="no"
            allow="autoplay"
          />
        </div>

        {/* ── 2-col explainer ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#080F1A] border border-[#132030] rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-3">What the IAS module detects</h2>
            <ul className="space-y-2 text-sm text-white/60">
              {active.detects.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-[#00C97A] mt-0.5">✓</span> {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#080F1A] border border-[#132030] rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-3">The 4-layer validation system</h2>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">01</span><span><strong className="text-white">Activity sensing</strong> — sensor data captures physical unloading activity</span></li>
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">02</span><span><strong className="text-white">Geofence check</strong> — unloading must occur within the plant/dealer polygon</span></li>
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">03</span><span><strong className="text-white">OCR verification</strong> — vehicle number matched against dispatch record</span></li>
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">04</span><span><strong className="text-white">Confidence score</strong> — 0–100 score, alert triggered below threshold</span></li>
            </ul>
          </div>
        </div>

        {/* ── CTA Banner ── */}
        <CTABanner
          cta={active.cta}
          slug="ias-simulation"
          industry={active.ctaIndustry}
        />

        {/* ── Related Tools Navigation ── */}
        <div style={{ marginTop: "2.5rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4b5563", marginBottom: "1rem" }}>
            Explore More Tools
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <a href="/roi-calculator" style={{ display: "block", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "1.1rem 1.25rem", textDecoration: "none" }}>
              <div style={{ fontSize: "1.25rem", marginBottom: "0.4rem" }}>📊</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.25rem" }}>Freight Loss ROI Calculator</div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Calculate back-unloading + grey market + KM debit savings</div>
            </a>
            <a href="/faq" style={{ display: "block", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "1.1rem 1.25rem", textDecoration: "none" }}>
              <div style={{ fontSize: "1.25rem", marginBottom: "0.4rem" }}>❓</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.25rem" }}>Frequently Asked Questions</div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>Common questions on IAS, tracking, and supply chain visibility</div>
            </a>
            <a href={active.relatedHref} style={{ display: "block", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "1.1rem 1.25rem", textDecoration: "none" }}>
              <div style={{ fontSize: "1.25rem", marginBottom: "0.4rem" }}>{active.relatedIcon}</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.25rem" }}>{active.relatedLabel}</div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{active.relatedDesc}</div>
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
