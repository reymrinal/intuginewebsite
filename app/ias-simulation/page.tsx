"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";

export default function IASSimulationPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(900);

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
            A live walkthrough of the IAS module — from raw sensor waveform capture through
            geofence validation, OCR confirmation, and final confidence score generation.
          </p>
        </div>

        {/* ── Feature pills ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            "Activity Waveform Analysis",
            "Geofence Validation",
            "OCR Vehicle Verification",
            "Confidence Score Engine",
            "Back-Unloading Detection",
          ].map((tag) => (
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
            ref={iframeRef}
            src="/ias-simulation.html"
            width="100%"
            height={iframeHeight}
            style={{ border: "none", background: "#03080F", display: "block" }}
            title="Intugine IAS Module Simulation"
            scrolling="no"
            allow="autoplay"
          />
        </div>

        {/* ── 2-col explainer ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#080F1A] border border-[#132030] rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-3">What the IAS module detects</h2>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-[#00C97A] mt-0.5">✓</span> Back-unloading at unauthorised points before reaching the dealer</li>
              <li className="flex gap-2"><span className="text-[#00C97A] mt-0.5">✓</span> Short delivery — truck unloads less than the invoiced quantity</li>
              <li className="flex gap-2"><span className="text-[#00C97A] mt-0.5">✓</span> Drive-through fraud — truck enters geofence without unloading</li>
              <li className="flex gap-2"><span className="text-[#00C97A] mt-0.5">✓</span> Vehicle substitution — different truck at delivery vs dispatch</li>
            </ul>
          </div>
          <div className="bg-[#080F1A] border border-[#132030] rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-3">The 4-layer validation system</h2>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">01</span><span><strong className="text-white">Activity sensing</strong> — sensor data captures physical unloading activity</span></li>
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">02</span><span><strong className="text-white">Geofence check</strong> — unloading must occur within dealer polygon</span></li>
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">03</span><span><strong className="text-white">OCR verification</strong> — vehicle number matched against dispatch record</span></li>
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">04</span><span><strong className="text-white">Confidence score</strong> — 0–100 score, alert triggered below threshold</span></li>
            </ul>
          </div>
        </div>

        {/* ── CTA Banner ── */}
        <CTABanner
          cta="See IAS deployed at your cement plant | Book a Free Demo"
          slug="ias-simulation"
          industry="Cement"
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
            <a href="/cement-logistics-control-tower" style={{ display: "block", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "1.1rem 1.25rem", textDecoration: "none" }}>
              <div style={{ fontSize: "1.25rem", marginBottom: "0.4rem" }}>🏗️</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.25rem" }}>Cement Logistics Control Tower</div>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>End-to-end cement logistics visibility with 24×7 monitoring</div>
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
