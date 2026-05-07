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
  // Mode: "simple" = trips + freight | "detailed" = tons + km + rate
  const [mode, setMode]           = useState<"simple" | "detailed">("simple");

  // Simple mode inputs
  const [trips, setTrips]         = useState("");
  const [freight, setFreight]     = useState("");

  // Detailed mode inputs
  const [tons, setTons]           = useState("");
  const [km, setKm]               = useState("");
  const [ratePerTonKm, setRatePerTonKm] = useState("");

  // Shared inputs — defaults updated to 10 and 20
  const [leakPct, setLeakPct]     = useState("");
  const [kmPct, setKmPct]         = useState("");
  const [costShare, setCostShare] = useState(30);

  // Derive effective trips & freight based on mode
  const tripsN   = parseFloat(trips)   || 0;
  const freightN = parseFloat(freight) || 0;

  const tonsN        = parseFloat(tons)        || 0;
  const kmN_input    = parseFloat(km)          || 0;
  const rateN        = parseFloat(ratePerTonKm) || 0;

  // In detailed mode: freight per trip = tons × km × rate per ton-km
  // trips in detailed mode is derived as 1 (the user is giving us total monthly freight value via tons×km×rate)
  // Actually we treat tons×km×rate as the total monthly freight bill, trips = 1 conceptually for platform cost
  // Better: ask for trips separately in detailed mode too — but user said "select tons, km, rate" as alternate to freight
  // So: monthly freight = tons × km × rate (total monthly freight spend), trips stays from simple mode
  // We'll keep trips input visible in detailed mode for platform cost calc, but derive freightN from tons×km×rate
  const detailedFreight = tonsN * kmN_input * rateN; // total monthly freight ₹

  const effectiveTrips   = tripsN;
  const effectiveFreight = mode === "simple" ? freightN : (tripsN > 0 ? detailedFreight / tripsN : 0);

  const leakN  = parseFloat(leakPct) || 10;  // default changed to 10
  const kmN    = parseFloat(kmPct)   || 20;  // default changed to 20
  const cPct   = costShare;

  const mf               = effectiveTrips * effectiveFreight;
  const S1               = mf * (leakN / 100) * 0.70 * 12;
  const S2               = mf * (leakN / 100) * 1.80 * 12;
  const S3               = mf * (kmN   / 100) * 0.85 * 12;
  const gross            = S1 + S2 + S3;
  const platformTotal    = effectiveTrips * 40;
  const yourCost         = platformTotal * (cPct / 100);
  const transporterCost  = platformTotal * ((100 - cPct) / 100);
  const platformAnnual   = yourCost * 12;
  const netROI           = gross - platformAnnual;
  const paybackMonths    = platformAnnual > 0 ? platformAnnual / (gross / 12) : 0;

  const hasData = effectiveTrips > 0 && effectiveFreight > 0;

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

              {/* Mode toggle */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Input Mode</h2>
                <div className="flex rounded-xl overflow-hidden border border-white/10 text-sm font-medium">
                  <button
                    onClick={() => setMode("simple")}
                    className={`flex-1 py-2.5 px-3 transition-colors ${
                      mode === "simple"
                        ? "bg-[#22c55e] text-black"
                        : "bg-white/5 text-white/50 hover:text-white/80"
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setMode("detailed")}
                    className={`flex-1 py-2.5 px-3 transition-colors ${
                      mode === "detailed"
                        ? "bg-[#22c55e] text-black"
                        : "bg-white/5 text-white/50 hover:text-white/80"
                    }`}
                  >
                    Detailed (ton·km)
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-2">
                  {mode === "simple"
                    ? "Enter trips dispatched and avg freight cost per trip."
                    : "Enter tonnage, distance, and rate — we calculate freight for you."}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Your Numbers</h2>

                {/* Trips — always shown */}
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

                {/* Simple mode: avg freight per trip */}
                {mode === "simple" && (
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
                )}

                {/* Detailed mode: tons + km + rate */}
                {mode === "detailed" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Total tonnage per month (MT) <span className="text-[#22c55e]">*</span>
                      </label>
                      <input
                        type="number" min="0" placeholder="e.g. 10000"
                        value={tons}
                        onChange={e => setTons(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e]/50 focus:bg-white/[0.08] transition text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Avg distance per trip (km) <span className="text-[#22c55e]">*</span>
                      </label>
                      <input
                        type="number" min="0" placeholder="e.g. 300"
                        value={km}
                        onChange={e => setKm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e]/50 focus:bg-white/[0.08] transition text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Rate per ton·km (₹) <span className="text-[#22c55e]">*</span>
                      </label>
                      <input
                        type="number" min="0" placeholder="e.g. 2.5"
                        value={ratePerTonKm}
                        onChange={e => setRatePerTonKm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e]/50 focus:bg-white/[0.08] transition text-base"
                      />
                    </div>
                    {/* Show derived freight value */}
                    {detailedFreight > 0 && (
                      <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-xl px-4 py-3 flex justify-between items-center">
                        <span className="text-xs text-white/50">Monthly freight (derived)</span>
                        <span className="text-sm font-bold text-[#22c55e]">{formatINR(detailedFreight)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Leakage % — default 10 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Back-unloading / leakage %
                  <span className="ml-2 text-xs text-white/30">(default 10%)</span>
                </label>
                <input
                  type="number" min="0" max="100" placeholder="10"
                  value={leakPct}
                  onChange={e => setLeakPct(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#22c55e]/50 transition text-base"
                />
              </div>

              {/* KM gap % — default 20 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Planned vs actual KM gap %
                  <span className="ml-2 text-xs text-white/30">(default 20%)</span>
                </label>
                <input
                  type="number" min="0" max="100" placeholder="20"
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
                <p className="text-white/40 text-sm max-w-xs">
                  {mode === "simple"
                    ? "Enter monthly trips and avg freight cost to see your savings."
                    : "Enter trips, tonnage, distance, and rate to calculate."}
                </p>
              </div>
            )}

            {/* Results */}
            {hasData && (
              <>
                {/* Mode indicator */}
                {mode === "detailed" && (
                  <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <span className="text-[#22c55e] text-xs">●</span>
                    <span className="text-xs text-white/50">
                      Using <span className="text-white/70 font-medium">detailed mode</span> — avg freight per trip: <span className="text-[#22c55e] font-semibold">{formatINR(effectiveFreight)}</span>
                    </span>
                  </div>
                )}

                {/* Key stats */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Annual savings" value={formatINR(gross)} highlight sub="Gross recoverable" />
                  <StatCard label="Net ROI" value={formatINR(netROI)} highlight={netROI > 0} sub="After platform cost" />
                  <StatCard label="Payback period" value={formatPayback(paybackMonths, cPct)} accent sub="Based on your cost share" />
                  <StatCard label="Monthly freight" value={formatINR(mf)} sub="trips × avg freight" />
                </div>

                {/* Savings breakdown */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Savings Breakdown</h3>
                  <p className="text-xs text-white/25 mb-4">Annual figures</p>
                  <SavingRow
                    label="Back-unloading freight recovery"
                    value={S1}
                    tooltip={`${leakN}% leakage × freight value recovered`}
                  />
                  <SavingRow
                    label="Grey market prevention"
                    value={S2}
                    tooltip={`${leakN}% leakage × replacement cost at MRP`}
                  />
                  <SavingRow
                    label="KM debit accuracy"
                    value={S3}
                    tooltip={`${kmN}% km gap × freight eliminated`}
                  />
                  <div className="flex justify-between pt-4 mt-2 border-t border-white/10">
                    <span className="text-sm font-bold text-white">Total gross savings</span>
                    <span className="text-sm font-bold text-[#22c55e]">{formatINR(gross)}/yr</span>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={`https://www.intugine.com/schedule-demo?utm_source=library&utm_campaign=cement_roi&utm_content=${mode}_mode`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-4 rounded-2xl transition-colors text-base"
                >
                  Get Your Custom ROI Analysis →
                </a>
                <p className="text-center text-xs text-white/25">
                  Free 30-min session with an Intugine cement specialist
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Methodology note ── */}
        <div className="mt-12 bg-[#111] border border-white/10 rounded-2xl p-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Methodology</h3>
          <div className="grid md:grid-cols-3 gap-4 text-xs text-white/40">
            <div>
              <p className="text-white/60 font-medium mb-1">Back-unloading recovery</p>
              <p>70% of leakage freight is recoverable through real-time alerts and unloading point validation.</p>
            </div>
            <div>
              <p className="text-white/60 font-medium mb-1">Grey market prevention</p>
              <p>Diverted cement sold at MRP (1.8× freight cost). Intugine prevents diversion before it happens.</p>
            </div>
            <div>
              <p className="text-white/60 font-medium mb-1">KM debit accuracy</p>
              <p>85% of planned vs actual KM gap is attributable to systematic fraud, recoverable via IntuDB data.</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
