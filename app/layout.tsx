import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

// ─── REPLACE THESE WITH YOUR ACTUAL IDs ───────────────────────────────────────
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-54STCR3F";
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-XXXXXXXXXX";
// ──────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://library.intugine.com"),
  title: { default: "Intugine Library | Supply Chain Visibility Intelligence", template: "%s | Intugine" },
  description: "Guides, glossary terms, and industry playbooks to help logistics and supply chain leaders make better decisions.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.png", sizes: "any", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    siteName: "Intugine",
    type: "website",
    images: [{ url: "/logo.png", width: 720, height: 720, alt: "Intugine Technologies" }],
  },
  twitter: {
    card: "summary",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ── Bing Webmaster Verification ── */}
        <meta name="msvalidate.01" content="626E83BC5451E2AD7D7884954C359F91" />

        {/* ── Favicons ── */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* ── Google Tag Manager — fires before anything else ── */}
        <Script
          id="gtm-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />

        {/* ── GA4 direct tag (backup if GTM isn't configured yet) ── */}
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        />
        <Script
          id="ga4-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}', {
                page_path: window.location.pathname,
                send_page_view: true,
                custom_map: {
                  dimension1: 'industry',
                  dimension2: 'funnel_stage',
                  dimension3: 'persona'
                }
              });

              // ── Custom Event Helpers ──────────────────────────────
              // Fire these from anywhere: window.trackDemoClick(), window.trackCTAClick() etc.

              window.trackDemoClick = function(source) {
                gtag('event', 'demo_request_click', {
                  event_category: 'CTA',
                  event_label: source || 'unknown',
                  value: 1
                });
              };

              window.trackCTAClick = function(cta_text, page_slug) {
                gtag('event', 'cta_click', {
                  event_category: 'Engagement',
                  event_label: cta_text,
                  page_slug: page_slug
                });
              };

              window.trackPageRead = function(slug, industry, persona) {
                gtag('event', 'page_read', {
                  event_category: 'Content',
                  event_label: slug,
                  industry: industry,
                  persona: persona
                });
              };

              window.trackLibrarySearch = function(search_term) {
                gtag('event', 'library_search', {
                  event_category: 'Search',
                  search_term: search_term
                });
              };
            `,
          }}
        />
      </head>
      <body>
        {/* ── GTM noscript fallback (required by Google) ── */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}
