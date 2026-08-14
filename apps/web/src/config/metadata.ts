import type { Metadata, Viewport } from "next";

const SITE_URL = "https://scrapy-dev.hridaya.dev";
const SITE_NAME = "ScrapyChat";
const SITE_DESCRIPTION =
  "Scrape any website and chat with its content using AI. Ask questions, extract insights, and explore web data conversationally.";

export const siteConfig = {
  description: SITE_DESCRIPTION,
  name: SITE_NAME,
  url: SITE_URL,
} as const;

export const globalViewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { color: "#ffffff", media: "(prefers-color-scheme: light)" },
    { color: "#09090b", media: "(prefers-color-scheme: dark)" },
  ],
  width: "device-width",
};

export const globalMetadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
  applicationName: SITE_NAME,
  description: SITE_DESCRIPTION,
  icons: {
    apple: [{ sizes: "180x180", url: "/apple-touch-icon.png" }],
    icon: [
      { sizes: "any", url: "/favicon.ico" },
      { type: "image/svg+xml", url: "/favicon.svg" },
      { sizes: "96x96", type: "image/png", url: "/favicon-96x96.png" },
    ],
  },
  keywords: [
    "web scraping",
    "AI chat",
    "scrape website",
    "chat with website",
    "web data extraction",
    "ScrapyChat",
    "conversational AI",
    "RAG",
  ],
  manifest: "/site.webmanifest",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description: SITE_DESCRIPTION,
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    type: "website",
    url: SITE_URL,
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    description: SITE_DESCRIPTION,
    title: SITE_NAME,
  },
};
