import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ReportCard from "@/components/ReportCard";
import { getAllReports } from "@/lib/api";

export const revalidate = 3600;

const BASE_URL = "https://library.intugine.com";

export const metadata: Metadata = {
  title: "Logistics Reports & Industry Benchmarks | Intugine",
  description: "Data-backed logistics reports, market benchmarks, and industry studies from Intugine — covering freight costs, control tower adoption, and supply chain performance across India.",
  alternates: { canonical: `${BASE_URL}/reports` },
  openGraph: {
    title: "Logistics Reports & Industry Benchmarks | Intugine",
    description: "Data-backed logistics reports, market benchmarks, and industry studies from Intugine.",
    url: `${BASE_URL}/reports`,
    type: "website",
    siteName: "Intugine",
  },
  robots: { index: true, follow: true },
};

export default async function ReportsHub() {
  const reports = await getAllReports();
  const featured = reports.filter(r => r.is_featured);
  const rest = reports.filter(r => !r.is_featured);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Intugine Logistics Reports",
    description: "Data-backed logistics reports, market benchmarks, and industry studies from Intugine.",
    url: `${BASE_URL}/reports`,
    publisher: { "@type": "Organization", name: "Intugine Technologies", url: "https://www.intugine.com" },
    hasPart: reports.map(r => ({
      "@type": "Report",
      name: r.title,
      url: `${BASE_URL}/reports/${r.slug}`,
      datePublished: r.published_date,
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <main className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-xs text-[#6b7280] flex gap-1.5 items-center mb-6">
          <a href="https://www.intugine.com" className="hover:text-[#1a3c8f]">Home</a>
          <span>›</span>
          <a href="/" className="hover:text-[#1a3c8f]">Library</a>
          <span>›</span>
          <span className="text-[#1a3c8f] font-medium">Reports</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f2460] mb-3">Logistics Reports</h1>
        <p className="text-[#6b7280] text-base md:text-lg max-w-2xl mb-10">
          Data-backed reports and benchmarks on Indian logistics — freight costs, control tower adoption, exception management, and industry-specific supply chain performance.
        </p>

        {/* Live dashboard callout — separate system from the Report entity, always featured first */}
        <a
          href="/diesel-freight-cost-index"
          className="group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-[#22c55e]/30 bg-[#0f1e14] p-6 mb-10 hover:shadow-lg hover:shadow-[#22c55e]/10 transition-all"
        >
          <div>
            <span className="inline-block text-[0.68rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] mb-2">
              Live · Updated Weekly
            </span>
            <h3 className="text-white text-lg font-bold mb-1">India Diesel & Freight Cost Index</h3>
            <p className="text-white/50 text-sm">City-wise diesel prices, a Sensex-style index score, and real ₹/km freight cost impact — refreshed every Monday.</p>
          </div>
          <span className="text-[#22c55e] font-semibold text-sm whitespace-nowrap group-hover:translate-x-1 transition-transform">View live index →</span>
        </a>

        {reports.length === 0 && (
          <div className="text-center py-16 text-[#9ca3af]">
            New reports are being prepared — check back soon.
          </div>
        )}

        {featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-[#0f2460] mb-4">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(r => <ReportCard key={r.id} report={r} />)}
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div>
            {featured.length > 0 && <h2 className="text-lg font-bold text-[#0f2460] mb-4">All Reports</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(r => <ReportCard key={r.id} report={r} />)}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
