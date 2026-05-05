"use client";
import { useState } from "react";

interface FAQ { q: string; a: string; }

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
    const boldMatches = [...faqSection.matchAll(/\*\*([^*]+\??)\*\*\s*([^\n*][^\n]*(?:\n(?!\*\*)[^\n]+)*)/g)];
    if (boldMatches.length > 0) {
      return boldMatches.map(m => ({ q: m[1].trim(), a: m[2].trim() }));
    }
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

  // ── Format 4: newline-separated Q: / A: pairs (primary format for new pages) ──
  const sourceForNewlineFormat = faqRaw || faqSection || "";
  if (sourceForNewlineFormat.includes("Q:") && sourceForNewlineFormat.includes("A:")) {
    // Split on lines that start with "Q:" — handles multi-line answers
    const blocks = sourceForNewlineFormat.split(/\n(?=Q:)/);
    const parsed: FAQ[] = [];
    for (const block of blocks) {
      const qMatch = block.match(/^Q:\s*(.+?)(?:\n|$)/);
      const aMatch = block.match(/\nA:\s*([\s\S]+)/);
      if (qMatch && aMatch) {
        parsed.push({
          q: qMatch[1].trim(),
          a: aMatch[1].trim().replace(/\n+$/, ""),
        });
      }
    }
    if (parsed.length > 0) return parsed;
  }

  // ── Format 5: faq_block Q: only → match answers from faqSection ──────────
  if (faqRaw?.includes("Q:") && !faqRaw.includes("A:")) {
    const questions = faqRaw.split("|").map(q => q.replace(/^Q:\s*/, "").trim()).filter(Boolean);
    if (faqSection) {
      return questions.map(q => {
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
  faqSection,
}: {
  faqRaw?: string;
  faqSection?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = parseFAQs(faqRaw || "", faqSection || "");

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
