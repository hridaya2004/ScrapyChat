const getDevelopmentUrl = () => {
  if (typeof window === "undefined") {
    return "/api";
  }
  let url = window.localStorage.getItem("development-url") || "";

  // remove the quotation marks if present
  if (url.startsWith('"') && url.endsWith('"')) {
    url = url.slice(1, -1);
  }

  return url.trim() ? `${url.trim()}/api` : "/api";
};

export const apiConfig = {
  get baseUrl() {
    return getDevelopmentUrl();
  },
  authUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001/api"
      : "/api",
};
