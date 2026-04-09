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

const BASE44_API = "https://api.base44.com/api/apps/69c3668110c055bc6011d59d/entities/SEOPage";
const API_KEY = process.env.BASE44_API_KEY || "";

export async function getAllPages(): Promise<SEOPage[]> {
  try {
    const res = await fetch(`${BASE44_API}?limit=500`, {
      headers: { "x-api-key": API_KEY },
      next: { revalidate: 3600 }, // ISR: refresh every hour
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return (data.records || []).filter((p: SEOPage) =>
      p.slug && p.full_content && ["content_draft", "reviewed", "published"].includes(p.status || "")
    );
  } catch (e) {
    console.error("Failed to fetch pages:", e);
    return [];
  }
}

export async function getPageBySlug(slug: string): Promise<SEOPage | null> {
  try {
    const res = await fetch(`${BASE44_API}?slug=${encodeURIComponent(slug)}&limit=1`, {
      headers: { "x-api-key": API_KEY },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.records?.[0] || null;
  } catch {
    return null;
  }
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
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|o|l|h|p|s|b|i|a])/gm, '')
    .replace(/<p><\/p>/g, '')
    .trim();
}

export function buildSchemaMarkup(page: SEOPage, baseUrl: string): object[] {
  const schemas: object[] = [];
  const url = `${baseUrl}/library/${page.slug}`;
  const schemaTypes = page.schema_markup || "";

  // Always add WebPage
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

  // FAQPage schema
  if (schemaTypes.includes("FAQPage") && page.faq_block) {
    const questions = page.faq_block.split("|").map(q => q.replace(/^Q:\s*/, "").trim()).filter(Boolean);
    if (questions.length) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions.map(q => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Contact Intugine to learn more about this topic.",
          },
        })),
      });
    }
  }

  // HowTo schema
  if (schemaTypes.includes("HowTo")) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": page.title,
      "description": page.meta_description,
      "url": url,
    });
  }

  // DefinedTerm schema for glossary
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
