"use client";

import { useState, useCallback } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// ── Indian number format ──────────────────────────────────────────────────────
function formatINR(value: number): string {
  if (isNaN(value) || !isFinite(value)) return "₹0";
  const abs = Math.abs(value);
  if (abs >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)} Cr`;
  if (abs >= 100_000)    return `₹${(value / 100_000).toFixed(1)} L`;
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatPayback(months: number, cPct: number): string {
  if (cPct === 0) return "Instant";
  if (months < 1) return "Under 1 month";
  return `${months.toFixed(1)} months`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, highlight = false, accent = false,
}: { label: string; value: string; sub?: string; highlight?: boolean; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-1 border ${
      highlight
        ? "bg-[#0f1e14] border-[#22c55e]/40 shadow-lg shadow-[#22c55e]/10"
        : accent
        ? "bg-[#0d1a26] border-[#38bdf8]/30"
        : "bg-[#111] border-white/10"
    }`}>
      <p className="text-xs text-white/50 uppercase tracking-widest font-medium">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-[#22c55e]" : accent ? "text-[#38bdf8]" : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Saving row ────────────────────────────────────────────────────────────────
function SavingRow({ label, value, tooltip }: { label: string; value: number; tooltip: string }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-white/5 last:border-0 gap-4">
      <div>
        <p className="text-sm text-white/80 font-medium">{label}</p>
        <p className="text-xs text-white/40 mt-0.5">{tooltip}</p>
      </div>
      <p className="text-sm font-bold text-white whitespace-nowrap">{formatINR(value)}<span className="text-white/40 font-normal">/yr</span></p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ROICalculator() {
  const [trips, setTrips]         = useState("");
  const [freight, setFreight]     = useState("");
  const [leakPct, setLeakPct]     = useState("");
  const [kmPct, setKmPct]         = useState("");
  const [costShare, setCostShare] = useState(30);

  const tripsN   = parseFloat(trips)   || 0;
  const freightN = parseFloat(freight) || 0;
  const leakN    = parseFloat(leakPct) || 4;
  const kmN      = parseFloat(kmPct)   || 6;
  const cPct     = costShare;

  const mf               = tripsN * freightN;
  const S1               = mf * (leakN / 100) * 0.70 * 12;
  const S2               = mf * (leakN / 100) * 1.80 * 12;
  const S3               = mf * (kmN   / 100) * 0.85 * 12;
  const gross            = S1 + S2 + S3;
  const platformTotal    = tripsN * 40;
  const yourCost         = platformTotal * (cPct / 100);
  const transporterCost  = platformTotal * ((100 - cPct) / 100);
  const platformAnnual   = yourCost * 12;
  const netROI           = gross - platformAnnual;
  const paybackMonths    = platformAnnual > 0 ? platformAnnual / (gross / 12) : 0;

  const hasData = tripsN > 0 && freightN > 0;

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCostShare(Number(e.target.value));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

      <main className="max-w-4xl mx-auto px-4 py-16">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full px-4 py-1.5 mb-4">
            ROI Calculator
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            What does back-unloading &amp; KM fraud<br className="hidden md:block" /> cost your cement business?
          </h1>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Enter your dispatch numbers below. Every field updates instantly — no forms, no sign-ups.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* ── LEFT: Inputs ── */}
          <div className="space-y-6">

            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Your Numbers</h2>

              {/* Trips */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Monthly trips dispatched <span className="text-[#22c55e]">*</span>
                </label>
                <input
                  type="number" min="0" placeholder="e.g. 500"
                  value={trips}
                  onChange={e => setTrips(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e]/50 focus:bg-white/[0.08] transition text-base"
                />
              </div>

              {/* Freight */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Avg freight cost per trip (₹) <span className="text-[#22c55e]">*</span>
                </label>
                <input
                  type="number" min="0" placeholder="e.g. 15000"
                  value={freight}
                  onChange={e => setFreight(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e]/50 focus:bg-white/[0.08] transition text-base"
                />
              </div>

              {/* Leakage */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Back-unloading / leakage %
                  <span className="ml-2 text-xs text-white/30">(default 4%)</span>
                </label>
                <input
                  type="number" min="0" max="100" placeholder="4"
                  value={leakPct}
                  onChange={e => setLeakPct(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e]/50 transition text-base"
                />
              </div>

              {/* KM gap */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Planned vs actual KM gap %
                  <span className="ml-2 text-xs text-white/30">(default 6%)</span>
                </label>
                <input
                  type="number" min="0" max="100" placeholder="6"
                  value={kmPct}
                  onChange={e => setKmPct(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e]/50 transition text-base"
                />
              </div>
            </div>

            {/* Platform cost slider */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Platform Cost Split</h2>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-white/80">Your company bears</label>
                  <span className="text-xl font-bold text-[#38bdf8]">{cPct}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={cPct}
                  onChange={handleSlider}
                  className="w-full accent-[#38bdf8] cursor-pointer h-2"
                />
                <div className="flex justify-between text-xs text-white/25 mt-1.5">
                  <span>0% (all transporter)</span>
                  <span>100% (all you)</span>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-white/40 mb-1">Your monthly cost</p>
                  <p className="text-lg font-bold text-[#38bdf8]">
                    {hasData ? formatINR(yourCost) : "—"}
                  </p>
                  <p className="text-xs text-white/25 mt-0.5">₹40/trip × {cPct}%</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-white/40 mb-1">Transporter bears</p>
                  <p className="text-lg font-bold text-white/60">
                    {hasData ? formatINR(transporterCost) : "—"}
                  </p>
                  <p className="text-xs text-white/25 mt-0.5">₹40/trip × {100 - cPct}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Outputs ── */}
          <div className="space-y-4">

            {/* Empty state */}
            {!hasData && (
              <div className="bg-[#111] border border-white/10 rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center gap-3">
                <div className="text-5xl">🧮</div>
                <p className="text-white/40 text-sm max-w-xs">Enter your monthly trips and avg freight cost on the left to see your savings instantly.</p>
                <p className="text-white/20 text-xs">All calculations update as you type. No email required.</p>
              </div>
            )}

            {hasData && (
              <>
                {/* Key metrics grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Net Annual ROI"
                    value={formatINR(netROI)}
                    sub="after platform cost"
                    highlight
                  />
                  <StatCard
                    label="Payback Period"
                    value={formatPayback(paybackMonths, cPct)}
                    sub="to recover platform cost"
                    accent
                  />
                  <StatCard
                    label="Gross Savings / yr"
                    value={formatINR(gross)}
                    sub="before platform cost"
                  />
                  <StatCard
                    label="Annual Platform Cost"
                    value={formatINR(platformAnnual)}
                    sub={`your ${cPct}% share`}
                  />
                </div>

                {/* Savings breakdown */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Savings Breakdown</h3>
                  <SavingRow
                    label="Freight leakage recovered"
                    value={S1}
                    tooltip={`${leakN}% leakage × 70% recovery — direct freight pool reclaimed`}
                  />
                  <SavingRow
                    label="Grey market diversion saved"
                    value={S2}
                    tooltip={`${leakN}% diversion × 1.8× value — margin + penalty exposure avoided`}
                  />
                  <SavingRow
                    label="KM debit accuracy savings"
                    value={S3}
                    tooltip={`${kmN}% KM gap × 85% reclaim — overbilling corrected at source`}
                  />

                  {/* Totals */}
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-white">Total gross savings</p>
                      <p className="text-base font-bold text-white">{formatINR(gross)}<span className="text-white/40 text-xs font-normal">/yr</span></p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-white/40">Less: platform cost (your {cPct}% share)</p>
                      <p className="text-sm text-red-400 font-semibold">− {formatINR(platformAnnual)}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#22c55e]/20">
                      <p className="text-sm font-bold text-white">Net savings after cost</p>
                      <p className={`text-lg font-bold ${netROI >= 0 ? "text-[#22c55e]" : "text-red-400"}`}>
                        {formatINR(netROI)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-[#0f1e14] to-[#0c1520] border border-[#22c55e]/20 rounded-2xl p-6 text-center">
                  <p className="text-sm text-white/50 mb-1">Ready to recover</p>
                  <p className="text-xl font-bold text-[#22c55e] mb-1">{formatINR(gross)} annually?</p>
                  <p className="text-sm text-white/60 mb-5">See exactly how Intugine delivers this for your cement fleet</p>
                  <a
                    href="https://intugine.com/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold px-8 py-3 rounded-xl transition text-sm"
                  >
                    Book a Free Demo →
                  </a>
                  <p className="text-xs text-white/25 mt-3">No commitment. 30-minute session.</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-white/20 mt-12 max-w-xl mx-auto leading-relaxed">
          Estimates based on industry benchmarks for Indian cement outbound logistics. Actual savings vary by fleet size, route mix, and operations. Platform cost: ₹40/trip/month all-in.
        </p>
      </main>

      <Footer />
    </div>
  );
}
