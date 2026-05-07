import { getAllPages, getPageBySlug, markdownToHtml, buildSchemaMarkup, getTemplateLabel, getReadingTime } from "@/lib/api";
import { extractFAQSection } from "@/lib/faqUtils";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FAQBlock from "@/components/FAQBlock";
import CTABanner from "@/components/CTABanner";
import SidebarDemoLink from "@/components/SidebarDemoLink";
import PageAnalytics from "@/components/PageAnalytics";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const BASE_URL = "https://library.intugine.com";

// Allow dynamic fallback so new pages render even if not in static build
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const pages = await getAllPages();
    console.log(`[generateStaticParams] Found ${pages.length} pages to pre-build`);
    return pages.map(p => ({ slug: p.slug }));
  } catch (e) {
    console.error("[generateStaticParams] Failed:", e);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug.includes('.')) notFound();
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Not Found" };

  const canonical = `${BASE_URL}/${page.slug}`;
  return {
    title: page.meta_title || page.title,
    description: page.meta_description,
    alternates: { canonical },
    openGraph: {
      title: page.meta_title || page.title,
      description: page.meta_description || "",
      url: canonical,
      type: "article",
    },
  };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug.includes('.')) notFound();

  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const { body: contentBody } = extractFAQSection(page.full_content || "");
  const contentHtml = markdownToHtml(contentBody);
  const schemas = buildSchemaMarkup(page, BASE_URL);
  const templateLabel = getTemplateLabel(page.template_type || "");
  const readingTime = getReadingTime(page.full_content || "");

  let faqs: { q: string; a: string }[] = [];
  if (page.faq_block) {
    try {
      const parsed = JSON.parse(page.faq_block);
      if (Array.isArray(parsed)) faqs = parsed;
    } catch {
      faqs = [];
    }
  }

  const relatedTopics = page.secondary_keywords
    ? page.secondary_keywords.split(",").map((k: string) => k.trim()).filter(Boolean).slice(0, 5)
    : [];

  const industrySlug = page.industry
    ? page.industry.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <Nav />

      <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
        {/* Hero */}
        <section style={{ background: "linear-gradient(135deg, #0f2460 0%, #1a3a7a 100%)", padding: "3rem 1.5rem 2.5rem", color: "#fff" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {templateLabel}
              </span>
              {page.funnel_stage && (
                <span style={{ background: page.funnel_stage === "BOFU" ? "#dc2626" : page.funnel_stage === "MOFU" ? "#d97706" : "#059669", color: "#fff", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                  {page.funnel_stage}
                </span>
              )}
              {industrySlug && (
                <a href={`/industry/${industrySlug}`} style={{ background: "rgba(255,255,255,0.1)", color: "#e0e7ff", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 500, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                  {page.industry}
                </a>
              )}
            </div>
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: "1rem", color: "#fff" }}>
              {page.meta_title || page.title}
            </h1>
            {page.meta_description && (
              <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: "680px" }}>
                {page.meta_description}
              </p>
            )}
            <div style={{ marginTop: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              <span>⏱ {readingTime} min read</span>
              {page.persona && <span>👤 For: {page.persona}</span>}
              {page.target_keyword && <span>🔍 {page.target_keyword}</span>}
            </div>
          </div>
        </section>

        {/* Content */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 280px", gap: "2.5rem" }}>
          <div>
            {/* Article body */}
            <div
              style={{ background: "#fff", borderRadius: "12px", padding: "2rem 2.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", lineHeight: 1.8, color: "#1e293b", fontSize: "1rem" }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* FAQ */}
            {faqs.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <FAQBlock faqs={faqs} />
              </div>
            )}

            {/* Related topics */}
            {relatedTopics.length > 0 && (
              <div style={{ marginTop: "2rem", background: "#fff", borderRadius: "12px", padding: "1.5rem 2rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Related Topics</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {relatedTopics.map((topic: string) => {
                    const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    return (
                      <a key={topic} href={`/${topicSlug}`} style={{ background: "#f1f5f9", color: "#475569", padding: "0.35rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", textDecoration: "none", border: "1px solid #e2e8f0" }}>
                        {topic}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <CTABanner cta={page.cta} industry={page.industry} />

            {/* Back link */}
            <div style={{ marginTop: "2rem" }}>
              <a href="/" style={{ color: "#0f2460", fontSize: "0.9rem", textDecoration: "none", fontWeight: 500 }}>
                ← Back to Library
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <SidebarDemoLink industry={page.industry} keyword={page.target_keyword} />
            <PageAnalytics slug={page.slug} />
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
}
