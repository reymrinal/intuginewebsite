import type { NextConfig } from "next";

// Build trigger: 2026-05-07T11:02 — force regenerate all 140 pages
const nextConfig: NextConfig = {
  images: {
    domains: ["intugine.com"],
  },
  async rewrites() {
    return [
      {
        source: "/BingSiteAuth1.xml",
        destination: "/api/bing-verify",
      },
      {
        source: "/756e7247211148e21808006bd23cdc23.txt",
        destination: "/api/indexnow-key",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "index, follow" },
        ],
      },
    ];
  },
};

export default nextConfig;
