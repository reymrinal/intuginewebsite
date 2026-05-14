import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";

export const metadata = {
  title: "IAS Module Simulation — Intugine Activity Sensing | How It Works",
  description:
    "See exactly how Intugine's Activity Sensing (IAS) module detects unloading events in real time — waveform analysis, geofence validation, OCR confirmation, and confidence scoring. Interactive simulation for cement logistics.",
};

export default function IASSimulationPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

      <main className="max-w-5xl mx-auto px-4 py-12">

        {/* ── Header ── */}
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#3A8FF0] bg-[#1B6FD4]/10 border border-[#1B6FD4]/20 rounded-full px-4 py-1.5 mb-4">
            IAS Module · Interactive Simulation
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            Intugine Activity Sensing — How It Works
          </h1>
          <p className="text-white/50 text-base max-w-2xl">
            A live walkthrough of the IAS module — from raw sensor waveform capture through
            geofence validation, OCR confirmation, and final confidence score generation.
            Step through each stage of a real cement truck unloading event.
          </p>
        </div>

        {/* ── Feature pills ── */}
        <div className="flex flex-wrap gap-2 mb-8">
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

        {/* ── Simulation iframe ── */}
        <div className="w-full rounded-xl overflow-hidden border border-white/10 mb-10 shadow-2xl">
          <iframe
            src="/ias-simulation.html"
            className="w-full"
            style={{ height: "820px", border: "none", background: "#03080F" }}
            title="Intugine IAS Module Simulation"
            allow="autoplay"
          />
        </div>

        {/* ── How IAS works — explainer ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-3">What the IAS module detects</h2>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-[#00C97A] mt-0.5">✓</span> Back-unloading at unauthorised points before reaching the dealer</li>
              <li className="flex gap-2"><span className="text-[#00C97A] mt-0.5">✓</span> Short delivery — truck unloads less than the invoiced quantity</li>
              <li className="flex gap-2"><span className="text-[#00C97A] mt-0.5">✓</span> Drive-through fraud — truck enters geofence without unloading</li>
              <li className="flex gap-2"><span className="text-[#00C97A] mt-0.5">✓</span> Vehicle substitution — different truck at delivery vs dispatch</li>
            </ul>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-3">The 4-layer validation system</h2>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">01</span> <span><strong className="text-white">Activity sensing</strong> — sensor data captures physical unloading motion</span></li>
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">02</span> <span><strong className="text-white">Geofence check</strong> — unloading must occur within dealer polygon</span></li>
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">03</span> <span><strong className="text-white">OCR verification</strong> — vehicle number matched against dispatch record</span></li>
              <li className="flex gap-2"><span className="text-[#3A8FF0] mt-0.5">04</span> <span><strong className="text-white">Confidence score</strong> — 0–100 score, alert triggered below threshold</span></li>
            </ul>
          </div>
        </div>

        {/* ── CTA Banner ── */}
        <CTABanner
          cta="See IAS deployed at your cement plant | Book a Free Demo"
          slug="ias-simulation"
          industry="Cement"
        />

      </main>

      <Footer />
    </div>
  );
}
