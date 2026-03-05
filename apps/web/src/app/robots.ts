import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/c/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
