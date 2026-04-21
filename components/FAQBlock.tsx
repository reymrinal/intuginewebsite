"use client";
import { useState } from "react";

interface FAQ { q: string; a: string; }

// Extract the raw FAQ section text from full_content
export function extractFAQSection(fullContent?: string): string {
  if (!fullContent) return "";
  // Match everything after "## Frequently Asked Questions" until next ## or end
  const match = fullContent.match(/##\s*Frequently Asked Questions\s*\n([\s\S]+?)(?=\n##\s|\n---\s*\n##\s|$)/i);
  return match?.[1]?.trim() || "";
}

function parseFAQs(faqRaw: string, faqSection: string): FAQ[] {
  const faqs: FAQ[] = [];

  // ── Format 0: faq_block is a JSON array ──────────────────────────────────
  if (faqRaw?.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(faqRaw);
      if (Array.isArray(parsed)) {
        const result = parsed
          .filter((i: any) => i.question || i.q)
          .map((i: any) => ({ q: i.question || i.q || "", a: i.answer || i.a || "" }));
        if (result.length) return result;
      }
    } catch (_) {}
  }

  // ── Format 1: faqSection is a JSON array (dumped into full_content body) ─
  if (faqSection?.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(faqSection.trim());
      if (Array.isArray(parsed)) {
        const result = parsed
          .filter((i: any) => i.question || i.q)
          .map((i: any) => ({ q: i.question || i.q || "", a: i.answer || i.a || "" }));
        if (result.length) return result;
      }
    } catch (_) {}
  }

  // ── Format 2: faqSection has **Bold Question?** Answer text lines ─────────
  if (faqSection) {
    // Match "**Question text?**" followed by answer text (until next ** or end)
    const boldMatches = [...faqSection.matchAll(/\*\*([^*]+\??)\*\*\s*([^\n*][^\n]*(?:\n(?!\*\*)[^\n]+)*)/g)];
    if (boldMatches.length > 0) {
      return boldMatches.map(m => ({ q: m[1].trim(), a: m[2].trim() }));
    }

    // Also handle: "**Question?** Answer on same line" without multiline
    const inlineMatches = [...faqSection.matchAll(/\*\*([^*]+?)\*\*\s+(.+)/g)];
    if (inlineMatches.length > 0) {
      return inlineMatches.map(m => ({ q: m[1].trim(), a: m[2].trim() }));
    }
  }

  // ── Format 3: faq_block pipe-separated Q&A pairs ─────────────────────────
  if (faqRaw?.includes(" | ") && faqRaw.includes("Q:") && faqRaw.includes("A:")) {
    const segments = faqRaw.split(" | ").map(s => s.trim()).filter(Boolean);
    let currentQ = "";
    for (const seg of segments) {
      if (seg.startsWith("Q:")) currentQ = seg.replace(/^Q:\s*/, "").trim();
      else if (seg.startsWith("A:") && currentQ) {
        faqs.push({ q: currentQ, a: seg.replace(/^A:\s*/, "").trim() });
        currentQ = "";
      }
    }
    if (faqs.length > 0) return faqs;
  }

  // ── Format 4: faq_block Q: only → match answers from faqSection ──────────
  if (faqRaw?.includes("Q:")) {
    const questions = faqRaw.split("|").map(q => q.replace(/^Q:\s*/, "").trim()).filter(Boolean);
    if (faqSection) {
      return questions.map(q => {
        // Try to find answer after the question in faqSection
        const qClean = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\?$/, "\\??");
        const match = faqSection.match(new RegExp(`${qClean}\\s*([^*\\n][^\\n]+(?:\\n(?![A-Z*])[^\\n]+)*)`, "i"));
        return { q, a: match?.[1]?.trim() || "" };
      });
    }
    return questions.map(q => ({ q, a: "" }));
  }

  return faqs;
}

export default function FAQBlock({
  faqRaw,
  fullContent,
  faqSection,
}: {
  faqRaw?: string;
  fullContent?: string;
  faqSection?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  // faqSection can be pre-extracted by the parent (page.tsx) to avoid re-parsing
  const section = faqSection ?? extractFAQSection(fullContent);
  const faqs = parseFAQs(faqRaw || "", section);

  if (!faqs.length) return null;

  return (
    <div style={{ margin: "2.5rem 0" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f2460", marginBottom: "1.25rem" }}>
        Frequently Asked Questions
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "1rem 1.25rem",
                background: open === i ? "#f0f4ff" : "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#0f2460",
              }}
            >
              <span>{faq.q}</span>
              <span style={{ fontSize: "1.2rem", color: "#6b7280", flexShrink: 0, marginLeft: "1rem" }}>
                {open === i ? "−" : "+"}
              </span>
            </button>
            {open === i && faq.a && (
              <div
                style={{
                  padding: "1rem 1.25rem",
                  background: "#f9fafb",
                  color: "#374151",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
