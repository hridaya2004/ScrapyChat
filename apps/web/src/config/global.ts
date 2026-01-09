export const siteConfig = {
  title: "ScrapyChat",
} as const;

const getDevelopmentUrl = () => {
  if (typeof window === "undefined") {
    return;
  }
  let url = window.localStorage.getItem("development-url") || "";

  // remove the quotation marks if present
  if (url.startsWith('"') && url.endsWith('"')) {
    url = url.slice(1, -1);
  }

  return `${url.trim()}/api`;
};

export const apiConfig = {
  baseUrl: getDevelopmentUrl() ?? "/api",
  authUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001/api"
      : "/api",
};
