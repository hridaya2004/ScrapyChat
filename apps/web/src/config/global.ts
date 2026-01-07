export const siteConfig = {
  title: "ScrapyChat",
} as const;

export const apiConfig = {
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/api"
      : "/api",
  authUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001/api"
      : "/api",
} as const;
