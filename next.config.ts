import type { NextConfig } from "next";

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
