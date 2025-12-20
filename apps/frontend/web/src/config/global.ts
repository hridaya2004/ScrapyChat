export const siteConfig = {
  title: "ScrapyChat",
  description: "No description yet.",
} as const;

export const apiConfig = {
  baseUrl:
    process.env.NODE_ENV === "development" ? "http://localhost:8080" : "/api",
} as const;
