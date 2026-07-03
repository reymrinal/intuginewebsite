// ═══════════════════════════════════════════════════════════════════════════
// Standalone-HTML report rendering support.
//
// Some reports (the "India Freight Data" editorial series) are handed to us
// as a COMPLETE, self-contained HTML document — own <style> with bare-tag
// selectors (body, h1, section, table, footer...), own <script> that draws
// an SVG chart at load. That CSS/JS is designed to own the whole page, which
// is fine as a standalone artifact but NOT safe to drop straight into a
// shared Next.js page — the bare selectors would leak and override the rest
// of the site's styling (Nav, Footer, every other report).
//
// scopeCss() rewrites every top-level selector (recursing into @media, etc.)
// to be prefixed with a wrapper class, e.g. `h1 -> .report-doc-x h1`, so the
// report's design is fully contained. `:root` variable declarations are left
// alone (they're just custom-property definitions — harmless globally).
// parseStandaloneDoc() pulls the <style>/<script>/<body> pieces back apart
// so the page can re-assemble them safely.
// ═══════════════════════════════════════════════════════════════════════════

export function isStandaloneHtmlDoc(html?: string): boolean {
  if (!html) return false;
  return /<!DOCTYPE html/i.test(html) || /<html[\s>]/i.test(html);
}

// Recursive brace-depth scanner — handles one or more levels of @media nesting.
export function scopeCss(css: string, scopeClass: string): string {
  let out = "";
  let i = 0;
  const n = css.length;

  while (i < n) {
    // Skip whitespace
    while (i < n && /\s/.test(css[i])) { out += css[i]; i++; }
    if (i >= n) break;

    // Skip comments
    if (css[i] === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      out += css.slice(i, stop);
      i = stop;
      continue;
    }

    // Read prelude (selector or @-rule) up to next { or ;
    let j = i;
    while (j < n && css[j] !== "{" && css[j] !== ";") j++;
    if (j >= n) { out += css.slice(i); break; }

    if (css[j] === ";") {
      // e.g. an @import or stray statement — pass through untouched
      out += css.slice(i, j + 1);
      i = j + 1;
      continue;
    }

    const prelude = css.slice(i, j).trim();

    // Find matching closing brace for this block (balanced)
    let depth = 1;
    let k = j + 1;
    while (k < n && depth > 0) {
      if (css[k] === "{") depth++;
      else if (css[k] === "}") depth--;
      k++;
    }
    const body = css.slice(j + 1, k - 1);

    if (prelude.startsWith("@")) {
      // At-rule (@media, @supports, ...) — keep prelude, recurse into body
      out += `${prelude}{${scopeCss(body, scopeClass)}}`;
    } else if (prelude.startsWith(":root")) {
      // Custom property definitions — leave untouched
      out += `${prelude}{${body}}`;
    } else {
      const scopedSelectors = prelude
        .split(",")
        .map(s => `.${scopeClass} ${s.trim()}`)
        .join(", ");
      out += `${scopedSelectors}{${body}}`;
    }
    i = k;
  }

  return out;
}

export interface ParsedStandaloneDoc {
  css: string;
  script: string;
  bodyInner: string;
}

export function parseStandaloneDoc(html: string, scopeClass: string): ParsedStandaloneDoc {
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

  let bodyInner = bodyMatch ? bodyMatch[1] : html;
  // Strip the inline <script> out of the body markup — it's re-injected as a
  // separate real <script> tag by the page so it actually executes (scripts
  // inserted via dangerouslySetInnerHTML/innerHTML never auto-run).
  bodyInner = bodyInner.replace(/<script[^>]*>[\s\S]*?<\/script>/i, "");

  return {
    css: styleMatch ? scopeCss(styleMatch[1], scopeClass) : "",
    script: scriptMatch ? scriptMatch[1] : "",
    bodyInner,
  };
}
