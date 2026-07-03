import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import FAQBlock from "@/components/FAQBlock";
import ReportCard from "@/components/ReportCard";
import { getAllReports, getReportBySlug } from "@/lib/api";

const BASE_URL = "https://library.intugine.com";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const reports = await getAllReports();
    console.log(`[reports/generateStaticParams] Found ${reports.length} reports to pre-build`);
    return reports.map(r => ({ slug: r.slug }));
  } catch (e) {
    console.error("[reports/generateStaticParams] Failed:", e);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug.includes(".")) notFound();
  const report = await getReportBySlug(slug);
  if (!report) return { title: "Not Found" };

  const canonical = `${BASE_URL}/reports/${report.slug}`;
  const ogImage = report.og_image_url || report.hero_image_url;

  return {
    title: report.meta_title || report.title,
    description: report.meta_description || report.summary,
    alternates: { canonical },
    openGraph: {
      title: report.meta_title || report.title,
      description: report.meta_description || report.summary || "",
      url: canonical,
      type: "article",
      siteName: "Intugine",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: report.meta_title || report.title,
      description: report.meta_description || report.summary || "",
    },
    robots: { index: true, follow: true },
  };
}

export default async function ReportDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug.includes(".")) notFound();
  const report = await getReportBySlug(slug);
  if (!report) notFound();

  const allReports = await getAllReports();
  const related = allReports.filter(r => r.slug !== report.slug).slice(0, 3);

  const canonical = `${BASE_URL}/reports/${report.slug}`;
  const schemaType = report.schema_type || "Report";

  const schemas: object[] = [
    {
      "@context": "https://schema.org",
      "@type": schemaType,
      headline: report.title,
      name: report.title,
      description: report.meta_description || report.summary,
      url: canonical,
      datePublished: report.published_date,
      dateModified: report.published_date,
      author: { "@type": "Organization", name: report.author_name || "Intugine Technologies", url: "https://www.intugine.com" },
      publisher: {
        "@type": "Organization",
        name: "Intugine Technologies",
        url: "https://www.intugine.com",
        logo: { "@type": "ImageObject", url: "https://library.intugine.com/intugine-logo.png", width: 200, height: 60 },
      },
      ...(report.hero_image_url ? { image: report.hero_image_url } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Library", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Reports", item: `${BASE_URL}/reports` },
        { "@type": "ListItem", position: 3, name: report.title, item: canonical },
      ],
    },
  ];

  let faqs: { q: string; a: string }[] = [];
  if (report.faq_block) {
    try {
      const parsed = JSON.parse(report.faq_block);
      if (Array.isArray(parsed)) faqs = parsed;
    } catch { /* ignore malformed FAQ */ }
  }
  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <div className="bg-[#f8fafc] border-b border-[#e5e7eb] px-6 py-2.5">
        <div className="max-w-3xl mx-auto text-[0.8rem] text-[#6b7280] flex gap-1.5 items-center">
          <a href="https://www.intugine.com" className="hover:text-[#1a3c8f]">Home</a>
          <span>›</span>
          <a href="/" className="hover:text-[#1a3c8f]">Library</a>
          <span>›</span>
          <a href="/reports" className="hover:text-[#1a3c8f]">Reports</a>
          <span>›</span>
          <span className="text-[#1a3c8f] font-medium truncate">{report.title}</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-4">
          {report.category && (
            <span className="text-[0.7rem] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              {report.category}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-[2.4rem] font-extrabold text-[#0f2460] leading-tight mb-4">{report.title}</h1>

        {report.summary && (
          <p className="text-lg text-[#6b7280] leading-relaxed mb-6">{report.summary}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-[#9ca3af] border-y border-[#f0f0f0] py-3 mb-8">
          <span>{report.author_name || "Intugine Research Team"}</span>
          {report.published_date && (
            <>
              <span>·</span>
              <span>{new Date(report.published_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </>
          )}
          {report.read_time_minutes && (
            <>
              <span>·</span>
              <span>{report.read_time_minutes} min read</span>
            </>
          )}
        </div>

        {report.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={report.hero_image_url} alt={report.title} className="w-full rounded-xl mb-10 border border-[#e5e7eb]" />
        )}

        <article className="prose" dangerouslySetInnerHTML={{ __html: report.html_content || "" }} />

        {faqs.length > 0 && <FAQBlock faqRaw={report.faq_block} />}

        {report.tags && report.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[#f0f0f0]">
            {report.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">#{tag}</span>
            ))}
          </div>
        )}
      </main>

      <CTABanner
        cta={report.cta_text || "See How Cruise™ Turns These Numbers Into Action|Book a Demo"}
        slug={report.slug}
        industry={report.category || "Reports"}
      />

      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="text-lg font-bold text-[#0f2460] mb-4">More Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
