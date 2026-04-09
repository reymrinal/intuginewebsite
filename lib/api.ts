const BACKEND_URL = "https://rey-6011d59d.base44.app/functions/getDashboardData";

export interface SEOPage {
  id: string;
  title: string;
  slug: string;
  template_type: string;
  target_keyword: string;
  secondary_keywords?: string;
  industry?: string;
  persona?: string;
  funnel_stage?: string;
  meta_title?: string;
  meta_description?: string;
  full_content?: string;
  faq_block?: string;
  schema_markup?: string;
  cta?: string;
  status?: string;
  priority?: string;
}

export async function getAllPages(): Promise<SEOPage[]> {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    const data = await res.json();
    const pages: SEOPage[] = data.pages || [];
    // Only serve pages that have content and a slug
    return pages.filter(p => p.slug && p.slug.trim() !== "");
  } catch (e) {
    console.error("[getAllPages] Failed to fetch from backend:", e);
    return [];
  }
}

export async function getPageBySlug(slug: string): Promise<SEOPage | null> {
  const pages = await getAllPages();
  return pages.find(p => p.slug === slug) || null;
}

export function markdownToHtml(md: string): string {
  if (!md) return "";
  return md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|o|l|h|p|s|b|i|a])/gm, '')
    .replace(/<p><\/p>/g, '')
    .trim();
}

export function buildSchemaMarkup(page: SEOPage, baseUrl: string): object[] {
  const schemas: object[] = [];
  const url = baseUrl + "/" + page.slug;
  const schemaTypes = page.schema_markup || "";

  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.meta_title || page.title,
    "description": page.meta_description,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "Intugine Technologies",
      "url": "https://www.intugine.com",
    },
  });

  if (schemaTypes.includes("FAQPage") && page.faq_block) {
    const questions = page.faq_block.split("|").map((q: string) => q.replace(/^Q:\s*/, "").trim()).filter(Boolean);
    if (questions.length) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions.map((q: string) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": "Contact Intugine to learn more." },
        })),
      });
    }
  }

  if (schemaTypes.includes("DefinedTerm") || page.template_type === "glossary") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": page.target_keyword,
      "description": page.meta_description,
      "url": url,
    });
  }

  return schemas;
}

export function getTemplateLabel(type: string): string {
  const map: Record<string, string> = {
    glossary: "Glossary",
    how_to: "Guide",
    product_x_industry: "Industry Solution",
    competitor_comparison: "Comparison",
  };
  return map[type] || "Resource";
}

export function getReadingTime(content: string): number {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}
