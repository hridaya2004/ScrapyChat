import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 1,
      url: siteConfig.url,
    },
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 0.5,
      url: `${siteConfig.url}/auth`,
    },
  ];
}
