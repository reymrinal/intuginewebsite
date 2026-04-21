"use client";
import { useState } from "react";

interface FAQ { q: string; a: string; }

function parseFAQs(raw: string, fullContent?: string): FAQ[] {
  if (!raw && !fullContent) return [];

  const faqs: FAQ[] = [];

  // Format 0: JSON array [{"question":"...","answer":"..."}, ...]
  if (raw && raw.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: any) => item.question || item.q)
          .map((item: any) => ({
            q: item.question || item.q || "",
            a: item.answer || item.a || "",
          }));
      }
    } catch (_) {
      // not valid JSON, fall through to other parsers
    }
  }

  // Format 1: pipe-separated "Q: question | A: answer | Q: question | A: answer"
  if (raw && raw.includes(" | ") && raw.includes("Q:") && raw.includes("A:")) {
    const segments = raw.split(" | ").map(s => s.trim()).filter(Boolean);
    let currentQ = "";
    for (const seg of segments) {
      if (seg.startsWith("Q:")) {
        currentQ = seg.replace(/^Q:\s*/, "").trim();
      } else if (seg.startsWith("A:") && currentQ) {
        faqs.push({ q: currentQ, a: seg.replace(/^A:\s*/, "").trim() });
        currentQ = "";
      }
    }
    if (faqs.length > 0) return faqs.filter(f => f.q);
  }

  // Format 2: double-newline separated blocks "Q: ...\nA: ..."
  if (raw && raw.includes("A:")) {
    const blocks = raw.split(/\n\n+/);
    for (const block of blocks) {
      const qMatch = block.match(/Q:\s*(.+)/);
      const aMatch = block.match(/A:\s*([\s\S]+)/);
      if (qMatch) faqs.push({ q: qMatch[1].trim(), a: aMatch?.[1]?.trim() || "" });
    }
    if (faqs.length > 0) return faqs.filter(f => f.q);
  }

  // Format 3: Extract Q&A from full_content inline FAQ section
  // Looks for pattern: "Question text Answer text" in FAQ sections of full_content
  if (fullContent) {
    // Try to find FAQ section in full content: lines like "What is X? Y answer text."
    const faqSectionMatch = fullContent.match(/##\s*Frequently Asked Questions([\s\S]+?)(?=\n##|$)/i);
    if (faqSectionMatch) {
      const faqText = faqSectionMatch[1];
      // Each Q&A is: "Question sentence? Answer sentence(s)."
      // Split on lines that look like questions
      const qaBlocks = faqText.split(/\n(?=[A-Z][^\n]+\?)/);
      for (const block of qaBlocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;
        const qEnd = trimmed.indexOf("?");
        if (qEnd === -1) continue;
        const q = trimmed.slice(0, qEnd + 1).trim();
        const a = trimmed.slice(qEnd + 1).trim();
        if (q && a) faqs.push({ q, a });
      }
      if (faqs.length > 0) return faqs;
    }
  }

  // Format 4: questions only separated by |
  if (raw) {
    const questions = raw.split("|").map(q => q.replace(/^Q:\s*/, "").trim()).filter(Boolean);
    questions.forEach(q => faqs.push({ q, a: "" }));
  }

  return faqs.filter(f => f.q);
}

// Extract FAQ answers from full_content if parseFAQs only got questions
function enrichFromContent(faqs: FAQ[], fullContent?: string): FAQ[] {
  if (!fullContent) return faqs;
  return faqs.map(faq => {
    if (faq.a) return faq;
    const qClean = faq.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = fullContent.match(new RegExp(`${qClean}\\s*([\\s\\S]+?)(?=\\n[A-Z][^\\n]+\\?|\\n##|$)`, "i"));
    return { ...faq, a: match?.[1]?.trim() || "" };
  });
}

export default function FAQBlock({ faqRaw, fullContent }: { faqRaw?: string; fullContent?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const rawFaqs = parseFAQs(faqRaw || "", fullContent);
  const enriched = enrichFromContent(rawFaqs, fullContent);

  if (!enriched.length) return null;

  return (
    <div style={{ margin: "2.5rem 0" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f2460", marginBottom: "1.25rem" }}>Frequently Asked Questions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {enriched.map((faq, i) => (
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
              <span style={{ fontSize: "1.2rem", color: "#6b7280", flexShrink: 0, marginLeft: "1rem" }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && faq.a && (
              <div style={{ padding: "1rem 1.25rem", background: "#f9fafb", color: "#374151", fontSize: "0.9rem", lineHeight: 1.7, borderTop: "1px solid #e5e7eb" }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
