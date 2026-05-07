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

export const dynamicParams = false;

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
      siteName: "Intugine",
    },
    twitter: {
      card: "summary_large_image",
      title: page.meta_title || page.title,
      description: page.meta_description || "",
    },
    robots: { index: true, follow: true },
  };
}

const FUNNEL_COLORS: Record<string, string> = {
  TOFU: "#10b981",
  MOFU: "#f59e0b",
  BOFU: "#ef4444",
};

export default async function PageDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug.includes('.')) notFound();
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const schemas = buildSchemaMarkup(page, BASE_URL);
  const readingTime = getReadingTime(page.full_content || "");
  const templateLabel = getTemplateLabel(page.template_type);

  // Extract FAQ section from full_content BEFORE rendering body (server-side, safe)
  const faqSection = extractFAQSection(page.full_content);

  // Strip H1 and FAQ section from body so FAQBlock renders it cleanly (no duplicates)
  let bodyContent = page.full_content || "";
  bodyContent = bodyContent.replace(/^#\s+.+\n?/m, "");
  bodyContent = bodyContent.replace(/##\s*Frequently Asked Questions[\s\S]+?(?=\n##\s|\n---\s*\n##\s|$)/i, "");

  const bodyHtml = markdownToHtml(bodyContent);

  const h1Match = page.full_content?.match(/^#\s+(.+)$/m);
  const h1 = h1Match?.[1] || page.title.replace(/ \| Intugine$/, "");

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <Nav />
      <main>
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "0.6rem 1.5rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", fontSize: "0.8rem", color: "#6b7280", display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <a href="https://www.intugine.com" style={{ color: "#6b7280", textDecoration: "none" }}>Home</a>
            <span>›</span>
            <a href="/" style={{ color: "#6b7280", textDecoration: "none" }}>Library</a>
            <span>›</span>
            <span style={{ color: "#374151" }}>{templateLabel}</span>
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)", padding: "3rem 1.5rem 2.5rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
              <span style={{ background: "#1a3c8f", color: "#fff", padding: "0.25rem 0.75rem", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {templateLabel}
              </span>
              {page.industry && (
                <span style={{ background: "#fff", color: "#374151", padding: "0.25rem 0.75rem", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600, border: "1px solid #e5e7eb" }}>
                  {page.industry}
                </span>
              )}
              {page.funnel_stage && (
                <span style={{ background: FUNNEL_COLORS[page.funnel_stage] || "#6b7280", color: "#fff", padding: "0.25rem 0.65rem", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600 }}>
                  {page.funnel_stage}
                </span>
              )}
            </div>
            <h1 style={{ color: "#0f2460", fontSize: "2.1rem", fontWeight: 800, lineHeight: 1.2, margin: "0 0 1rem" }}>
              {h1}
            </h1>
            {page.meta_description && (
              <p style={{ color: "#374151", fontSize: "1.05rem", lineHeight: 1.65, marginBottom: "1rem", maxWidth: 680 }}>
                {page.meta_description}
              </p>
            )}
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "#6b7280", alignItems: "center", flexWrap: "wrap" }}>
              <span>📖 {readingTime} min read</span>
              {page.persona && <span>👤 For: {page.persona}</span>}
              {page.target_keyword && <span>🔍 {page.target_keyword}</span>}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "3rem", alignItems: "start" }}>
            <article>
              <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              {/* FAQBlock is a client component — faqSection extracted server-side and passed as prop */}
              <FAQBlock faqRaw={page.faq_block} faqSection={faqSection} />
              <CTABanner cta={page.cta} slug={page.slug} industry={page.industry} />
            </article>

            <aside style={{ position: "sticky", top: 80 }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem", marginBottom: "1.25rem" }}>
                <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", fontWeight: 700, color: "#0f2460", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Quick Facts
                </h3>
                <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {[
                    { label: "Industry", value: page.industry },
                    { label: "Audience", value: page.persona },
                    { label: "Stage", value: page.funnel_stage },
                    { label: "Read time", value: `${readingTime} min` },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label}>
                      <dt style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{item.label}</dt>
                      <dd style={{ margin: 0, fontSize: "0.85rem", color: "#374151", fontWeight: 500 }}>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div style={{ background: "linear-gradient(135deg, #1a3c8f, #0f2460)", borderRadius: 10, padding: "1.5rem", textAlign: "center" }}>
                <p style={{ color: "#bfdbfe", fontSize: "0.8rem", marginBottom: "0.5rem" }}>See Intugine in action</p>
                <h3 style={{ color: "#fff", margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, lineHeight: 1.3 }}>
                  Book a 30-min demo with our team
                </h3>
                <SidebarDemoLink slug={page.slug} industry={page.industry} />
              </div>

              {page.secondary_keywords && (
                <div style={{ marginTop: "1.25rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem" }}>
                  <h3 style={{ margin: "0 0 0.6rem", fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Related Topics</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {page.secondary_keywords.split(",").map(kw => (
                      <span key={kw} style={{ background: "#f1f5f9", color: "#374151", padding: "0.2rem 0.5rem", borderRadius: 4, fontSize: "0.75rem" }}>
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <PageAnalytics slug={page.slug} industry={page.industry} persona={page.persona} funnel_stage={page.funnel_stage} />
    </>
  );
}
