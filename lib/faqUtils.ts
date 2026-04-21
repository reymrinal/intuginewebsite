// Server-safe FAQ utilities — no "use client" here

export function extractFAQSection(fullContent?: string): string {
  if (!fullContent) return "";
  const match = fullContent.match(
    /##\s*Frequently Asked Questions\s*\n([\s\S]+?)(?=\n##\s|\n---\s*\n##\s|$)/i
  );
  return match?.[1]?.trim() || "";
}
