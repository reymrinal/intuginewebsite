"use client";
import { useState } from "react";

interface FAQ { q: string; a: string; }

function parseFAQs(raw: string): FAQ[] {
  if (!raw) return [];
  const faqs: FAQ[] = [];

  // Format 1: pipe-separated "Q: question | A: answer | Q: question | A: answer"
  if (raw.includes(" | ") && raw.includes("Q:") && raw.includes("A:")) {
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
  if (raw.includes("A:")) {
    const blocks = raw.split(/\n\n+/);
    for (const block of blocks) {
      const qMatch = block.match(/Q:\s*(.+)/);
      const aMatch = block.match(/A:\s*([\s\S]+)/);
      if (qMatch) faqs.push({ q: qMatch[1].trim(), a: aMatch?.[1]?.trim() || "" });
    }
    if (faqs.length > 0) return faqs.filter(f => f.q);
  }

  // Format 3: questions only separated by |
  const questions = raw.split("|").map(q => q.replace(/^Q:\s*/, "").trim()).filter(Boolean);
  questions.forEach(q => faqs.push({ q, a: "" }));

  return faqs.filter(f => f.q);
}

export default function FAQBlock({ faqRaw, fullContent }: { faqRaw?: string; fullContent?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = parseFAQs(faqRaw || "");

  const enriched = faqs.map(faq => {
    if (faq.a || !fullContent) return faq;
    const qClean = faq.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = fullContent.match(new RegExp(`\\*\\*${qClean}\\*\\*\\s*\\n([\\s\\S]+?)(?=\\n\\*\\*|$)`, "i"));
    return { ...faq, a: match?.[1]?.trim() || "" };
  });

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
