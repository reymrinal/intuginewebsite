import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/library/" },
    sitemap: "https://www.intugine.com/library/sitemap.xml",
  };
}
